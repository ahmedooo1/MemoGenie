# 🚀 Guide de Déploiement - MemoGenie

## Déploiement manuel sur VPS

### 1. Première installation

```bash
# Se connecter au VPS
ssh debian@your-vps-ip

# Naviguer vers le dossier
cd /var/www/MemoGenie

# Cloner le projet (si première fois)
git clone https://github.com/ahmedooo1/MemoGenie.git .

# Installer TOUTES les dépendances (y compris devDependencies pour le build)
npm install

# Configurer les variables d'environnement
cp .env.example .env
nano .env  # Remplir avec vos clés API

# Exécuter les migrations de base de données
npm run migrate

# Build l'application Next.js
npm run build

# Démarrer avec PM2
pm2 start npm --name "memogenie" -- start -- -p 3500
pm2 save
pm2 startup
```

### 2. Mise à jour de l'application

```bash
# Se connecter au VPS
ssh debian@your-vps-ip

# Naviguer vers le dossier
cd /var/www/MemoGenie

# Récupérer les dernières modifications
git pull origin main

# Installer/mettre à jour les dépendances
npm install

# Exécuter les migrations (automatique, mais pour être sûr)
npm run migrate

# Rebuild l'application
npm run build

# Redémarrer PM2
pm2 restart memogenie
```

### 3. Commandes utiles PM2

```bash
# Voir les logs en temps réel
pm2 logs memogenie

# Voir le statut
pm2 status

# Redémarrer
pm2 restart memogenie

# Arrêter
pm2 stop memogenie

# Démarrer
pm2 start memogenie
```

## Configuration Nginx

Exemple de configuration `/etc/nginx/sites-available/memogenie`:

```nginx
server {
    server_name votredomaine.com;

    location / {
        proxy_pass http://localhost:3500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/votredomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votredomaine.com/privkey.pem;
}

server {
    if ($host = votredomaine.com) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name votredomaine.com;
    return 404;
}
```

Après modification:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Déploiement automatique avec GitHub Actions

Le workflow `.github/workflows/deploy.yml` déploie automatiquement à chaque push sur `main`.

### Secrets à configurer sur GitHub:

1. `VPS_HOST` - IP ou domaine du VPS
2. `VPS_USER` - Utilisateur SSH (ex: debian)
3. `VPS_SSH_KEY` - Clé privée SSH
4. `VPS_PORT` - Port SSH (défaut: 22)

## Vérifications après déploiement

```bash
# Vérifier que l'app tourne
curl http://localhost:3500

# Vérifier les logs
pm2 logs memogenie --lines 50

# Vérifier la base de données
cd /var/www/MemoGenie
node -e "const db = require('better-sqlite3')('data/memoire.db'); console.log(db.prepare('PRAGMA table_info(conversations)').all());"
```

## Troubleshooting

### Erreur: "Cannot find module 'tailwindcss'"
**Solution**: Installer toutes les dépendances (pas `--production`)
```bash
npm install
```

### Erreur: "No production build in .next"
**Solution**: Rebuild l'application
```bash
npm run build
```

### Erreur: "table conversations has no column named images"
**Solution**: Exécuter les migrations
```bash
npm run migrate
```

### Port 3500 déjà utilisé
**Solution**: Tuer le processus ou utiliser un autre port
```bash
# Trouver le processus
lsof -i :3500
# Ou
pm2 list

# Tuer si nécessaire
pm2 delete memogenie
```

## Performance

Pour optimiser en production:

1. **Activer la compression gzip** dans Nginx
2. **Configurer le cache** pour les assets statiques
3. **Utiliser CDN** pour les images (Cloudflare, etc.)
4. **Monitorer avec PM2**: `pm2 monit`

## Backup de la base de données

```bash
# Backup manuel
cp /var/www/MemoGenie/data/memoire.db /var/www/MemoGenie/data/backups/memoire-$(date +%Y%m%d).db

# Automatiser avec cron
0 2 * * * cp /var/www/MemoGenie/data/memoire.db /var/www/MemoGenie/data/backups/memoire-$(date +\%Y\%m\%d).db
```

## Mise à jour Node.js

```bash
# Installer nvm si pas déjà fait
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Installer Node.js 18
nvm install 18
nvm use 18

# Vérifier
node -v
```
