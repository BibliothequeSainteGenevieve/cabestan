from django.db import models


class Language(models.Model):
    class Meta:
        db_table = 'language'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['name']),
        ]

    code = models.CharField(blank=False, max_length=7, primary_key=True, db_column='code')
    name = models.CharField(blank=False, max_length=100)

    def __str__(self):
        return f"{self.code} - {self.name}"
