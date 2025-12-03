# Configuration de Google OAuth pour Event2one-SaaS

## Étapes de configuration

### 1. Configuration de Google Cloud Console

1. **Allez sur [Google Cloud Console](https://console.cloud.google.com/)**
2. **Créez un nouveau projet ou sélectionnez un projet existant**
3. **Activez les APIs nécessaires :**
   - Google+ API (pour les informations de profil)
   - Google OAuth2 API

### 2. Création des identifiants OAuth 2.0

1. **Dans Google Cloud Console, allez dans "APIs & Services" > "Credentials"**
2. **Cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"**
3. **Sélectionnez "Web application"**
4. **Configurez les URLs autorisées :**

   - **Origines JavaScript autorisées :**

     - `http://localhost:3002` (pour le développement)
     - `https://votre-domaine.com` (pour la production)

   - **URIs de redirection autorisées :**
     - `http://localhost:3002/saas/api/auth/callback/google` (développement)
     - `https://votre-domaine.com/saas/api/auth/callback/google` (production)

### 3. Configuration des variables d'environnement

1. **Copiez le Client ID et le Client Secret depuis Google Cloud Console**
2. **Mettez à jour votre fichier `.env.local` :**

```env
GOOGLE_CLIENT_ID=votre_client_id_google
GOOGLE_CLIENT_SECRET=votre_client_secret_google
```

### 4. Test de la configuration

1. **Démarrez votre serveur de développement :**

   ```bash
   npm run dev
   ```

2. **Allez sur la page de connexion :**

   ```
   http://localhost:3002/signin
   ```

3. **Cliquez sur "Continue with Google"**

## Fonctionnalités implémentées

### ✅ Authentification Google OAuth 2.0

- Bouton de connexion Google avec icône
- Configuration NextAuth 5 avec provider Google
- Paramètres OAuth optimaux (consent, offline access)

### ✅ Création automatique d'utilisateurs

- Les nouveaux utilisateurs Google sont automatiquement créés dans la base de données
- Création des enregistrements dans les tables `contacts` et `rcc`
- Récupération automatique du nom et de l'email depuis Google

### ✅ Gestion des sessions

- Intégration complète avec NextAuth
- Récupération des privilèges utilisateur
- Sessions persistantes

## Structure des fichiers modifiés

```
src/
├── auth.ts                    # Configuration NextAuth avec Google provider
├── app/
│   ├── (auth)/
│   │   └── signin/
│   │       └── page.tsx      # Page de connexion avec bouton Google
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts          # Routes API NextAuth
│   └── saas/api/auth/[...nextauth]/
│       └── route.ts          # Routes API NextAuth pour SaaS
└── middleware.ts              # Middleware d'authentification (si présent)
```

## Sécurité

- ✅ Validation des tokens OAuth
- ✅ Création sécurisée des utilisateurs
- ✅ Gestion des erreurs OAuth
- ✅ URLs de callback sécurisées

## Dépannage

### Erreur "redirect_uri_mismatch"

Vérifiez que l'URL de callback dans Google Cloud Console correspond exactement à :
`http://localhost:3002/saas/api/auth/callback/google`

### Erreur "invalid_client"

Vérifiez que le `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont corrects dans `.env.local`

### Utilisateur non créé automatiquement

Vérifiez les logs du serveur pour les erreurs de base de données et assurez-vous que Prisma est correctement configuré.
