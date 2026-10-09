# Rufus : règles natives et autorité Encounter

Le Companion consomme les ressources et lance les dés natifs. Encounter possède cibles, touche, dégâts effectifs, PV, effets et expirations. Réutilisation du bus existant, de `effect:request` / `message:gm.effectResult`, des commandes autorisées et de l’annulation certifiée. Aucun nouveau serveur nécessaire.

## Effets

`effect:request` porte `actionId`, `combatId`, `kind`, `source`, les `targetIds` réels et la capture des ressources. Les kinds Rufus sont `rufus-mirror`, `rufus-invisibility`, `rufus-vision`, `rufus-agony`, `rufus-raven`, `rufus-cunning`, `rufus-teleport`. La concentration réutilise `concentrationInstance`. Chaque résultat est enregistré par action ; un replay renvoie le reçu.

`state:sync.rufus` et `message:gm.rufus` reflètent doubles restants, cible de Vision, indicateur d’agonie, offres d’absorption et proposition de Frappes autoguidées. Ce miroir est également inclus dans la correction d’annulation. Il ne contient aucun PV ennemi, pourcentage de vie ni fiche complète.

- Image miroir : trois doubles, seuils de redirection 6/8/11, CA native 13, une minute. Résolution avant dégâts et Esquive instinctive. Le MJ marque les exceptions de perception sur la créature ; pas de participants supplémentaires.
- Invisibilité : bénéficiaire vivant du groupe, concentration du lanceur, une heure. Attaque ou lancement de sort du bénéficiaire met fin à l’effet ; perception spéciale vérifiée par Encounter.
- Vision de la Vérité : cible verrouillée par ID, validation MJ de portée et révélation, une minute. Avantage et critique 17–20 contre cette cible seulement. Une défense pertinente choisie par le MJ, jamais la totalité des statistiques secrètes. Le contrecoup SAG reste natif.
- Œil du Destin : Linceul éveillé, validation MJ par défaut et une attaque par round. Aucun seuil d’agonie inventé. Une table peut explicitement configurer `encounter.rufusAgonyThresholdPercent` ; le pourcentage n’est jamais transmis.
- Ombre : offre uniquement après une élimination appliquée et attribuée. L’absorption conserve la ressource native ; un seul souvenir +1d8 à la fois.
- Ruse et téléportation : économie native et journal partagé. Se cacher reste une intention ; déplacement et espace libre sont validés à la table sans coordonnées artificielles.

## Révision d’un jet

`attack:revise` conserve `attackId` et `actionId`. Il porte `revisionId`, `combatId`, `reason` (`lucky`, `guided`, `guided-decline`, `raven`), `nat`, `total`, les dés supplémentaires et `undoCapture`. Encounter refuse les décisions définitives, cibles éliminées, calculs incohérents et bonus déjà utilisés. Le reçu `message:gm.attackRevisionResult` est rejoué sans deuxième calcul. La fenêtre MJ existante affiche le total révisé.

Le choix Chanceux et le dé supplémentaire sont sauvegardés avant présentation. Frappes autoguidées est proposé après la proposition de raté du MJ ; le dé psionique diminue uniquement à la touche finale. Les JdS hostiles conservent `player-save:request/result/ack`, enrichis par `initialRolls`, `luckyRoll` et `ravenRoll` lorsque utilisés. Les coûts sont capturés dans l’action originale et une reconnexion ne relance pas les dés.

## Défenses et annulation

Le profil natif ajoute la résistance nécrotique seulement pour l’objet équipé `Collier de résistance nécrotique`. Encounter applique R/I/V puis PV temporaires ; aucune division locale d’un dégât résolu.

Les annulations passent par `undo:prepare/commit/finalize` et le Journal MJ existants. Les actions restent annulables lorsqu’aucune modification ultérieure incompatible n’empêche leur restauration. Les replays d’une action annulée ne doivent pas réactiver ses effets.

Hors connexion, les contrôles et règles natifs sont conservés. Déployer Ensemble les modifications Rufus et Encounter ; les cinq autres Companions n’ont pas besoin de changement de leurs règles.
