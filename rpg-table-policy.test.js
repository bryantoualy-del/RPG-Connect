import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import {tacticalState,tacticalPayload,tableCommand} from './rpg-table-policy.js';
process.env.PORT='0';process.env.RPG_CONNECT_GM_KEY='test-table-key-at-least-24-characters';
const {server,rooms}=await import('./rpg-connect-server.js');
await new Promise(r=>server.listening?r():server.once('listening',r));
const clients=[];
after(async()=>{for(const ws of clients)ws.terminate();await new Promise(r=>server.close(r));});
const caps=['table-free-v5','hybrid-resolution-v4','event-receipts','initiative-ack','attack-id-ledger','authoritative-save-v1','state-revisions','condition-revisions'];
async function peer(){const ws=new WebSocket('ws://127.0.0.1:'+server.address().port);clients.push(ws);const inbox=[];ws.on('message',m=>inbox.push(JSON.parse(String(m))));await new Promise(r=>ws.once('open',r));return {ws,inbox,send:q=>ws.send(JSON.stringify({v:1,protocolVersion:1,clientCapabilities:caps,...q})),wait:async type=>{for(let i=0;i<100;i++){const index=inbox.findIndex(m=>m.type===type);if(index>=0)return inbox.splice(index,1)[0];await new Promise(r=>setTimeout(r,10));}throw Error('Missing '+type);}};}
test('explicit enemy disclosure, private state whitelist',()=>{
 const p=tacticalPayload({health:{current:40},inventory:['secret'],conditionActors:[{id:'enemy',kind:'enemy',name:'Cultiste',health:{current:91,max:99},ac:22,resources:{secret:1},conditions:[]}]});
 assert.equal(p.health,undefined);assert.equal(p.inventory,undefined);assert.equal(p.conditionActors[0].health,undefined);assert.equal(p.conditionActors[0].ac,undefined);
 const disclosed=tacticalPayload({conditionActors:[{kind:'enemy',publicHealth:true,publicAc:true,health:{current:7,max:12},ac:15}]});assert.equal(disclosed.conditionActors[0].health.current,7);assert.equal(disclosed.conditionActors[0].ac,15);
 const s=tacticalState({characterId:'samoth',hp:{current:60,max:72,temp:3,tempMetadata:{secret:1}},turn:{reaction:false,action:true,bonus:false},resources:{slots:5},inventory:['secret'],journal:['secret']});assert.deepEqual(s.hp,{current:60,max:72,temp:3});assert.deepEqual(s.turn,{action:true,bonus:false,reaction:false});assert.equal(s.resources,undefined);
});
test('free table never permits MJ to mutate a Companion\'s PV or conditions',()=>{
 for(const type of ['hp:set','tempHp:set','conditions:set']){
   assert.equal(tableCommand({id:'old-mj-correction',type,characterId:'samoth',payload:{amount:99,conditions:[{name:'charmed'}]}}),null,type);
 }
 const sync=tableCommand({type:'state:sync',payload:{conditionActors:[],hp:{current:1},statuses:['charmed']}});
 assert.equal(sync.type,'state:sync');
 assert.equal(sync.payload.hp,undefined);
 assert.equal(sync.payload.statuses,undefined);
});

test('free table default, real sockets: private rolls dropped, state retained, mode CAS and reconnect',async()=>{
 const gm=await peer();gm.send({type:'hello',role:'gm',key:process.env.RPG_CONNECT_GM_KEY});const welcome=await gm.wait('welcome'),room=welcome.room;assert.equal(welcome.payload.sessionMode,'table-free');
 gm.send({type:'invite',characterId:'samoth'});const token=(await gm.wait('invite')).payload.token;
 const player=await peer();player.send({type:'hello',role:'player',room,characterId:'samoth',token});assert.equal((await player.wait('welcome')).payload.sessionMode,'table-free');
 for(const type of ['hp:set','tempHp:set','conditions:set']){
  const id='blocked-'+type.replace(':','-');
  gm.send({type:'command',characterId:'samoth',event:{id,type,characterId:'samoth',payload:{current:1,statuses:['charmed']}}});
  assert.equal((await gm.wait('queued')).result,'local-only');
  assert.equal(rooms.get(room).pending.has(id),false);
  assert.equal(player.inbox.some(m=>m.type==='command'&&m.event?.id===id),false);
 }
 const event={id:'local-attack',type:'attack:damage',characterId:'samoth',payload:{amount:1000}};player.send({type:'event',event});assert.equal((await player.wait('ack')).result,'local-only');assert.equal(rooms.get(room).pendingEvents.size,0);
 player.send({type:'state',state:{characterId:'samoth',stateEpoch:'a',stateRevision:4,hp:{current:51,max:72,temp:0},turn:{reaction:false},resources:{slots:4}}});const state=await gm.wait('state');assert.equal(state.state.hp.current,51);assert.equal(state.state.resources,undefined);
 player.send({type:'state',state:{characterId:'samoth',stateEpoch:'a',stateRevision:2,hp:{current:72,max:72,temp:0},turn:{reaction:true}}});
 gm.send({type:'session:set',mode:'guided',expectedRevision:0});assert.equal((await gm.wait('session-mode')).payload.conflict,true);
 player.ws.close();await new Promise(r=>player.ws.once('close',r));const again=await peer();again.send({type:'hello',role:'player',room,characterId:'samoth',token});await again.wait('welcome');assert.equal(rooms.get(room).states.get('samoth').hp.current,51);assert.equal(rooms.get(room).states.get('samoth').turn.reaction,false);
 gm.send({type:'session:set',mode:'guided',expectedRevision:1});assert.equal((await gm.wait('session-mode')).payload.mode,'guided');assert.equal((await again.wait('session-mode')).payload.mode,'guided');
 again.send({type:'event',event:{...event,id:'guided-attack'}});assert.equal((await gm.wait('event')).event.id,'guided-attack');
});

test('lost GM discards unconfirmed Table commands before reconnect, preserves Guided queue',async()=>{
 const gm=await peer();gm.send({type:'hello',role:'gm',key:process.env.RPG_CONNECT_GM_KEY});const room=(await gm.wait('welcome')).room;
 gm.send({type:'invite',characterId:'samoth'});const token=(await gm.wait('invite')).payload.token;
 gm.send({type:'command',characterId:'samoth',event:{id:'unconfirmed-turn',type:'state:sync',characterId:'samoth',payload:{session:{phase:'fight',activeCharacterId:'samoth',turnStartRevision:9}}}});await gm.wait('queued');assert.equal(rooms.get(room).pending.size,1);
 gm.ws.close();await new Promise(r=>gm.ws.once('close',r));
 const player=await peer();player.send({type:'hello',role:'player',room,characterId:'samoth',token});await player.wait('welcome');assert.equal((await player.wait('table-presence')).payload.gmOnline,false);assert.equal(rooms.get(room).pending.size,0);assert.equal(player.inbox.some(m=>m.type==='command'),false,'no stale turn is replayed before absence is known');
 const restored=await peer();restored.send({type:'hello',role:'gm',room,key:process.env.RPG_CONNECT_GM_KEY});await restored.wait('welcome');restored.send({type:'session:set',mode:'guided',expectedRevision:1});await restored.wait('session-mode');
 restored.send({type:'command',characterId:'samoth',event:{id:'guided-retained',type:'state:sync',characterId:'samoth',payload:{}}});await restored.wait('queued');restored.ws.close();await new Promise(r=>restored.ws.once('close',r));assert.equal(rooms.get(room).pending.size,1,'historical Guided delivery is unchanged');
});

test('Table Libre keeps turn signals ordered and idempotent through GM reconnect',async()=>{
 const gm=await peer();
 gm.send({type:'hello',role:'gm',key:process.env.RPG_CONNECT_GM_KEY});
 const {room}=await gm.wait('welcome');
 gm.send({type:'invite',characterId:'samoth'});
 const {token}=(await gm.wait('invite')).payload;
 const player=await peer();
 player.send({type:'hello',role:'player',room,characterId:'samoth',token});
 await player.wait('welcome');
 gm.ws.close();
 await new Promise(resolve=>gm.ws.once('close',resolve));

 for(const revision of [7,7,8]){
  const event={id:'end-'+revision,type:'turn:end-request',characterId:'samoth',
    payload:{participantId:'cc-samoth',turnStartRevision:revision}};
  player.send({type:'event',event});
  assert.equal((await player.wait('ack')).id,event.id);
 }
 assert.equal(rooms.get(room).pendingEvents.size,2);
 const restored=await peer();
 restored.send({type:'hello',role:'gm',room,key:process.env.RPG_CONNECT_GM_KEY});
 await restored.wait('welcome');
 const first=(await restored.wait('event')).event;
 const second=(await restored.wait('event')).event;
 assert.deepEqual([first.id,second.id],['end-7','end-8']);
 assert.equal(second.serverOrder,first.serverOrder+1);
 assert.equal(second.serverEpoch,first.serverEpoch);
 for(const event of [first,second])restored.send({type:'event-ack',id:event.id});
 restored.send({type:'invite',characterId:'samoth'});
 await restored.wait('invite');
 assert.equal(rooms.get(room).pendingEvents.size,0);
});

test('Table Libre retains only Zephyr’s active blessing declaration through GM reconnect',async()=>{
 const gm=await peer();
 gm.send({type:'hello',role:'gm',key:process.env.RPG_CONNECT_GM_KEY});
 const {room}=await gm.wait('welcome');
 const blessing={id:'cast-one',room,remaining:10,targets:['cc-rufus','cc-kentaro','cc-rufus']};
 const hp={current:90,max:92,temp:0};
 assert.equal(tacticalState({characterId:'kobe',hp,concentration:true,blessing}).blessing,undefined);
 gm.send({type:'invite',characterId:'zephyr'});
 const {token}=(await gm.wait('invite')).payload;
 const zephyr=await peer();
 zephyr.send({type:'hello',role:'player',room,characterId:'zephyr',token});
 await zephyr.wait('welcome');
 const caster={characterId:'zephyr',stateEpoch:'cast-test',hp};
 zephyr.send({type:'state',state:{...caster,stateRevision:1,concentration:true,blessing}});
 assert.deepEqual((await gm.wait('state')).state.blessing,{...blessing,targets:['cc-rufus','cc-kentaro']});
 gm.ws.close();
 await new Promise(resolve=>gm.ws.once('close',resolve));
 const restored=await peer();
 restored.send({type:'hello',role:'gm',room,key:process.env.RPG_CONNECT_GM_KEY});
 const roster=(await restored.wait('welcome')).payload.players;
 assert.deepEqual(roster.find(p=>p.characterId==='zephyr').state.blessing.targets,['cc-rufus','cc-kentaro']);
 zephyr.send({type:'state',state:{...caster,stateRevision:2,concentration:false,blessing}});
 assert.equal((await restored.wait('state')).state.blessing,undefined);
});

test('Table Libre transports an inspiration grant and its consumption without a roll result',()=>{
 const expiresAt=Date.now()+60000;
 const grant={id:'grant-1',target:'rufus',room:'TABLE2',expiresAt};
 const hp={current:80,max:80,temp:0};
 assert.deepEqual(tacticalState({characterId:'kobe',hp,inspirations:[{...grant,result:31}]}).inspirations,[grant]);
 assert.deepEqual(tacticalState({characterId:'kobe',hp,inspirations:[{...grant,expiresAt:0}]}).inspirations,[]);
 assert.equal(tacticalState({characterId:'samoth',hp,inspirations:[grant]}).inspirations,undefined);
 const used=tacticalState({characterId:'rufus',hp,usedInspiration:grant.id,lastRoll:31});
 assert.equal(used.usedInspiration,grant.id);
 assert.equal(used.lastRoll,undefined);
 assert.equal(tacticalPayload({conditionActors:[{kind:'player',usedInspiration:grant.id}]}).conditionActors[0].usedInspiration,grant.id);
});
