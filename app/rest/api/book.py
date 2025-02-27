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
    publisher: Optional[str] = None
    publication_city: Optional[str] = None
    publication_country: Optional[str] = None
    publication_date_start: Optional[datetime] = None
    publication_date_end: Optional[datetime] = None
    original_language: Optional[str] = None
    tags: Optional[str] = None
    collection_name: Optional[str] = None
    event_type: Optional[str] = None
    event_date_start: Optional[datetime] = None
    event_date_end: Optional[datetime] = None
    page: int = 1
    per_page: int = 20


@router.get("/rcr/{rcr_number}/books/search")
def get_rcr_books(request, rcr_number: str, filters: BookSearchFilters = Query(...)):
    queryset = Book.objects.filter(rcr__rcr_number=rcr_number)

    if filters.title:
        queryset = queryset.filter(title__icontains=filters.title)

    # if filters.translated_title:
    #     queryset = queryset.filter(translated_title__icontains=filters.translated_title)

    # if filters.original_title:
    #     queryset = queryset.filter(original_title__icontains=filters.original_title)

    if filters.author_name:
        queryset = queryset.filter(
            Q(author__firstname__icontains=filters.author_name)
            | Q(author__lastname__icontains=filters.author_name)
        )

    if filters.translator_name:
        queryset = queryset.filter(
            Q(translator__firstname__icontains=filters.translator_name)
            | Q(translator__lastname__icontains=filters.translator_name)
        )

    if filters.publisher:
        queryset = queryset.filter(editor__title__icontains=filters.publisher)

    if filters.publication_city:
        queryset = queryset.filter(publication_city__icontains=filters.publication_city)

    if filters.original_language:
        queryset = queryset.filter(lang__iso_code=filters.original_language)

    if filters.publication_date_start:
        publication_date_start = datetime.fromtimestamp(
            filters.publication_date_start / 1000
        )
        queryset = queryset.filter(publication_date__gte=publication_date_start)

    if filters.publication_date_end:
        publication_date_end = datetime.fromtimestamp(
            filters.publication_date_end / 1000
        )
        queryset = queryset.filter(publication_date__lte=publication_date_end)

    if filters.tags:
        tag_query = Q()
        for tag in filters.tags.split(","):
            tag_query |= Q(type__label=tag.strip())
        queryset = queryset.filter(tag_query)

    # Pagination
    total = queryset.count()
    start = (filters.page - 1) * filters.per_page
    end = start + filters.per_page
    queryset = queryset[start:end]

    response = {
        "pagination": {
            "totalResults": total,
            "currentPage": filters.page,
            "itemsPerPage": filters.per_page,
            "remainingItems": max(0, total - (filters.page * filters.per_page)),
        },
        "items": BookSerializer(queryset, many=True).data,
    }

    return response


@router.get("/rcr/{rcr_number}/books/export")
def export_rcr_books(request, rcr_number: str, filters: BookSearchFilters = Query(...)):
    data = get_rcr_books(request, rcr_number=rcr_number, filters=filters)

    response = HttpResponse(
        content_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="export_books.csv"'},
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
