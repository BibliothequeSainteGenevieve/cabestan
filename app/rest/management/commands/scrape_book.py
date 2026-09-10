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
from rest.management.commands.utils.author_utils import AuthorUtils
from typing import List
import datetime
from cabestan.config import get_config
import pytz
from typing import Dict
import traceback
import logging
import os
import time
from django.conf import settings

# Logger dédié aux erreurs de scraping des livres
_log_dir = os.path.join(settings.BASE_DIR, "logs")
os.makedirs(_log_dir, exist_ok=True)
_scrape_book_handler = logging.FileHandler(
    os.path.join(_log_dir, "scrape_book.log")
)
_scrape_book_handler.setFormatter(
    logging.Formatter("%(asctime)s %(levelname)s %(message)s")
)
scrape_book_logger = logging.getLogger("scrape_book")
scrape_book_logger.setLevel(logging.WARNING)
if not scrape_book_logger.handlers:
    scrape_book_logger.addHandler(_scrape_book_handler)

_HTTP_TIMEOUT = 60          # secondes
_HTTP_MAX_RETRIES = 3
_HTTP_BACKOFF = 10          # secondes entre tentatives (multiplié par le numéro de tentative)


class Command(BaseCommand):
    help = "Import book data"
    NUMBER_OF_RECORDS_PER_CALL = 200  # Réduit pour éviter les erreurs serveur ABES

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

    def add_arguments(self, parser):
        parser.add_argument(
            "--rcr_number",
            type=int,
        )

    def handle(self, *args, **options):
        self.url = get_config("URL_SUDOC")
        print("Importing book data")
        self.get_initial_data()
        if options["rcr_number"]:
            rcrs = Rcr.objects.filter(rcr_number=options["rcr_number"])
        else:
            rcrs = Rcr.objects.filter(
                Q(
                    last_scraped_date__lte=datetime.datetime.now(tz=pytz.UTC)
                    - datetime.timedelta(days=7)
                )
                | Q(last_scraped_date__isnull=True)
            )
        rcrs = list(rcrs)
        total_rcrs = len(rcrs)
        for rcr_index, rcr in enumerate(rcrs, 1):
            print(f"[RCR {rcr_index}/{total_rcrs}] {rcr.rcr_number}")
            try:
                self.parse_one_rcr(rcr)
                rcr.last_scraped_date = datetime.datetime.now(tz=pytz.UTC)
                rcr.save()
            except Exception as e:
                scrape_book_logger.error(
                    "Erreur irrécupérable sur le RCR %s : %s\n%s",
                    rcr.rcr_number, e, traceback.format_exc(),
                )
                # print(traceback.format_exc())
                # print(f"Error parsing rcr {rcr.rcr_number}: {e}")
            # print(" ")

    def _get_with_retry(self, url: str) -> rq.Response:
        """Exécute un GET HTTP avec retry et backoff. Lève l'exception au dernier échec."""
        last_exc = None
        for attempt in range(1, _HTTP_MAX_RETRIES + 1):
            try:
                response = rq.get(url, timeout=_HTTP_TIMEOUT)
                return response
            except (
                rq.exceptions.ChunkedEncodingError,
                rq.exceptions.ConnectionError,
                rq.exceptions.Timeout,
            ) as e:
                last_exc = e
                if attempt < _HTTP_MAX_RETRIES:
                    wait = _HTTP_BACKOFF * attempt
                    scrape_book_logger.warning(
                        "Tentative %d/%d échouée pour %s : %s. Nouvel essai dans %ds.",
                        attempt, _HTTP_MAX_RETRIES, url, e, wait,
                    )
                    time.sleep(wait)
                else:
                    scrape_book_logger.error(
                        "Toutes les tentatives (%d) ont échoué pour %s : %s",
                        _HTTP_MAX_RETRIES, url, e,
                    )
        raise last_exc

    def parse_one_rcr(self, rcr: Rcr, start_record: int = 1):
        start_time = datetime.datetime.now()
        url = (
            f"{self.url}?operation=searchRetrieve&recordSchema=unimarc&version=1.1"
            f"&query=rbc%3D{rcr.rcr_number}&maximumRecords=1&startRecord=1"
        )
        try:
            rcr_csv = self._get_with_retry(url)
        except Exception as e:
            scrape_book_logger.error(
                "Impossible de récupérer le nombre de notices pour le RCR %s : %s",
                rcr.rcr_number, e,
            )
            return

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

        step = (
            int(self.NUMBER_OF_RECORDS_PER_CALL)
            if int(self.NUMBER_OF_RECORDS_PER_CALL) < int(number_of_records)
            else int(number_of_records)
        )
        for i in range(1, int(number_of_records) + 1, step):
            try:
                self.parse_one_record(i, rcr)
            except Exception as e:
                scrape_book_logger.error(
                    "Erreur sur le batch startRecord=%d pour le RCR %s : %s\n%s",
                    i, rcr.rcr_number, e, traceback.format_exc(),
                )
                print(f"Batch startRecord={i} ignoré pour RCR {rcr.rcr_number} : {e}")
                continue
            elapsed = datetime.datetime.now() - start_time
            remaining = elapsed / i * (int(number_of_records) - i)
            print(
                f"scrape {i}/{number_of_records} for rcr:{rcr.rcr_number} - "
                f"in: {elapsed} (finish in {remaining})"
            )

    def parse_one_record(self, index: str, rcr: Rcr):
        url = (
            f"{self.url}?operation=searchRetrieve&recordSchema=unimarc&version=1.1"
            f"&query=rbc%3D{rcr.rcr_number}&maximumRecords={self.NUMBER_OF_RECORDS_PER_CALL}"
            f"&startRecord={index}"
        )
        request_start_time = datetime.datetime.now()
        rcr_csv = self._get_with_retry(url)
        request_time = datetime.datetime.now() - request_start_time
        # print(f"Request time: {request_time}")

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

        # Utilisation de AuthorUtils pour gérer les auteurs
        author_utils = AuthorUtils(books_data)
        author_utils.insert_or_update_authors()
        # Les books_data sont maintenant mis à jour avec les IDs des auteurs

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

            if not book_data["ppn"]:
                scrape_book_logger.warning(
                    "Enregistrement ignoré (PPN absent) pour le RCR %s — unique_identifier : %s",
                    rcr.rcr_number, book_data["physical_copy_id"],
                )
                continue

            books_to_create.append(
                Book(
                    unique_identifier=f"{book_data['physical_copy_id']}_{rcr.rcr_number}",
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
                    author_id=book_data.get("author_id"),
                    illustrator_id=book_data.get("illustrator_id"),
                    translator_id=book_data.get("translator_id"),
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
            unique_fields=["unique_identifier"],
            update_fields=[
                "ppn",
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

        # print(f"Created {len(created_books)} books")

        # for book in created_books:
        #     for to_create_book in books_data:
        #         if to_create_book["physical_copy_id"] == book.unique_identifier:
        #             for tag in to_create_book["tags"]:
        #                 tag_obj, created = BookTags.objects.update_or_create(tag=tag)
        #                 book.tags.add(tag_obj)

        db_time = datetime.datetime.now() - db_start_time
        # print(f"Database insertion time: {db_time} for {len(books_to_create)} books")

    def remove_duplicates_editors(self, editors_data: list[Dict]):
        # remove editors with same title
        final_editors = []
        for editor in editors_data:
            if not any(e.title == editor.title for e in final_editors):
                final_editors.append(editor)
        return final_editors
