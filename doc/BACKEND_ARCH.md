# Architecture du Module REST

## Structure du Module

```
rest/
├── __init__.py           # Initialisation du module
├── admin.py             # Configuration de l'interface d'administration
├── apps.py              # Configuration de l'application Django
├── models.py            # Modèles de données
├── api/                 # API REST
│   ├── __init__.py
│   ├── book.py         # Endpoints livres
│   └── rcr.py          # Endpoints RCR
├── fixtures/            # Données initiales
│   ├── author_types.json
│   ├── book_types.json
│   ├── city_types.json
│   ├── country_types.json
│   ├── department_types.json
│   ├── editor_types.json
│   ├── lang_types.json
│   └── rcr_types.json

├── management/          # Commandes personnalisées
│   └── commands/
│       └── scrape_rcr.py
│       └── scrape_book.py
├── migrations/          # Migrations de base de données
└── serializers/         # Sérialiseurs pour l'API
    ├── book.py
    ├── config.py
    └── search.py
```

## Composants Principaux

### 1. Modèles (`models.py`)
Définit la structure de la base de données avec les modèles suivants :
- **Localisation** : Region, Department, City, CountryType
- **RCR** : RcrType, Rcr, RcrBookCount
- **Livres** : Book, BookType, BookTags
- **Auteurs** : Author, AuthorType
- **Publication** : Editor, Lang

### 2. API REST (`api/`)
Implémente les endpoints REST :
- **book.py** : Gestion des livres (recherche, export)
- **rcr.py** : Gestion des RCR (recherche, configuration)

### 3. Sérialiseurs (`serializers/`)
Convertit les modèles en JSON :
- **book.py** : Sérialisation des livres et auteurs
- **config.py** : Sérialisation des configurations
- **search.py** : Sérialisation des résultats de recherche

### 4. Données Initiales (`fixtures/`)
Contient les données de référence :
- Types d'auteurs (author_type)
- Types de documents (book_type)
- Types de villes (city_type)
- Types de pays (country_type)
- Types de langues (lang_type)
- Types de RCR (rcr_type)
- Types de livres (book_type)
- Types de publications (editor_type)

### 5. Commandes (`management/commands/`)
Scripts d'administration :
- **scrape_rcr.py** : Import des données RCR depuis une source externe
- **scrape_book.py** : Import des données livres depuis une source externe
## Fonctionnalités Principales

1. **Gestion des RCR**
   - Recherche de RCR
   - Export des données
   - Configuration client
   - Gestion des suggestions

2. **Gestion des Livres**
   - Recherche par RCR
   - Export CSV
   - Filtrage multicritères

3. **Système de Localisation**
   - Hiérarchie Région > Département > Ville
   - Support des codes postaux et INSEE
   - Gestion des territoires (DROM, Métropole, etc.)

## Points Techniques

1. **Indexation**
   - Index Hash sur les champs fréquemment recherchés
   - Optimisation des requêtes de recherche

2. **Relations**
   - Utilisation extensive de ForeignKey
   - Support des relations nullables quand nécessaire
   - Relations Many-to-Many pour les tags

3. **Validation**
   - Contraintes d'unicité
   - Champs obligatoires vs optionnels
   - Formats spécifiques (email, URL)

## Migrations

Le projet utilise les migrations Django pour gérer l'évolution de la base de données :
- Création initiale des tables
- Ajout de champs (zipcode, abes_code)
- Modifications de relations
- Ajustements de contraintes

## Notes de Développement

1. **Performance**
   - Utilisation d'index pour optimiser les recherches
   - Relations optimisées pour minimiser les jointures

2. **Extensibilité**
   - Structure modulaire
   - Séparation claire des responsabilités
   - Support facile de nouveaux types de données

3. **Maintenance**
   - Code documenté
   - Migrations versionnées
   - Données de référence en fixtures