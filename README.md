# Cabestan

Cabestan est un outil utilisant l'API SRU du Sudoc de l'ABES - Agence bibliographique de l'enseignement supérieur pour cartographier les collections en langues étrangères de l'enseignement supérieur français.
L'outil permet, pour une langue donnée, de localiser et de quantifier par adresse de bibliothèques toutes les collections signalées dans cette langue, et de mettre en lumière les fonds les plus importants. S'adressant tant aux professionnels des bibliothèques qu'aux chercheurs, le projet entend proposer une plateforme web à l'automne 2025 qui permettra une connaissance approfondie et une gestion optimisée des collections en langues étrangères du Sudoc.

## Installation

Cabestan est conçu pour fonctionner en tant qu'image Docker, ce dernier est donc obligatoire (> 27.1.1).
Le fichier docker-compose.yml est compatible Traefik, mais il n'est pas obligatoire.

Recopier les fichiers .model présents dans le répertoire docker

```bash
cp docker/cabestan.conf.model docker/cabestan.conf
cp docker/.env.model docker/.env
```

Dans cabestan.conf, modifier tout ou partie suivant votre configuration :
- le server_name
- le port. Si traefik n'est pas installé, il faut mettre le port à 8080 ou 8443 (ou modifier le port dans .env).
- Ajouter la configuration ssl si nécessaire

Modifier le fichier .env suivant votre configuration :
- les ports sont gérés par Traefik s'il est installé (et n'ont pas à être configurés)

Si nécessaire, modifier le docker-compose :
- le docker-compose.yml est compatible traefik. S'il n'est pas installé, il faut bien faire correspondre le port d'écoute du conteneur avec celui déclaré dans cabestan.conf.

```bash
cd docker
docker compose up -d
docker exec cabestan_web python manage.py migrate
docker exec -it cabestan_web python manage.py createsuperuser
```

Le site devrait ensuite être accessible à l'adresse spécifiée dans le .env

http://cabestan.localhost est la partie "utilisateur" d'interrogation de la base.

http://cabestan.localhost/admin est la partie "administration" de Django (identifiants utilisés lors de l'étape "createsuperuser") où l'on fixe notamment les tokens pour pouvoir utiliser les api.

http://cabestan.localhost/api/docs fournit la partie api permettant d'alimenter la base de données.