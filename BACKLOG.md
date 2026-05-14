# Product Backlog — event2one SaaS

## À implémenter

### Gestion de la désinscription (`deleteConferencier`)

**Contexte** : `ProgramGridSelector` gère l'inscription en temps réel quand `id_contact` est fourni (appel `createConferencier`). La désélection d'une session déjà inscrite ne déclenche pas encore de désincription côté API.

**Ce qu'il faut faire** :
- Stocker un `Map<id_conf_event, id_conferencier>` dans le state du composant
- Alimenter cette map à chaque `createConferencier` réussi
- À la désélection (avec `id_contact`), si la map contient un `id_conferencier` pour cette session → appeler `deleteConferencier({ id_conferencier })`
- En cas de succès : retirer de la map, décrémenter `nb_inscrits` localement
- En cas d'erreur : rollback sélection + rollback jauge
- Ajouter une prop `initialRegistrations?: Record<string, number>` pour pré-seeder la map (cas utilisateur existant)

**Fichiers concernés** :
- `src/components/ProgramGridSelector.tsx` — logique centrale
- `api.php` — action `deleteConferencier` déjà disponible (prend `id_conferencier` via JSON body)
