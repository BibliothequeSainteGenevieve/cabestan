from ninja import Router, Query, Schema
from typing import Optional
from .models import Book, Editor, City
from .views import ClientConfigView
from django.db.models import Q


router = Router()


@router.get("/client-config")
def get_client_config(request):
    view = ClientConfigView()
    return view.get(request).data


class RcrSearchFilters(Schema):
    search: Optional[str] = None
    search_type: Optional[str] = None
    language: Optional[str] = None
    region: Optional[int] = None
    department: Optional[int] = None
    city: Optional[int] = None
    rcr_type: Optional[str] = None
    book_type: Optional[str] = None
    publisher: Optional[str] = None
    map_format: Optional[bool] = False
    page: int = 1
    per_page: int = 20


@router.get("/rcr/search")
def search_rcr(request, filters: RcrSearchFilters = Query(...)):

    queryset = Book.objects.select_related(
        "lang",
        "type",
        "editor",
        "author",
        "translator",
        "illustrator",
        "rcr",
    )

    if filters.search:
        if filters.search_type == "rcr":
            search_query = Q(rcr__rcr_number=filters.search) | Q(
                rcr__title=filters.search
            )
        if filters.search_type == "editor":
            search_query = Q(editor__title=filters.search)
        if filters.search_type == "author":
            search_query = Q(author__lastname=filters.search) | Q(
                author__firstname=filters.search
            )
        if filters.search_type == "translator":
            search_query = Q(translator__lastname=filters.search) | Q(
                translator__firstname=filters.search
            )
        if filters.search_type == "illustrator":
            search_query = Q(illustrator__lastname=filters.search) | Q(
                illustrator__firstname=filters.search
            )
        if filters.search_type == "book":
            search_query = Q(title=filters.search)

        queryset = queryset.filter(search_query)

    if filters.region:
        queryset = queryset.filter(rcr__city__department__region_id=filters.region)
    if filters.department:
        queryset = queryset.filter(rcr__city__department_id=filters.department)
    if filters.city:
        queryset = queryset.filter(rcr__city_id=filters.city)

    if filters.rcr_type:
        queryset = queryset.filter(rcr__type__label=filters.rcr_type)

    if filters.language:
        queryset = queryset.filter(lang__iso_code=filters.language)

    if filters.book_type:
        queryset = queryset.filter(type__label=filters.book_type)

    if filters.publisher:
        queryset = queryset.filter(editor__title__icontains=filters.publisher)

    queryset = queryset.distinct("rcr__books_count", "rcr")

    queryset = queryset.order_by("-rcr__books_count", "rcr")

    total = queryset.count()
    start = (filters.page - 1) * filters.per_page
    end = start + filters.per_page
    if not filters.map_format:
        queryset = queryset[start:end]
        response = {
            "pagination": {
                "totalResults": total,
                "currentPage": filters.page,
                "itemsPerPage": filters.per_page,
                "remainingItems": max(0, total - (filters.page * filters.per_page)),
            },
            "items": [
                {
                    "rcr": book.rcr.rcr_number,
                    "name": book.rcr.title,
                    "translatedName": None,
                    "numberOfDocuments": book.rcr.books_count,
                    "contact": {
                        "website": book.rcr.website,
                        "phone": book.rcr.phone,
                        "email": book.rcr.email,
                        "address": {
                            "street": book.rcr.address,
                            "postalCode": (
                                book.rcr.city.zipcode if book.rcr.city else None
                            ),
                            "city": book.rcr.city.label if book.rcr.city else None,
                            "country": "France",
                        },
                    },
                    "location": {
                        "longitude": book.rcr.longitude,
                        "latitude": book.rcr.latitude,
                    },
                    "languages": {
                        "count": None,  # TODO,
                        "supported": None,  # TODO,
                    },
                    "metadata": {
                        "author": None,  # TODO
                        "publicationPlace": None,  # TODO
                        "publisher": None,  # TODO
                        "publicationDate": None,  # TODO
                        "documentLanguage": None,  # TODO
                        "tags": None,  # TODO,
                    },
                }
                for book in queryset
            ],
        }
    else:
        response = {
            "items": [
                {
                    "rcr": book.rcr.rcr_number,
                    "name": book.rcr.title,
                    "numberOfDocuments": book.rcr.books_count,
                    "contact": {
                        "address": {
                            "street": book.rcr.address,
                            "postalCode": (
                                book.rcr.city.zipcode if book.rcr.city else None
                            ),
                            "city": book.rcr.city.label if book.rcr.city else None,
                            "country": "France",
                        }
                    },
                    "location": {
                        "longitude": book.rcr.longitude,
                        "latitude": book.rcr.latitude,
                    },
                }
                for book in queryset
            ],
        }
    return response


class EditorSearchFilters(Schema):
    search: str


@router.get("/editor/search")
def search_editor(request, filters: EditorSearchFilters = Query(...)):
    if len(filters.search) < 3:
        return {"items": []}

    queryset = Editor.objects.filter(title__icontains=filters.search).values(
        "id", "title"
    )[:10]

    return {"items": list(queryset)}


class CitySearchFilters(Schema):
    search: str


@router.get("/city/search")
def search_city(request, filters: CitySearchFilters = Query(...)):
    if len(filters.search) < 3:
        return {"items": []}

    queryset = City.objects.filter(label__icontains=filters.search).values(
        "id", "label", "zipcode"
    )[:10]

    return {"items": list(queryset)}
