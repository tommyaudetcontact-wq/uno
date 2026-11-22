// Décor vivant : mouvements lents derrière le plateau, jamais devant les cartes.
let scenes=[],frame=0,last=0;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function attach(){if(reduced())return;for(const parent of document.querySelectorAll('.space,.hero-art,.arena')){if(parent.querySelector(':scope > .ambient-cosmos'))continue;let c=document.createElement('canvas');c.className='ambient-cosmos';c.setAttribute('aria-hidden','true');parent.prepend(c);scenes.push({c,parent,ctx:c.getContext('2d'),offset:Math.random()*100,isArena:parent.classList.contains('arena')});}scenes=scenes.filter(s=>s.c.isConnected);if(scenes.length&&!frame)frame=requestAnimationFrame(tick);}
function ship(g,x,y,scale,direction,t){g.save();g.translate(x,y);g.scale(scale*direction,scale);g.rotate(-.08);g.globalAlpha=.85;
 // Propulseur turquoise et coque ambrée : même langage que les plateformes.
 let trail=g.createLinearGradient(-95,0,-14,0);trail.addColorStop(0,'#42d8f000');trail.addColorStop(.7,'#42d8f04d');trail.addColorStop(1,'#d7ffffee');g.fillStyle=trail;g.beginPath();g.moveTo(-14,-5);g.quadraticCurveTo(-55,-9-Math.sin(t*4)*2,-100,0);g.quadraticCurveTo(-55,8,-14,5);g.fill();
 g.fillStyle='#585380';g.beginPath();g.moveTo(-18,-7);g.lineTo(-32,-19);g.lineTo(10,-8);g.lineTo(29,0);g.lineTo(8,10);g.lineTo(-32,17);g.lineTo(-18,5);g.closePath();g.fill();g.strokeStyle='#c5b8f8';g.lineWidth=1;g.stroke();
 g.fillStyle='#e7a45d';g.beginPath();g.ellipse(1,0,25,7,0,0,Math.PI*2);g.fill();g.fillStyle='#60e8ec';g.beginPath();g.ellipse(8,-3,10,5,.1,Math.PI,Math.PI*2);g.fill();g.fillStyle='#e6ffff';g.fillRect(-22,-3,6,6);g.restore();}
function render(s,time){const {c,parent,ctx:g}=s;let w=parent.clientWidth,h=parent.clientHeight;if(!w||!h)return;if(c.width!==w||c.height!==h){c.width=w;c.height=h;}g.clearRect(0,0,w,h);let t=time+s.offset;
 // Scintillement doux, sans flash global.
 for(let i=0;i<17;i++){let x=((i*137.3+s.offset*17)%997)/997*w,y=((i*79.7+s.offset*5)%613)/613*h,r=.6+(i%3)*.4;g.globalAlpha=.2+.35*(.5+.5*Math.sin(t*.5+i*1.7));g.fillStyle=i%4===0?'#9df9fc':'#d5c9ff';g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
 g.globalAlpha=1;
 // Deux couloirs de vol très espacés; le centre de l'arène reste dégagé.
 for(let i=0;i<2;i++){let cycle=34+i*19,progress=((t+i*13)%cycle)/cycle;if(progress>.48)continue;let u=progress/.48,direction=i%2?-1:1,x=direction>0?-140+(w+280)*u:w+140-(w+280)*u,y=h*(s.isArena?(i?.78:.18):(i?.65:.26))+Math.sin(u*5+i)*h*.025;ship(g,x,y,(s.isArena?.35:.5)+(i*.12),direction,t);}
 // Une étoile filante toutes les 9–14 secondes, avec traînée effilée.
 for(let i=0;i<2;i++){let life=(t+i*6.7)%(11+i*4);if(life>1.15)continue;let u=life/1.15,x=w*(.08+i*.45)+u*w*.45,y=h*(.03+i*.12)+u*h*.35;let dx=Math.min(115,w*.22),dy=dx*.48,tail=g.createLinearGradient(x-dx,y-dy,x,y);tail.addColorStop(0,'#a4eaff00');tail.addColorStop(.8,'#9cecff66');tail.addColorStop(1,'#f5ffff');g.globalAlpha=Math.sin(u*Math.PI)*.85;g.strokeStyle=tail;g.lineWidth=1.7;g.beginPath();g.moveTo(x-dx,y-dy);g.lineTo(x,y);g.stroke();g.fillStyle='#ffffff';g.beginPath();g.arc(x,y,1.7,0,Math.PI*2);g.fill();}
 g.globalAlpha=1;
}
function tick(now){if(document.hidden||reduced()){frame=0;return;}if(now-last>40){last=now;scenes=scenes.filter(s=>s.c.isConnected);for(const s of scenes)render(s,now/1000);}frame=requestAnimationFrame(tick);}
new MutationObserver(attach).observe(document.querySelector('#app'),{childList:true,subtree:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else attach();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{if(reduced()){cancelAnimationFrame(frame);frame=0;for(const s of scenes)s.ctx.clearRect(0,0,s.c.width,s.c.height);}else attach();});
attach();
