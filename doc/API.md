# API Cabestan

## Base URL
```
/api/rest
```

## Endpoints

### Configuration Client

#### Obtenir la configuration client
```http
GET /client-config
```

**Réponse** :
```json
{
    "languages": [
        { "slug": "fra", "label": "Français" },
        { "slug": "eng", "label": "Anglais" }
    ],
    "rcrTypes": [
        { "slug": "BU" },
        { "slug": "BM" }
    ],
    "bookTypes": [
        { "slug": "printed-monograph" },
        { "slug": "manuscript" }
    ],
    "departments": [
        { "slug": "75", "label": "Paris" },
        { "slug": "69", "label": "Rhône" }
    ],
    "regions": [
        { "slug": "11", "label": "Île-de-France" },
        { "slug": "84", "label": "Auvergne-Rhône-Alpes" }
    ]
}
```

### RCR (Répertoire des Centres de Ressources)

#### Rechercher des RCR
```http
GET /rcrs/search
```

**Paramètres** :
```typescript
{
    string?: string;           // Texte de recherche
    type?: string;            // Type de recherche (rcr, editor, author, translator, illustrator, book)
    languages?: string;       // Liste de codes ISO de langues (séparés par des virgules)
    regions?: string;         // Liste d'IDs de régions
    departments?: string;     // Liste d'IDs de départements
    cities?: string;         // Liste d'IDs de villes
    establishementsTypes?: string; // Types d'établissements
    documentsTypes?: string;  // Types de documents
    publishers?: string;      // Liste d'IDs d'éditeurs
    map_format?: boolean;     // Format pour affichage sur carte
    page?: number;           // Page courante (défaut: 1)
    per_page?: number;       // Éléments par page (défaut: 20)
    publicationDatesStart?: number; // Timestamp en millisecondes
    publicationDatesEnd?: number;   // Timestamp en millisecondes
    reeditionDatesStart?: number;   // Timestamp en millisecondes
    reeditionDatesEnd?: number;     // Timestamp en millisecondes
}
```

**Réponse** :
```json
{
    "pagination": {
        "totalResults": 123,
        "currentPage": 1,
        "itemsPerPage": 20,
        "remainingItems": 103
    },
    "items": [
        {
            "rcr": "751052103",
            "name": "Bibliothèque Universitaire Paris 1",
            "translatedName": null,
            "numberOfDocuments": 150000,
            "contact": {
                "website": "http://bu.univ-paris1.fr",
                "phone": "01 44 07 89 00",
                "email": "bu@univ-paris1.fr",
                "address": {
                    "street": "12 place du Panthéon",
                    "postalCode": "75005",
                    "city": "Paris",
                    "country": "France"
                }
            },
            "location": {
                "longitude": 2.3444,
                "latitude": 48.8466
            }
        }
    ]
}
```

### Livres

#### Rechercher les livres d'un RCR
```http
GET /rcr/{rcr_number}/books/search
```

**Paramètres** :
```typescript
{
    title?: string;
    translated_title?: string;
    original_title?: string;
    author_name?: string;
    translator_name?: string;
    publisher?: string;
    publication_city?: string;
    publication_country?: string;
    publication_date_start?: string; // datetime
    publication_date_end?: string;   // datetime
    original_language?: string;
    tags?: string;
    collection_name?: string;
    event_type?: string;
    event_date_start?: string;       // datetime
    event_date_end?: string;         // datetime
    page?: number;                   // défaut: 1
    per_page?: number;               // défaut: 20
}
```

**Réponse** :
```json
{
    "pagination": {
        "totalResults": 1500,
        "currentPage": 1,
        "itemsPerPage": 20,
        "remainingItems": 1480
    },
    "items": [
        {
            "title": "Les Misérables",
            "author": {
                "firstname": "Victor",
                "lastname": "Hugo"
            },
            "translator": null,
            "publisher": "Albert Lacroix",
            "publication_date": "1862-01-01",
            "publication_city": "Paris",
            "original_language": "fra",
            "type": "printed-monograph"
        }
    ]
}
```

### Éditeurs

#### Rechercher des éditeurs
```http
GET /publishers/search?str=gall
```

**Réponse** :
```json
[
    {
        "id": 1,
        "name": "Gallimard"
    },
    {
        "id": 2,
        "name": "Gallmeister"
    }
]
```

### Villes

#### Rechercher des villes
```http
GET /cities/search?str=par
```

**Réponse** :
```json
[
    {
        "id": 1,
        "name": "Paris"
    },
    {
        "id": 2,
        "name": "Parthenay"
    }
]
```

### Suggestions de recherche

#### Rechercher des suggestions
```http
GET /suggestions/search?str=hugo
```

**Réponse** :
```json
[
    {
        "title": "Victor",
        "subtitle": "Hugo",
        "type": "author"
    },
    {
        "title": "Les Misérables",
        "subtitle": null,
        "type": "book"
    },
    {
        "title": "Bibliothèque Victor Hugo",
        "subtitle": "751052103",
        "type": "rcr"
    }
]
```

## Export CSV

### Export RCR
```http
GET /rcrs/export
```

**Réponse** : Fichier CSV avec les colonnes
```csv
"Titre de l'établissement","Adresse complète","Ville","Code postal","Étranger/France","Numero RCR","Nb ouvrage"
"Bibliothèque Universitaire Paris 1","12 place du Panthéon","Paris","75005","France","751052103","150000"
```

### Export Livres
```http
GET /rcr/{rcr_number}/books/export
```

**Réponse** : Fichier CSV avec les colonnes
```csv
"Titre","Auteur","Traducteur","Editeur","Lieu de publication","Pays de publication","Date de publication","Langue original","Tags"
"Les Misérables","Victor Hugo","","Albert Lacroix","Paris","France","1862-01-01","fra","printed-monograph"
```

## Formats de réponse

### RCR
```typescript
{
    rcr: string;
    name: string;
    translatedName: string | null;
    numberOfDocuments: number;
    contact: {
        website: string;
        phone: string;
        email: string;
        address: {
            street: string;
            postalCode: string;
            city: string;
            country: string;
        }
    };
    location: {
        longitude: number;
        latitude: number;
    }
}
```

### Livre
```typescript
{
    title: string;
    author: {
        firstname: string | null;
        lastname: string | null;
    } | null;
    translator: {
        firstname: string | null;
        lastname: string | null;
    } | null;
    publisher: string | null;
    publication_date: string;
    publication_city: string;
    original_language: string | null;
    type: string | null;
}