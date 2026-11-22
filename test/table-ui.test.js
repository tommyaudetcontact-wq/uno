import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.localStorage={getItem:()=>null};
const {renderTable}=await import('../public/table-ui.js');
const card=(c,o={})=>o.back?'<div class="card back">DOS</div>':`<${o.interactive?'button':'div'} class="card" ${o.interactive?'data-card="'+c.id+'"':''}>${c.id}</${o.interactive?'button':'div'}>`;
const state={players:[{id:'a',name:'Alice',avatar:15,count:3,online:true,score:20},{id:'b',name:'Bob',avatar:4,count:7,online:true,score:0}],turn:'a',color:'violet',direction:-1,status:'playing',round:1,code:'123456',rules:{},top:{id:'public-top'},history:[{id:'old-visible'},{id:'public-top'}],hand:[{id:'SECRET-PRIVATE-CARD'}],deckCount:85,discardCount:2};
const options={card,canPlay:()=>true,feed:()=>'<aside>fil</aside>',esc:s=>String(s??'')};
test('hôte : aucune main ni bouton de carte, défausse publique et pioche distinctes',()=>{let html=renderTable(state,options);assert.ok(!html.includes('SECRET-PRIVATE-CARD'));assert.ok(!html.includes('data-card='));assert.ok(html.includes('data-pile="draw"'));assert.ok(html.includes('old-visible'));assert.ok(html.includes('public-top'));assert.ok(html.includes('counterclockwise'));assert.ok(html.includes('id="host-menu-toggle"'));assert.ok(/class="game-feed" hidden/.test(html));});
test('joueur : main personnelle en éventail et aucun menu hôte',()=>{let html=renderTable({...state,me:'a'},options);assert.ok(html.includes('data-card="SECRET-PRIVATE-CARD"'));assert.ok(html.includes('class="hand fan"'));assert.ok(!html.includes('host-menu-toggle'));assert.ok(html.includes('C’est ton tour !'));assert.ok(html.includes('PRIVÉE'));});
