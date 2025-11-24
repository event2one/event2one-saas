# Configuration Apache pour Socket.IO WebSocket (HTTPS)

## Problème
Le client Socket.IO essaie de se connecter en `wss://` (WebSocket Secure) mais le serveur Node.js écoute en `ws://` (WebSocket non sécurisé sur localhost).

## Solution : Proxy WebSocket Apache

### 1. Activer les modules Apache requis
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 2. Configuration VirtualHost HTTPS

Éditez votre fichier VirtualHost SSL (probablement `/etc/apache2/sites-available/www.event2one.com-le-ssl.conf` ou similaire) :

```apache
<VirtualHost *:443>
    ServerName www.event2one.com
    
    # ... configuration SSL existante (certificats, etc.) ...
    
    # Activer les modules proxy
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Proxy HTTP pour Next.js
    ProxyPass /saas http://localhost:3002/saas
    ProxyPassReverse /saas http://localhost:3002/saas
    
    # Proxy WebSocket pour Socket.IO (CRITIQUE)
    <Location /saas/socket.io>
        ProxyPass ws://localhost:3002/saas/socket.io
        ProxyPassReverse ws://localhost:3002/saas/socket.io
    </Location>
    
    # Alternative avec RewriteRule (si la méthode ci-dessus ne fonctionne pas)
    # RewriteEngine On
    # RewriteCond %{HTTP:Upgrade} =websocket [NC]
    # RewriteRule /saas/socket.io/(.*) ws://localhost:3002/saas/socket.io/$1 [P,L]
    
    # ... reste de la configuration ...
</VirtualHost>
```

### 3. Tester la configuration
```bash
# Vérifier la syntaxe
sudo apache2ctl configtest

# Si OK, recharger Apache
sudo systemctl reload apache2
```

### 4. Vérifier les logs
```bash
# Logs Apache
sudo tail -f /var/log/apache2/error.log

# Logs PM2
pm2 logs event2one-saas
```

### 5. Test WebSocket
Ouvrez la console du navigateur sur `https://www.event2one.com/saas/broadcast/event/470/admin/176895` et vérifiez :
- Pas d'erreur `wss://... failed`
- Message de connexion Socket.IO réussie

## Dépannage

### Si WebSocket échoue toujours

1. **Vérifier que les modules sont activés :**
```bash
apache2ctl -M | grep proxy
# Devrait afficher :
# proxy_module
# proxy_http_module
# proxy_wstunnel_module
```

2. **Vérifier que PM2 tourne :**
```bash
pm2 list
pm2 logs event2one-saas
```

3. **Tester la connexion WebSocket directement :**
```bash
# Depuis le serveur
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:3002/saas/socket.io/
```

4. **Vérifier les permissions SELinux (si applicable) :**
```bash
sudo setsebool -P httpd_can_network_connect 1
```

## Configuration Minimale Testée

Voici une configuration minimale qui devrait fonctionner :

```apache
<VirtualHost *:443>
    ServerName www.event2one.com
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    ProxyPreserveHost On
    
    # HTTP Proxy
    ProxyPass /saas http://localhost:3002/saas
    ProxyPassReverse /saas http://localhost:3002/saas
    
    # WebSocket Proxy
    ProxyPass /saas/socket.io ws://localhost:3002/saas/socket.io
    ProxyPassReverse /saas/socket.io ws://localhost:3002/saas/socket.io
</VirtualHost>
```

## Notes Importantes

- Le serveur Node.js (`server.js`) écoute sur **HTTP** (port 3002)
- Apache fait le **proxy HTTPS → HTTP** pour les requêtes normales
- Apache fait le **proxy WSS → WS** pour les WebSockets
- Le client ne voit que HTTPS/WSS, le serveur Node.js reste en HTTP/WS
