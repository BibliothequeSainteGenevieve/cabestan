from typing import Dict, List, Optional
from rest.models import Author, AuthorType


class AuthorUtils:
    def __init__(self, books_data: List[Dict]):
        self.books_data = books_data
        self.author_mapping = {}  # Stocke les correspondances (prénom, nom, type) -> id
        # Récupération des types d'auteurs directement depuis la base de données
        self.author_type_ids = {at.label: at.id for at in AuthorType.objects.all()}

    def insert_or_update_authors(self):
        """
        Collecte tous les auteurs uniques des livres, les insère en base de données
        et met à jour le mapping pour une utilisation ultérieure.
        """
        # Collecte des auteurs uniques
        self._collect_unique_authors()

        # Création des auteurs en masse
        if self.author_mapping:
            self._create_authors_in_bulk()
            self._update_mapping_with_db_ids()

        # Mise à jour des books_data avec les IDs des auteurs
        self._update_books_with_author_ids()

    def _collect_unique_authors(self):
        """Collecte tous les auteurs uniques des livres"""
        for book_data in self.books_data:
            # Auteur principal
            self._add_author_to_mapping(book_data["author"], "author")

            # Illustrateur
            if book_data.get("illustrator"):
                self._add_author_to_mapping(book_data["illustrator"], "illustrator")

            # Traducteur
            if book_data.get("translator"):
                self._add_author_to_mapping(book_data["translator"], "translator")

    def _add_author_to_mapping(self, author_data: Dict, role: str):
        """Ajoute un auteur au mapping s'il a un prénom ou un nom"""
        if author_data and (
            author_data.get("firstname") or author_data.get("lastname")
        ):
            key = (author_data.get("firstname"), author_data.get("lastname"), role)
            self.author_mapping[key] = None

    def _create_authors_in_bulk(self):
        """Crée les auteurs en masse dans la base de données"""
        authors_to_create = [
            Author(
                firstname=firstname or "",
                lastname=lastname or "",
                type_id=self.author_type_ids.get(role),
            )
            for (firstname, lastname, role) in self.author_mapping.keys()
        ]

        # Suppression des doublons
        authors_to_create = self._remove_duplicates_authors(authors_to_create)

        # Création en masse
        Author.objects.bulk_create(
            authors_to_create,
            ignore_conflicts=True,
        )

    def _update_mapping_with_db_ids(self):
        """Met à jour le mapping avec les IDs des auteurs depuis la base de données"""
        existing_authors = Author.objects.filter(
            firstname__in=[a[0] or "" for a in self.author_mapping.keys()],
            lastname__in=[a[1] or "" for a in self.author_mapping.keys()],
        )

        for author in existing_authors:
            for key in list(self.author_mapping.keys()):
                firstname, lastname, role = key
                if (
                    author.firstname == (firstname or "")
                    and author.lastname == (lastname or "")
                    and author.type_id == self.author_type_ids.get(role)
                ):
                    self.author_mapping[key] = author.id

    def get_author_id_from_book_data(
        self, type_label: str, firstname: str, lastname: str
    ) -> Optional[int]:
        """
        Récupère l'ID d'un auteur à partir de ses informations.

        Args:
            type_label: Le type d'auteur (author, illustrator, translator)
            firstname: Le prénom de l'auteur
            lastname: Le nom de l'auteur

        Returns:
            L'ID de l'auteur ou None si non trouvé
        """
        key = (firstname, lastname, type_label)
        return self.author_mapping.get(key)

    def get_updated_books_data(self) -> List[Dict]:
        """
        Retourne les données des livres mises à jour avec les IDs des auteurs.

        Returns:
            La liste des livres avec les IDs des auteurs
        """
        return self.books_data

    def _update_books_with_author_ids(self):
        """Met à jour les books_data avec les IDs des auteurs"""
        for book_data in self.books_data:
            # Auteur principal
            self._update_book_author_id(book_data, "author", "author_id")

            # Illustrateur
            self._update_book_author_id(book_data, "illustrator", "illustrator_id")

            # Traducteur
            self._update_book_author_id(book_data, "translator", "translator_id")

    def _update_book_author_id(self, book_data: Dict, role_field: str, id_field: str):
        """Met à jour l'ID d'un auteur dans les données du livre"""
        author_data = book_data.get(role_field)
        if author_data:
            key = (
                author_data.get("firstname"),
                author_data.get("lastname"),
                role_field,
            )
            book_data[id_field] = self.author_mapping.get(key)
        else:
            book_data[id_field] = None

    def _remove_duplicates_authors(self, authors_data: List[Author]) -> List[Author]:
        """
        Supprime les auteurs en double (même prénom et nom).

        Args:
            authors_data: Liste des auteurs à filtrer

        Returns:
            Liste des auteurs sans doublons
        """
        final_authors = []
        for author in authors_data:
            if not any(
                a.lastname == author.lastname
                and a.firstname == author.firstname
                and a.type_id == author.type_id
                for a in final_authors
            ):
                final_authors.append(author)
        return final_authors
