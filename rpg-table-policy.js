/* V5 boundary: no rolls, inventories or private journals cross a free-table room. */
export const TABLE='table-free', GUIDED='guided';
export const validMode=mode=>[TABLE,GUIDED].includes(mode);
const clone=x=>JSON.parse(JSON.stringify(x));
const pick=(value,keys)=>Object.fromEntries(keys.filter(k=>value?.[k]!==undefined).map(k=>[k,clone(value[k])]));
export function tacticalState(value){
 const s=pick(value,['characterId','characterName','portrait','stateEpoch','stateRevision','hp','ac','statuses','concentration','updatedAt']);
 s.concentration=!!value.concentration;s.hp=pick(value.hp,['current','max','temp']);s.turn=pick(value.turn,['reaction']);return s;
}
export function tacticalRow(a){
 const enemy=a.kind==='enemy',row=pick(a,['id','name','portrait','role','kind','ownerId','companionId','initiative','activeTurn','conditions']);
 if(!enemy)return {...row,...pick(a,['health','ac','reaction','concentration','lifeStatus'])};
 // Hostile disclosure is opt-in, including on the wire (not merely hidden by CSS).
 if(a.publicHealth===true&&a.health)row.health=pick(a.health,['current','max','temp']);
 if(a.publicAc===true)row.ac=a.ac;
 return row;
}
export function tacticalPayload(q={}){
 const p=pick(q,['version','combatId','syncEpoch','syncRevision','groupRevision','healthActorId','round','activeParticipantId','session','machine','text','requestId']);
 if(q.session)p.session=pick(q.session,['phase','markerOnly','activeCharacterId','activeName','activeKind','round','turnIndex','activeParticipantId','turnStartRevision','summonActor','combatId','syncEpoch','sessionRevision','text','resetCombat','ready']);
 if(Array.isArray(q.conditionActors))p.conditionActors=q.conditionActors.map(tacticalRow);
 if(Array.isArray(q.targets))p.targets=q.targets.map(t=>pick(t,['id','name','portrait','creatureType','boss','conditions']));
 return p;
}
export const tableEvents=new Set(['initiative:rolled','turn:end-request']);
export const tableCommands=new Set(['state:sync','targets:set','target:clear','message:gm','initiative:request','initiative:retry','turn:grant','turn:close','defense:turn-ended','hp:set','tempHp:set','conditions:set']);
export function tableCommand(event){
 if(!tableCommands.has(event.type))return null;
 if(['hp:set','tempHp:set','conditions:set'].includes(event.type))return event; // explicit MJ correction, never a snapshot overwrite
 return {...event,payload:tacticalPayload(event.payload)};
}
