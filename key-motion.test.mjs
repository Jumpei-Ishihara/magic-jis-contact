import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const code=readFileSync(new URL('./key-motion.js',import.meta.url),'utf8');
const {KeyMotion}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const layout=JSON.parse(readFileSync(new URL('./dist/keyboard.json',import.meta.url),'utf8'));
function setup(){const keys=new Map(layout.keys.map(k=>[k.code,{group:{position:{y:14.25}},baseY:14.25}]));return {keys,m:new KeyMotion(keys)};}
{
 const {keys,m}=setup();m.input('Space','hardware',true,0);m.tick(65);
 assert.equal(keys.get('Space').depth,5.5);assert.equal(keys.get('KeyX').depth,0);
 assert.deepEqual([...keys].filter(([,k])=>k.depth).map(([c])=>c),['Space']);
 m.input('Space','hardware',false,80);m.tick(250);assert.equal(keys.get('Space').depth,0);
}
{
 const {keys,m}=setup();m.input('Space','hardware',true,0);m.input('Space','hardware',false,5);
 m.tick(50);assert(keys.get('Space').depth>0);assert.equal(keys.get('Space').held,false);
 m.input('Space','hardware',true,55);m.input('Space','hardware',false,70);m.tick(350);
 assert.equal(keys.get('Space').depth,0);assert.equal(m.tick(400),false);
}
{
 const {keys,m}=setup();m.input('Space','hardware',true,0);m.input('Space','pointer:1',true,10);
 m.input('Space','hardware',false,80);m.tick(100);assert.equal(keys.get('Space').depth,5.5);
 m.releaseSource('pointer:1',110);m.tick(300);assert.equal(keys.get('Space').depth,0);
 m.input('KeyX','hardware',true,400);m.input('MetaLeft','hardware',true,400);m.tick(470);
 m.releaseSource('hardware',500);m.tick(700);assert([...keys.values()].every(k=>k.depth===0&&!k.held));
}
{
 const {keys,m}=setup();
 for(const [i,c] of [...keys.keys()].entries()){const t=i*500;m.input(c,'hardware',true,t);m.tick(t+65);assert.equal(keys.get(c).depth,5.5,c);m.input(c,'hardware',false,t+70);m.tick(t+230);assert.equal(keys.get(c).depth,0,c);}
 for(const c of keys.keys())m.input(c,'hardware',true,41000);m.tick(41020);m.reset();
 assert([...keys.values()].every(k=>k.depth===0&&k.group.position.y===14.25&&!k.held&&k.sources.size===0&&k.releaseAt===null));
 assert.equal(m.tick(42000),false);
}
console.log('PASS: Space isolation, rapid re-press, overlapping input sources, Command release, all 80 key returns, forced focus-loss reset.');
