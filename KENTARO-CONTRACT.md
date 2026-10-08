# Kentaro — contrat de résolution connecté

Livraison du 8 octobre 2026. Le transport existant suffit : aucune nouvelle famille
d’événements ni modification du serveur n’est nécessaire.

## Attaque et Châtiment

1. `attack:rolled` / `attack:pending-hit` verrouillent l’identifiant réel de la cible.
2. Encounter confirme la touche. Kentaro conserve une décision de Châtiment durable.
3. Kentaro émet **un seul dommage logique** `attack:damage` : arme, bonus applicables
   et éventuel Châtiment sont des composantes typées du même `attackId`.
4. Une retransmission conserve `attackId` et `actionId`, avec un nouvel identifiant
   d’enveloppe. L’ACK de transport ne remplace pas `damage:resolved`.
5. Encounter conserve le résultat dans `rpgAppliedAttacks`, applique chaque
   résistance/immunité/vulnérabilité et les conséquences une seule fois.

Le refus conserve le slot. La consommation acceptée entre dans la capture
`RPGUndo` du même `actionId`. Si la cible devient indisponible avant les dégâts,
Encounter termine cette résolution avec `cancelled: true`, `effective: 0` ; le
client restaure son slot réservé, sans rejouer l’attaque.

## Effets et synchronisation

Les pouvoirs utilisent `effect:request`, `actionId`, `combatId`,
`concentrationInstance`, `undoCertified` et `undoCapture`. La réservation locale
est durable ; le résultat `message:gm.effectResult` est mémorisé par Encounter.
Les demandes répétées retournent ce résultat et ne consomment aucune nouvelle
ressource. La morsure peut rester en attente d’une décision MJ persistante.

`STATE_SYNC.kentaro` contient les effets partagés, la cible du Sceau, les touches
des deux lames par cible et par tour, et l’utilisation du Châtiment. Il ne contient
pas les PV privés des ennemis. Les annulations réutilisent le journal et son
protocole de préparation, commit et ACK existant.

## Exclusivité des dégâts

`source: mark` est remplacée par `seal-radiant` et `seal-psychic` lorsque le Sceau
s’applique. Le paquet contient alors 1d8 radiant et 1d8 psychique, jamais le d6
de Marque. Un critique double seulement les dés présents. Hexblade, Maléfice et
Voile sont calculés par le joueur, soumis aux défenses par Encounter ; ils ne
sont pas ajoutés une seconde fois côté MJ.

Les autres Companions continuent d’utiliser les mêmes événements et ACK.
