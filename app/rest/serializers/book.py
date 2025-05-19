from rest_framework import serializers
from ..models import Book


class AuthorSerializer(serializers.Serializer):
    firstname = serializers.CharField(allow_null=True)
    lastname = serializers.CharField(allow_null=True)


class PublisherSerializer(serializers.Serializer):
    title = serializers.CharField(source="editor.title", allow_null=True)


class BookSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(allow_null=True)
    translator = AuthorSerializer(allow_null=True)
    publisher = serializers.CharField(source="editor.title", allow_null=True)
    original_language = serializers.CharField(source="lang.iso_code", allow_null=True)
    type = serializers.CharField(source="type.label", allow_null=True)
    publication_city = serializers.CharField(
        source="publication_city.label", allow_null=True
    )

    class Meta:
        model = Book
        fields = [
            "title",
            # "translated_title",
            # "original_title",
            "author",
            "translator",
            "publisher",
            "publication_date",
            "publication_city",
            "publication_address",
            "original_language",
            "type",
        ]
