from rest_framework import serializers
from ..models import Rcr
from .search import ContactSerializer, LocationSerializer


class RcrDetailsSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="title")
    rcr = serializers.CharField(source="rcr_number")
    website = serializers.CharField(allow_null=True)
    phone = serializers.CharField(allow_null=True)
    email = serializers.CharField(allow_null=True)
    languages = serializers.SerializerMethodField()
    contact = ContactSerializer(source="*")
    location = LocationSerializer(source="*")

    class Meta:
        model = Rcr
        fields = [
            "website",
            "phone",
            "email",
            "languages",
            "rcr",
            "name",
            "contact",
            "location",
        ]

    def get_languages(self, obj):
        # Récupère la liste des langues distinctes avec leur code ISO
        return list(obj.books.values_list("lang__iso_code", flat=True).distinct())
