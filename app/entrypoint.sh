#!/bin/bash
echo launch django

python manage.py migrate --noinput
python manage.py createsuperuser \
        --noinput \
        --username $DJANGO_SUPERUSER_USERNAME \
        --email $DJANGO_SUPERUSER_EMAIL

if python manage.py shell -c "from rest.models import Department; exit(0 if Department.objects.exists() else 1)"; then
    echo "Fixtures already added"
else
    echo "Loading fixtures..."
    python manage.py loaddata regions country_types rcr_types book_types languages departments
    echo "Fixtures added"
fi
python manage.py runserver 0.0.0.0:8080