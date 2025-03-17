from ninja import Router, Schema, Query
from ..models import Book
from django.db.models import Q, Count
from typing import Optional
from datetime import datetime
from ..serializers.book import BookSerializer
from django.http import HttpResponse
import csv

router = Router()


class BookSearchFilters(Schema):
    title: Optional[str] = None
    translated_title: Optional[str] = None
    original_title: Optional[str] = None
    author_name: Optional[str] = None
    translator_name: Optional[str] = None
    publishers: Optional[str] = None
    publication_city: Optional[str] = None
    publication_country: Optional[str] = None
    publicationDatesStart: Optional[int] = None
    publicationDatesEnd: Optional[int] = None
    reissueDatesStart: Optional[int] = None
    reissueDatesEnd: Optional[int] = None
    languages: Optional[str] = None
    tags: Optional[str] = None
    collection_name: Optional[str] = None
    event_type: Optional[str] = None
    event_date_start: Optional[datetime] = None
    event_date_end: Optional[datetime] = None
    documentsTypes: Optional[str] = None
    page: int = 1
    itemsPerPage: int = 20
    type: Optional[str] = None
    subtitle: Optional[str] = None
    string: Optional[str] = None
    nullValues: Optional[bool] = True
    allBooks: Optional[bool] = False


@router.get("/rcr/{rcr_number}/books/search")
def get_rcr_books(request, rcr_number: str, filters: BookSearchFilters = Query(...)):
    # Condition de base : filtrer par numéro RCR
    conditions = Q(rcr__rcr_number=rcr_number)

    # Ajout des filtres conditionnels

    # Filtres commentés conservés pour référence
    # if filters.translated_title:
    #     conditions &= Q(translated_title__icontains=filters.translated_title)
    # if filters.original_title:
    #     conditions &= Q(original_title__icontains=filters.original_title)

    if filters.type == "book":
        conditions &= Q(title=filters.string)

    if filters.type == "author" and filters.string and filters.subtitle:
        conditions &= Q(author__firstname=filters.string) & Q(
            author__lastname=filters.subtitle
        )

    if filters.type == "illustrator" and filters.string and filters.subtitle:
        conditions &= Q(illustrator__firstname=filters.string) & Q(
            illustrator__lastname=filters.subtitle
        )
    if filters.documentsTypes:
        conditions &= Q(type__label__in=filters.documentsTypes.split(","))

    if filters.type == "translator" and filters.string and filters.subtitle:
        conditions &= Q(translator__firstname=filters.string) & Q(
            translator__lastname=filters.subtitle
        )

    if filters.documentsTypes:
        conditions &= Q(type__label__in=filters.documentsTypes.split(","))
        if filters.nullValues:
            conditions |= Q(type__isnull=True)

    if filters.publishers:
        conditions &= Q(editor__in=filters.publishers.split(","))
        if filters.nullValues:
            conditions |= Q(editor__isnull=True)

    if filters.publication_city:
        conditions &= Q(publication_city=filters.publication_city)
        if filters.nullValues:
            conditions |= Q(publication_city__isnull=True)

    if filters.languages:
        conditions &= Q(lang__iso_code__in=filters.languages.split(","))
        if filters.nullValues:
            conditions |= Q(lang__isnull=True)

    if filters.publicationDatesStart:
        publication_date_start = datetime.fromtimestamp(
            filters.publicationDatesStart / 1000
        )
        conditions &= Q(publication_date__gte=publication_date_start)
        if filters.nullValues:
            conditions |= Q(publication_date__isnull=True)

    if filters.publicationDatesEnd:
        publication_date_end = datetime.fromtimestamp(
            filters.publicationDatesEnd / 1000
        )
        conditions &= Q(publication_date__lte=publication_date_end)
        if filters.nullValues:
            conditions |= Q(publication_date__isnull=True)

    if filters.reissueDatesStart:
        reissue_date_start = datetime.fromtimestamp(filters.reissueDatesStart / 1000)
        conditions &= Q(reedition_date__gte=reissue_date_start)
        if filters.nullValues:
            conditions |= Q(reedition_date__isnull=True)

    if filters.reissueDatesEnd:
        reissue_date_end = datetime.fromtimestamp(filters.reissueDatesEnd / 1000)
        conditions &= Q(reedition_date__lte=reissue_date_end)
        if filters.nullValues:
            conditions |= Q(reedition_date__isnull=True)

    if filters.tags:
        tag_conditions = Q()
        for tag in filters.tags.split(","):
            tag_conditions |= Q(type__label=tag.strip())
        conditions &= tag_conditions

    # Application des filtres
    queryset = Book.objects.filter(conditions)

    # Pagination
    if not filters.allBooks:
        total = queryset.count()
        start = (filters.page - 1) * filters.itemsPerPage
        end = start + filters.itemsPerPage
        queryset = queryset[start:end]
    else:
        total = 0

    response = {
        "pagination": {
            "totalResults": total,
            "currentPage": filters.page,
            "itemsPerPage": filters.itemsPerPage,
            "remainingItems": max(0, total - (filters.page * filters.itemsPerPage)),
        },
        "items": BookSerializer(queryset, many=True).data,
    }
    return response


@router.get("/rcr/{rcr_number}/books/export", auth=None)
def export_rcr_books(request, rcr_number: str, filters: BookSearchFilters = Query(...)):
    filters.allBooks = True
    data = get_rcr_books(request, rcr_number=rcr_number, filters=filters)

    response = HttpResponse(
        content_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="export_books.csv"'},
        charset="utf-8",
    )

    writer = csv.writer(response)

    writer.writerow(
        [
            "Titre",
            "Auteur",
            "Traducteur",
            "Editeur",
            "Lieu de publication",
            "Pays de publication",
            "Date de publication",
            "Langue original",
            "Tags",
        ]
    )

    # Accéder aux items dans data
    for item in data["items"]:
        writer.writerow(
            [
                item["title"],
                (
                    f"{item['author']['firstname']} {item['author']['lastname']}"
                    if item["author"]
                    else ""
                ),
                (
                    f"{item['translator']['firstname']} {item['translator']['lastname']}"
                    if item["translator"]
                    else ""
                ),
                item["publisher"],
                item["publication_city"],
                "France",  # ou une valeur par défaut appropriée
                item["publication_date"],
                item["original_language"],
                item["type"],
            ]
        )

    return response
