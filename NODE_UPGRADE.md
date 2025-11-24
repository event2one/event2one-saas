# Mise à Jour Node.js sur le Serveur

## Problème

Le serveur utilise **Node.js v14.15.0**, mais Next.js 16 requiert **Node.js >=20.9.0**.

```
Error: Cannot find module 'node:events'
npm WARN EBADENGINE   package: 'next@16.0.3',
npm WARN EBADENGINE   required: { node: '>=20.9.0' },
npm WARN EBADENGINE   current: { node: 'v14.15.0', npm: '8.1.3' }
```

## Solution : Installer Node.js 20 LTS

### Étape 1 : Se connecter au serveur

```bash
ssh -i path/to/your_key -p 22224 webapps@www.event2one.com
```

### Étape 2 : Installer Node.js 20 via nvm (recommandé)

```bash
# Installer nvm si pas déjà installé
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recharger le shell
source ~/.bashrc

# Installer Node.js 20 LTS
nvm install 20

# Définir Node.js 20 comme version par défaut
nvm alias default 20

# Vérifier la version
node -v  # Devrait afficher v20.x.x
npm -v   # Devrait afficher v10.x.x
```

### Étape 3 : Réinstaller PM2 globalement

```bash
# Désinstaller l'ancienne version de PM2
npm uninstall -g pm2

# Installer PM2 avec la nouvelle version de Node
npm install -g pm2

# Vérifier
pm2 -v
```

### Étape 4 : Redéployer l'application

```bash
cd /var/www/e2o/event2one-saas

# Nettoyer les anciens modules
rm -rf node_modules package-lock.json

# Réinstaller avec Node 20
npm install

# Build
npm run build

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivre les instructions affichées
```

## Alternative : Utiliser le gestionnaire de paquets du système

Si vous préférez utiliser apt (Debian/Ubuntu) :

```bash
# Ajouter le dépôt NodeSource pour Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Installer Node.js 20
sudo apt-get install -y nodejs

# Vérifier
node -v
npm -v
```

## Après la mise à jour

Une fois Node.js 20 installé, le workflow GitHub Actions fonctionnera correctement :

1. `git pull` ✅
2. `npm install` ✅ (sans warnings EBADENGINE)
3. `npm run build` ✅ (Next.js 16 fonctionnera)
4. `pm2 reload` ✅

## Vérification

Pour vérifier que tout fonctionne :

```bash
# Vérifier Node.js
node -v  # >= v20.9.0

# Vérifier PM2
pm2 status

# Vérifier les logs
pm2 logs event2one-saas

# Tester l'application
curl http://localhost:3002/saas
```
