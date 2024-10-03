from ninja import Schema, ModelSchema
from typing import Optional
from .models import SudocQuery, IGNORE_ATTRIBUTES
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class SudocQueryCommonSchema(Schema):
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    limit: Optional[int] = None


class SudocQuerySpecificSchema(ModelSchema):
    class Meta:
        model = SudocQuery
        all_attributes = [field.name for field in SudocQuery._meta.fields]
        fields = [element for element in all_attributes if element not in IGNORE_ATTRIBUTES]
        fields_optional = '__all__'


class SudocQueryProcessSchema(SudocQueryCommonSchema, SudocQuerySpecificSchema):
    pass
