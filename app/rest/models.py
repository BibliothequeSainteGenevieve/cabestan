from django.db import models
from django.contrib.postgres.indexes import HashIndex


# Localisation models
class Region(models.Model):
    label = models.CharField(max_length=100)

    def __str__(self):
        return self.label


class Department(models.Model):
    label = models.CharField(max_length=100)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.label


class City(models.Model):
    label = models.CharField(max_length=100)
    zipcode = models.CharField(max_length=10, null=True, blank=True, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    def __str__(self):
        return self.label


class CountryType(models.Model):
    label = models.CharField(max_length=100)  # DROM, Metropolitan, Stranger

    def __str__(self):
        return self.label


# RCR related models
class RcrType(models.Model):
    label = models.CharField(max_length=100)  # library, reserve, etc.
    abes_code = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return self.label


class Rcr(models.Model):
    title = models.CharField(max_length=200)
    rcr_number = models.CharField(max_length=50)
    type = models.ForeignKey(RcrType, on_delete=models.CASCADE)
    city = models.ForeignKey(City, on_delete=models.CASCADE, null=True, blank=True)
    address = models.CharField(max_length=255)
    longitude = models.FloatField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    country_type = models.ForeignKey(CountryType, on_delete=models.CASCADE)
    books_count = models.IntegerField(null=True, blank=True, default=0)

    def __str__(self):
        return f"{self.title} ({self.rcr_number})"

    class Meta:
        indexes = [
            HashIndex(fields=["rcr_number"]),
            HashIndex(fields=["title"]),
        ]


# Book related models
class Lang(models.Model):
    label = models.CharField(max_length=100)
    iso_code = models.CharField(max_length=10)

    def __str__(self):
        return self.label


class AuthorType(models.Model):
    label = models.CharField(max_length=100)  # author, editor, illustrator, etc.

    def __str__(self):
        return self.label


class Author(models.Model):
    firstname = models.CharField(max_length=100, null=True, blank=True)
    lastname = models.CharField(max_length=100)
    type = models.ForeignKey(AuthorType, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.firstname} {self.lastname}"

    class Meta:
        indexes = [
            HashIndex(fields=["firstname"]),
            HashIndex(fields=["lastname"]),
        ]


class Editor(models.Model):
    title = models.TextField(max_length=200)

    def __str__(self):
        return self.title

    class Meta:
        indexes = [
            HashIndex(fields=["title"]),
        ]


class BookType(models.Model):
    label = models.CharField(max_length=100)  # book, pdf, etc.

    def __str__(self):
        return self.label


class Book(models.Model):
    ppn = models.CharField(max_length=200, unique=True, default="")
    title = models.TextField(max_length=200, null=True, blank=True)
    lang = models.ForeignKey(Lang, on_delete=models.CASCADE, null=True, blank=True)
    type = models.ForeignKey(BookType, on_delete=models.CASCADE, null=True, blank=True)
    editor = models.ForeignKey(Editor, on_delete=models.CASCADE, null=True, blank=True)
    publication_date = models.DateField(null=True, blank=True)
    is_reedition = models.BooleanField(null=True, blank=True)
    reedition_date = models.DateField(null=True, blank=True)
    author = models.ForeignKey(
        Author,
        on_delete=models.CASCADE,
        related_name="authored_books",
        null=True,
        blank=True,
    )
    illustrator = models.ForeignKey(
        Author,
        on_delete=models.CASCADE,
        related_name="illustrated_books",
        null=True,
        blank=True,
    )
    translator = models.ForeignKey(
        Author,
        on_delete=models.CASCADE,
        related_name="translated_books",
        null=True,
        blank=True,
    )
    publication_city = models.ForeignKey(
        City, on_delete=models.CASCADE, null=True, blank=True
    )
    publication_address = models.TextField(max_length=255, null=True, blank=True)
    publication_country_type = models.ForeignKey(
        CountryType, on_delete=models.CASCADE, null=True, blank=True
    )
    misc_book_data = models.JSONField(null=True, blank=True)
    rcr = models.ForeignKey(Rcr, on_delete=models.CASCADE, default=None)

    def __str__(self):
        return self.title

    class Meta:
        indexes = [
            HashIndex(fields=["title"]),
        ]


class RcrBook(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    rcr = models.ForeignKey(Rcr, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("book", "rcr")

    def __str__(self):
        return f"{self.book.title} at {self.rcr.title}"


class BookTranslation(models.Model):
    book = models.ForeignKey(
        Book, on_delete=models.CASCADE, related_name="original_book"
    )
    translate = models.ForeignKey(
        Book, on_delete=models.CASCADE, related_name="translated_book"
    )

    class Meta:
        unique_together = ("book", "translate")

    def __str__(self):
        return f"{self.book.title} -> {self.translate.title}"
