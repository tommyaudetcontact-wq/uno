import {botDecision} from './bots.js?v=29';
import {room,start,end,action,view,log,resetReady,assignTeams,teamChange,syncReady,advanceLobby} from './engine.js?v=29';

// Étoile WebRTC : l'écran partagé est l'autorité, chaque téléphone est un pair.
// PeerServer Cloud ne transporte que la signalisation. Pas de backend applicatif.
let peer,connection,game,activeSession,latest,onView,onStatus;
let reconnectTimer,lobbyTimer,botTimer,closed=false,peerPromise;
const clients=new Map(),requests=new Map();
const uuid=()=>crypto.randomUUID();
const peerId=code=>'nova-party-v1-'+code;
function status(text){onStatus?.(text);}
function persist(){if(game)sessionStorage.setItem('nova-host-'+game.code,JSON.stringify(game));}
function controller(token){return token===game.host||!!game.controllers?.includes(token);}
function playerView(token){return {...view(game,token),canControl:controller(token)};}
function publish(){if(!game)return;syncReady(game);persist();latest=game?view(game,game.host):latest;if(onView&&game)onView(latest);for(const [token,c]of clients)if(c.open)c.send({kind:'state',state:playerView(token)});scheduleSystems();}
function addBot(g,difficulty){if(g.players.length>=32)throw Error('La partie est complète.');if(!['easy','medium','hard'].includes(difficulty))throw Error('Difficulté invalide.');const n=g.players.filter(p=>p.bot).length,avatars=[12,1,17,7,28,40,30,46];g.players.push({id:uuid(),token:uuid(),name:['Gizmo','Bolt','Zenith','Mox','Blaze','Tortuga','Dash','Merlin'][n%8]+' · Bot '+(n+1),avatar:avatars[n%8],bot:true,difficulty,ready:true,online:true,hand:[],score:0});if(g.mode==='teams'){const bot=g.players.at(-1);let team=0;while(g.players.filter(p=>p!==bot&&p.team===team).length>=2)team++;bot.team=team;}log(g,'Un bot '+({easy:'facile',medium:'moyen',hard:'difficile'}[difficulty])+' rejoint la table.');}
function scheduleSystems(){clearTimeout(lobbyTimer);clearTimeout(botTimer);if(!game||closed)return;const current=game;if(game.status==='lobby'&&game.countdown){lobbyTimer=setTimeout(()=>{if(game===current&&!closed){advanceLobby(game);publish();}},Math.max(0,game.countdown.endsAt-Date.now())+15);}else if(game.status==='playing'){const p=game.players[game.turn];if(p?.bot){const wait=Math.max(0,(game.transition?.until||0)-Date.now())+(p.difficulty==='easy'?1000:p.difficulty==='hard'?650:850);botTimer=setTimeout(()=>{if(game!==current||closed||game.status!=='playing'||game.players[game.turn]!==p)return;try{hostAction(p.token,{room:game.code,...botDecision(view(game,p.token),p.difficulty||'medium')});}catch(e){status('BOT · '+e.message);}},wait);}}}
function hostAction(token,a){if(!game||a.room!==game.code)throw Error('Partie introuvable.');
  if(a.type==='start'){if(!controller(token))throw Error('Réservé à l’hôte.');if(game.status==='playing')throw Error('La manche est déjà en cours.');if(game.countdown)throw Error('Le décompte de départ est en cours.');start(game);}
  else if(a.type==='setup'){const humans=game.players.filter(p=>!p.bot),solo=humans.length===1&&humans[0].token===token;if(game.status!=='lobby'||!controller(token)&&!solo)throw Error('Réglages disponibles à l’hôte ou au joueur seul avant le départ.');if(!['classic','teams'].includes(a.mode)||!['easy','medium','hard'].includes(a.difficulty||'medium'))throw Error('Réglages invalides.');const needed=a.bots?(a.mode==='teams'?Math.max(4,2*Math.ceil((humans.length+1)/2)):Math.max(2,humans.length+1)):humans.length;if(needed>32)throw Error('La partie est complète.');game.mode=a.mode;if(!a.bots)game.players=humans;else{if(solo&&a.mode==='teams')game.players=[...humans,...game.players.filter(p=>p.bot).slice(0,3)];while(game.players.length<needed)addBot(game,a.difficulty||'medium');game.players.filter(p=>p.bot).forEach(p=>p.difficulty=a.difficulty||'medium');}if(game.mode==='teams')assignTeams(game);else game.players.forEach(p=>p.team=null);game.round=0;game.matchWinner=null;game.players.forEach(p=>p.score=0);resetReady(game);}
  else if(['mode','botAdd','botLevel','teamAssign'].includes(a.type)){const humans=game.players.filter(p=>!p.bot),solo=humans.length===1&&humans[0].token===token&&['botAdd','botLevel'].includes(a.type);if(!controller(token)&&!solo||game.status!=='lobby')throw Error('Réglage réservé à l’hôte ou au joueur seul avant le départ.');if(solo&&!controller(token)&&a.type==='botAdd'&&game.mode==='teams'&&game.players.length>=4)throw Error('Le 2v2 solo compte déjà trois bots.');if(a.type==='mode'){if(!['classic','teams','bots'].includes(a.mode))throw Error('Mode invalide.');if(a.mode==='bots'&&!game.players.some(p=>p.bot)&&game.players.length>=32)throw Error('Retire un joueur pour ajouter un bot.');game.mode=a.mode;if(a.mode==='classic')game.players=game.players.filter(p=>!p.bot);if(a.mode==='teams')assignTeams(game);else game.players.forEach(p=>p.team=null);game.round=0;game.matchWinner=null;game.players.forEach(p=>p.score=0);if(a.mode==='bots'&&!game.players.some(p=>p.bot))addBot(game,'medium');}else if(a.type==='botAdd')addBot(game,a.difficulty||'medium');else if(a.type==='botLevel'){const p=game.players.find(p=>p.id===a.player&&p.bot);if(!p||!['easy','medium','hard'].includes(a.difficulty))throw Error('Bot invalide.');p.difficulty=a.difficulty;}else{const p=game.players.find(p=>p.id===a.player);if(!p)throw Error('Joueur inconnu.');teamChange(game,p,Number(a.team));}resetReady(game);}
  else if(a.type==='reset'){if(!controller(token))throw Error('Réservé à l’hôte.');if(game.status!=='lobby')end(game);else{resetReady(game);game.players.forEach(p=>{p.score=0;p.hand=[];});game.round=0;game.matchWinner=null;}log(game,'Nouvelle partie : préparez votre équipage !');}
  else if(a.type==='end'){if(!controller(token))throw Error('Réservé à l’hôte.');end(game);}
  else if(a.type==='rules'){if(!controller(token)||game.status==='playing')throw Error('Réglages verrouillés.');for(const k of ['jump','stack','drawUntil','challenge','freeFour'])game.rules[k]=!!a.rules?.[k];if(typeof a.rules?.classicFour==='boolean')game.rules.freeFour=!a.rules.classicFour;if(game.rules.freeFour)game.rules.challenge=false;resetReady(game);}
  else if(a.type==='remove'){if(!controller(token)||game.status==='playing')throw Error('Impossible maintenant.');let p=game.players.find(x=>x.id===a.player);if(p){clients.get(p.token)?.send({kind:'removed'});clients.get(p.token)?.close();clients.delete(p.token);}game.players=game.players.filter(x=>x.id!==a.player);resetReady(game);}
  else {if(game.transition?.until>Date.now()&&['play','draw','pass','challenge'].includes(a.type))throw Error('Un instant : effet de carte en cours.');let p=game.players.find(x=>x.token===token);if(!p)throw Error('Session invalide.');action(game,p,a);if(p.bot&&a.type==='play'&&game.status==='playing'&&p.hand.length===1&&(p.difficulty!=='easy'||Math.random()>.25))action(game,p,{type:'uno'});}
  publish();return {ok:true};
}
function accept(c){let token=null,n=0,windowStart=Date.now();const authTimer=setTimeout(()=>{if(!token)c.close();},15000);
  c.on('data',msg=>{try{if(!msg||JSON.stringify(msg).length>8192)throw Error('Requête invalide.');if(Date.now()-windowStart>10000){n=0;windowStart=Date.now();}if(++n>100)throw Error('Trop de requêtes.');if(msg.kind!=='rpc'||typeof msg.id!=='string')return;
    let result,a=msg.payload||{};
    if(msg.route==='join'||msg.route==='resume'){
      if(String(a.room)!==game.code)throw Error('Code incorrect.');
      let p=game.players.find(x=>x.token===a.token);
      if(!p&&msg.route==='resume')throw Error('Ta place n’est plus disponible.');
      if(!p){if(game.status!=='lobby')throw Error('Cette manche a déjà commencé.');if(game.players.length>=32)throw Error('La partie est complète.');let name=String(a.name||'').trim().slice(0,20);if(!name)throw Error('Entre ton pseudo.');p={id:uuid(),token:uuid(),name,avatar:Math.max(0,Math.min(47,Math.floor(Number(a.avatar)||0))),hand:[],score:0,online:true};game.players.push(p);if(game.mode==='teams'){let team=0;while(game.players.filter(q=>q!==p&&q.team===team).length>=2)team++;p.team=team;}resetReady(game);log(game,name+' entre dans l’arène.');}
      if(token&&token!==p.token)throw Error('Connexion déjà associée.');
      token=p.token;if(a.controlPassword==='tommy123'){game.controllers??=[];if(!game.controllers.includes(token))game.controllers.push(token);}clearTimeout(authTimer);let previous=clients.get(token);clients.set(token,c);if(previous&&previous!==c)previous.close();p.online=true;
      result={code:game.code,token,role:'player'};c.send({kind:'result',id:msg.id,result});publish();return;
    }
    if(!token)throw Error('Rejoins la partie avant de jouer.');
    if(msg.route==='control'){if(a.password!=='tommy123')throw Error('Mot de passe incorrect.');game.controllers??=[];if(!game.controllers.includes(token))game.controllers.push(token);publish();c.send({kind:'result',id:msg.id,result:{ok:true}});return;}
    if(msg.route!=='action')throw Error('Action inconnue.');result=hostAction(token,a);c.send({kind:'result',id:msg.id,result});
  }catch(e){if(msg?.id)c.send({kind:'result',id:msg.id,error:e.message});}});
  c.on('close',()=>{clearTimeout(authTimer);if(token&&clients.get(token)===c){clients.delete(token);let p=game?.players.find(x=>x.token===token);if(p){p.online=false;p.ready=false;}if(game)publish();}});
  c.on('error',()=>{});
}
function makePeer(id){return new Promise((resolve,reject)=>{let p=new Peer(id,{debug:0,secure:true});let timer=setTimeout(()=>{p.destroy();reject(Error('Le service de signalisation ne répond pas. Réessaie.'));},18000);p.once('open',()=>{clearTimeout(timer);resolve(p);});p.on('error',e=>{clearTimeout(timer);if(!p.open)reject(Error(e.type==='unavailable-id'?'Ce code est déjà utilisé. Réessaie dans quelques secondes.':'Connexion WebRTC impossible : '+e.type));else status('CONNEXION P2P · '+e.type);});p.on('disconnected',()=>{if(!closed&&!p.destroyed){status('SIGNALISATION · RECONNEXION');setTimeout(()=>{if(p.disconnected&&!p.destroyed)p.reconnect();},2000);}});p.on('connection',c=>{if(game)accept(c);else c.close();});return p;});}
async function playerPeer(){if(peer&&!peer.destroyed)return peer;if(!peerPromise)peerPromise=makePeer().then(p=>peer=p).finally(()=>peerPromise=null);return peerPromise;}
async function dial(code){if(connection?.open&&connection.peer===peerId(code))return connection;const p=await playerPeer();return new Promise((resolve,reject)=>{let c=p.connect(peerId(code),{reliable:true,serialization:'json'});let timer=setTimeout(()=>{c.close();reject(Error('L’écran de partie est introuvable. Vérifie le code et laisse-le ouvert. Certains réseaux bloquent le pair à pair.'));},18000);c.on('open',()=>{clearTimeout(timer);connection=c;resolve(c);});c.on('data',m=>{if(m.kind==='state'){latest=m.state;onView?.(latest);status('PAIR À PAIR · SALON '+code);}if(m.kind==='removed'){closed=true;status('L’HÔTE A RETIRÉ TA PLACE');}if(m.kind==='result'){let r=requests.get(m.id);if(r){clearTimeout(r.timer);requests.delete(m.id);m.error?r.reject(Error(m.error)):r.resolve(m.result);}}});c.on('close',()=>{clearTimeout(timer);if(connection===c)connection=null;if(!closed&&activeSession?.role==='player'){status('HÔTE DÉCONNECTÉ · RECONNEXION');clearTimeout(reconnectTimer);reconnectTimer=setTimeout(()=>resumePlayer().catch(()=>{}),2500);}});c.on('error',()=>{clearTimeout(timer);reject(Error('Connexion directe impossible. Essaie le même Wi-Fi.'));});});}
function rpc(c,route,payload){return new Promise((resolve,reject)=>{if(!c?.open)return reject(Error('Connexion interrompue.'));let id=uuid(),timer=setTimeout(()=>{requests.delete(id);reject(Error('L’hôte ne répond pas. Vérifie sa connexion.'));},12000);requests.set(id,{resolve,reject,timer});c.send({kind:'rpc',id,route,payload});});}
async function resumePlayer(){if(closed||!activeSession)return;try{let c=await dial(activeSession.code);await rpc(c,'resume',{room:activeSession.code,token:activeSession.token,controlPassword:globalThis.localStorage?.getItem('nova-controller-password')});}catch(e){status(e.message);if(!closed)reconnectTimer=setTimeout(()=>resumePlayer().catch(()=>{}),4000);}}
function stop(){closed=true;clearTimeout(reconnectTimer);clearTimeout(lobbyTimer);clearTimeout(botTimer);for(const r of requests.values()){clearTimeout(r.timer);r.reject(Error('Connexion fermée.'));}requests.clear();connection?.close();connection=null;for(const c of clients.values())c.close();clients.clear();peer?.destroy();peer=null;peerPromise=null;onView=null;onStatus=null;activeSession=null;latest=null;game=null;}
export const transport={
  async request(route,a,session){
    if(route==='create'){stop();closed=false;let code=String(crypto.getRandomValues(new Uint32Array(1))[0]%900000+100000),token=uuid();peer=await makePeer(peerId(code));game=room(code,token);log(game,'Le portail est ouvert. Rejoignez la partie !');persist();return {code,token,role:'host'};}
    if(route==='join'){if(game)stop();closed=false;let c=await dial(String(a.room));return rpc(c,'join',{...a,controlPassword:globalThis.localStorage?.getItem('nova-controller-password')});}
    if(route==='control')return rpc(connection,'control',a);
    if(route==='action'){if(session?.role==='host'){if(!game||game.host!==session.token)throw Error('Session hôte invalide.');return hostAction(session.token,a);}return rpc(connection,'action',a);}
    throw Error('Action inconnue.');
  },
  subscribe(session,update,notify){onView=update;onStatus=notify;activeSession=session;closed=false;
    if(session.role==='host'){
      if(game?.code===session.code){queueMicrotask(publish);}
      else {let saved;try{saved=JSON.parse(sessionStorage.getItem('nova-host-'+session.code));}catch{}if(!saved||saved.host!==session.token){notify('SALON EXPIRÉ · CRÉE UNE NOUVELLE PARTIE');}
        else {game=saved;if(game.rules.freeFour===undefined){game.rules.freeFour=true;game.rules.challenge=false;game.challenge=null;}game.players.forEach(p=>{p.online=!!p.bot;p.ready=!!p.bot;});game.countdown=null;let restore=async()=>{try{peer=await makePeer(peerId(game.code));publish();}catch(e){notify(e.message);if(!closed)reconnectTimer=setTimeout(restore,4000);}};restore();}}
    }else {if(latest)queueMicrotask(()=>update(latest));resumePlayer().catch(()=>{});}
    return {close:stop};
  }
};
window.addEventListener('pagehide',()=>{persist();peer?.destroy();});

