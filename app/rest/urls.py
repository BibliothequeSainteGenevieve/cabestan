from django.urls import path
from .views import ClientConfigView
from .api import router

urlpatterns = [
    path("api/client-config", ClientConfigView.as_view(), name="client-config"),
    path("api/", router.urls),
]
