# Cabestan

## Installation
Copie du fichier .env.model dans .env
```bash
cp .env.model .env
```

Lancement du docker : 
```bash
docker compose up -d
```

## Configuration HTTPS/let's encrypt
Assurez vous d'avoir un nginx qui fonctionne : 
```bash
apt-get install nginx
systemctl start nginx
```

Installez certbot : 
```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx
```

Configurez votre .env : 
```bash
CERTIFICATES_PATH=/etc/letsencrypt/live/
```




## Configuration du fichier .env

### Configuration du projet
| Variable | Description | Exemple |
|----------|-------------|----------|
| `COMPOSE_PROJECT_NAME` | Préfixe pour tous les services Docker | `cabestan` |

### Configuration de la base de données
| Variable | Description | Exemple |
|----------|-------------|----------|
| `VOLUME_PGDATA` | Chemin local pour le stockage de la base de données | `/path/to/db/cabestan` |
| `DB_NAME` | Nom de la base de données | `cabestan` |
| `DB_USER` | Nom d'utilisateur de la base de données | `cabestan` |
| `DB_PASSWORD` | Mot de passe de la base de données | `mypassword` |
| `DB_PORT` | Port exposé pour la connexion PostgreSQL depuis l'hôte | `5433` |

### Configuration système
| Variable | Description | Exemple |
|----------|-------------|----------|
| `USER_ID` | ID utilisateur pour les conteneurs (ne pas modifier) | `1000` |
| `GROUP_ID` | ID groupe pour les conteneurs (ne pas modifier) | `1000` |
| `CABESTAN_ENV` | Environnement d'exécution | `DEV` |
| `WORK_DIR` | Répertoire racine Git | `..` |

### Configuration Django
| Variable | Description | Exemple |
|----------|-------------|----------|
| `ALLOWED_HOSTS` | Liste des hôtes autorisés par Django | `servogne.com,cabestan,cabestan:8080,localhost` |
| `HOST` | Nom d'hôte principal | `localhost` |
| `SECRET_KEY` | Clé secrète Django pour la sécurité | `'INSERT YOUR DJANGO SECRET KEY HERE'` |

### Configuration SSL/TLS
| Variable | Description | Exemple |
|----------|-------------|----------|
| `CERTIFICATES_PATH` | Chemin vers les certificats SSL (requis pour nginx) | `.` |

### Configuration des ports
| Variable | Description | Exemple |
|----------|-------------|----------|
| `DJANGO_HTTP_PORT` | Port HTTP pour Django | `8080` |
| `DJANGO_HTTPS_PORT` | Port HTTPS pour Django | `8443` |
| `CLIENT_HTTP_PORT` | Port HTTP pour le client | `5173` |
| `CLIENT_HTTPS_PORT` | Port HTTPS pour le client (désactivé) | `0` |

### Notes importantes
- Les variables `USER_ID` et `GROUP_ID` ne doivent pas être modifiées
- `CERTIFICATES_PATH` doit pointer vers des certificats valides pour que nginx fonctionne correctement











---
## Archive 
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