from django.core.management.base import BaseCommand
from django.db.models import Q
from rest.models import (
    Book,
    Rcr,
    Lang,
    BookType,
    Editor,
    Author,
    City,
    AuthorType,
    CountryType,
    BookTags,
)
import requests as rq
import csv
import codecs
from rest.management.commands.book_parser import UnimarcBookParser
from typing import List
import datetime
from cabestan.config import get_config
import pytz
from typing import Dict


class Command(BaseCommand):
    help = "Import book data"
    NUMBER_OF_RECORDS_PER_CALL = 500  # I think it's a good value without api error

    langs: List[Lang] = []
    bookTypes: List[BookType] = []
    countries: List[CountryType] = []
    cities: List[City] = []
    authorTypes: List[AuthorType] = []

    def get_initial_data(self):
        self.langs = list(Lang.objects.all())
        self.bookTypes = list(BookType.objects.all())
        self.countries = list(CountryType.objects.all())
        self.cities = list(City.objects.all())
        self.authorTypes = list(AuthorType.objects.all())

    def handle(self, *args, **options):
        self.url = get_config("URL_SUDOC")
        print("Importing book data")
        self.get_initial_data()
        if args:
            rcrs = Rcr.objects.filter(id__in=args)
        else:
            rcrs = Rcr.objects.filter(
                Q(
                    last_scraped_date__lte=datetime.datetime.now(tz=pytz.UTC)
                    - datetime.timedelta(days=7)
                )
                | Q(last_scraped_date__isnull=True)
            )
        for rcr in rcrs:
            try:
                self.parse_one_rcr(rcr)
                rcr.last_scraped_date = datetime.datetime.now(tz=pytz.UTC)
                rcr.save()
            except Exception as e:
                print(f"Error parsing rcr {rcr.rcr_number}: {e}")
            print(" ")

    def parse_one_rcr(self, rcr: Rcr, start_record: int = 1):
        start_time = datetime.datetime.now()
        url = f"{self.url}/?operation=searchRetrieve&version=1.1&query=rbc%3D{rcr.rcr_number}&maximumRecords=1&startRecord=1"
        rcr_csv: str = rq.get(url)
        reader = csv.DictReader(
            codecs.iterdecode(rcr_csv.iter_lines(), "utf-8"),
            delimiter="\t",
            lineterminator="\r\n",
        )
        data = list(reader)
        parser = UnimarcBookParser(data)
        number_of_records = parser.get_number_of_records()
        if number_of_records == 0 or not number_of_records:
            return

        for i in range(
            1,
            int(number_of_records),
            (
                int(self.NUMBER_OF_RECORDS_PER_CALL)
                if int(self.NUMBER_OF_RECORDS_PER_CALL) < int(number_of_records)
                else number_of_records
            ),
        ):
            self.parse_one_record(i, rcr)
            print(
                f"scrape {i}/{number_of_records} for rcr:{rcr.rcr_number} - "
                f"in: {datetime.datetime.now() - start_time}"
            )

    def parse_one_record(self, index: str, rcr: Rcr):
        url = (
            f"{self.url}/?operation=searchRetrieve&version=1.1"
            f"&query=rbc%3D{rcr.rcr_number}&maximumRecords={self.NUMBER_OF_RECORDS_PER_CALL}"
            f"&startRecord={index}"
        )
        request_start_time = datetime.datetime.now()
        rcr_csv: str = rq.get(url)
        request_time = datetime.datetime.now() - request_start_time
        print(f"Request time: {request_time}")

        reader = csv.DictReader(
            codecs.iterdecode(rcr_csv.iter_lines(), "utf-8"),
            delimiter="\t",
            lineterminator="\r\n",
        )
        data = list(reader)
        parser = UnimarcBookParser(data)
        books_data = parser.parse_books()

        # Préparation des données en masse
        db_start_time = datetime.datetime.now()

        editors_to_create = []
        authors_to_create = []
        books_to_create = []

        # Collecte des éditeurs uniques
        editor_mapping = {}
        for book_data in books_data:
            if book_data["editor"]["title"]:
                editor_mapping[book_data["editor"]["title"]] = None

        if editor_mapping:
            editors_to_create = [Editor(title=title) for title in editor_mapping.keys()]
            Editor.objects.bulk_create(
                self.remove_duplicates_editors(editors_to_create),
                ignore_conflicts=True,
            )
            # Mise à jour du mapping avec les éditeurs créés
            existing_editors = Editor.objects.filter(title__in=editor_mapping.keys())
            for editor in existing_editors:
                editor_mapping[editor.title] = editor.id

        # Collecte des auteurs uniques
        author_mapping = {}
        for book_data in books_data:
            # Auteur principal
            if book_data["author"]["firstname"]:
                key = (
                    book_data["author"]["firstname"],
                    book_data["author"]["lastname"],
                    "author",
                )
                author_mapping[key] = None

            # Illustrateur
            if book_data["illustrator"] and book_data["illustrator"]["lastname"]:
                key = (
                    book_data["illustrator"]["firstname"],
                    book_data["illustrator"]["lastname"],
                    "illustrator",
                )
                author_mapping[key] = None

            # Traducteur
            if book_data["translator"] and book_data["translator"]["lastname"]:
                key = (
                    book_data["translator"]["firstname"],
                    book_data["translator"]["lastname"],
                    "translator",
                )
                author_mapping[key] = None

        # Création des auteurs en masse
        if author_mapping:
            author_type_ids = {at.label: at.id for at in self.authorTypes}

            authors_to_create = [
                Author(
                    firstname=firstname,
                    lastname=lastname,
                    type_id=author_type_ids[role],
                )
                for (firstname, lastname, role) in author_mapping.keys()
            ]

            Author.objects.bulk_create(
                self.remove_duplicates_authors(authors_to_create),
                ignore_conflicts=True,
            )
            # Mise à jour du mapping avec les auteurs créés
            existing_authors = Author.objects.filter(
                firstname__in=[a[0] for a in author_mapping.keys()],
                lastname__in=[a[1] for a in author_mapping.keys()],
            )
            for author in existing_authors:
                for key in author_mapping.keys():
                    if (
                        author.firstname == key[0]
                        and author.lastname == key[1]
                        and author.type.label == key[2]
                    ):
                        author_mapping[key] = author.id

        # Préparation des livres
        for book_data in books_data:
            try:
                publication_date = datetime.datetime(
                    int(book_data["publication_date"]), 1, 1
                )
            except (ValueError, TypeError):
                publication_date = None

            try:
                reedition_date = datetime.datetime(
                    int(book_data["reedition_date"]), 1, 1
                )
            except (ValueError, TypeError):
                reedition_date = None

            # Recherche des IDs correspondants
            editor_id = (
                editor_mapping.get(book_data["editor"]["title"])
                if book_data["editor"]["title"]
                else None
            )

            author_key = (
                (
                    book_data["author"]["firstname"],
                    book_data["author"]["lastname"],
                    "author",
                )
                if book_data["author"]["firstname"]
                else None
            )
            author_id = author_mapping.get(author_key)

            illustrator_key = (
                (
                    book_data["illustrator"]["firstname"],
                    book_data["illustrator"]["lastname"],
                    "illustrator",
                )
                if book_data["illustrator"] and book_data["illustrator"]["lastname"]
                else None
            )
            illustrator_id = author_mapping.get(illustrator_key)

            translator_key = (
                (
                    book_data["translator"]["firstname"],
                    book_data["translator"]["lastname"],
                    "translator",
                )
                if book_data["translator"] and book_data["translator"]["lastname"]
                else None
            )
            translator_id = author_mapping.get(translator_key)

            books_to_create.append(
                Book(
                    ppn=book_data["ppn"],
                    title=book_data["title"],
                    lang_id=next(
                        (
                            lang.id
                            for lang in self.langs
                            if lang.iso_code == book_data["lang"]["iso_code"]
                        ),
                        None,
                    ),
                    type_id=next(
                        (
                            bt.id
                            for bt in self.bookTypes
                            if bt.label == book_data["document_type"]
                        ),
                        None,
                    ),
                    editor_id=editor_id,
                    publication_date=publication_date,
                    is_reedition=book_data["is_reedition"],
                    reedition_date=reedition_date,
                    author_id=author_id,
                    illustrator_id=illustrator_id,
                    translator_id=translator_id,
                    publication_city_id=(
                        next(
                            (
                                c.id
                                for c in self.cities
                                if book_data["publication_city"]["label"].lower()
                                in c.label.lower()
                            ),
                            None,
                        )
                        if book_data["publication_city"]
                        and book_data["publication_city"]["label"]
                        else None
                    ),
                    publication_address=book_data["publication_address"],
                    publication_country_type_id=next(
                        (
                            c.id
                            for c in self.countries
                            if c.label == book_data["publication_country_type"]["label"]
                        ),
                        None,
                    ),
                    misc_book_data=book_data["misc_book_data"],
                    translated_of=book_data["translated_of"],
                    translated_as=book_data["translated_as"],
                    rcr=rcr,
                )
            )

        # Insertion en masse des livres
        created_books = Book.objects.bulk_create(
            books_to_create,
            update_conflicts=True,
            unique_fields=["ppn"],
            update_fields=[
                "title",
                "lang_id",
                "type_id",
                "editor_id",
                "publication_date",
                "is_reedition",
                "reedition_date",
                "author_id",
                "illustrator_id",
                "translator_id",
                "publication_city_id",
                "publication_address",
                "publication_country_type_id",
                "misc_book_data",
                "translated_of",
                "translated_as",
                "rcr_id",
            ],
        )

        for book in created_books:
            for to_create_book in books_data:
                if to_create_book["ppn"] == book.ppn:
                    for tag in to_create_book["tags"]:
                        tag_obj, created = BookTags.objects.update_or_create(tag=tag)
                        book.tags.add(tag_obj)

        db_time = datetime.datetime.now() - db_start_time
        print(f"Database insertion time: {db_time} for {len(books_to_create)} books")

    def remove_duplicates_authors(self, authors_data: list[Dict]):
        # remove authors with same lastname and firstname
        final_authors = []
        for author in authors_data:
            if not any(
                a.lastname == author.lastname and a.firstname == author.firstname
                for a in final_authors
            ):
                final_authors.append(author)
        return final_authors

    def remove_duplicates_editors(self, editors_data: list[Dict]):
        # remove editors with same title
        final_editors = []
        for editor in editors_data:
            if not any(e.title == editor.title for e in final_editors):
                final_editors.append(editor)
        return final_editors
