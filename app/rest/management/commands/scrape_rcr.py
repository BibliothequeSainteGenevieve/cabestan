from django.core.management.base import BaseCommand
from rest.models import (
    Lang,
    RcrType,
    BookType,
    Editor,
    Rcr,
    City,
    Department,
    CountryType,
)
import requests as rq
from cabestan.config import get_config
import csv
import codecs
import re


class Command(BaseCommand):
    help = "Import configuration data"

    def handle(self, *args, **options):
        # Langues
        rcr_url: str = get_config("URL_RCR")
        self.stdout.write("Scrape all rcr from" + str(rcr_url))
        rcr_csv: str = rq.get(rcr_url)
        reader = csv.DictReader(
            codecs.iterdecode(rcr_csv.iter_lines(), "utf-16le"),
            delimiter="\t",
            lineterminator="\r\n",
        )
        for row in reader:                        
            city = None
            if row["PAYS"] == "FR":
                city = self.find_or_create_city_by_name(row["VILLE"], row["CDPOSTAL"])
            rcr = row["\ufeffRCR"].replace('"', "")
            rcr = rcr.replace("\x00=", "")

            rcr_type = self.find_rcr_type(rcr)

            try:
                row["LATITUDE"] = float(row["LATITUDE"])
                row["LONGITUDE"] = float(row["LONGITUDE"])
            except ValueError:
                row["LATITUDE"] = None
                row["LONGITUDE"] = None

            row["EMAIL"] = (
                row["EMAIL"]
                if re.match(
                    r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", row["EMAIL"]
                )
                else None
            )

            Rcr.objects.update_or_create(
                rcr_number=rcr,
                defaults=dict(
                    title=row["LIBELLE"],
                    type=rcr_type,
                    city=city,
                    address=row["ADPHYSIQUE"],
                    country_type=self.find_country_type(
                        row["CDPOSTAL"] if city else None
                    ),
                    latitude=row["LATITUDE"],
                    longitude=row["LONGITUDE"],
                    email=row["EMAIL"],
                ),
            )

        print("Number of rcr: " + str(reader.line_num))

    def find_or_create_city_by_name(self, label: str, zipcode: int):
        try:
            zipcode = "".join(i for i in zipcode if i.isdigit())
            label = label.lower()
            city = City.objects.filter(zipcode=zipcode).first()
            if not city:
                department = self.find_department(zipcode)
                city = City.objects.create(
                    label=label, zipcode=zipcode, department=department
                )
                city.save()
            return city
        except Exception as e:
            print(e)
            return None

    def find_rcr_type(self, label: str):
        type_code = label[5:7]
        rcr_type = RcrType.objects.filter(abes_code=type_code).first()
        if not rcr_type:
            rcr_type = RcrType.objects.get(label="unknown")
        return rcr_type

    def find_department(self, zipcode: int):
        zipcode = "".join(i for i in zipcode if i.isdigit())
        try:
            if int(zipcode) < 96999:
                department = Department.objects.filter(id=zipcode[0:2]).first()
            elif int(zipcode) > 96999:
                department = Department.objects.filter(id=zipcode[0:3]).first()
            else:
                department = None
        except Exception as e:
            print(e)
            department = None
        return department

    def find_country_type(self, zipcode):
        if not zipcode:
            return CountryType.objects.get(label="foreign")
        zipcode = "".join(i for i in zipcode if i.isdigit())
        if int(zipcode) < 96999:
            return CountryType.objects.get(label="metropolitan")
        elif int(zipcode) > 96999:
            return CountryType.objects.get(label="drom")
        elif len(zipcode) == 3:
            return CountryType.objects.get(label="com")
        else:
            return CountryType.objects.get(label="foreign")
