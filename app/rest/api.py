from ninja import Router, Query, Schema
from typing import Optional
from .models import Book, Editor, City, Rcr, Author
from .views import ClientConfigView
from django.db.models import Q


router = Router()


@router.get("/client-config")
def get_client_config(request):
    view = ClientConfigView()
    return view.get(request).data


class RcrSearchFilters(Schema):
    string: Optional[str] = None
    type: Optional[str] = None
    language: Optional[str] = None
    region: Optional[str] = None
    department: Optional[str] = None
    city: Optional[str] = None
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
        "rcr",
    )

    if filters.string:
        search_value = filters.string
        print("search: " + filters.string)
        if filters.type == "rcr":
            search_query = Q(rcr__rcr_number=search_value) | Q(rcr__title=search_value)
        if filters.type == "editor":
            queryset.select_related("editor")
            search_query = Q(editor__title=search_value)
        if filters.type == "author":
            queryset.select_related("author")
            search_query = Q(author__lastname=search_value) | Q(
                author__firstname=search_value
            ) & Q(author__type__label="author")
        if filters.type == "translator":
            queryset.select_related("translator")
            search_query = Q(translator__lastname=search_value) | Q(
                translator__firstname=search_value
            ) & Q(translator__type__label="translator")
        if filters.type == "illustrator":
            queryset.select_related("illustrator")
            search_query = Q(illustrator__lastname=search_value) | Q(
                illustrator__firstname=search_value
            ) & Q(illustrator__type__label="illustrator")
        if filters.type == "book":
            search_query = Q(title=search_value)

        queryset = queryset.filter(search_query)

    if filters.region:
        region_query = Q()
        for region_id in filters.region.split(","):
            region_query |= Q(rcr__city__department__region_id=region_id.strip())
        queryset = queryset.filter(region_query)

    if filters.department:
        department_query = Q()
        for department_id in filters.department.split(","):
            department_query |= Q(rcr__city__department_id=department_id.strip())
        queryset = queryset.filter(department_query)

    if filters.city:
        city_query = Q()
        for city_id in filters.city.split(","):
            city_query |= Q(rcr__city_id=city_id.strip())
        queryset = queryset.filter(city_query)

    if filters.rcr_type:
        rcr_query = Q()
        for rcr_type in filters.rcr_type.split(","):
            rcr_query |= Q(rcr__type__label=rcr_type.strip())
        queryset = queryset.filter(rcr_query)

    if filters.language:
        lang_query = Q()
        for lang in filters.language.split(","):
            lang_query |= Q(lang__iso_code=lang.strip())
        queryset = queryset.filter(lang_query)

    if filters.book_type:
        book_type_query = Q()
        for b_type in filters.book_type.split(","):
            book_type_query |= Q(type__label=b_type.strip())
        queryset = queryset.filter(book_type_query)

    if filters.publisher:
        publisher_query = Q()
        for pub in filters.publisher.split(","):
            publisher_query |= Q(editor__title__icontains=pub.strip())
        queryset = queryset.filter(publisher_query)

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
        response = [
            {
                "rcr": book.rcr.rcr_number,
                "name": book.rcr.title,
                "numberOfDocuments": book.rcr.books_count,
                "contact": {
                    "address": {
                        "street": book.rcr.address,
                        "postalCode": book.rcr.city.zipcode if book.rcr.city else None,
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
        ]
    return response


class EditorSearchFilters(Schema):
    str: str


@router.get("/editor/search")
def search_editor(request, filters: EditorSearchFilters = Query(...)):
    if len(filters.str) < 3:
        return {"items": []}

    queryset = Editor.objects.filter(title__icontains=filters.str).values(
        "id", "title"
    )[:10]

    return list(queryset)


class CitySearchFilters(Schema):
    str: str


@router.get("/city/search")
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
