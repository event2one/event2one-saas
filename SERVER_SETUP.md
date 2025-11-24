# Configuration Initiale du Serveur

## Étape 1 : Se connecter au serveur

```bash
ssh -i path/to/your_key -p 22224 webapps@www.event2one.com
```

## Étape 2 : Créer le répertoire et cloner le dépôt

```bash
# Créer le répertoire parent si nécessaire
mkdir -p /var/www/e2o

# Naviguer vers le répertoire
cd /var/www/e2o

# Cloner le dépôt
git clone https://github.com/event2one/event2one-saas.git

# Naviguer dans le projet
cd event2one-saas

# Installer les dépendances
npm install

# Build l'application
npm run build

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save
```

## Étape 3 : Vérifier que tout fonctionne

```bash
# Vérifier le statut PM2
pm2 status

# Voir les logs
pm2 logs event2one-saas
```

## Après cette configuration initiale

Une fois ces étapes effectuées **une seule fois**, le workflow GitHub Actions fonctionnera automatiquement à chaque push sur `master` :

1. Se connecte au serveur via SSH
2. Fait `git pull origin master`
3. Installe les dépendances
4. Build l'application
5. Recharge PM2

## Notes importantes

- Le répertoire doit être accessible en écriture pour l'utilisateur `webapps`
- La clé SSH publique doit être dans `~/.ssh/authorized_keys`
- PM2 doit être installé globalement : `npm install -g pm2`
