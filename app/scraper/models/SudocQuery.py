from django.db import models
from .Rcr import Rcr
from .Language import Language
import logging
import requests as rq
import xml.etree.ElementTree as et

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# When constructing sudoc queries, by default, all attributes from sudoc_query class will be taken into account

# Except following ones
IGNORE_ATTRIBUTES = ['ID', 'id', 'url', 'number', 'created']

# Following fields are not used directly in sudoc query, a subfield will be used instead
# (obviously, fields are required to be a foreign key on another class)
QUERY_SUBFIELDS = {'rbc': 'rcr', 'lan': 'code'}
# DISPLAY_SUBFIELDS = {'rbc': 'lib', 'lan': 'name'}


class SudocQuery(models.Model):
    class Meta:
        db_table = 'sudoc_query'
        constraints = [models.UniqueConstraint(fields=['rbc', 'lan', 'created'], name='unique_rbc_lan_created')]

    url = models.TextField()
    number = models.IntegerField(db_column='number')
    created = models.DateField(auto_now_add=True)
    rbc = models.ForeignKey(Rcr, on_delete=models.CASCADE, default=None, null=True, db_column='rbc')
    lan = models.ForeignKey(Language, on_delete=models.CASCADE, default=None, null=True, db_column='lan')

    # You can add any field below, and use it as a search criteria / display field hereafter
    # first_name = models.CharField(db_column='prenom', null=True, default=None)

    @staticmethod
    def get_values(attr, value):
        field = SudocQuery._meta.get_field(attr)
        logger.debug(field)
        logger.debug(value)
        if field.get_internal_type() == 'ForeignKey':
            # If field is a foreign key
            # If value has not been filled, take all possible values
            # Else check if it's present in table
            if value is None:
                return list(field.related_model.objects.all())
            else:
                stripped_options = [i.strip() for i in value.split(',')]
                result = field.related_model.objects.filter(**{f"{field.remote_field.field_name}__in": stripped_options})
                if not result.exists():
                    logger.warning(field.related_model.__name__)
                    raise field.related_model.DoesNotExist
                return list(result)
        elif value is not None:
            return [value]

    @staticmethod
    def get_from_sudoc(url, criterias, result):
        logger.debug(url)
        req = rq.get(url)
        root_sudoc = et.fromstring(req.content)
        child = root_sudoc.find("{http://www.loc.gov/zing/srw/}numberOfRecords")
        sudoc_query = SudocQuery(url=url, number=child.text)
        for k, v in criterias.items():
            setattr(sudoc_query, k, v)
        result.append(sudoc_query)

    def __str__(self):
        string = ""
        for field in SudocQuery._meta.get_fields():
            if field.name not in IGNORE_ATTRIBUTES:
                # if field.name in DISPLAY_SUBFIELDS:
                #     string += f"{getattr(getattr(self, field.name), DISPLAY_SUBFIELDS[field.name])} / "
                # else:
                string += f"{getattr(self, field.name)} / "
        string += f"{self.created} : {self.number}"
        return string
