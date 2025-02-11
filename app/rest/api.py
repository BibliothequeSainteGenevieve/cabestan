from ninja import Router
from .views import ClientConfigView

router = Router()


@router.get("/client-config")
def get_client_config(request):
    view = ClientConfigView()
    return view.get(request).data
