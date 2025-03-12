from typing import Dict, Optional, List
import xml.etree.ElementTree as ET
import datetime
import re
import hashlib
import uuid


class UnimarcBookParser:
    def __init__(self, xml_data: List[Dict]):
        xml_string = self._reconstruct_xml(xml_data)
        self.root = ET.fromstring(xml_string)
        self.number_of_records = self.root.find(
            ".//{http://www.loc.gov/zing/srw/}numberOfRecords"
        ).text
        self.records = self.root.findall(".//{http://www.loc.gov/zing/srw/}record")
        if not self.records:
            print(xml_data)
            print("Aucun record trouvé dans les données XML")

    def parse_books(self) -> List[Dict]:
        """Parse tous les livres présents dans le XML"""
        parse_start_time = datetime.datetime.now()
        books = []
        for i, record in enumerate(self.records, 1):
            self.record = record.find(".//{*}record")  # Mise à jour du record courant
            self.datafields = self.record.findall(".//{*}datafield")
            books.append(self.parse_book())

        total_time = datetime.datetime.now() - parse_start_time
        print(f"Total parsing time: {total_time} for {len(self.records)} records")
        return books

    def get_number_of_records(self):
        if (len(self.records)) == 0:
            return 0
        return self.number_of_records

    def _reconstruct_xml(self, data: List[Dict]) -> str:
        """Reconstruit le XML à partir des dictionnaires"""
        xml_content = []
        for item in data:
            for key, value in item.items():
                if key == '<?xml version="1.0" encoding="UTF-8" ?>':
                    if value:
                        xml_content.append(value)
                elif value and isinstance(value, list):
                    xml_content.extend(value)
        return "\n".join(xml_content)

    def _get_datafields(self, tag: str) -> List:
        """Récupère tous les datafields avec le tag spécifié"""
        return [f for f in self.datafields if f.get("tag") == tag]

    def _get_subfield_value(self, tag: str, code: str) -> Optional[str]:
        """Récupère la valeur d'un subfield spécifique"""
        fields = self._get_datafields(tag)
        if not fields:
            return None

        for field in fields:
            subfield = field.find(f".//*[@code='{code}']")
            if subfield is not None:
                return subfield.text
        return None

    def _get_subfield_from_field(self, field: ET.Element, code: str) -> Optional[str]:
        """Récupère la valeur d'un subfield à partir d'un field donné"""
        subfield = field.find(f".//*[@code='{code}']")
        return subfield.text if subfield is not None else None

    def _extract_firstname_from_field(self, field: ET.Element) -> Optional[str]:
        """Extrait le prénom d'un field"""
        return self._get_subfield_from_field(field, "d")

    def _extract_lastname_from_field(self, field: ET.Element) -> Optional[str]:
        """Extrait le nom de famille d'un field"""
        return self._get_subfield_from_field(field, "a")

    def _extract_firstname(self, tag: str) -> Optional[str]:
        """Extrait le prénom d'un tag"""
        return self._get_subfield_value(tag, "d")

    def _extract_lastname(self, tag: str) -> Optional[str]:
        """Extrait le nom de famille d'un tag"""
        return self._get_subfield_value(tag, "a")

    def parse_book(self) -> Dict:
        """Parse un livre individuel"""
        return {
            "ppn": self.get_ppn(),
            "title": self.get_title(),
            "lang": self.get_language(),
            "type": self.get_book_type(),
            "editor": self.get_editor(),
            "publication_date": self.get_publication_date(),
            "is_reedition": self.is_reedition(),
            "reedition_date": self.get_reedition_date(),
            "author": self.get_main_author(),
            "illustrator": self.get_illustrator(),
            "translator": self.get_translator(),
            "publication_city": self.get_publication_city(),
            "publication_address": self.get_publication_address(),
            "publication_country_type": self.get_country_type(),
            "misc_book_data": self.get_misc_data(),
            "document_type": self.get_book_type(),
            "translated_of": self.get_translated_of(),
            "translated_as": self.get_translated_as(),
            "tags": self.get_tags(),
            "physical_copy_id": self.get_physical_copy_id(),
        }

    def sanitize_string(self, string: str | None) -> str:
        if string is None:
            return None
        return string.strip().lower()

    def get_ppn(self) -> str:
        """Extrait le PPN (003@)"""
        return self.sanitize_string(self._get_subfield_value("003@", "0"))

    def get_title(self) -> str:
        """Extrait le titre (021A)"""
        return self.sanitize_string(self._get_subfield_value("021A", "a"))

    def get_language(self) -> Dict:
        """Extrait la langue (010@)"""
        return {
            "iso_code": self.sanitize_string(self._get_subfield_value("010@", "a")),
            "label": self.sanitize_string(self._get_subfield_value("010@", "8")),
        }

    def get_book_type(self) -> str:
        """Détermine le type de document pour le modèle BookType"""
        general_type = self._get_subfield_value("002@", "0")
        content_type = self._get_subfield_value("012T", "c")
        carrier_type = self._get_subfield_value("012V", "c")

        if general_type:
            # Mapping complet des codes UNIMARC vers les types de BookType

            # Monographies
            if general_type.startswith("Aa"):
                return "printed-monograph"
            elif general_type.startswith("Ab"):
                return "manuscript"
            elif general_type.startswith("Ac"):
                return "printed-music"
            elif general_type.startswith("Ad"):
                return "periodical"
            elif general_type.startswith("Ae"):
                return "electronic-resource"
            elif general_type.startswith("Af"):
                return "cartographic-material"
            elif general_type.startswith("Ag"):
                return "projected-medium"
            elif general_type.startswith("Ah"):
                return "sound-recording"
            elif general_type.startswith("Ai"):
                return "graphic-material"
            elif general_type.startswith("Aj"):
                return "three-dimensional-object"
            elif general_type.startswith("Ak"):
                return "kit"
            elif general_type.startswith("Al"):
                return "microform"
            elif general_type.startswith("Am"):
                return "mixed-material"
            elif general_type.startswith("An"):
                return "tactile-material"
            elif general_type.startswith("Ao"):
                return "computer-file"
            elif general_type.startswith("Ap"):
                return "braille"
            elif general_type.startswith("Ar"):
                return "remote-sensing-image"
            elif general_type.startswith("As"):
                return "unmediated-text"
            elif general_type.startswith("At"):
                return "manuscript-music"
            elif general_type.startswith("Au"):
                return "legal-deposit"
            elif general_type.startswith("Av"):
                return "audiovisual"
            elif general_type.startswith("Ax") or carrier_type == "cz":
                return "electronic-monograph"

            # Ressources continues
            elif general_type.startswith("Ba"):
                return "serial"
            elif general_type.startswith("Bb"):
                return "musical-score"
            elif general_type.startswith("Bc"):
                return "newspaper"
            elif general_type.startswith("Bd"):
                return "website"
            elif general_type.startswith("Be"):
                return "database"
            elif general_type.startswith("Bf"):
                return "blog"

            # Enregistrements sonores
            elif general_type.startswith("Oa"):
                return "sound-disc"
            elif general_type.startswith("Ob"):
                return "still-image"
            elif general_type.startswith("Oc"):
                return "map"
            elif general_type.startswith("Od"):
                return "sound-cassette"
            elif general_type.startswith("Oe"):
                return "sound-tape"
            elif general_type.startswith("Of"):
                return "non-musical-recording"
            elif general_type.startswith("Og"):
                return "musical-recording"
            elif general_type.startswith("Oh"):
                return "multimedia"
            elif general_type.startswith("Oi"):
                return "online-resource"

            # Ressources électroniques
            elif general_type.startswith("La"):
                return "electronic-legal-deposit"
            elif general_type.startswith("Lb"):
                return "electronic-book"
            elif general_type.startswith("Lc"):
                return "electronic-periodical"
            elif general_type.startswith("Ld"):
                return "electronic-thesis"

            # Thèses et documents académiques
            elif general_type.startswith("Ta"):
                return "thesis"
            elif general_type.startswith("Tb"):
                return "dissertation"
            elif general_type.startswith("Tc"):
                return "research-report"

            # Par défaut
            else:
                return "printed-monograph"
        elif content_type:
            if content_type == "txt" and "thesis" in self.get_title().lower():
                return "thesis"
            elif content_type == "txt" and self._is_article():
                return "article"
            else:
                return content_type
        else:
            return "unknown"

    def get_editor(self) -> Dict:
        """Extrait l'éditeur (033A)"""
        return {"title": self.sanitize_string(self._get_subfield_value("033A", "n"))}

    def get_publication_date(self) -> Optional[str]:
        """Extrait la date de publication (011@)"""
        return self.sanitize_string(self._get_subfield_value("011@", "a"))

    def is_reedition(self) -> bool:
        """Vérifie s'il s'agit d'une réédition"""
        return bool(self._get_subfield_value("011@", "b"))

    def get_reedition_date(self) -> Optional[str]:
        """Extrait la date de réédition"""
        return self.sanitize_string(self._get_subfield_value("011@", "b"))

    def get_main_author(self) -> Dict:
        """Extrait l'auteur principal (028A)"""
        return {
            "firstname": self.sanitize_string(self._extract_firstname("028A")),
            "lastname": self.sanitize_string(self._extract_lastname("028A")),
            "type": {"label": "author"},
        }

    def get_illustrator(self) -> Optional[Dict]:
        """Extrait l'illustrateur (028C avec code spécifique)"""
        illustrator_fields = [
            f
            for f in self._get_datafields("028C")
            if self._get_subfield_from_field(f, "B") == "440"
        ]
        if illustrator_fields:
            field = illustrator_fields[0]
            return {
                "firstname": self.sanitize_string(
                    self._extract_firstname_from_field(field)
                ),
                "lastname": self.sanitize_string(
                    self._extract_lastname_from_field(field)
                ),
                "type": {"label": "illustrator"},
            }
        return None

    def get_translator(self) -> Optional[Dict]:
        """Extrait le traducteur (028C avec code spécifique)"""
        translator_fields = [
            f
            for f in self._get_datafields("028C")
            if self._get_subfield_from_field(f, "B") == "730"
        ]
        if translator_fields:
            field = translator_fields[0]
            return {
                "firstname": self.sanitize_string(
                    self._extract_firstname_from_field(field)
                ),
                "lastname": self.sanitize_string(
                    self._extract_lastname_from_field(field)
                ),
                "type": {"label": "translator"},
            }
        return None

    def get_publication_city(self) -> Dict:
        """Extrait la ville de publication (033A)"""
        return {"label": self.sanitize_string(self._get_subfield_value("033A", "p"))}

    def get_publication_address(self) -> Optional[str]:
        """Extrait l'adresse de publication"""
        return self.sanitize_string(self._get_subfield_value("033A", "n"))

    def get_country_type(self) -> Dict:
        """Détermine le type de pays (019@)"""
        country_code = self.sanitize_string(self._get_subfield_value("019@", "a"))
        return {"label": self._map_country_code(country_code)}

    def get_misc_data(self) -> Dict:
        """Collecte toutes les autres informations pertinentes"""
        return {
            "physical_description": self._get_subfield_value("034R", "a"),
            "notes": self._get_subfield_value("300", "a"),
            "references": self._get_subfield_value("310", "a"),
        }

    def _map_type_code(self, code: str) -> str:
        """Mappe les codes de type vers des labels"""
        type_mapping = {
            "Aa": "book",
            "Ab": "manuscript",
            "Ad": "periodical",
        }
        return type_mapping.get(code, "unknown")

    def _map_country_code(self, code: str) -> str:
        """Mappe les codes pays vers des types"""
        country_mapping = {
            "FR": "metropolitan",
            "GP": "drom",
        }
        return country_mapping.get(code, "foreign")

    def _is_article(self) -> bool:
        # Implementation of _is_article method
        # This method should return True if the book is an article, False otherwise
        # This is a placeholder and should be implemented based on your specific requirements
        return False

    def get_translated_of(self) -> Optional[Dict]:
        """Extrait les informations sur l'œuvre originale (454)"""
        field = self._get_datafields("454")
        if not field:
            return None
        else:
            print("found translated of")

        return self.sanitize_string(self._get_subfield_value("454", "t"))

    def get_translated_as(self) -> List[Dict]:
        """Extrait les informations sur les traductions (453)"""
        translations = []
        for field in self._get_datafields("453"):
            translation = self._get_subfield_from_field(field, "t")
            if translation:
                translations.append(translation)
        return ",".join(translations) if translations else None

    def get_tags(self) -> List[str]:
        """Extrait les tags/sujets du livre (zones 600-619)"""
        tags = []

        # Liste des zones contenant des sujets
        subject_fields = []
        for tag in range(600, 620):
            subject_fields.extend(self._get_datafields(str(tag)))

        for field in subject_fields:
            # Récupération des différents sous-champs contenant des sujets
            for code in ["a", "x", "y", "z"]:  # codes UNIMARC pour les sujets
                value = self._get_subfield_from_field(field, code)
                if value:
                    tag = self.sanitize_string(value)
                    if tag and tag not in tags:  # Évite les doublons
                        tags.append(tag)

        return tags if tags else []

    def get_physical_copy_id(self) -> str:
        """Génère un identifiant unique pour l'exemplaire physique spécifique"""
        # Récupération du PPN comme base
        ppn = self.get_ppn() or ""

        # Collecte des données d'exemplaire
        exemplaire_data = {}

        # Recherche des champs d'exemplaires (E01-E99)
        holding_fields = []
        for i in range(1, 100):
            tag = f"E{i:02d}"
            holding_fields.extend(self._get_datafields(tag))

        if holding_fields:
            # On a trouvé des informations d'exemplaire
            field = holding_fields[0]  # Premier exemplaire

            # Récupération de toutes les données d'exemplaire disponibles
            for code in ["5", "f", "j", "c", "e", "k", "d", "o", "x", "z"]:
                value = self._get_subfield_from_field(field, code) or ""
                if value:
                    exemplaire_data[f"e_{code}"] = value

        # Si aucune donnée d'exemplaire n'est trouvée, on cherche d'autres identifiants locaux
        if not exemplaire_data:
            # Champs A98 (informations locales)
            local_fields = self._get_datafields("A98")
            if local_fields:
                for field in local_fields:
                    for code in ["a", "b", "c", "d", "e"]:
                        value = self._get_subfield_from_field(field, code) or ""
                        if value:
                            exemplaire_data[f"a98_{code}"] = value

        # Si toujours rien, on utilise les champs 930 (données locales françaises)
        if not exemplaire_data:
            local_fields = self._get_datafields("930")
            if local_fields:
                for field in local_fields:
                    for code in ["5", "a", "b", "c", "d", "e", "z"]:
                        value = self._get_subfield_from_field(field, code) or ""
                        if value:
                            exemplaire_data[f"930_{code}"] = value

        # Si on a des données d'exemplaire, on génère un hash
        if exemplaire_data:
            # Création d'une chaîne de caractères à partir des données d'exemplaire
            hash_string = "|".join(
                [f"{k}:{v}" for k, v in sorted(exemplaire_data.items())]
            )

            # Génération du hash MD5
            md5_hash = hashlib.md5(hash_string.encode("utf-8")).hexdigest()

            # Retourne le PPN suivi du hash pour garantir l'unicité
            return f"{ppn}_{md5_hash}"

        # Si aucune donnée d'exemplaire n'est trouvée, on ajoute un identifiant aléatoire
        random_id = str(uuid.uuid4())[:8]  # 8 premiers caractères d'un UUID

        return f"{ppn}_generic_{random_id}"
