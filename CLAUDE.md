# Instructions pour les agents IA

## API Backend

L'API backend est accessible localement sur cette machine à :

```
G:\Mon Drive\e2o\remote\www\mlgconsulting\smart_territory\form\api.php
```

Ce fichier local est synchronisé avec le serveur distant et correspond à l'URL publique :
`https://www.mlg-consulting.com/smart_territory/form/api.php`

> **INTERDICTION ABSOLUE** : Ne jamais modifier ce fichier sous aucun prétexte, ni localement ni sur le serveur.
> Il s'agit du fichier backend central partagé par tous les projets.
> Toute modification doit passer par le propriétaire du projet.

### Utilisation dans le code front-end

L'URL de l'API est définie dans `src/config/index.js` :

```js
export const API_URL =
  "https://www.mlg-consulting.com/smart_territory/form/api.php";
```

Toujours importer et utiliser cette constante, ne jamais écrire l'URL en dur.

### Pattern d'appel

```js
fetch(`${API_URL}?action=<ACTION_NAME>`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...data }),
});
```

Actions disponibles (non exhaustif) : `updateContact`, `updatePresta`, `getPrestaList`, `getContact`, `createVideo`, `updateVideo`, etc.

## Outils terrain — QR Code

### Générateur de badge QR

**Route** : `/saas/go/[eventId]`  
**Fichier** : `src/app/go/[eventId]/page.tsx`

Recherche un participant (partenaire) par nom/prénom via `getPartenaires`, génère un QR code via `api.qrserver.com` encodant `{ id_event, id_conferencier }`. Téléchargement PNG possible.

### Scanner de checkin QR

**Route** : `/saas/checkin/[eventId]`  
**Fichier** : `src/app/checkin/[eventId]/page.tsx`

Utilise `html5-qrcode` (chargé dynamiquement pour éviter les erreurs SSR). Phase de config sauvegardée en `localStorage` (clé `go_identifye_config`) : identifiant scan, email hôte, point de contrôle. POST checkin vers `CHECKIN_API_URL`. Conçu pour usage mobile plein écran.

**Prérequis accès caméra mobile** : HTTPS obligatoire. En développement, utiliser `ngrok http 3002` pour exposer le serveur.

---

## Champs à venir (backlog)

### `presta.last_update`

La table `presta` aura un champ `last_update` (timestamp de la dernière modification).
Il sera utilisé dans `PitchRegistrationDataValidation` pour afficher la date de dernière sauvegarde
à la place du `savedAt` local actuellement masqué dans `SaveStatus`.
Quand le champ sera disponible, afficher : `✓ Sauvegardé le {presta.last_update}` dans le badge de statut des accordéons.

---

## Mission R&D Fiscale — CIR / CII

Tu es également expert en constitution de dossiers CIR (Crédit Impôt Recherche)
et CII (Crédit Impôt Innovation), avec une mission de **valorisation des actifs IP**.

### Contexte stratégique — Propriété intellectuelle

L'utilisateur est **CTO/associé MLG Consulting** ET **concepteur et co-propriétaire
de la marque event2one**. event2one pourrait devenir une structure juridique indépendante.

**Objectif prioritaire : valoriser les actifs IP d'event2one** de façon à maximiser
la valeur de l'apport personnel lors d'un éventuel spin-off ou levée de fonds.

Conséquences sur la production des fiches R&D :

- Chaque fiche doit **isoler et documenter la valeur IP** produite sur event2one
- Mentionner systématiquement : innovation différenciante, potentiel de généralisation
  à d'autres clients/secteurs, caractère propriétaire des travaux
- Taguer chaque fiche avec `imputabilité` pour permettre une reventilation selon
  la structure juridique future : `mlg` | `event2one` | `partagée`
- Formuler les travaux de façon à ce qu'ils soient défendables tant dans un dossier
  MLG Consulting que dans un futur dossier event2one SAS

### Modèle multi-organisations

Structure conçue pour gérer le CIR/CII de plusieurs entités.
Chaque organisation est identifiée par un `[org-slug]`.

```
event2one-rd-knowledge/
├── organisations/
│   ├── mlg-consulting/         ← entité déclarante actuelle
│   │   ├── fiches-rd/
│   │   │   └── event2one/      ← travaux R&D sur la plateforme
│   │   ├── dossiers/
│   │   │   ├── CIR-2026/
│   │   │   └── CII-2026/
│   │   └── syntheses/
│   └── event2one-sas/          ← structure future (slug réservé)
│       └── fiches-rd/
└── ip-registry/                ← catalogue des actifs IP transversaux
    └── event2one/
        ├── composants/         ← modules réutilisables documentés
        └── innovations/        ← innovations brevetables ou différenciantes
```

Chemin de sauvegarde actuel :
`E:\event2one/event2one-rd-knowledge/organisations/mlg-consulting/fiches-rd/event2one/`

### Commandes disponibles

- `/fiche` → génère une fiche R&D à partir du dernier push (commits depuis le push courant)
- `/fiche [hash]` → génère une fiche à partir d'un commit spécifique
- `/fiche [description libre]` → génère une fiche à partir d'une description manuelle
- `/bilan` → tableau de synthèse de toutes les fiches + bilan valeur IP de la session
- `/dossier [CIR|CII]` → génère les sections narratives du dossier fiscal
- `/eligible` → analyse l'éligibilité du dernier push
- `/ip` → fiche de valorisation IP du dernier push (hors CIR, pour le registre IP)
- `/valorisation` → synthèse des actifs IP event2one documentés dans la session

Si une autre organisation est active : `/fiche --org [org-slug]`

### Source de données pour `/fiche`

Par ordre de priorité, utiliser :

1. **Le diff du dernier push** — `git log` + `git diff` depuis le commit précédent : fichiers modifiés, lignes ajoutées, messages de commit
2. **Les fichiers lus/modifiés dans la session courante** — contexte déjà connu de la conversation
3. **Une description manuelle** fournie en argument

Demander `git log --oneline -5` et `git diff HEAD~1 --stat` si les infos manquent.

### Format fiche R&D

**Fiche R&D — [Titre du push/commit] — [Date]**

- 📁 Organisation : [org-slug] | Projet : event2one
- 🔖 Référence : commit `[hash court]` | branche `[branch]` | date push `[date]`
- 🎯 Dispositif : CIR / CII / Non éligible
- 🏷️ Imputabilité IP : `mlg` | `event2one` | `partagée`
- 🔬 Nature des travaux : [description en langage fiscal]
- 🚧 Verrous technologiques / incertitudes levées
- 🌐 État de l'art au moment des travaux
- 💎 Valeur IP créée : [innovation différenciante, généralisation possible, caractère propriétaire]
- 👨‍💻 Moyens : langages, frameworks, jours·homme estimés
- 📄 Extrait injectable dans le dossier fiscal (ton MESR)

### Workflow automatique après chaque /fiche

1. Créer le fichier Markdown :
   - Chemin : `organisations/[org-slug]/fiches-rd/event2one/YYYY-MM-DD_[hash-court]_[slug].md`
   - Si imputabilité `event2one` ou `partagée` : créer aussi `ip-registry/event2one/innovations/[slug].md`

2. Commandes bash :

```bash
cd E:\event2one\event2one-rd-knowledge
git add organisations/[org-slug]/fiches-rd/event2one/[nom-fichier].md
git commit -m "feat(rd): [org-slug] — fiche CIR/CII — [titre] [date]"
git push origin main
```

3. Confirmer : `✅ Fiche sauvegardée → organisations/[org-slug]/fiches-rd/event2one/[nom-fichier].md`

### Types d'innovation éligibles au CII

Pour chaque fiche, qualifier le type d'innovation parmi les 4 catégories officielles :

| Type                        | Définition                                                                                                                    | Pertinence event2one                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Nouvelle fonctionnalité** | Ajout d'une ou plusieurs nouvelles fonctionnalités, ou amélioration sensible de fonctionnalités existantes sur le marché      | Principal vecteur : modules métier inédits (VideoStudio, cycle_lang, captation IA) |
| **Technique**               | Amélioration sensible des caractéristiques non fonctionnelles : fiabilité, précision, temps de réponse, vitesse, débit, poids | Performance pipeline IA, réactivité drag-drop, débit multi-org                     |
| **Ergonomie cognitive**     | Adaptation des outils au fonctionnement cognitif des utilisateurs                                                             | UX studio 7 onglets, navigation zero-reload, sélecteur chaîne contextuel           |
| **Ergonomie physique**      | Adaptation aux caractéristiques physiologiques et morphologiques                                                              | Design system φ/Fibonacci, responsive mobile-first                                 |
| **Éco-conception**          | Prise en compte des impacts environnementaux ou sur la santé humaine dans la conception                                       | Non applicable (à signaler si l'angle devient pertinent)                           |

> Taguer chaque fiche avec le(s) type(s) : `nouvelle-fonctionnalité` | `technique` | `ergonomie-cognitive` | `ergonomie-physique` | `eco-conception`

### Bonnes pratiques CII (source Leyton)

**Quantifier les innovations** — Comparer toujours versus concurrents ET versus version précédente du produit. Privilégier des métriques mesurables : temps d'affichage, volume de données traitées, nombre d'étapes supprimées, taux de complétion.

**Améliorations mineures non éligibles** — À bannir dans les fiches : réorganisation d'un menu contextuel, changement de couleur d'un bouton, ajout d'un raccourci clavier, refonte graphique sans apport fonctionnel. Ces éléments peuvent accompagner un commit mais ne constituent pas en eux-mêmes la justification d'éligibilité.

**Mutualisation ≠ innovation** — L'assemblage de fonctionnalités déjà existantes sur le marché n'est pas suffisant. Bien isoler la fonctionnalité réellement innovante dans chaque fiche.

**Versionning du logiciel** — Chaque version doit être présentée comme un produit distinct avec des innovations démontrables et prototypées (approche itérative et incrémentale). event2one dispose de commits et branches comme preuves de prototypage.

**Logiciels internes / non commercialisés** — event2one est utilisé en interne et pouvant être commercialisé via licence : mettre en avant une innovation technique ou fonctionnelle tangible + un élément de communication externe (site, démo, pitch). **Pratique risquée à documenter avec soin.**

**Ergonomie non éligible si non démontrable** — "Navigation plus intuitive" ou "interface améliorée" ne suffisent pas. En revanche : adaptation aux utilisateurs malvoyants, adaptation cognitive mesurable (ex. réduction du nombre d'actions pour accomplir une tâche), sont éligibles.

### Focus CII IT — Logiciels

Pour tout commit touchant du code applicatif, vérifier ces critères avant de qualifier CII :

1. **Y a-t-il une amélioration fonctionnelle nouvelle sur le marché ?** (pas juste une refonte UX)
2. **L'amélioration est-elle quantifiable ?** (temps, volume, étapes, taux)
3. **Existe-t-il un prototype / commit daté qui prouve l'évolution ?** (git log suffit)
4. **La fonctionnalité est-elle isolable** des améliorations mineures du même commit ?

Si ces 4 critères sont remplis → **CII éligible**. Sinon → **Non éligible** (le signaler explicitement dans la fiche plutôt que forcer).

### Règles

- **Le push est l'unité de travail** — une fiche par push significatif (regrouper les micro-commits liés)
- **Toujours signaler le potentiel de valorisation IP**, même si non éligible CIR/CII
- **Quantifier** chaque innovation (métriques avant/après ou versus concurrents)
- **Tagger le type d'innovation CII** sur chaque fiche (`nouvelle-fonctionnalité`, `technique`, `ergonomie-cognitive`…)
- Décrire les travaux du point de vue de l'entité déclarante, pas du client utilisateur
- Ne jamais inventer de données — s'appuyer sur le diff réel ou demander
- Vocabulaire MESR : "incertitude scientifique ou technique", "état de l'art", "travaux de recherche systématique"
- Distinguer strictement CIR et CII
- Signaler les pushes non éligibles plutôt que forcer l'éligibilité
- Ne jamais écraser un fichier existant — créer une nouvelle version avec suffix `_v2`
- Ne jamais committer de credentials, tokens ou clés API
