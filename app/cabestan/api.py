from ninja import NinjaAPI
from ninja.security import HttpBearer
from scraper.api import router as scraper_router
from process.api import router as process_router
from rest.api.rcr import router as rcr_router
from rest.api.book import router as book_router
from .config import get_config
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

api = NinjaAPI()


@api.exception_handler(Exception)
def internal_error(request, exc):
    logger.critical(f"API Internal error : {exc}")
    return api.create_response(request, {"detail": "API internal error"}, status=500)


class ScraperAuthBearer(HttpBearer):
    def authenticate(self, request, token):
        if token == get_config("API_SCRAPER_TOKEN"):
            return token


class ProcessAuthBearer(HttpBearer):
    def authenticate(self, request, token):
        if token == get_config("API_PROCESS_TOKEN"):
            return token


class RestAuthBearer(HttpBearer):
    def authenticate(self, request, token):
        if token == get_config("API_PROCESS_TOKEN"):
            return token


api.add_router("/scraper/", scraper_router, tags=["scraper"], auth=ScraperAuthBearer())
api.add_router("/process/", process_router, tags=["process"], auth=ProcessAuthBearer())
api.add_router("/rest/", rcr_router, tags=["rcr"], auth=RestAuthBearer())
api.add_router("/rest/", book_router, tags=["book"], auth=RestAuthBearer())
