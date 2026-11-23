import {budget,quality} from './quality.js?v=27';
// Moteur de particules additif : sprites lumineux, traînées, vortex et ondes.
// Un seul canvas et une seule boucle, arrêtée dès qu'aucun effet n'est actif.
const palette={coral:'#ff635f',cyan:'#42d8f0',lime:'#c8fa69',violet:'#ae8aff',wild:'#d4b6ff'};
let canvas,ctx,particles=[],waves=[],bolts=[],frame=0,last=0,width=0,height=0;
const sprites=new Map(),TAU=Math.PI*2;
function reduced(){return matchMedia('(prefers-reduced-motion: reduce)').matches;}
function setup(){if(canvas)return;canvas=document.createElement('canvas');canvas.className='cosmic-fx';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);ctx=canvas.getContext('2d',{alpha:true});resize();addEventListener('resize',resize,{passive:true});document.addEventListener('nova-quality',resize);}
function resize(){if(!canvas)return;width=innerWidth;height=innerHeight;let dpr=Math.min(devicePixelRatio||1,budget().dpr);canvas.width=width*dpr;canvas.height=height*dpr;canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);}
function sprite(color){if(sprites.has(color))return sprites.get(color);let c=document.createElement('canvas');c.width=c.height=64;let g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'#ffffff');r.addColorStop(.09,'#ffffffee');r.addColorStop(.22,color);r.addColorStop(.5,color+'66');r.addColorStop(1,color+'00');g.fillStyle=r;g.fillRect(0,0,64,64);sprites.set(color,c);return c;}
export function cosmicBurst(rect,color='violet',kind='card'){
 if(!rect||reduced())return;setup();let x=rect.left+rect.width/2,y=rect.top+rect.height/2;
 let big=['+4','nova','win'].includes(kind),power=kind==='win'?1.7:big?1.35:kind==='+2'?1.1:.65;
 let density=(width<600?.6:1)*budget().density,count=Math.round((big?380:kind==='reverse'?220:120)*density);
 const base=palette[color]||palette.violet,tones=big?[base,'#ffffff','#ffe2aa',palette.cyan,palette.violet]:[base,'#ffffff',base];
 for(let i=0;i<count;i++){let a=Math.random()*TAU,v=(30+Math.pow(Math.random(),.6)*330)*power;let swirl=kind==='reverse'?(i%2?1:-1):0;particles.push({x,y,px:x,py:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.55+Math.random()*1.35,max:1.9,size:(1+Math.random()*4)*power,color:tones[i%tones.length],drag:1.2+Math.random(),gravity:35+Math.random()*80,swirl,seed:a,star:i%17===0});}
 for(let i=0;i<(big?3:2);i++)waves.push({x,y,age:-i*.12,life:.9+i*.15,radius:(130+i*65)*power,color:i%2?'#ffffff':base,rotation:Math.random()*TAU,reverse:kind==='reverse'});
 if(big||kind==='+2')for(let i=0;i<(big?8:4);i++){let a=i/(big?8:4)*TAU;bolts.push({x,y,a,len:(80+Math.random()*160)*power,life:.35+Math.random()*.25,age:0,color:base,seed:Math.random()*100});}
 if(kind==='win')for(let i=0;i<3;i++)setTimeout(()=>{if(!reduced())cosmicBurst({left:width*(.2+Math.random()*.6),top:height*(.15+Math.random()*.3),width:1,height:1},['coral','cyan','lime'][i],'nova');},300+i*350);
 particles=particles.slice(-budget().maxParticles);if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}
}
function tick(now){let dt=Math.min((now-last)/1000,.035);last=now;ctx.clearRect(0,0,width,height);ctx.globalCompositeOperation='lighter';
 for(const w of waves){w.age+=dt;if(w.age<0||w.age>w.life)continue;let t=w.age/w.life,r=w.radius*(1-Math.pow(1-t,3));ctx.save();ctx.translate(w.x,w.y);ctx.rotate(w.rotation+t*(w.reverse?-3:1));ctx.scale(1,w.reverse?.58:.8);ctx.globalAlpha=Math.pow(1-t,1.6)*.8;ctx.strokeStyle=w.color;ctx.shadowColor=w.color;ctx.shadowBlur=quality()==='rich'?20:0;ctx.lineWidth=(1-t)*5+.5;ctx.beginPath();ctx.arc(0,0,r,w.reverse?.25:0,w.reverse?Math.PI*1.7:TAU);ctx.stroke();ctx.lineWidth=1;ctx.globalAlpha*=.4;ctx.beginPath();ctx.arc(0,0,r*1.08,0,TAU);ctx.stroke();ctx.restore();
  if(t<.7){let glow=ctx.createRadialGradient(w.x,w.y,0,w.x,w.y,Math.max(1,r));glow.addColorStop(0,w.color+'35');glow.addColorStop(.45,w.color+'10');glow.addColorStop(1,w.color+'00');ctx.fillStyle=glow;ctx.globalAlpha=(1-t)*.5;ctx.fillRect(w.x-r,w.y-r,r*2,r*2);}}
 ctx.shadowBlur=0;
 for(const p of particles){p.life-=dt;if(p.life<=0)continue;p.px=p.x;p.py=p.y;let drag=Math.exp(-p.drag*dt);p.vx*=drag;p.vy=p.vy*drag+p.gravity*dt;if(p.swirl){let a=p.swirl*dt*4,co=Math.cos(a),si=Math.sin(a),vx=p.vx;p.vx=vx*co-p.vy*si;p.vy=vx*si+p.vy*co;}p.x+=p.vx*dt;p.y+=p.vy*dt;let alpha=Math.min(1,p.life*1.2);ctx.globalAlpha=alpha*.85;ctx.strokeStyle=p.color;ctx.lineWidth=Math.max(.5,p.size*.45);ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(p.x-p.vx*.035,p.y-p.vy*.035);ctx.stroke();let size=p.size*7*(.5+Math.min(1,p.life));ctx.drawImage(sprite(p.color),p.x-size/2,p.y-size/2,size,size);if(p.star&&p.life>.4){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.seed+now*.001);ctx.globalAlpha=alpha*.8;ctx.strokeStyle='#ffffff';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-p.size*3,0);ctx.lineTo(p.size*3,0);ctx.moveTo(0,-p.size*3);ctx.lineTo(0,p.size*3);ctx.stroke();ctx.restore();}}
 for(const b of bolts){b.age+=dt;if(b.age>b.life)continue;ctx.globalAlpha=Math.pow(1-b.age/b.life,1.5)*.9;ctx.shadowColor=b.color;ctx.shadowBlur=quality()==='rich'?14:0;ctx.strokeStyle=b.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x,b.y);for(let i=1;i<=9;i++){let d=i/9*b.len,jitter=Math.sin(i*73.1+b.seed+Math.floor(now/65))*(i===9?0:13);ctx.lineTo(b.x+Math.cos(b.a)*d-Math.sin(b.a)*jitter,b.y+Math.sin(b.a)*d+Math.cos(b.a)*jitter);}ctx.stroke();}
 ctx.shadowBlur=0;ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);waves=waves.filter(w=>w.age<w.life);bolts=bolts.filter(b=>b.age<b.life);
 if(particles.length||waves.length||bolts.length)frame=requestAnimationFrame(tick);else {frame=0;ctx.clearRect(0,0,width,height);}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;particles=[];waves=[];bolts=[];ctx?.clearRect(0,0,width,height);}});
