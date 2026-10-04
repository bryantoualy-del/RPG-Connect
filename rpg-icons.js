/* RPG Connect central icon registry v2 */
(()=>{'use strict';
 const SCRIPT=document.currentScript?.src||'https://raw.githubusercontent.com/bryantoualy-del/RPG-Connect/main/rpg-icons.js';
 const BASE=new URL('./',SCRIPT);
 const raw=p=>new URL(p,BASE).href;
 const types=["aberration","beast","celestial","construct","dragon","elemental","fey","fiend","giant","humanoid","monstrosity","ooze","plant","undead"];
 const conditionAliases={aveugle:'aveugle',charme:'charme',assourdi:'assourdi',effraye:'effraye',empoisonne:'empoisonne',entrave:'entrave',etourdi:'etourdi',inconscient:'inconscient',invisible:'invisible',paralyse:'paralyse',petrifie:'petrifie',a_terre:'a_terre',agrippe:'agrippe',incapacite:'incapacite',epuisement:'epuisement',epuise:'epuisement'};
 const conditionNorm=v=>{const k=String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');return conditionAliases[k]||k};
 const aliases={humanoide:'humanoid',fee:'fey',celeste:'celestial',mort_vivant:'undead',geant:'giant',fielon:'fiend',plante:'plant',vase:'ooze',artificiel:'construct',monstruosite:'monstrosity',elementaire:'elemental',bete:'beast'};
 const norm=v=>{const k=String(v||'').toLowerCase().trim().replace(/[ -]+/g,'_');return aliases[k]||k};
 const data=Object.create(null);
 const shards=[...Array(10)].map((_,i)=>raw('assets/icon-data/icon-data-'+String(i).padStart(2,'0')+'.json'));shards.push(raw('assets/icon-data/condition-icons.json'));
 const ready=Promise.all(shards.map(u=>fetch(u,{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('Icon shard '+r.status);return r.json()}))).then(rows=>{for(const row of rows)Object.assign(data,row.icons||{});return api});
 const key=(group,name)=>group+'/'+String(name||'').toLowerCase().trim().replace(/[ -]+/g,'_');
 const api={
  version:2,ready,creatureTypes:[...types],
  creature:(type,boss=false)=>{const k=norm(type);return types.includes(k)?raw('assets/icons/creatures/'+(boss?'boss':'standard')+'/'+k+'.webp'):null},
  ui:name=>data[key('ui',name)]||null,
  classIcon:name=>data[key('classes',name)]||null,
  magicSchool:name=>data[key('magic-schools',name)]||null,
  inventory:name=>data[key('inventory',name)]||null,
  condition:name=>data[key('conditions',conditionNorm(name))]||null,
  get:async(group,name,options={})=>{await ready;if(group==='creature')return api.creature(name,!!options.boss);const map={ui:'ui',class:'classes',classes:'classes',school:'magic-schools','magic-school':'magic-schools',inventory:'inventory',condition:'conditions',conditions:'conditions'};return data[key(map[group]||group,group==='condition'||group==='conditions'?conditionNorm(name):name)]||null}
 };
 window.RPG_ICONS=Object.freeze(api);
})();