# Variables d'Environnement Cabestan

## Configuration du Projet

### Identification du Projet
```bash
# Nom du projet, utilisé comme préfixe pour tous les services
COMPOSE_PROJECT_NAME=cabestan
```

### Superutilisateur Django
```bash
# Identifiants du superutilisateur Django par défaut
DJANGO_SUPERUSER_USERNAME=cabestan
DJANGO_SUPERUSER_EMAIL=cabestan@cabestan.com
DJANGO_SUPERUSER_PASSWORD=cabestan
```

## Configuration de la Base de Données

### Stockage
```bash
# Chemin local pour le stockage des données PostgreSQL
VOLUME_PGDATA=/path/to/db/cabestan
```

### Connexion
```bash
# Nom de la base de données
DB_NAME=cabestan

# Utilisateur de la base de données
DB_USER=cabestan

# Mot de passe de la base de données
DB_PASSWORD=mypassword

# Port exposé pour PostgreSQL (pour connexion depuis l'hôte)
DB_PORT=5433
```

## Configuration Système

### Utilisateur
```bash
# ID utilisateur et groupe pour les conteneurs (ne pas modifier)
USER_ID=1000
GROUP_ID=1000
```

### Environnement
```bash
# Environnement d'exécution (DEV/PROD)
CABESTAN_ENV=DEV

# Chemin racine du projet Git
WORK_DIR=..
```

## Configuration Django

### Sécurité
```bash
# Hôtes autorisés pour Django
ALLOWED_HOSTS=servogne.com,cabestan,cabestan:8080,localhost

# Hôte principal
HOST=servogne.com

# Clé secrète Django (à modifier)
SECRET_KEY='INSERT YOUR DJANGO SECRET KEY HERE'
```

### Certificats SSL
```bash
# Chemin vers les certificats SSL
CERTIFICATES_PATH=/var/www/certbot
```

## Ports Exposés

### Application Django
```bash
# Port HTTP pour Django
DJANGO_HTTP_PORT=8080

# Port HTTPS pour Django
DJANGO_HTTPS_PORT=8443
```

### Client Frontend
```bash
# Port HTTP pour le client
CLIENT_HTTP_PORT=5173

# Port HTTPS pour le client (désactivé)
CLIENT_HTTPS_PORT=0
```

## Notes Importantes

1. **Sécurité** :
   - Modifiez `SECRET_KEY` avant le déploiement
   - Changez les identifiants du superutilisateur
   - Utilisez un mot de passe fort pour la base de données

2. **Production** :
   - Ajustez `ALLOWED_HOSTS` selon votre domaine
   - Configurez correctement `CERTIFICATES_PATH`
   - Changez `CABESTAN_ENV` en PROD

3. **Développement** :
   - Les ports par défaut peuvent être modifiés si nécessaire
   - Assurez-vous que `VOLUME_PGDATA` pointe vers un chemin valide