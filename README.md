# RPG Connect

Serveur WebSocket autonome, assets et conventions RPG Connect pour la **Compagnie Créole**.

## Serveur autonome

Le serveur canonique est `rpg-connect-server.js` à la racine de ce dépôt. Il est extrait sans changement fonctionnel de la copie serveur Lot 3 dans `Encounter/audit/fixtures/lot3-server/` (commit `89cd0213bcca1d58d6c4738a75db8157edfae1a4`, version `collective-2026-10-12-lot3`). Encounter conserve l’autorité de combat ; ce serveur assure le transport.

- Installation : `npm ci`
- Tests : `npm test`
- Démarrage : `npm start`
- Santé : `GET /health`
- Render : Docker, branche `main`, contexte `.`, Dockerfile `./Dockerfile`, région Frankfurt.
- `RPG_CONNECT_GM_KEY` : secret aléatoire de 24 caractères minimum, configuré sur Render uniquement.
- `RPG_CONNECT_ORIGINS` : origines clientes autorisées, séparées par des virgules.
- `PORT` : fourni par Render.

Une nouvelle instance a ses propres salles, invitations et clé MJ. Les salles et files restent en mémoire et disparaissent au redémarrage. Les changements d’Encounter ne doivent plus déployer ce service.

Les assets existants conservent leurs chemins. Le conteneur ne copie que le serveur et ses dépendances.

## Pack d'icônes

Le registre couvre **138 icônes** :
- 43 interface
- 31 inventaire
- 13 classes
- 8 écoles de magie
- 14 types de créatures + 14 variantes boss
- 15 états D&D

### Décision sémantique
Les icônes **épée** et **bouclier** du dossier interface d'origine sont classées ici dans **inventaire** :
- `inventory.generic_sword`
- `inventory.generic_shield`

Les icônes de créatures sont des fichiers WebP centraux dans `assets/icons/creatures/`.
Les autres familles sont regroupées dans `assets/icon-data/` sous forme de data-URI WebP optimisées, chargées par `rpg-icons.js`.

## API

```js
await RPG_ICONS.ready;
RPG_ICONS.creature('dragon', true);   // Boss dragon
RPG_ICONS.classIcon('paladin');
RPG_ICONS.magicSchool('evocation');
RPG_ICONS.inventory('generic_sword');
RPG_ICONS.ui('d20');
RPG_ICONS.condition('Étourdi');
```

Le fichier `manifest.json` documente toutes les clés disponibles.


## Rufus

Voir [RUFUS-PROTOCOL.md](RUFUS-PROTOCOL.md) : effets structurés, révisions de jets sur le même identifiant et informations contrôlées par Encounter. Le transport générique existant suffit ; aucun canal ni PV ennemi supplémentaire.
