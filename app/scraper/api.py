from ninja import Router, Schema
from ninja.responses import codes_4xx
from .api_schema import SudocQuerySpecificSchema
from typing import List
from .models import Language, Rcr, RcrException, SudocQuery, QUERY_SUBFIELDS, IGNORE_ATTRIBUTES
from cabestan.config import get_config
from django.db.models import CharField, IntegerField
from django.db.models.fields import NOT_PROVIDED
from decimal import Decimal
from datetime import date
from itertools import product
from threading import Thread
import xml.etree.ElementTree as et
import requests as rq
import logging

# Ignore urllib debug
logging.getLogger("urllib3").setLevel(logging.INFO)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

router = Router()


class defaultResponseSchema(Schema):
    created: int
    updated: int
    errors: int


class numberResponseSchema(Schema):
    language: str
    rcr: int
    number: int


class errorSchema(Schema):
    detail: str


@router.get(
    "/get_rcr",
    response={200: defaultResponseSchema, codes_4xx: errorSchema, 500: errorSchema},
)
def get_rcr(request):
    rcr_list = rq.get(get_config('URL_RCR'))
    lines = rcr_list.text.split('\n')
    list_in_base = Rcr.objects.all()
    fields_type = {k.name: k for k in Rcr._meta.get_fields() if k.get_internal_type() != 'ForeignKey'}
    fields = [k for k in fields_type.keys()]
    logger.debug(fields)
    logger.debug(fields_type)
    created = 0
    updated = 0
    errors = 0
    # Delete header
    lines.pop(0)
    for line_no, line in enumerate(lines):
        # logger.debug(line)
        if line.strip() != "":
            columns = line.split("\t")
            is_updated = False
            obj = {}
            try:
                for index, field in enumerate(fields):
                    msg = None
                    try:
                        # logger.debug(f"{field} : {columns[index].strip()}")
                        if hasattr(Rcr, f"{field}_from_list") and callable(getattr(Rcr, f"{field}_from_list")):
                            value = getattr(Rcr, f"{field}_from_list")(columns[index])
                        else:
                            # Default treatment for input fields
                            if isinstance(fields_type[field], CharField):
                                max_length = fields_type[field].max_length
                                value = columns[index].strip()
                                if value == 'null':
                                    value = None
                                elif len(value) > max_length:
                                    msg = f"Line {line_no+2} : {field} value is too long, truncated to {max_length} char : {value}"
                                    value = value[0:fields_type[field].max_length - 1]
                            elif isinstance(fields_type[field], IntegerField):
                                # logger.debug(f"Integer {field} ({columns[index]})")
                                value = int(columns[index])
                            else:
                                raise RcrException(
                                    code=RcrException.UNHANDLED_TYPE,
                                    message=f"Line {line_no+2} : Field {field} : type not registered ! ({columns})")
                                break
                        obj[field] = value
                        if msg is not None:
                            logger.warning(msg)
                        # logger.debug(f"obj[{field}] = {obj[field]}")
                    except RcrException as e:
                        if e.code == RcrException.UNHANDLED_TYPE:
                            logger.error(e.message)
                            errors += 1
                        elif e.code == RcrException.OUTBOUND:
                            logger.warning(f"Line {line_no+2} : {e.message} (set to 0)")
                            obj[field] = 0
                        else:
                            raise e
            except Exception as e:
                logger.error(f"Line {line_no+2} : {field=}, {line=} : {e}")
                errors += 1
            try:
                logger.debug(obj)
                obj_in_base = list_in_base.get(rcr=obj['rcr'])
                for i in fields:
                    # Using decimal library to avoid issues with float representation
                    # 17 * 0.1 = 1.7000000000000002
                    # This issue leads to false positive updates
                    if i in ('latitude', 'longitude'):
                        attr_in_base = round(Decimal(getattr(obj_in_base, i)), 8) if getattr(obj_in_base, i) is not None else None
                        attr_in_list = round(Decimal(obj[i]), 8) if obj[i] is not None else None
                    else:
                        attr_in_base = getattr(obj_in_base, i)
                        attr_in_list = obj[i]
                    if attr_in_base != attr_in_list:
                        is_updated = True
                        setattr(obj_in_base, i, obj[i])
                if is_updated:
                    obj_in_base.save()
                    logger.debug("=> Updated")
                    updated += 1
            except Rcr.DoesNotExist:
                try:
                    new_rcr = Rcr(**obj)
                    new_rcr.save()
                    logger.debug("=> Created")
                    created += 1
                except Exception as e:
                    logger.error(f"{obj} => Error while creating : {e}")
                    errors += 1
    logger.info(f"{created} created, {updated} updated, {errors} errors")
    return 200, {'created': created, 'updated': updated, 'errors': errors}


@router.get(
    "/get_lang",
    response={200: defaultResponseSchema, codes_4xx: errorSchema, 500: errorSchema},
)
def get_lang(request):
    languages = rq.get(get_config('URL_LANG'))
    languages.encoding = "utf-8"
    lines = languages.text.lstrip('\ufeff').split('\n')
    logger.debug(lines)
    list_in_base = Language.objects.all()
    updated = 0
    created = 0
    for line in lines:
        if line.strip() != "":
            columns = line.split("|")
            code = columns[0].strip()
            name = columns[4].strip().capitalize()
            try:
                obj_in_base = list_in_base.get(code=code)
                if obj_in_base.name != name:
                    obj_in_base.name = name
                    obj_in_base.save()
                    updated += 1
            except Language.DoesNotExist:
                new_language = Language(**{'code': code, 'name': name})
                new_language.save()
                created += 1
    logger.info(f"{created} created, {updated} updated")
    return 200, {'created': created, 'updated': updated, 'errors': 0},


@router.post(
    "/get_sudoc",
    summary="Récupération œuvres Sudoc",
    response={200: List[numberResponseSchema], codes_4xx: errorSchema, 500: errorSchema},
)
def get_sudoc(request, query: SudocQuerySpecificSchema):
    today = date.today()
    options = {k: v for k, v in query}
    logger.debug(f"Options {options}")
    search_keys = {}
    query_class_fields = [i for i in SudocQuery._meta.get_fields() if i.name not in IGNORE_ATTRIBUTES]
    try:
        for attr, value in query:
            val = SudocQuery.get_values(attr, value)
            if val is not None:
                search_keys[attr] = val
    except Exception as e:
        logger.error(e)
        return 500, {'detail': f"{attr} {value} not found"}

    logger.debug(f"{search_keys=}")
    foreign_lib = search_keys.keys()
    foreign_data = list(search_keys.values())
    thread_list = []
    query_results = []
    url_base = get_config('URL_SUDOC')
    start_thread = False
    # First, inserting all results, by threading queries to sudoc
    # All query create a result object, which will be bulk inserted
    for url_data in product(*foreign_data):
        logger.debug(f"{url_data=}")
        database_criterias = {i.name: None if i.default == NOT_PROVIDED else i.default for i in query_class_fields}
        query_parameters = {}
        for i, j in zip(foreign_lib, url_data):
            database_criterias[i] = j
            query_parameters[i] = getattr(j, QUERY_SUBFIELDS[i]) if i in QUERY_SUBFIELDS else j
        query_string = '%20and%20'.join([f"{k}%3D{v}" for k, v in query_parameters.items()])
        logger.debug(f"{database_criterias=}")
        sudoc_query = SudocQuery.objects.filter(**{**database_criterias, **{'created': today}})
        if sudoc_query.exists():
            logger.warning(f"Query {query_string.replace('%20and%20', ',').replace('%3D', '=')} for {today} already exists")
        else:
            url = url_base.format(query=query_string)
            logger.debug(url)
            t = Thread(target=SudocQuery.get_from_sudoc, kwargs={'url': url, 'criterias': database_criterias, 'result': query_results})
            thread_list.append(t)
            t.start()
            start_thread = True
    if start_thread:
        for t in thread_list:
            t.join()
        logger.debug(query_results)
        SudocQuery.objects.bulk_create(query_results)
        return 200, [{'language': i.lan.code, 'rcr': i.rbc.rcr, 'number': i.number} for i in query_results]
    else:
        return 200, []
