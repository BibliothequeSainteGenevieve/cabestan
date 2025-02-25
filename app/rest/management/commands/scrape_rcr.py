from django.core.management.base import BaseCommand
from rest.models import (
    RcrType,
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
from rest.management.commands.book_parser import UnimarcBookParser
from django.db.models import Q
import unicodedata


class Command(BaseCommand):
    help = "Import configuration data"

    def handle(self, *args, **options):
        # Langues
        rcr_url: str = get_config("URL_RCR")
        self.sudoc_url: str = get_config("URL_SUDOC")
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
                city = self.find_city(row["VILLE"], row["CDPOSTAL"], row["CDPOSTAL"])
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

            books_count = self.find_books_count(rcr)

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
                    books_count=books_count,
                ),
            )

        print("Number of rcr: " + str(reader.line_num))

    def find_city(self, label: str, zipcode: int, insee: int):
        try:
            zipcode = "".join(i for i in zipcode if i.isdigit())
            label = label.lower()
            # use OR with one request
            city = self.find_city_by_code(zipcode, insee)
            if not city:
                city = self.find_city_by_name_exactly(label)
            if not city:
                city = self.find_city_by_name_partially(label)
            if not city:
                city = self.find_city_with_sanitized_name(label)
            if not city:
                city = self.find_city_with_saint_replaced(label)
            return city
        except Exception as e:
            print(e)
            return None

    def find_city_by_code(self, zipcode: int, insee: int):
        try:
            city = City.objects.filter(zipcode=zipcode, insee=insee).first()
            if not city:
                print("not found by code for " + str(zipcode) + " " + str(insee))
            return city
        except Exception as e:
            print(e)

    def find_city_by_name_exactly(self, label: str):
        try:
            city_strings = label.upper()
            city_strings = unicodedata.normalize("NFD", city_strings)
            city_strings = city_strings.encode("ascii", "ignore")
            city_strings = city_strings.decode("utf-8")

            city = City.objects.filter(label=city_strings).first()
            if not city:
                print("not found for exactly " + city_strings)
            return city
        except Exception as e:
            print(e)

    def find_city_by_name_partially(self, label: str):
        try:
            city = City.objects.filter(label__icontains=label.strip()).first()
            if not city:
                print("not found for partially " + label)
            return city
        except Exception as e:
            print(e)

    def find_city_with_sanitized_name(self, label: str):
        try:
            city = self.find_city_by_name_exactly(self.sanitize_city_name(label))
            if not city:
                print("not found for sanitized " + self.sanitize_city_name(label))
            return city
        except Exception as e:
            print(e)

    def find_city_with_saint_replaced(self, label: str):
        try:
            city = self.sanitize_city_name(label)
            city.replace("saint", "st")
            city = self.find_city_by_name_exactly(self.sanitize_city_name(label))
            if not city:
                print("not found for sanitized " + self.sanitize_city_name(label))
            return city
        except Exception as e:
            print(e)

    def sanitize_city_name(self, label: str):
        label = label.lower()
        label = label.replace("cedex", "")
        label = label.replace("-", " ")
        return label

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

    def find_books_count(self, rcr_number: str):
        try:
            url = f"{self.sudoc_url}/?operation=searchRetrieve&version=1.1&query=rbc%3D{rcr_number}&maximumRecords=1&startRecord=1"
            rcr_csv: str = rq.get(url)
            reader = csv.DictReader(
                codecs.iterdecode(rcr_csv.iter_lines(), "utf-8"),
                delimiter="\t",
                lineterminator="\r\n",
            )
            data = list(reader)
            parser = UnimarcBookParser(data)
            number_of_records = parser.get_number_of_records()
            return number_of_records
        except Exception as e:
            print(e)
            return None
