from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Lang, RcrType, BookType, Department, Region
from .serializers import (
    ConfigLangSerializer,
    ConfigRcrTypeSerializer,
    ConfigBookTypeSerializer,
    ConfigDepartmentSerializer,
    ConfigRegionSerializer,
)

# Create your views here.


class ClientConfigView(APIView):
    def get(self, request):
        # Récupérer tous les objets
        languages = Lang.objects.all()
        establishment_types = RcrType.objects.all()
        document_types = BookType.objects.all()
        departments = Department.objects.all()
        regions = Region.objects.all()
        # Sérialiser les données
        data = {
            "languages": ConfigLangSerializer(languages, many=True).data,
            "establishementsTypes": ConfigRcrTypeSerializer(
                establishment_types, many=True
            ).data,
            "documentsTypes": ConfigBookTypeSerializer(document_types, many=True).data,
            "departments": ConfigDepartmentSerializer(departments, many=True).data,
            "regions": ConfigRegionSerializer(regions, many=True).data,
        }

        return Response(data)
