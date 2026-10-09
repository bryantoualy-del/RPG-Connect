# RPG Connect

Source centrale des assets et conventions RPG Connect pour les compagnons de la **Compagnie Créole**.

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
