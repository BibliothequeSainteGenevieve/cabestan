from django.urls import path
from .views import ClientConfigView
from api.rcr import router as rcr_router
from api.book import router as book_router

urlpatterns = [
    path("api/client-config", ClientConfigView.as_view(), name="client-config"),
    path("api/", rcr_router.urls),
    path("api/", book_router.urls),
]
