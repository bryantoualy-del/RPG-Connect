# Effets de combat partagés

`rpg-combat-effects-client.js` est copié à l’identique dans les six Companions. Il ne résout pas les dégâts ni les effets à distance : Encounter les arbitre.

- `effect:request` : `actionId`, `combatId`, `kind`, bénéficiaires ou action de Hâte ; capture d’annulation certifiée.
- `object:batch-request` : objets identifiés, cibles individuelles, naturels d20, nouvel ordre ou continuation.
- `object:order-request` : ordre commun et capture de l’action bonus.
- Résultats via `message:gm.effectResult` / `objectBatchResult`.
- Miroir `combatEffects` via `state:sync`, `conditions:set` et correction d’annulation ; CA de base distincte de la CA effective pour éviter le cumul après reconnexion.
- Réactions : protocole existant `reaction:request/options/claim/grant/resolve/closed` ; descripteurs Samoth `samoth-shield`, `samoth-wings`.

Les coûts ne sont pris qu’une fois dans le Companion. Encounter mémorise les résultats par action ; un replay renvoie le résultat. Les commandes restent dans la liste de commandes autorisées actuelle du serveur. Déployer Encounter et les Companions ensemble ; le serveur n’a pas besoin d’être modifié.
