from ninja import Router, Schema, ModelSchema
from ninja.responses import codes_4xx
from datetime import date, datetime, timedelta
from scraper.models import Language, Rcr, SudocQuery
from scraper.api_schema import SudocQueryProcessSchema, SudocQuerySpecificSchema
from django.db.models import Func, Value, CharField, F
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

router = Router()


class SudocQuerySchema(Schema):
    rcr: Optional[int] = None
    lang: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    limit: Optional[int] = None


class RcrSchema(ModelSchema):
    class Meta:
        model = Rcr
        fields = [
            'rcr', 'lib', 'physical_addr_1', 'physical_addr_2', 'physical_addr_3',
            'physical_addr_4', 'city', 'postal_code', 'country', 'latitude',
            'longitude']


class LanguageSchema(ModelSchema):
    class Meta:
        model = Language
        fields = ['code', 'name']


class SudocResultSchema(SudocQuerySpecificSchema):
    rbc: RcrSchema = None
    lan: LanguageSchema = None
    date: str
    number: int


class ErrorSchema(Schema):
    detail: str


@router.post(
    "/get_rcr/",
    summary="Récupération Rcr",
    response={200: List[RcrSchema], codes_4xx: ErrorSchema, 500: ErrorSchema},
)
def get_rcr(request):
    return Rcr.objects.all()


@router.post(
    "/get_lang/",
    summary="Récupération langues",
    response={200: List[LanguageSchema], codes_4xx: ErrorSchema, 500: ErrorSchema},
)
def get_lang(request):
    return Language.objects.all()


@router.post(
    "/get_sudoc/",
    summary="Récupération statistiques",
    response={200: List[SudocResultSchema], codes_4xx: ErrorSchema, 500: ErrorSchema},
)
def get_sudoc(request, query: SudocQueryProcessSchema):
    today = date.today()
    filters = {}
    if query.date_from is None:
        filters['created__gte'] = today
    else:
        try:
            filters['created__gte'] = datetime.strptime(query.date_from, '%Y-%m-%d')
        except Exception:
            return 500, {'detail': 'Bad format for date_from (YYYY-MM-DD expected)'}
    if query.date_to is None:
        filters['created__lt'] = today + timedelta(days=1)
    else:
        try:
            filters['created__lt'] = datetime.strptime(query.date_to, '%Y-%m-%d') + timedelta(days=1)
        except Exception:
            return 500, {'detail': 'Bad format for date_to (YYYY-MM-DDD expected)'}

    display_values = []
    try:
        for attr, value in query:
            if attr not in ['date_from', 'date_to', 'limit']:
                val = SudocQuery.get_values(attr, value)
                if val is not None:
                    display_values.append(attr)
                    if len(val) == 1:
                        filters[attr] = val
                    else:
                        filters[f"{attr}__in"] = val
    except Exception as e:
        logger.error(e)
        return 500, {'detail': f"{attr} {value} not found"}
    if query.limit is not None and query.limit != 0:
        query_results = SudocQuery.objects.filter(**filters).order_by('-number')[:query.limit]
    else:
        logger.debug(filters)
        query_results = SudocQuery.objects.filter(**filters).annotate(
            date=Func(F('created'), Value('YYYY-MM-DD'), function='TO_CHAR', output_field=CharField())
        ).order_by('-number')
    logger.debug(query_results)
    return 200, query_results
