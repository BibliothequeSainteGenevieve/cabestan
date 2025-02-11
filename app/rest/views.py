from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Lang, RcrType, BookType, Department, City, Editor
from .serializers import (
    ConfigLangSerializer,
    ConfigRcrTypeSerializer,
    ConfigBookTypeSerializer,
    ConfigDepartmentSerializer,
    ConfigCitySerializer,
    ConfigEditorSerializer,
)

# Create your views here.


class ClientConfigView(APIView):
    def get(self, request):
        # Récupérer tous les objets
        languages = Lang.objects.all()
        establishment_types = RcrType.objects.all()
        document_types = BookType.objects.all()
        departments = Department.objects.all()
        cities = City.objects.all()
        publishers = Editor.objects.all()

        # Sérialiser les données
        data = {
            "languages": ConfigLangSerializer(languages, many=True).data,
            "establishementsTypes": [
                ConfigRcrTypeSerializer(establishment_types, many=True).data
            ],
            "documentTypes": ConfigBookTypeSerializer(document_types, many=True).data,
            "departments": ConfigDepartmentSerializer(departments, many=True).data,
            "city": ConfigCitySerializer(cities, many=True).data,
            "publisher": ConfigEditorSerializer(publishers, many=True).data,
        }

        return Response(data)
