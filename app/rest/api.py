from ninja import Router, Query, Schema
from typing import Optional
from .models import Book, Editor, City, Rcr, Author
from .views import ClientConfigView
from django.db.models import Q, Count
from datetime import datetime

router = Router()


@router.get("/client-config")
def get_client_config(request):
    view = ClientConfigView()
    return view.get(request).data


class RcrSearchFilters(Schema):
    string: Optional[str] = None
    type: Optional[str] = None
    languages: Optional[str] = None
    regions: Optional[str] = None
    departments: Optional[str] = None
    cities: Optional[str] = None
    establishementsTypes: Optional[str] = None
    documentsTypes: Optional[str] = None
    publisher: Optional[str] = None
    map_format: Optional[bool] = False
    page: int = 1
    per_page: int = 20
    publicationDatesStart: Optional[int] = None
    publicationDatesEnd: Optional[int] = None
    reeditionDatesStart: Optional[int] = None
    reeditionDatesEnd: Optional[int] = None


@router.get("/rcr/search")
def search_rcr(request, filters: RcrSearchFilters = Query(...)):
    queryset = Rcr.objects.all()

    if filters.string:
        search_value = filters.string
        if filters.type == "rcr":
            queryset = queryset.filter(
                Q(rcr_number=search_value) | Q(title=search_value)
            )
        if filters.type == "editor":
            queryset = queryset.filter(books__editor__title=search_value).distinct()
        if filters.type == "author":
            queryset = queryset.filter(
                Q(books__author__lastname=search_value)
                | Q(books__author__firstname=search_value),
                books__author__type__label="author",
            ).distinct()
        if filters.type == "translator":
            queryset = queryset.filter(
                Q(books__translator__lastname=search_value)
                | Q(books__translator__firstname=search_value),
                books__translator__type__label="translator",
            ).distinct()
        if filters.type == "illustrator":
            queryset = queryset.filter(
                Q(books__illustrator__lastname=search_value)
                | Q(books__illustrator__firstname=search_value),
                books__illustrator__type__label="illustrator",
            ).distinct()
        if filters.type == "book":
            queryset = queryset.filter(books__title=search_value).distinct()

    if filters.regions:
        region_query = Q()
        for region_id in filters.regions.split(","):
            region_query |= Q(city__department__region_id=region_id.strip())
        queryset = queryset.filter(region_query)

    if filters.departments:
        department_query = Q()
        for department_id in filters.departments.split(","):
            department_query |= Q(city__department_id=department_id.strip())
        queryset = queryset.filter(department_query)

    if filters.cities:
        city_query = Q()
        for city_id in filters.cities.split(","):
            city_query |= Q(city_id=city_id.strip())
        queryset = queryset.filter(city_query)

    if filters.establishementsTypes:
        rcr_query = Q()
        for rcr_type in filters.establishementsTypes.split(","):
            rcr_query |= Q(type__label=rcr_type.strip())
        queryset = queryset.filter(rcr_query)

    if filters.languages:
        lang_query = Q()
        for lang in filters.languages.split(","):
            lang_query |= Q(books__lang__iso_code=lang.strip())
        queryset = queryset.filter(lang_query).distinct()

    if filters.documentsTypes:
        book_type_query = Q()
        for b_type in filters.documentsTypes.split(","):
            book_type_query |= Q(books__type__label=b_type.strip())
        queryset = queryset.filter(book_type_query).distinct()

    if filters.publisher:
        publisher_query = Q()
        for pub in filters.publisher.split(","):
            publisher_query |= Q(books__editor__id=pub.strip())
        queryset = queryset.filter(publisher_query).distinct()

    if filters.publicationDatesStart:
        publication_date_start = datetime.fromtimestamp(
            filters.publicationDatesStart / 1000
        )
        print(publication_date_start)
        queryset = queryset.filter(books__publication_date__gte=publication_date_start)

    if filters.publicationDatesEnd:
        publication_date_end = datetime.fromtimestamp(
            filters.publicationDatesEnd / 1000
        )
        queryset = queryset.filter(books__publication_date__lte=publication_date_end)
    if filters.reeditionDatesStart:
        reedition_date_start = datetime.fromtimestamp(
            filters.reeditionDatesStart / 1000
        )
        queryset = queryset.filter(books__reedition_date__gte=reedition_date_start)

    if filters.reeditionDatesEnd:
        reedition_date_end = datetime.fromtimestamp(filters.reeditionDatesEnd / 1000)
        queryset = queryset.filter(books__reedition_date__lte=reedition_date_end)

    queryset = queryset.order_by("-books_count", "title")
    # calculate books count
    queryset = queryset.annotate(calculated_books_count=Count("books"))

    queryset = queryset.order_by("-calculated_books_count", "title")

    if not filters.map_format:
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
            "items": [
                {
                    "rcr": rcr.rcr_number,
                    "name": rcr.title,
                    "translatedName": None,
                    "numberOfDocuments": rcr.calculated_books_count,
                    "contact": {
                        "website": rcr.website,
                        "phone": rcr.phone,
                        "email": rcr.email,
                        "address": {
                            "street": rcr.address,
                            "postalCode": rcr.city.zipcode if rcr.city else None,
                            "city": rcr.city.label if rcr.city else None,
                            "country": "France",
                        },
                    },
                    "location": {
                        "longitude": rcr.longitude,
                        "latitude": rcr.latitude,
                    },
                    "languages": {
                        "count": None,
                        "supported": None,
                    },
                    "metadata": {
                        "author": None,
                        "publicationPlace": None,
                        "publisher": None,
                        "publicationDate": None,
                        "documentLanguage": None,
                        "tags": None,
                    },
                }
                for rcr in queryset
            ],
        }
    else:
        response = [
            {
                "rcr": rcr.rcr_number,
                "name": rcr.title,
                "numberOfDocuments": rcr.calculated_books_count,
                "contact": {
                    "address": {
                        "street": rcr.address,
                        "postalCode": rcr.city.zipcode if rcr.city else None,
                        "city": rcr.city.label if rcr.city else None,
                        "country": "France",
                    }
                },
                "location": {
                    "longitude": rcr.longitude,
                    "latitude": rcr.latitude,
                },
            }
            for rcr in queryset
        ]
    print(queryset.query)
    return response


class EditorSearchFilters(Schema):
    str: str


@router.get("/publishers/search")
def search_editor(request, filters: EditorSearchFilters = Query(...)):
    if len(filters.str) < 3:
        return {"items": []}

    queryset = Editor.objects.filter(title__icontains=filters.str).values(
        "id", "title"
    )[:10]

    return list(queryset)


class CitySearchFilters(Schema):
    str: str


@router.get("/cities/search")
def search_city(request, filters: CitySearchFilters = Query(...)):
    if len(filters.str) < 3:
        return {"items": []}

    queryset = City.objects.filter(label__icontains=filters.str).values(
        "id", "label", "zipcode"
    )[:10]

    return list(queryset)


class SuggestionsSearchFilters(Schema):
    str: str


@router.get("/suggestions/search")
def search_suggestions(request, filters: SuggestionsSearchFilters = Query(...)):
    books = Book.objects.filter(title__icontains=filters.str).values("title")[:3]
    rcr = Rcr.objects.filter(title__icontains=filters.str).values(
        "title", "rcr_number"
    )[:3]
    authors = (
        Author.objects.filter(lastname__icontains=filters.str)
        .filter(type__label="author")
        .values("lastname", "firstname")[:3]
    )
    translators = (
        Author.objects.filter(lastname__icontains=filters.str)
        .filter(type__label="translator")
        .values("lastname", "firstname")[:3]
    )
    illustrators = (
        Author.objects.filter(lastname__icontains=filters.str)
        .filter(type__label="illustrator")
        .values("lastname", "firstname")[:3]
    )
    editors = Editor.objects.filter(title__icontains=filters.str).values("title")[:3]

    formatted_results = []

    # Format RCR results
    for r in rcr:
        formatted_results.append(
            {"title": r["title"], "subtitle": r["rcr_number"], "type": "rcr"}
        )

    # Format Book results
    for b in books:
        formatted_results.append(
            {
                "title": b["title"],
                "subtitle": None,
                "type": "book",
            }
        )

    # Format Author results
    for a in authors:
        formatted_results.append(
            {
                "title": a["firstname"],
                "subtitle": a["lastname"],
                "type": "author",
            }
        )

    # Format Translator results
    for t in translators:
        formatted_results.append(
            {"title": t["firstname"], "subtitle": t["lastname"], "type": "translator"}
        )

    # Format Illustrator results
    for i in illustrators:
        formatted_results.append(
            {"title": i["firstname"], "subtitle": i["lastname"], "type": "illustrator"}
        )

    # Format Editor results
    for e in editors:
        formatted_results.append(
            {"title": e["title"], "subtitle": None, "type": "editor"}
        )

    return formatted_results
