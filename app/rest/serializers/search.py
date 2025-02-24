from rest_framework import serializers
from ..models import Rcr


class AddressSerializer(serializers.Serializer):
    street = serializers.CharField(source="address", allow_null=True)
    postalCode = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    country = serializers.CharField(default="France")

    def get_postalCode(self, obj):
        return obj.city.zipcode if obj.city else None

    def get_city(self, obj):
        return obj.city.label if obj.city else None


class ContactSerializer(serializers.Serializer):
    website = serializers.CharField()
    phone = serializers.CharField()
    email = serializers.CharField()
    address = AddressSerializer(source="*")


class LocationSerializer(serializers.Serializer):
    longitude = serializers.FloatField()
    latitude = serializers.FloatField()


class RcrSerializer(serializers.ModelSerializer):
    rcr = serializers.CharField(source="rcr_number")
    name = serializers.CharField(source="title")
    translatedName = serializers.CharField(default=None)
    numberOfDocuments = serializers.SerializerMethodField()
    contact = ContactSerializer(source="*")
    location = LocationSerializer(source="*")

    class Meta:
        model = Rcr
        fields = [
            "rcr",
            "name",
            "translatedName",
            "numberOfDocuments",
            "contact",
            "location",
        ]

    def get_numberOfDocuments(self, obj):
        return (
            obj.calculated_books_count
            if hasattr(obj, "calculated_books_count")
            else obj.books_count
        )
