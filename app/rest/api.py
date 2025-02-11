from ninja import Router, Query, Schema
from typing import Optional
from .models import Rcr
from .views import ClientConfigView


router = Router()


@router.get("/client-config")
def get_client_config(request):
    view = ClientConfigView()
    return view.get(request).data


class RcrSearchFilters(Schema):
    language: Optional[str] = None
    region: Optional[int] = None
    department: Optional[int] = None
    city: Optional[int] = None
    rcr_type: Optional[str] = None
    book_type: Optional[str] = None
    publisher: Optional[str] = None
    page: int = 1
    per_page: int = 20


@router.get("/rcr/search")
def search_rcr(request, filters: RcrSearchFilters = Query(...)):
    queryset = Rcr.objects.select_related(
        "type", "city__department__region", "country_type"
    ).prefetch_related(
        "rcrbook_set__book__lang",
        "rcrbook_set__book__type",
        "rcrbook_set__book__editor",
    )

    if filters.region:
        queryset = queryset.filter(city__department__region_id=filters.region)
    if filters.department:
        queryset = queryset.filter(city__department_id=filters.department)
    if filters.city:
        queryset = queryset.filter(city_id=filters.city)

    if filters.rcr_type:
        queryset = queryset.filter(type__label=filters.rcr_type)

    if filters.language:
        queryset = queryset.filter(rcrbook__book__lang__iso_code=filters.language)

    if filters.book_type:
        queryset = queryset.filter(rcrbook__book__type__label=filters.book_type)

    if filters.publisher:
        queryset = queryset.filter(
            rcrbook__book__editor__title__icontains=filters.publisher
        )

    queryset = queryset.distinct()

    total = queryset.count()
    start = (filters.page - 1) * filters.per_page
    end = start + filters.per_page
    queryset = queryset[start:end]

    return {
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
                "numberOfDocuments": rcr.rcrbook_set.count(),
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
                "location": {"longitude": rcr.longitude, "latitude": rcr.latitude},
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
            for rcr in queryset
        ],
    }
