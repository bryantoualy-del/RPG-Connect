# Brack Mard — contrat connecté, 9 octobre 2026

Les ajouts sont portés par `Brackmard/rpg-brack-client.js` et
`Encounter/rpg-brack-authority.js`. Le serveur transporte les événements existants ;
aucune nouvelle commande serveur ni moteur parallèle de dégâts n’est nécessaire.

## Événements existants réutilisés

- `effect:request`, `kind: brack-dodge` : réserve l’action native, validation MJ,
  réponse `message:gm.effectResult`. Le refus restaure la réserve locale.
- `message:gm.brackAuraRequest` : le MJ confirme le contact au début du tour
  hostile. Brack lance ses 2d6 natifs, conserve le résultat avant émission.
- `effect:request`, `kind: brack-aura` : `actionId = triggerId = requestId`,
  `combatId`, `rolls: [d6,d6]`, `amount`. Encounter valide le déclenchement,
  applique les défenses et PV temporaires, renvoie les dégâts effectifs.
- `heal:request`, `source: Vigueur naine` : conserve le flux de soin existant ;
  son succès ajoute Esquiver dans la même transaction du journal. Aucun second
  événement d’Esquiver, ni seconde consommation d’action.
- `player-save:request/result/ack` : le premier échec de Brack est conservé
  localement pendant la proposition Inflexible. Seul le résultat final est envoyé.
  `indomitable.used` et `indomitable.firstRoll` documentent la relance.
- `message:gm.brackBonus` : une attaque d’arme de Brack pendant son tour réduit
  effectivement une cible hostile vivante à zéro. Ni aura ni autre auteur.
- `save:request/result` : taille Grande maximum pour Croc-en-jambe et Poussée.
  Taille inconnue : décision MJ avant le JdS. Poussée : confirmation de 4,5 m,
  sans coordonnées fictives, conservée dans le journal.
- `reaction:request/claim/grant/resolve/closed` : mêmes attaques natives et coûts
  qu’auparavant. Riposte exige une attaque de mêlée effectivement ratée ;
  Sentinelle automatique exige que le MJ ait confirmé le contact à 1,5 m.

## Synchronisation et corrections

`STATE_SYNC.brack` contient l’état Esquiver, la dernière autorisation Cogneur
lourd et les demandes d’aura en attente. Les ledgers de déclenchement et les
résultats restent persistants ; les répétitions rejouent le reçu sans relancer.
Chaque identifiant réseau est un UUID court persistant, associé à une empreinte
combat / révision de début de tour / cible : plusieurs ennemis d’un round restent
indépendants.

Les réservations et conséquences utilisent `undo:prepare/commit/finalize`
existant, avec les captures natives de ressources. Les limites ordinaires du
protocole demeurent : même tour, dernière transaction restaurable, aucune
mutation ultérieure incompatible. Une action annulée reste tombstonée.

Esquiver expire au prochain début de tour canonique de Brack. Incapacitation et
vitesse zéro suspendent ses bénéfices. Le désavantage des attaques exige une
vision confirmée dans Encounter ; l’aveuglement l’empêche. Les données de portée,
vision et taille inconnues restent sous arbitrage du MJ.
