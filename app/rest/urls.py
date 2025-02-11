from django.urls import path
from .views import ClientConfigView

urlpatterns = [
    path("api/client-config", ClientConfigView.as_view(), name="client-config"),
]
