from django.db import models
from decimal import Decimal
from shapely.geometry import Point
import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class RcrException(Exception):
    UNHANDLED_TYPE = 0
    OUTBOUND = 1

    def __init__(self, code=None, message=None):
        self.code = code
        self.message = message

    def __str__(self):
        if self.message or self.code:
            return f"""{self.code if self.code is not None else ''} \
{' - ' if self.code is not None and self.message is not None else ''} \
{self.message if self.message is not None else ''}"""
        else:
            return "RcException"


class Rcr(models.Model):
    class Meta:
        db_table = 'rcr'

    rcr = models.CharField(max_length=15, primary_key=True, db_column='rcr')
    lib = models.CharField(max_length=200)
    iln = models.IntegerField()
    ppn = models.CharField(max_length=15)
    email = models.CharField(null=True, blank=True, max_length=200)
    physical_addr_1 = models.CharField(null=True, blank=True, max_length=300)
    physical_addr_2 = models.CharField(null=True, blank=True, max_length=300)
    physical_addr_3 = models.CharField(null=True, blank=True, max_length=300)
    physical_addr_4 = models.CharField(null=True, blank=True, max_length=300)
    city = models.CharField(null=True, blank=True, max_length=150)
    cedex = models.CharField(null=True, blank=True, max_length=15)
    postal_code = models.CharField(null=True, blank=True, max_length=20)
    country = models.CharField(null=True, blank=True, max_length=2)
    latitude = models.DecimalField(null=True, blank=True, max_digits=11, decimal_places=8)
    longitude = models.DecimalField(null=True, blank=True, max_digits=11, decimal_places=8)

    @staticmethod
    def rcr_from_list(val):
        return val[2:-1]

    @staticmethod
    def ppn_from_list(val):
        return val[2:-1]

    @staticmethod
    def longitude_from_list(val):
        val = val.strip().lower().replace(" ", "")
        # logger.debug(val)
        if val in ('null', 'nonprécisé'):
            return None
        else:
            val = round(Decimal(val), 8)
            if val < -180.0 or val > 180.0:
                raise RcrException(code=RcrException.OUTBOUND, message=f"Longitude {val} off limit : must be between -180 and +180")
            return val

    @staticmethod
    def latitude_from_list(val):
        val = val.strip().lower().replace(" ", "")
        # logger.debug(val)
        if val in ('null', 'nonprécisé'):
            return None
        else:
            val = round(Decimal(val), 8)
            if val < -180.0 or val > 180.0:
                raise RcrException(code=RcrException.OUTBOUND, message=f"Latitude {val} off limit : must be between -180 and +180")
            return val

    def create_point(self):
        latitude = Decimal(self.latitude) if self.latitude is not None else None
        longitude = Decimal(self.longitude) if self.longitude is not None else None
        return Point(longitude, latitude) if latitude and longitude else None

    def __str__(self):
        return f"{self.lib} ({self.city})"
