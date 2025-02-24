from rest_framework import serializers
from ..models import Lang, RcrType, BookType, Department, Region


class ConfigLangSerializer(serializers.ModelSerializer):
    slug = serializers.SerializerMethodField()

    class Meta:
        model = Lang
        fields = ["slug", "label"]

    def get_slug(self, obj):
        return obj.iso_code


class ConfigRcrTypeSerializer(serializers.ModelSerializer):
    slug = serializers.SerializerMethodField()

    class Meta:
        model = RcrType
        fields = ["slug"]

    def get_slug(self, obj):
        return obj.label


class ConfigBookTypeSerializer(serializers.ModelSerializer):
    slug = serializers.SerializerMethodField()

    class Meta:
        model = BookType
        fields = ["slug"]

    def get_slug(self, obj):
        return obj.label


class ConfigDepartmentSerializer(serializers.ModelSerializer):
    slug = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ["slug", "label"]

    def get_slug(self, obj):
        return str(obj.id).zfill(2)  # Pour avoir "01" au lieu de "1"


class ConfigRegionSerializer(serializers.ModelSerializer):
    slug = serializers.SerializerMethodField()

    class Meta:
        model = Region
        fields = ["slug", "label"]

    def get_slug(self, obj):
        return str(obj.id).zfill(2)  # Pour avoir "01" au lieu de "1"
