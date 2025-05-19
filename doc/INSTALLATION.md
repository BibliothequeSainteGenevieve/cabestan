# Guide d'Installation

## Prérequis

- Docker et Docker Compose
- Git
- Un accès au dépôt du projet

## Installation en Développement

1. Cloner le projet
```bash
git clone git@github.com:BibliothequeSainteGenevieve/cabestan.git
cd cabestan
```

2. Copier et configurer le fichier d'environnement
```bash
cp docker/.env.model docker/.env
```

3. Modifier les variables dans `docker/.env` :
```bash
# Chemin vers le stockage de la base de données
VOLUME_PGDATA=/chemin/vers/db/cabestan

# Mot de passe de la base de données
DB_PASSWORD=votre_mot_de_passe

# Clé secrète Django (à générer)
SECRET_KEY='votre_cle_secrete'

# Host
HOST=localhost
```

4. Lancer l'environnement de développement
```bash
cd docker
docker compose up -d
```

L'application est accessible sur :
- Frontend : http://localhost:5173
- Backend : http://localhost
- API/Swagger : http://localhost/api/docs

## Installation en Staging

Vous devrez en staging installer un letsencrypt ou équivalent et configurer dans le `.env` le path du certificat generé  :
```
CERTIFICATES_PATH=/chemin/vers/certificats/ssl
```

L'application est accessible sur :
- Frontend : https://votre-domaine.com
- Backend : https://votre-domaine.com/api
- API : https://votre-domaine.com/api/rest

## Différences entre Développement et Staging

### Développement
- Client Vite en mode développement (hot reload)
- Pas de SSL
- Wiremock pour les tests
- Ports exposés pour le développement

### Staging
- Build statique du client
- SSL activé
- Nginx en reverse proxy
- Configuration sécurisée
- Pas de ports de développement exposés
- Cron de scraping activé

## Vérification de l'Installation

1. Vérifier que tous les conteneurs sont en cours d'exécution :
```bash
docker compose ps
```

2. Vérifier les logs pour d'éventuelles erreurs :
```bash
docker compose logs -f
```
3. :warning: Forcer l'authentification de l'admin :
Rendez vous sur http://localhost/admin et connectez vous avec les identifiants cabestan/cabestan
Dans Config, la valeur de `API_SCRAPER_TOKEN` et `API_PROCESS_TOKEN` doit être `a`.


4. Tester l'accès à l'application via le navigateur

## Problèmes Courants

1. Erreur de permissions sur VOLUME_PGDATA
```bash
sudo chown -R 1000:1000 /chemin/vers/db/cabestan
```

2. Ports déjà utilisés
- Modifier les ports dans le fichier .env

3. Certificats SSL manquants (staging)
- Vérifier le chemin CERTIFICATES_PATH
- Vérifier la présence des fichiers .crt et .key