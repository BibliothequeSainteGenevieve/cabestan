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
            self.controlfields = self.record.findall(".//{*}controlfield")
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

    def _get_controlfields(self, tag: str) -> List:
        """Récupère tous les datafields avec le tag spécifié"""
        return [f for f in self.controlfields if f.get("tag") == tag]

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
        """Extrait le PPN (001)"""
        return self.sanitize_string(self._get_controlfields("001")[0].text)

    def get_title(self) -> str:
        """Extrait le titre (021A)"""
        return self.sanitize_string(self._get_subfield_value("200", "a"))

    def get_language(self) -> Dict:
        """Extrait la langue (010@)"""
        return {
            "iso_code": self.sanitize_string(self._get_subfield_value("101", "a")),
            "label": self.sanitize_string(self._get_subfield_value("101", "a")),
        }

    def get_book_type(self) -> str:
        """Détermine le type de document pour le modèle BookType selon la documentation SUDOC"""
        # Le type de document est défini dans la zone 008 $a positions 1-2
        document_type_code = self._get_subfield_value("008", "a")

        if document_type_code and len(document_type_code) >= 2:
            # Extraction des deux premiers caractères qui définissent le type de document
            type_code = document_type_code[:2]
            # Mapping selon la documentation SUDOC
            if type_code == "Aa":
                return "printed-monograph"  # Monographie imprimée
            elif type_code == "Ab":
                return "periodical"  # Périodique imprimé
            elif type_code == "Ad":
                return "collection"  # Collection imprimée
            elif type_code == "Ar":
                return "printed-collection"  # Recueil factice d'imprimés
            elif type_code == "As":
                return "printed-component"  # Partie composante d'imprimé
            elif type_code == "Ba":
                return "audiovisual"  # Document audiovisuel
            elif type_code == "Bb":
                return "audiovisual-periodical"  # Périodique sous forme de documents audiovisuels
            elif type_code == "Bd":
                return "audiovisual-collection"  # Collection de documents audiovisuels
            elif type_code == "Br":
                return "audiovisual-collection"  # Recueil factice de documents audiovisuels
            elif type_code == "Bs":
                return "audiovisual-extract"  # Extrait de document audiovisuel
            elif type_code == "Fa":
                return "manuscript"  # Manuscrit
            elif type_code == "Ga":
                return "musical-recording"  # Enregistrement sonore musical
            elif type_code == "Gd":
                return "musical-recording-collection"  # Collection d'enregistrements sonores musicaux
            elif type_code == "Ia":
                return "still-image"  # Image fixe
            elif type_code == "Ir":
                return "still-image-collection"  # Recueil factice d'images fixes
            elif type_code == "Ka":
                return "printed-map"  # Carte imprimée
            elif type_code == "Kd":
                return "printed-map-collection"  # Collection de cartes imprimées
            elif type_code == "Ke":
                return "cartographic-series"  # Série cartographique
            elif type_code == "La":
                return "manuscript-music"  # Partition manuscrite
            elif type_code == "Ma":
                return "printed-music"  # Partition imprimée
            elif type_code == "Md":
                return "printed-music-collection"  # Collection de partitions imprimées
            elif type_code == "Mr":
                return "printed-music-collection"  # Recueil factice de partitions imprimées
            elif type_code == "Na":
                return "non-musical-recording"  # Enregistrement sonore non musical
            elif type_code == "Nb":
                return "non-musical-recording-periodical"  # Périodique sous forme d'enregistrements sonores non musicaux
            elif type_code == "Nd":
                return "non-musical-recording-collection"  # Collection d'enregistrements sonores non musicaux
            elif type_code == "Oa":
                return "electronic-monograph"  # Monographie électronique
            elif type_code == "Ob":
                return "electronic-periodical"  # Périodique électronique
            elif type_code == "Od":
                return "electronic-collection"  # Collection de documents électroniques
            elif type_code == "Or":
                return "electronic-collection"  # Recueil factice de documents électroniques
            elif type_code == "Os":
                return "electronic-component"  # Partie de document électronique
            elif type_code == "Pa":
                return "manuscript-map"  # Carte manuscrite
            elif type_code == "Qp":
                return "commercial-bundle"  # Bouquet commercial
            elif type_code == "Va":
                return "object"  # Objet
            elif type_code == "Za":
                return "multimedia"  # Document mutimédia multisupport
            elif type_code == "Zb":
                return "multimedia-periodical"  # Périodique multimédia multisupport
            elif type_code == "Zd":
                return "multimedia-collection"  # Collection de documents multimédias multisupports
            elif type_code == "Zr":
                return "multimedia-collection"  # Recueil factice de documents multimédias multisupports
            else:
                return "unknown"  # Type non reconnu

        # Fallback : déterminer le type en fonction des zones présentes

        # Vérifier la présence de zones spécifiques pour déterminer le type
        if self._get_datafields("110"):
            return "periodical"  # Périodique imprimé (Ab)

        if self._get_datafields("115"):
            return "audiovisual"  # Document audiovisuel (Ba)

        if self._get_datafields("116"):
            return "still-image"  # Image fixe (Ia)

        if self._get_datafields("117"):
            return "object"  # Objet (Va)

        if any(self._get_datafields(tag) for tag in ["120", "121", "123", "124"]):
            return "printed-map"  # Carte imprimée (Ka)

        if any(self._get_datafields(tag) for tag in ["125", "126", "127"]):
            return "non-musical-recording"  # Enregistrement sonore non musical (Na)

        if self._get_datafields("128"):
            return "musical-recording"  # Enregistrement sonore musical (Ga)

        if self._get_datafields("130"):
            return "printed-monograph"  # Microforme (considérée comme monographie)

        if self._get_datafields("135") or self._get_datafields("139"):
            return "electronic-monograph"  # Monographie électronique (Oa)

        if self._get_datafields("140"):
            return "printed-monograph"  # Livre ancien (considéré comme monographie)

        # Vérifier la zone 105 pour les monographies textuelles
        if self._get_datafields("105"):
            return "printed-monograph"  # Monographie imprimée (Aa)

        # Vérifier la zone 106 pour la forme de la ressource
        form_code = self._get_subfield_value("106", "a")
        if form_code:
            if form_code == "s":
                return "electronic-monograph"  # Monographie électronique (Oa)
            elif form_code == "r":
                return "printed-monograph"  # Monographie imprimée (Aa)

        # Vérifier la zone 101 pour les langues
        language_code = self._get_subfield_value("101", "a")
        if language_code:
            # Si une langue est spécifiée, c'est probablement un document textuel
            return "printed-monograph"  # Monographie imprimée (Aa)

        # Par défaut, si aucune information spécifique n'est trouvée
        return "unknown"

    def get_editor(self) -> Dict:
        """Extrait l'éditeur (033A)"""
        return {"title": self.sanitize_string(self._get_subfield_value("210", "c"))}

    def get_publication_date(self) -> Optional[str]:
        """Extrait la date de publication (210)"""
        publication_date = self.sanitize_string(self._get_subfield_value("210", "d"))
        if not publication_date:
            publication_date = self.sanitize_string(
                self._get_subfield_value("214", "d")
            )
        return publication_date

    def is_reedition(self) -> bool:
        """Vérifie s'il s'agit d'une réédition"""
        return bool(self._get_subfield_value("205", ""))

    def get_reedition_date(self) -> Optional[str]:
        """Extrait la date de réédition"""
        return self.sanitize_string(self._get_subfield_value("205", ""))

    def get_main_author(self) -> Dict:
        """Extrait l'auteur principal (028A)"""
        firstname = None
        lastname = None

        # Chercher le champ 028A
        author_fields = self._get_datafields("700")
        if author_fields:
            for field in author_fields:
                firstname, lastname = self._extract_author_from_field(field)
                if firstname or lastname:
                    break
            return {
                "firstname": self.sanitize_string(firstname),
                "lastname": self.sanitize_string(lastname),
                "type": {"label": "author"},
            }
        return None

    def get_illustrator(self) -> Optional[Dict]:
        """Extrait l'illustrateur (702 avec code spécifique)"""
        illustrator_fields = [
            f
            for f in self._get_datafields("702")
            if self._get_subfield_from_field(f, "4") == "440"
        ]

        if illustrator_fields:
            field = illustrator_fields[0]
            firstname, lastname = self._extract_author_from_field(field)

            return {
                "firstname": self.sanitize_string(firstname),
                "lastname": self.sanitize_string(lastname),
                "type": {"label": "illustrator"},
            }
        return None

    def get_translator(self) -> Optional[Dict]:
        """Extrait le traducteur (702 avec code spécifique)"""
        translator_fields = [
            f
            for f in self._get_datafields("702")
            if self._get_subfield_from_field(f, "B") == "730"
        ]

        if translator_fields:
            field = translator_fields[0]
            firstname, lastname = self._extract_author_from_field(field)

            return {
                "firstname": self.sanitize_string(firstname),
                "lastname": self.sanitize_string(lastname),
                "type": {"label": "translator"},
            }
        return None

    def get_publication_city(self) -> Dict:
        """Extrait la ville de publication (210)"""
        publication_city = self.sanitize_string(self._get_subfield_value("210", "a"))
        if not publication_city:
            publication_city = self.sanitize_string(
                self._get_subfield_value("214", "a")
            )
        return {"label": publication_city}

    def get_publication_address(self) -> Optional[str]:
        """Extrait l'adresse de publication"""
        publication_address = self.sanitize_string(self._get_subfield_value("210", "b"))
        if not publication_address:
            publication_address = self.sanitize_string(
                self._get_subfield_value("214", "b")
            )
        return publication_address

    def get_country_type(self) -> Dict:
        """Détermine le type de pays (102)"""
        country_code = self.sanitize_string(self._get_subfield_value("102", "a"))
        return {"label": self._map_country_code(country_code)}

    def get_misc_data(self) -> Dict:
        """Collecte toutes les autres informations pertinentes"""
        return {
            "physical_description": self._get_subfield_value("215", "a"),
            "notes": self._get_subfield_value("300", "a"),
            "references": self._get_subfield_value("310", "a"),
        }

    def _map_country_code(self, code: str) -> str:
        """Mappe les codes pays vers des types"""
        country_mapping = {
            "fr": "metropolitan",
            "gp": "drom",
        }
        return country_mapping.get(code, "foreign")

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
        """Extrait les tags/sujets du livre (principalement zone 610)"""
        tags = []

        # En UNIMARC, la zone 610 contient les mots-clés non contrôlés
        subject_fields = self._get_datafields("610")

        for field in subject_fields:
            # La sous-zone 'a' contient les termes sujets
            value = self._get_subfield_from_field(field, "a")
            if value:
                # Les termes peuvent être séparés par des points-virgules
                terms = value.split(";")
                for term in terms:
                    tag = self.sanitize_string(term)
                    if tag and tag not in tags:  # Évite les doublons
                        tags.append(tag)
        return tags if tags else []

    def get_physical_copy_id(self) -> str:
        """Génère un identifiant unique pour l'exemplaire physique spécifique"""
        # Récupération du PPN comme base
        ppn = self.get_ppn() or ""

        # Collecte des données d'exemplaire
        exemplaire_data = {}

        # En UNIMARC, les informations d'exemplaires sont dans les zones 9XX
        # Principalement 930 (données d'exemplaire), 995 (exemplaire), 915 (localisation)

        # 1. Recherche dans la zone 995 (données d'exemplaire complètes)
        exemplaire_fields = self._get_datafields("995")
        if exemplaire_fields:
            field = exemplaire_fields[0]  # Premier exemplaire

            # Codes importants en 995 selon la documentation SUDOC
            for code in ["f", "k", "r", "u", "a", "b", "c", "e", "j", "n", "s"]:
                value = self._get_subfield_from_field(field, code) or ""
                if value:
                    exemplaire_data[f"995_{code}"] = value

        # 2. Si pas d'information en 995, chercher dans 930 (données locales)
        if not exemplaire_data:
            local_fields = self._get_datafields("930")
            if local_fields:
                for field in local_fields:
                    for code in ["5", "a", "b", "c", "d", "e", "z"]:
                        value = self._get_subfield_from_field(field, code) or ""
                        if value:
                            exemplaire_data[f"930_{code}"] = value

        # 3. Chercher dans 915 (localisation)
        if not exemplaire_data:
            location_fields = self._get_datafields("915")
            if location_fields:
                for field in location_fields:
                    for code in ["a", "b", "5"]:
                        value = self._get_subfield_from_field(field, code) or ""
                        if value:
                            exemplaire_data[f"915_{code}"] = value

        # 4. Chercher dans 856 (accès électronique)
        if not exemplaire_data:
            electronic_fields = self._get_datafields("856")
            if electronic_fields:
                for field in electronic_fields:
                    for code in ["u", "z", "x"]:
                        value = self._get_subfield_from_field(field, code) or ""
                        if value:
                            exemplaire_data[f"856_{code}"] = value

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

    def _extract_author_from_field(self, field):
        """Extrait le prénom et le nom d'un champ d'auteur"""
        # Essayer d'abord les sous-champs standards
        firstname = self._get_subfield_from_field(field, "b")
        lastname = self._get_subfield_from_field(field, "a")

        # Si pas trouvé, essayer le sous-champ 8 qui contient souvent le nom complet
        if not firstname and not lastname:
            full_name = self._get_subfield_from_field(field, "f")
            if full_name:
                # Format typique: "Nom, Prénom (dates)" ou "Nom, Prénom"
                # Supprimer les dates entre parenthèses si présentes
                name_without_dates = re.sub(r"\s*\([^)]*\)", "", full_name)

                # Séparer le nom et le prénom
                parts = name_without_dates.split(",", 1)
                if len(parts) > 1:
                    lastname = parts[0].strip()
                    firstname = parts[1].strip()
                else:
                    # Si pas de virgule, considérer comme nom de famille
                    lastname = name_without_dates.strip()

        return firstname, lastname
