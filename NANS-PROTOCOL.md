# Nans — extensions compatibles avec le transport existant

Ces champs ajoutent des métadonnées aux événements existants. Aucun changement du broker ni nouvelle autorité de combat. Les acquittements, la file durable, les identifiants de messages et les corrections atomiques utilisent le protocole en place.

| Flux existant | Données ajoutées | Autorité |
|---|---|---|
| state:changed | `custom.nans`: rageId, rageActive, frenzy, exhaustion, capeSilent, ancestorsRules | Choix/ressources Companion ; validation des effets Encounter |
| attack:rolled | `nansAttack`: mode, reckless | Jet natif ; durée de Téméraire Encounter |
| attack:damage | `nansHit`: attackId, mode, impact, selfDamage | Dégâts et contrecoup Encounter ; reçu par attaque |
| effect:request | kind nans-control / nans-intimidate / nans-ancestors, actionId, combatId, cibles ou règles | Consommation locale capturée ; arbitrage Encounter |
| message:gm | effectResult avec actionId/ok ; nansBonusAttack après élimination | Accusé métier ; rollback du client sur refus |
| reaction:request/grant/resolve/closed | kind/optionId nans-wind ; parentActionId | Fenêtre de réaction commune ; CA temporaire pour une seule attaque |
| state:sync | nans.rage, exhaustion, reckless, ancestors | Effets durables Encounter |

Une activation de Rage possède un jeton créé avant le premier événement natif. Le Companion n'applique une correction de Rage que pour ce même jeton : un ancien STATE_SYNC ne peut pas éteindre une nouvelle activation. Pendant la réception d'un état natif, Encounter ne publie pas de miroir intermédiaire de Rage.

Le contrecoup et le renversement d'Impact sont traités seulement après une touche validée et un reçu de dégâts ; une retransmission ne rejoue pas ces conséquences. L'Impact peut ajouter plusieurs cibles à la transaction d'attaque uniquement pour Nans et pour un reçu certifié comme Impact. Les JdS, conditions et éventuels déplacements conservent le même parent d'annulation. Les dégâts des ancêtres à un tour ultérieur ont une transaction propre, liée à un effet persistant expirant après dix rounds.

Les positions sans coordonnées sont validées par le MJ. Les ancêtres nécessitent les valeurs du dossier, jamais des défauts inventés. Le silence de cape reste un statut de mouvements silencieux, sans reproduire le sort Silence. Aucun nouveau payload de Nans ne contient les PV réels des ennemis.

Implémentations : `Nans/rpg-nans.js`, `Encounter/rpg-nans-authority.js` et raccords `Encounter/rpg-connect-mj.js`. Inventaire et preuves : `Encounter/audit/NANS-INTEGRATION.md`.
