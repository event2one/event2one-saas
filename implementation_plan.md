# Plan de Migration - Architecture Modulaire Monolithique Event2One SaaS

Migration du projet Event2One vers une architecture modulaire monolithique avec Next.js 16, déployée sur `https://event2one.com/saas/`.

## Contexte

Le projet actuel nécessite une refonte architecturale pour :
- Adopter une structure modulaire facilitant la maintenance et l'évolution
- Intégrer Socket.IO dans un serveur Next.js personnalisé
- Déployer sur le sous-chemin `/saas/` du domaine principal
- Préparer l'infrastructure pour les futures fonctionnalités (broadcast, voting, OBS)

## User Review Required

> [!IMPORTANT]
> **Confirmation de la structure existante**
> Avant de démarrer la migration, veuillez confirmer :
> - Quels fichiers/dossiers du projet actuel contiennent du code à migrer ?
> - Y a-t-il déjà une application broadcast fonctionnelle à migrer ?
> - Quelle est la base de données actuellement utilisée (structure, accès) ?

> [!WARNING]
> **Changements breaking**
> - Tous les chemins d'URL seront préfixés par `/saas/`
> - La structure des dossiers sera complètement réorganisée
> - Le serveur actuel sera remplacé par un custom server Next.js

## Proposed Changes

### Phase 1 : Préparation et Configuration

#### [NEW] `next.config.ts`
Configuration Next.js avec basePath `/saas/` :
- `basePath: '/saas'` pour tous les chemins
- `assetPrefix: '/saas'` pour les assets
- Headers de sécurité (X-Frame-Options, X-Content-Type-Options)
- Configuration de production optimisée

#### [NEW] `.env`
Variables d'environnement pour production :
- Port : **3002**
- `NEXT_PUBLIC_BASE_PATH=/saas`
- `NEXTAUTH_URL=https://event2one.com/saas`
- Configuration base de données (DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE)
- Configuration Socket.IO (`SOCKET_IO_PATH=/saas/socket.io`)
- Secrets d'authentification NextAuth

#### [NEW] `ecosystem.config.js`
Configuration PM2 pour le déploiement :
- Nom de l'app : `event2one-saas`
- Script : `server.js`
- Port : **3002**
- Mode cluster avec 1 instance
- Logs et gestion des erreurs

---

### Phase 2 : Structure de Dossiers Modulaire

#### [NEW] `src/app/` - Routes Next.js App Router

**Route Groups et Layouts** :

##### [NEW] `src/app/(marketing)/layout.tsx`
Layout pour le site vitrine (marketing) :
- Navigation publique
- Footer
- Styles marketing

##### [NEW] `src/app/(marketing)/page.tsx`
Page d'accueil marketing → `/saas/` :
- Présentation du produit
- Call-to-action
- Démonstration des fonctionnalités

##### [NEW] `src/app/(app)/layout.tsx`
Layout pour le dashboard authentifié :
- Sidebar de navigation
- Header avec user menu
- Protection par authentification

##### [NEW] `src/app/(app)/dashboard/page.tsx`
Page dashboard principal → `/saas/dashboard` :
- Vue d'ensemble des événements
- Statistiques
- Liens rapides

##### [NEW] `src/app/broadcast/layout.tsx`
Layout pour la feature broadcast :
- Configuration spécifique broadcast
- Initialisation Socket.IO

##### [NEW] `src/app/broadcast/screen/[id]/page.tsx`
Page écran de broadcast → `/saas/broadcast/screen/[id]` :
- Affichage en temps réel du contenu
- Connexion Socket.IO au namespace `/broadcast`

##### [NEW] `src/app/broadcast/event/[eventId]/admin/[adminId]/page.tsx`
Page d'administration broadcast → `/saas/broadcast/event/[eventId]/admin/[adminId]` :
- Contrôles admin pour le broadcast
- Gestion du contenu en temps réel
- Interface d'administration

##### [NEW] `src/app/voting/layout.tsx`
Layout pour la feature voting (future) :
- Configuration voting
- Initialisation Socket.IO voting

##### [NEW] `src/app/voting/room/[roomId]/page.tsx`
Page salle de vote → `/saas/voting/room/[roomId]` :
- Interface de vote en temps réel
- Leaderboard live
- Socket.IO namespace `/voting`

##### [NEW] `src/app/api/auth/[...nextauth]/route.ts`
API Route NextAuth :
- Configuration des providers
- Callbacks de session
- JWT handling

##### [NEW] `src/app/api/broadcast/` (multiple routes)
API Routes pour broadcast :
- `getScreen/route.ts` - Récupération config écran
- `updateMedia/route.ts` - Mise à jour contenu média
- `getEvents/route.ts` - Liste des événements

##### [NEW] `src/app/layout.tsx`
Root layout global :
- Providers (Auth, Theme)
- Fonts
- Metadata SEO

##### [NEW] `src/app/globals.css`
Styles globaux Tailwind CSS

---

### Phase 3 : Features Modulaires

#### Feature Broadcast

##### [NEW] `src/features/broadcast/components/ScreenDisplay.tsx`
Composant d'affichage écran :
- Rendu du contenu multimédia
- Mise à jour temps réel via Socket.IO
- Gestion des états (loading, error, connected)

##### [NEW] `src/features/broadcast/components/AdminControls.tsx`
Composant de contrôles admin :
- Interface de sélection média
- Boutons de contrôle (play, pause, next)
- Émission d'événements Socket.IO

##### [NEW] `src/features/broadcast/components/MediaContainer.tsx`
Composant container média :
- Affichage image/vidéo/PDF
- Transitions fluides
- Responsive design

##### [NEW] `src/features/broadcast/hooks/useScreenSocket.ts`
Hook Socket.IO pour broadcast :
- Connexion au namespace `/broadcast`
- Join room par screenId
- Écoute des événements `mediaUpdated`
- État de connexion

##### [NEW] `src/features/broadcast/types/broadcast.ts`
Types TypeScript broadcast :
- `Screen`, `MediaContent`, `BroadcastEvent`
- Interfaces pour Socket.IO events

##### [NEW] `src/features/broadcast/utils/socketEvents.ts`
Utilitaires événements Socket.IO :
- Helpers pour émission/écoute
- Validation des données

---

#### Feature Voting (Préparation)

##### [NEW] `src/features/voting/components/VoteCard.tsx`
Composant carte de vote :
- Affichage d'une option de vote
- Animation sur sélection
- État désactivé après vote

##### [NEW] `src/features/voting/components/Leaderboard.tsx`
Composant classement :
- Affichage temps réel du classement
- Animations de changement de position
- Mise à jour via Socket.IO

##### [NEW] `src/features/voting/hooks/useVotingSocket.ts`
Hook Socket.IO pour voting :
- Connexion au namespace `/voting`
- Join room par roomId
- Soumission et réception des votes

##### [NEW] `src/features/voting/types/voting.ts`
Types TypeScript voting :
- `Vote`, `Participant`, `VotingRoom`
- Interfaces pour les événements

---

#### Feature Shared (Ressources Partagées)

##### [NEW] `src/features/shared/components/Button.tsx`
Composant bouton réutilisable :
- Variantes (primary, secondary, outline)
- Tailles (sm, md, lg)
- États (loading, disabled)

##### [NEW] `src/features/shared/components/Input.tsx`
Composant input réutilisable :
- Variants (text, email, password)
- Validation visuelle
- Label et error message

##### [NEW] `src/features/shared/components/Modal.tsx`
Composant modal réutilisable :
- Overlay avec backdrop
- Animations d'ouverture/fermeture
- Accessible (ARIA)

##### [NEW] `src/features/shared/components/Card.tsx`
Composant carte réutilisable :
- Container avec shadow
- Header, body, footer sections
- Responsive

##### [NEW] `src/features/shared/hooks/useSocket.ts`
Hook Socket.IO générique :
- Connexion à un namespace donné
- Gestion reconnexion automatique
- État de connexion partagé
- Path configuré : `/saas/socket.io`

##### [NEW] `src/features/shared/hooks/useAuth.ts`
Hook d'authentification :
- Wrapper autour de NextAuth
- État de session
- Helpers login/logout

##### [NEW] `src/features/shared/types/event.ts`
Types Event partagés :
- `Event`, `EventConfig`, `EventStatus`

##### [NEW] `src/features/shared/types/user.ts`
Types User partagés :
- `User`, `UserRole`, `Session`

##### [NEW] `src/features/shared/types/index.ts`
Réexportation de tous les types partagés

##### [NEW] `src/features/shared/utils/date.ts`
Utilitaires de date :
- Formatage dates
- Calculs de durée
- Timezone handling

##### [NEW] `src/features/shared/utils/validation.ts`
Utilitaires de validation :
- Validators email, password
- Sanitization inputs

---

### Phase 4 : Infrastructure

#### [NEW] `src/lib/db.ts`
Configuration base de données :
- Pool de connexions MySQL
- Helpers pour requêtes
- Gestion des erreurs de connexion

#### [NEW] `src/lib/socket-server.ts`
Configuration serveur Socket.IO :
- Setup des namespaces (`/broadcast`, `/voting`, `/obs`)
- Handlers d'événements par namespace
- Middleware d'authentification Socket.IO
- Logging des connexions

#### [NEW] `src/lib/auth.ts`
Configuration NextAuth :
- Providers (Credentials, etc.)
- Callbacks (session, jwt)
- Pages personnalisées
- Adapters base de données

#### [NEW] `src/middleware.ts`
Middleware Next.js :
- Protection des routes authentifiées
- Redirections
- Headers de sécurité

---

### Phase 5 : Serveur Personnalisé

#### [NEW] `server.js`
Custom server Node.js :
- Intégration Next.js avec `basePath: '/saas'`
- Serveur HTTP avec Socket.IO
- Configuration Socket.IO avec `path: '/saas/socket.io'`
- CORS configuré pour `event2one.com`
- Import de `setupSocketServer` depuis `src/lib/socket-server.ts`
- **Écoute sur port 3002**
- Gestion des erreurs

---

### Phase 6 : Configuration Déploiement

#### [NEW] `APACHE_CONFIG.md`
Documentation configuration Apache :
- VirtualHost pour `event2one.com`
- **ProxyPass `/saas` vers `http://localhost:3002/saas`**
- **RewriteRule pour WebSocket `/saas/socket.io` vers `ws://localhost:3002`**
- Headers de sécurité
- Modules requis (proxy, proxy_http, proxy_wstunnel, rewrite, headers, ssl)

#### [MODIFY] `package.json`
Mise à jour des dépendances et scripts :
- Scripts : `dev`, `build`, `start` (avec server.js)
- Dépendances : `next@16.0.3`, `socket.io@^4.8.1`, `socket.io-client@^4.8.1`, `next-auth@^4.24.0`, `mysql@^2.18.1`
- DevDependencies : TypeScript, ESLint, Tailwind CSS 4

#### [NEW] `tsconfig.json`
Configuration TypeScript :
- Path aliases (`@/*` → `./src/*`)
- Strict mode
- Configuration Next.js

#### [NEW] `.gitignore`
Fichiers à ignorer :
- `.env`, `.env.local`
- `node_modules/`
- `.next/`
- `logs/`

---

### Phase 7 : Documentation

#### [NEW] `README.md`
Documentation projet :
- Description de l'architecture
- Installation locale
- Scripts disponibles
- Guide de déploiement
- Structure des features

#### [NEW] `DEPLOYMENT.md`
Guide de déploiement pas à pas :
- Préparation serveur
- Clone du code
- Configuration .env
- Build et lancement PM2
- Configuration Apache
- Vérification

---

## Verification Plan

### Tests Locaux

1. **Installation et Build**
   ```bash
   npm install
   npm run build
   npm run dev
   ```
   Vérifier que l'application démarre sur `http://localhost:3002/saas`

2. **Test Socket.IO**
   - Ouvrir deux fenêtres sur une page broadcast
   - Vérifier la synchronisation en temps réel
   - Vérifier les logs de connexion Socket.IO

3. **Test Routes**
   - `/saas/` → Page marketing
   - `/saas/dashboard` → Dashboard (avec auth)
   - `/saas/broadcast/screen/test-id` → Écran broadcast
   - `/saas/api/broadcast/getScreen` → API fonctionnelle

4. **Test Build Production**
   ```bash
   npm run build
   npm run start
   ```
   Vérifier l'absence d'erreurs de build

### Tests Serveur (Après Déploiement)

1. **Vérification Apache**
   ```bash
   sudo apache2ctl configtest
   curl -I https://event2one.com/saas/
   ```

2. **Vérification PM2**
   ```bash
   pm2 status
   pm2 logs event2one-saas --lines 50
   ```

3. **Test WebSocket**
   - Utiliser un client Socket.IO pour tester la connexion
   - Vérifier que le path `/saas/socket.io` fonctionne

4. **Test Fonctionnel Complet**
   - Accéder à `https://event2one.com/saas/`
   - Se connecter au dashboard
   - Tester le broadcast en temps réel
   - Vérifier les logs côté serveur

### Tests de Performance

1. **Lighthouse Audit**
   - Performance > 90
   - Accessibility > 95
   - Best Practices > 90
   - SEO > 90

2. **Load Testing**
   - Tester avec 50+ connexions Socket.IO simultanées
   - Vérifier la stabilité du serveur

---

## Migration des Données Existantes

Si du code/données existent actuellement dans le projet :

1. **Identifier les composants existants** à migrer
2. **Mapper vers la nouvelle structure** (features/broadcast, features/voting, etc.)
3. **Adapter les chemins** pour le basePath `/saas/`
4. **Tester la compatibilité** avec la nouvelle architecture

---

## Timeline Estimé

- **Phase 1-2** (Configuration + Structure) : 2-3 heures
- **Phase 3** (Features Broadcast + Shared) : 4-6 heures
- **Phase 4-5** (Infrastructure + Server) : 2-3 heures
- **Phase 6-7** (Déploiement + Docs) : 2 heures
- **Tests et Vérification** : 2-3 heures

**Total estimé** : 12-17 heures de développement

---

## Points d'Attention

- ⚠️ Tous les liens internes doivent être relatifs (ou utiliser le composant `Link` de Next.js)
- ⚠️ Le path Socket.IO doit être **exactement** le même côté client et serveur : `/saas/socket.io`
- ⚠️ Les variables d'environnement doivent être préfixées `NEXT_PUBLIC_` pour être accessibles côté client
- ⚠️ Tester la configuration Apache en local avant déploiement (via Docker si possible)
- ⚠️ **Port configuré : 3002** (au lieu du port 3000 par défaut)

---

## Prochaines Étapes

1. ✅ Valider ce plan avec l'équipe
2. ⏭️ Créer la structure de dossiers vide
3. ⏭️ Configurer Next.js et le serveur
4. ⏭️ Migrer/créer la feature broadcast
5. ⏭️ Tester en local
6. ⏭️ Déployer sur le serveur
7. ⏭️ Configurer Apache et PM2
8. ⏭️ Tests de validation finale
