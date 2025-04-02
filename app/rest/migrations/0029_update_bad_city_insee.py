from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("rest", "nom_de_la_migration_precedente"),
    ]

    operations = [
        migrations.RunSQL(
            """
            UPDATE rest_city SET insee = '13055' WHERE zipcode = '13000';
            UPDATE rest_city SET insee = '75056' WHERE zipcode = '75000';
            UPDATE rest_city SET insee = '69123' WHERE zipcode = '69000';
            """,
            reverse_sql="""
            UPDATE rest_city SET insee = '13000' WHERE insee = '13055' AND zipcode = '13000';
            UPDATE rest_city SET insee = '75000' WHERE insee = '75056' AND zipcode = '75000';
            UPDATE rest_city SET insee = '69000' WHERE insee = '69123' AND zipcode = '69000';
            """,
        ),
    ]
