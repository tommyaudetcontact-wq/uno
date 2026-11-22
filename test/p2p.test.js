import test from 'node:test';import assert from 'node:assert/strict';import {EventEmitter} from 'node:events';
// Contrat PeerJS simulé : les tests de navigateur vérifient ensuite WebRTC réel.
const peers=new Map();
class Link extends EventEmitter{open=false;send(m){queueMicrotask(()=>this.other.emit('data',structuredClone(m)));}close(){if(!this.open)return;this.open=false;this.other.open=false;this.emit('close');this.other.emit('close');}}
class FakePeer extends EventEmitter{constructor(id){super();this.id=id||crypto.randomUUID();peers.set(this.id,this);queueMicrotask(()=>{this.open=true;this.emit('open',this.id);});}connect(id){let a=new Link(),b=new Link();a.peer=id;b.peer=this.id;a.other=b;b.other=a;queueMicrotask(()=>{peers.get(id).emit('connection',b);a.open=b.open=true;a.emit('open');b.emit('open');});return a;}destroy(){this.destroyed=true;peers.delete(this.id);}}
globalThis.Peer=FakePeer;globalThis.window={addEventListener(){}};const data=new Map();globalThis.sessionStorage={setItem:(k,v)=>data.set(k,v),getItem:k=>data.get(k)};
test('transport P2P : rejoindre, vues privées, autorité et reconnexion',async()=>{
 let host=(await import('../public/transport.js?host')).transport,guest=(await import('../public/transport.js?guest')).transport,other=(await import('../public/transport.js?other')).transport;
 let h=await host.request('create',{}),hs,gs,os;let sub=host.subscribe(h,s=>hs=s,()=>{});
 let a=await guest.request('join',{room:h.code,name:'Alice',avatar:0});let sa=guest.subscribe(a,s=>gs=s,()=>{});
 let b=await other.request('join',{room:h.code,name:'Bob',avatar:1});let sb=other.subscribe(b,s=>os=s,()=>{});
 const tick=()=>new Promise(r=>setImmediate(r));await tick();assert.equal(hs.players.length,2);assert.equal(gs.me,hs.players[0].id);assert.equal(os.me,hs.players[1].id);
 await assert.rejects(guest.request('action',{room:h.code,type:'start'},a));
 await host.request('action',{room:h.code,type:'start'},h);await tick();assert.equal(hs.hand.length,0);assert.ok(gs.hand.length>=7);assert.ok(os.hand.length>=7);assert.equal(gs.players[1].hand,undefined);assert.notDeepEqual(gs.hand,os.hand);
 assert.equal(JSON.stringify(gs).includes(b.token),false);assert.equal(gs.host,false);assert.equal(hs.host,true);
 await assert.rejects(guest.request('action',{room:h.code,type:'rules',rules:{stack:true}},a));
 let oldId=gs.me;let again=await guest.request('join',{room:h.code,token:a.token});assert.equal(again.token,a.token);await tick();assert.equal(gs.me,oldId);assert.equal(hs.players.length,2);
 sa.close();sb.close();sub.close();
});
test('transport P2P : 32 places et refus de la 33e',async()=>{
 let host=(await import('../public/transport.js?large-host')).transport,h=await host.request('create',{}),last;
 let sub=host.subscribe(h,s=>last=s,()=>{}),subs=[];
 for(let i=0;i<32;i++){let guest=(await import('../public/transport.js?large-'+i)).transport;let p=await guest.request('join',{room:h.code,name:'Joueur '+i});subs.push(guest.subscribe(p,()=>{},()=>{}));}
 assert.equal(last.players.length,32);
 let extra=(await import('../public/transport.js?extra')).transport;
 await assert.rejects(extra.request('join',{room:h.code,name:'En trop'}),/complète/);
 subs.push(extra.subscribe({role:'player',code:h.code,token:'invalid'},()=>{},()=>{}));
 for(const s of subs)s.close();sub.close();
});
