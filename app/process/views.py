from django.shortcuts import render
from scraper.models import Language


# Create your views here.
def index(request):
    languages = Language.objects.all()
    context = {'languages': languages}
    if request.method == 'GET':
        return render(request, 'templates/main.html', context)
