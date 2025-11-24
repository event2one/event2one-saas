# Configuration Apache pour Broadcast App

## Option A : Sous-domaine `broadcast.event2one.com` (Recommandé)

### 1. Configuration DNS
Ajoutez un enregistrement A dans votre DNS :
```
Type: A
Nom: broadcast
Valeur: [IP de votre serveur - même que www.event2one.com]
TTL: 3600
```

### 2. Obtenir le Certificat SSL
```bash
# Sur le serveur
sudo certbot certonly --apache -d broadcast.event2one.com
```

### 3. Créer le VirtualHost Apache
Créez le fichier `/etc/apache2/sites-available/broadcast.event2one.com.conf` :

```apache
<VirtualHost *:80>
    ServerName broadcast.event2one.com
    Redirect permanent / https://broadcast.event2one.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName broadcast.event2one.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/broadcast.event2one.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/broadcast.event2one.com/privkey.pem
    
    # Reverse Proxy to Next.js (port 3001)
    ProxyPreserveHost On
    ProxyPass / http://localhost:3001/
    ProxyPassReverse / http://localhost:3001/
    
    # WebSocket Support for Socket.IO
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://localhost:3001/$1 [P,L]
    
    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/broadcast-error.log
    CustomLog ${APACHE_LOG_DIR}/broadcast-access.log combined
</VirtualHost>
```

### 4. Activer le Site
```bash
# Activer les modules nécessaires
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl

# Activer le site
sudo a2ensite broadcast.event2one.com

# Vérifier la configuration
sudo apache2ctl configtest

# Recharger Apache
sudo systemctl reload apache2
```

### 5. Mettre à Jour le Code
Dans `broadcast-app/src/pages/event/[eventId]/admin/[adminId].tsx`, ligne 454 :
```typescript
// Remplacer
const socket = io('http://localhost:3001');

// Par (en production)
const socket = io(process.env.NODE_ENV === 'production' 
  ? 'https://broadcast.event2one.com' 
  : 'http://localhost:3001'
);
```

---

## Option B : Sous-répertoire `/saas` (Configuration Actuelle)

### 1. Configuration Next.js
Le fichier `next.config.ts` est déjà configuré avec `basePath: '/saas'`.

### 2. Modifier le VirtualHost Apache
Éditez `/etc/apache2/sites-available/www.event2one.com.conf` et ajoutez :
```apache
<VirtualHost *:443>
    ServerName www.event2one.com
    
    # ... configuration SSL existante ...
    
    # Reverse Proxy pour /saas (Port 3002)
    ProxyPreserveHost On
    ProxyPass /saas http://localhost:3002/saas
    ProxyPassReverse /saas http://localhost:3002/saas
    
    # WebSocket Support pour Socket.IO (Port 3002)
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /saas/socket.io/(.*) ws://localhost:3002/saas/socket.io/$1 [P,L]
</VirtualHost>
```

### 3. Recharger Apache
```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### 4. Code Socket.IO (Déjà configuré)
Le client est déjà configuré pour se connecter sur `/saas/socket.io`.

---

## Vérification

### Tester la Configuration
```bash
# Vérifier qu'Apache écoute sur les bons ports
sudo netstat -tlnp | grep apache

# Vérifier que PM2 tourne
pm2 list

# Voir les logs Apache
sudo tail -f /var/log/apache2/broadcast-error.log
```

### Tester dans le Navigateur
- **Option A** : `https://broadcast.event2one.com/event/470/admin/176895`
- **Option B** : `https://www.event2one.com/broadcast/event/470/admin/176895`

---

## Dépannage

### Erreur 502 Bad Gateway
- Vérifier que PM2 tourne : `pm2 list`
- Vérifier les logs : `pm2 logs broadcast`

### Erreur de Certificat SSL
- Vérifier Certbot : `sudo certbot certificates`
- Renouveler si nécessaire : `sudo certbot renew`

### Socket.IO ne se connecte pas
- Vérifier les logs du navigateur (Console)
- Vérifier que le module `proxy_wstunnel` est activé
- Vérifier les règles de firewall (port 3001 doit être accessible en local)
