from ninja import Router, Query, Schema
from typing import Optional
from ..models import (
    Book,
    Editor,
    City,
    Rcr,
    Author,
    Region,
    Department,
    Lang,
    BookType,
    CountryType,
    RcrType,
)
from ..views import ClientConfigView
from django.db.models import (
    Q,
    Count,
    F,
    Value,
    IntegerField,
    OuterRef,
    Subquery,
)
from django.db.models.functions import Coalesce
from datetime import datetime
import csv
from django.http import HttpResponse
from ..serializers.search import RcrSerializer
from ..serializers.rcr import RcrDetailsSerializer
from django.core.cache import cache

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
    publishers: Optional[str] = None
    map_format: Optional[bool] = False
    territories: Optional[str] = None
    page: int = 1
    itemsPerPage: int = 20
    publicationDatesStart: Optional[int] = None
    publicationDatesEnd: Optional[int] = None
    reeditionDatesStart: Optional[int] = None
    reeditionDatesEnd: Optional[int] = None
    nullValues: Optional[bool] = True


# Cache des tables de référence
CACHE_TIMEOUT = 3600  # 1 heure en secondes


def get_cached_reference_data():
    """Récupère ou met en cache les données de référence"""
    cache_key = "reference_data_cache"
    reference_data = cache.get(cache_key)

    if reference_data is None:
        # Charger toutes les données de référence en une fois
        reference_data = {
            "regions": {r.id: r for r in Region.objects.all()},
            "departments": {
                d.id: d for d in Department.objects.select_related("region").all()
            },
            "cities": {
                c.id: c
                for c in City.objects.select_related(
                    "department", "department__region"
                ).all()
            },
            "languages": {l.iso_code: l.id for l in Lang.objects.all()},
            "document_types": {dt.label: dt.id for dt in BookType.objects.all()},
            "country_types": {ct.label: ct.id for ct in CountryType.objects.all()},
            "establishment_types": {et.label: et.id for et in RcrType.objects.all()},
            # Mappings inversés pour les recherches rapides
            "city_to_department": {c.id: c.department_id for c in City.objects.all()},
            "department_to_region": {
                d.id: d.region_id for d in Department.objects.all()
            },
        }

        # Mettre en cache pour une utilisation future
        cache.set(cache_key, reference_data, CACHE_TIMEOUT)

    return reference_data


@router.get("/rcrs/search")
def search_rcr(request, filters: RcrSearchFilters = Query(...)):
    # Récupérer les données de référence mises en cache
    ref_data = get_cached_reference_data()

    # 1. Construction des conditions RCR
    rcr_conditions = Q()
    if filters.type == "rcr" and filters.string:
        rcr_conditions &= Q(rcr_number=filters.string) | Q(title=filters.string)
        if filters.nullValues:
            rcr_conditions |= Q(rcr_number__isnull=True)
            rcr_conditions |= Q(title__isnull=True)

    if filters.regions:
        region_ids = [int(region_id) for region_id in filters.regions.split(",")]
        # Trouver toutes les villes qui appartiennent à ces régions
        cities_in_regions = [
            city_id
            for city_id, city in ref_data["cities"].items()
            if city.department and city.department.region_id in region_ids
        ]
        rcr_conditions &= Q(city_id__in=cities_in_regions)
        if filters.nullValues:
            rcr_conditions |= Q(city_id__isnull=True)

    if filters.departments:
        department_ids = [int(dept_id) for dept_id in filters.departments.split(",")]
        # Trouver toutes les villes qui appartiennent à ces départements
        cities_in_departments = [
            city_id
            for city_id, city in ref_data["cities"].items()
            if city.department_id in department_ids
        ]
        rcr_conditions &= Q(city_id__in=cities_in_departments)
        if filters.nullValues:
            rcr_conditions |= Q(city_id__isnull=True)

    if filters.cities:
        city_ids = [int(city_id) for city_id in filters.cities.split(",")]
        rcr_conditions &= Q(city_id__in=city_ids)
        if filters.nullValues:
            rcr_conditions |= Q(city_id__isnull=True)

    if filters.establishementsTypes:
        # Utiliser les IDs au lieu des labels
        establishment_type_ids = [
            ref_data["establishment_types"][label]
            for label in filters.establishementsTypes.split(",")
            if label in ref_data["establishment_types"]
        ]
        rcr_conditions &= Q(type_id__in=establishment_type_ids)
        if filters.nullValues:
            rcr_conditions |= Q(type_id__isnull=True)

    if filters.territories:
        # Utiliser les IDs au lieu des labels
        country_type_ids = [
            ref_data["country_types"][label]
            for label in filters.territories.split(",")
            if label in ref_data["country_types"]
        ]
        rcr_conditions &= Q(country_type_id__in=country_type_ids)
        if filters.nullValues:
            rcr_conditions |= Q(country_type_id__isnull=True)

    # 2. Construction des conditions Book
    book_conditions = Q()
    if filters.string:
        if filters.type == "editor":
            book_conditions &= Q(editor__title=filters.string)
            if filters.nullValues:
                book_conditions |= Q(editor__isnull=True)
        elif filters.type == "author":
            book_conditions &= (
                Q(author__lastname=filters.string) | Q(author__firstname=filters.string)
            ) & Q(author__type__label="author")
            if filters.nullValues:
                book_conditions |= Q(author__isnull=True)
        elif filters.type == "translator":
            book_conditions &= (
                Q(translator__lastname=filters.string)
                | Q(translator__firstname=filters.string)
            ) & Q(translator__type__label="translator")
            if filters.nullValues:
                book_conditions |= Q(translator__isnull=True)
        elif filters.type == "illustrator":
            book_conditions &= (
                Q(illustrator__lastname=filters.string)
                | Q(illustrator__firstname=filters.string)
            ) & Q(illustrator__type__label="illustrator")
            if filters.nullValues:
                book_conditions |= Q(illustrator__isnull=True)
        elif filters.type == "book":
            book_conditions &= Q(title=filters.string)

    if filters.languages:
        # Convertir les codes ISO en IDs de langue
        lang_ids = [
            ref_data["languages"][iso_code]
            for iso_code in filters.languages.split(",")
            if iso_code in ref_data["languages"]
        ]
        book_conditions &= Q(lang_id__in=lang_ids)
        if filters.nullValues:
            book_conditions |= Q(lang_id__isnull=True)

    if filters.documentsTypes:
        # Convertir les labels en IDs de type de document
        doc_type_ids = [
            ref_data["document_types"][label]
            for label in filters.documentsTypes.split(",")
            if label in ref_data["document_types"]
        ]
        book_conditions &= Q(type_id__in=doc_type_ids)
        if filters.nullValues:
            book_conditions |= Q(type_id__isnull=True)

    if filters.publishers:
        book_conditions &= Q(editor__id__in=filters.publishers.split(","))
        if filters.nullValues:
            book_conditions |= Q(editor__isnull=True)

    if filters.publicationDatesStart:
        book_conditions &= Q(
            publication_date__gte=datetime.fromtimestamp(
                filters.publicationDatesStart / 1000
            )
        )
        if filters.nullValues:
            book_conditions |= Q(publication_date__isnull=True)

    if filters.publicationDatesEnd:
        book_conditions &= Q(
            publication_date__lte=datetime.fromtimestamp(
                filters.publicationDatesEnd / 1000
            )
        )
        if filters.nullValues:
            book_conditions |= Q(publication_date__isnull=True)

    if filters.reeditionDatesStart:
        book_conditions &= Q(
            reedition_date__gte=datetime.fromtimestamp(
                filters.reeditionDatesStart / 1000
            )
        )
        if filters.nullValues:
            book_conditions |= Q(reedition_date__isnull=True)

    if filters.reeditionDatesEnd:
        book_conditions &= Q(
            reedition_date__lte=datetime.fromtimestamp(filters.reeditionDatesEnd / 1000)
        )
        if filters.nullValues:
            book_conditions |= Q(reedition_date__isnull=True)

    # 3. Récupération des IDs des RCR filtrés
    filtered_rcr_ids = (
        set(Rcr.objects.filter(rcr_conditions).values_list("id", flat=True))
        if rcr_conditions
        else set(Rcr.objects.values_list("id", flat=True))
    )

    # 4. Si des filtres de livres sont présents
    if book_conditions:
        # Récupérer les RCR et leur compte de livres en une seule requête
        book_counts = (
            Book.objects.filter(book_conditions)
            .values("rcr_id")
            .annotate(count=Count("id"))
            .filter(rcr_id__in=filtered_rcr_ids)
        )

        # Convertir en dictionnaire pour un accès rapide
        rcr_book_counts = {item["rcr_id"]: item["count"] for item in book_counts}

        # Mettre à jour filtered_rcr_ids pour ne garder que les RCR avec des livres
        filtered_rcr_ids &= set(rcr_book_counts.keys())

    # 5. Construction de la requête finale avec préchargement des relations
    queryset = list(Rcr.objects.filter(id__in=filtered_rcr_ids))

    # 6. Enrichir les objets RCR avec les données en cache
    for rcr in queryset:
        # Ajouter les relations à partir du cache
        if rcr.city_id and rcr.city_id in ref_data["cities"]:
            rcr.city = ref_data["cities"][rcr.city_id]

            # Ajouter le département et la région
            dept_id = ref_data["city_to_department"].get(rcr.city_id)
            if dept_id and dept_id in ref_data["departments"]:
                rcr.city.department = ref_data["departments"][dept_id]

                region_id = ref_data["department_to_region"].get(dept_id)
                if region_id and region_id in ref_data["regions"]:
                    rcr.city.department.region = ref_data["regions"][region_id]

    # 7. Ajout des comptages et tri
    if book_conditions:
        # Ajouter le compte de livres à chaque RCR
        for rcr in queryset:
            rcr.calculated_books_count = rcr_book_counts.get(rcr.id, 0)

        # Tri en Python
        queryset.sort(key=lambda x: (-x.calculated_books_count, x.title))
    else:
        # Tri par le books_count existant
        queryset.sort(key=lambda x: (-x.books_count, x.title))

    # 8. Pagination et réponse
    if not filters.map_format:
        total = len(queryset)
        start = (filters.page - 1) * filters.itemsPerPage
        end = start + filters.itemsPerPage
        paginated_queryset = queryset[start:end]

        response = {
            "pagination": {
                "totalResults": total,
                "currentPage": filters.page,
                "itemsPerPage": filters.itemsPerPage,
                "remainingItems": max(0, total - (filters.page * filters.itemsPerPage)),
            },
            "items": RcrSerializer(paginated_queryset, many=True).data,
        }
    else:
        response = RcrSerializer(queryset, many=True).data

    return response


@router.get("/rcrs/export", auth=None)
def export_rcr(request, filters: RcrSearchFilters = Query(...)):
    filters.map_format = True
    data = search_rcr(request, filters)

    response = HttpResponse(
        content_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="export_rcr.csv"'},
        charset="utf-8",
    )

    writer = csv.writer(response)
    # Titre de l'établissement Adresse complète +ville + code postal + étranger/france + numero RCR + nb ouvrage
    writer.writerow(
        [
            "Titre de l'établissement",
            "Adresse complète",
            "Ville",
            "Code postal",
            "Étranger/France",
            "Numero RCR",
            "Nb ouvrage",
        ]
    )
    for item in data:
        writer.writerow(
            [
                item["name"],
                item["contact"]["address"]["street"],
                item["contact"]["address"]["city"],
                item["contact"]["address"]["postalCode"],
                item["contact"]["address"]["country"],
                item["rcr"],
                item["numberOfDocuments"],
            ]
        )

    return response


@router.get("/rcr/{rcr_number}/details")
def get_rcr_details(request, rcr_number: str):
    rcr = Rcr.objects.get(rcr_number=rcr_number)
    return RcrDetailsSerializer(rcr).data


class EditorSearchFilters(Schema):
    str: str


@router.get("/publishers/search")
def search_editor(request, filters: EditorSearchFilters = Query(...)):
    if len(filters.str) < 3:
        return {"items": []}

    queryset = Editor.objects.filter(title__icontains=filters.str).values(
        "id", "title"
    )[:10]

    response = [
        {
            "id": item["id"],
            "name": item["title"],
        }
        for item in queryset
    ]

    return response


@router.get("/publisher/{id}")
def get_publisher_by_id(request, id: int):
    publisher = Editor.objects.get(id=id)
    return {
        "id": publisher.id,
        "name": publisher.title,
    }


class CitySearchFilters(Schema):
    str: str


@router.get("/city/{id}")
def get_city_by_id(request, id: int):
    city = City.objects.get(id=id)
    return {
        "id": city.id,
        "name": city.label,
    }


@router.get("/cities/search")
def search_city(request, filters: CitySearchFilters = Query(...)):
    if len(filters.str) < 3:
        return {"items": []}

    queryset = City.objects.filter(label__icontains=filters.str).values(
        "id", "label", "zipcode"
    )[:10]

    response = [
        {
            "id": item["id"],
            "name": item["label"],
        }
        for item in queryset
    ]

    return response


class SuggestionsSearchFilters(Schema):
    str: str


@router.get("/suggestions/search")
def search_suggestions(request, filters: SuggestionsSearchFilters = Query(...)):
    books = (
        Book.objects.filter(title__icontains=filters.str)
        .distinct("ppn")
        .values("title")[:3]
    )

    rcr_conditions = Q(title__icontains=filters.str) | Q(
        rcr_number__icontains=filters.str
    )

    rcr = Rcr.objects.filter(rcr_conditions).values("title", "rcr_number")[:3]
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
