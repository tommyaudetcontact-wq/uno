// Web Crypto : le même moteur tourne dans le navigateur et dans les tests.
const randomUUID=()=>crypto.randomUUID();
function randomInt(max){const limit=Math.floor(4294967296/max)*max;let value;do{value=crypto.getRandomValues(new Uint32Array(1))[0];}while(value>=limit);return value%max;}
export const colors=['coral','cyan','lime','violet'];
export function deck(){let d=[];for(const c of colors){for(let n=0;n<=9;n++)for(let i=0;i<(n===0?1:2);i++)d.push({id:randomUUID(),c,v:String(n)});for(const v of ['skip','reverse','+2'])for(let i=0;i<2;i++)d.push({id:randomUUID(),c,v});}for(let i=0;i<4;i++)for(const v of ['wild','+4'])d.push({id:randomUUID(),c:'wild',v});return shuffle(d);}
export function shuffle(d){for(let i=d.length-1;i>0;i--){let j=randomInt(i+1);[d[i],d[j]]=[d[j],d[i]];}return d;}
export function log(g,s){g.feed.unshift({text:s,time:Date.now()});g.feed=g.feed.slice(0,40);g.updated=Date.now();}
export function room(code,host){return {code,host,players:[],status:'lobby',rules:{jump:false,stack:false,drawUntil:false,challenge:true},feed:[],updated:Date.now(),round:0};}
export function end(g){
  if(!['playing','finished'].includes(g.status))throw Error('Aucune partie à terminer.');
  g.status='lobby';g.round=0;g.deck=[];g.discard=[];g.turn=0;g.direction=1;
  g.pending=0;g.challenge=null;g.drawn=null;g.vulnerable=null;g.winner=null;g.matchWinner=null;g.chooseColor=false;g.color=null;
  for(const p of g.players){p.hand=[];p.uno=false;p.score=0;}
  log(g,'Partie terminée par l’hôte. Retour au salon pour une nouvelle partie.');
}
function next(g,n=1){return (g.turn+n*g.direction+g.players.length*10)%g.players.length;}
export function draw(g,p,n){for(let i=0;i<n;i++){if(!g.deck.length){let top=g.discard.pop();g.deck=shuffle(g.discard);g.discard=[top];}if(!g.deck.length)break;p.hand.push(g.deck.pop());}p.uno=false;}
export function opening(g){
  let first;
  do {first=g.deck.pop();if(first.v==='+4'){g.deck.unshift(first);shuffle(g.deck);}} while(first.v==='+4');
  g.discard=[first];g.color=first.c;g.chooseColor=first.v==='wild';
  if(first.v==='skip')g.turn=next(g);
  if(first.v==='reverse'){g.direction=-1;g.turn=g.dealer;}
  if(first.v==='+2'){draw(g,g.players[g.turn],2);g.turn=next(g);}
}
export function start(g){
  if(g.players.length<2)throw Error('Il faut au moins 2 joueurs.');
  if(g.matchWinner){g.round=0;for(const p of g.players)p.score=0;}
  g.matchWinner=null;g.status='playing';g.round++;g.deck=Array.from({length:Math.ceil(g.players.length/10)},()=>deck()).flat();shuffle(g.deck);g.discard=[];
  g.dealer=(g.round-2+g.players.length)%g.players.length;
  g.direction=1;g.turn=(g.dealer+1)%g.players.length;
  g.pending=0;g.challenge=null;g.drawn=null;g.vulnerable=null;g.winner=null;
  for(const p of g.players){p.hand=[];p.uno=false;draw(g,p,7);}
  opening(g);log(g,'La manche '+g.round+' commence !');
}
export function legal(g,p,c){if(g.chooseColor)return false;if(c.v==='+4'&&g.rules.challenge===false&&p.hand.some(x=>x!==c&&x.c===g.color))return false;const top=g.discard.at(-1);if(g.pending)return g.rules.stack&&top.v==='+2'&&c.v==='+2';return c.c==='wild'||c.c===g.color||c.v===top.v;}
function win(g,p){g.status='finished';g.winner=p.id;let score=0;for(const q of g.players)if(q!==p)for(const c of q.hand)score+=/^\d$/.test(c.v)?Number(c.v):c.c==='wild'?50:20;p.score+=score;if(p.score>=500)g.matchWinner=p.id;log(g,p.name+' remporte la manche : +'+score+' points !');}
function finish(g,p){if(!p.hand.length)win(g,p);}
export function action(g,p,a){if(g.status!=='playing')throw Error('La manche n’est pas en cours.');if(g.chooseColor){if(a.type!=='color'||g.players[g.turn]!==p||!colors.includes(a.color))throw Error('Le premier joueur doit choisir une couleur.');g.color=a.color;g.chooseColor=false;log(g,p.name+' choisit la couleur de départ.');return;}if(a.type==='uno'){if(p.hand.length>2)throw Error('Annonce possible avec 1 ou 2 cartes.');p.uno=true;if(g.vulnerable===p.id)g.vulnerable=null;log(g,p.name+' crie NOVA !');return;}
if(a.type==='catch'){let q=g.players.find(x=>x.id===g.vulnerable);if(!q||q===p)throw Error('Personne à attraper.');draw(g,q,2);g.vulnerable=null;log(g,p.name+' surprend '+q.name+' : +2 !');return;}
let turn=g.players[g.turn];
if(a.type==='challenge'){if(g.rules.challenge===false||!g.challenge||turn!==p)throw Error('Aucun +4 à contester.');let ch=g.challenge,q=g.players.find(x=>x.id===ch.player);g.challenge=null;g.vulnerable=null;if(ch.illegal){draw(g,q,4);g.pending=0;log(g,'Contestation réussie : '+q.name+' pioche 4.');}else{draw(g,p,6);g.pending=0;g.turn=next(g);log(g,'Contestation ratée : '+p.name+' pioche 6.');finish(g,q);}return;}
if(a.type==='play'){let c=p.hand.find(x=>x.id===a.card);if(!c)throw Error('Carte introuvable.');let jump=turn!==p&&g.rules.jump&&!g.pending&&c.c===g.discard.at(-1).c&&c.v===g.discard.at(-1).v&&c.c!=='wild';if(turn!==p&&!jump)throw Error('Ce n’est pas ton tour.');if(g.challenge)throw Error('Accepte ou conteste le +4 avant de jouer.');if(!legal(g,p,c))throw Error(c.v==='+4'&&g.rules.challenge===false?'Ce +4 est interdit : joue une carte de la couleur active.':'Cette carte ne peut pas être jouée.');if(g.drawn&&g.drawn!==c.id&&!jump)throw Error('Seule la carte piochée peut être jouée.');if(c.c==='wild'&&!colors.includes(a.color))throw Error('Choisis une couleur.');let illegal=c.v==='+4'&&p.hand.some(x=>x!==c&&x.c===g.color);if(illegal&&g.rules.challenge===false)throw Error('Ce +4 est interdit : tu as une carte de la couleur active.');g.vulnerable=null;g.drawn=null;g.turn=g.players.indexOf(p);p.hand.splice(p.hand.indexOf(c),1);g.discard.push(c);g.color=c.c==='wild'?a.color:c.c;log(g,p.name+(jump?' intercepte avec ':' joue ')+c.v+' !');if(p.hand.length===1&&!p.uno)g.vulnerable=p.id;if(p.hand.length!==1)p.uno=false;
let steps=1;if(c.v==='reverse'){g.direction*=-1;if(g.players.length===2)steps=2;}if(c.v==='skip')steps=2;if(c.v==='+2')g.pending+=2;if(c.v==='+4'){g.pending=4;g.challenge=g.rules.challenge===false?null:{player:p.id,illegal};}g.turn=next(g,steps);if(!p.hand.length&&!g.pending)win(g,p);return;}
if(turn!==p)throw Error('Ce n’est pas ton tour.');if(a.type==='draw'){g.vulnerable=null;if(g.pending){let ch=g.challenge;let topPlayer=g.players.find(x=>x.id===ch?.player);draw(g,p,g.pending);log(g,p.name+' pioche '+g.pending+' cartes.');g.pending=0;g.challenge=null;g.turn=next(g);if(topPlayer)finish(g,topPlayer);else {let empty=g.players.find(x=>!x.hand.length);if(empty)win(g,empty);}return;}if(g.drawn)throw Error('Joue ou passe.');let c;do{let len=p.hand.length;draw(g,p,1);if(p.hand.length===len)break;c=p.hand.at(-1);}while(g.rules.drawUntil&&!legal(g,p,c));log(g,p.name+' pioche.');if(c&&legal(g,p,c))g.drawn=c.id;else g.turn=next(g);return;}if(a.type==='pass'&&g.drawn){g.drawn=null;g.turn=next(g);g.vulnerable=null;return;}throw Error('Action impossible.');}
export function view(g,token){let p=g.players.find(x=>x.token===token);return {code:g.code,status:g.status,rules:g.rules,round:g.round,chooseColor:!!g.chooseColor,matchWinner:g.matchWinner,color:g.color,direction:g.direction,turn:g.players[g.turn]?.id,pending:g.pending,challenge:!!g.challenge,drawn:p&&g.players[g.turn]===p?g.drawn:null,vulnerable:g.vulnerable,winner:g.winner,top:g.discard?.at(-1),history:g.discard?.slice(-7),deckCount:g.deck?.length,discardCount:g.discard?.length,feed:g.feed,players:g.players.map(x=>({id:x.id,name:x.name,avatar:x.avatar,count:x.hand.length,score:x.score,online:x.online,uno:x.uno})),me:p?.id,hand:p?.hand||[],host:g.host===token};}
