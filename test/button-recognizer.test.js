'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ButtonRecognizer}=require('../drivers/tap-dial/button-recognizer');
function harness(){
 let now=0,seq=0;const timers=new Map(),events=[];
 const r=new ButtonRecognizer({emit:e=>events.push(e),clock:()=>now,
   schedule:(fn,delay)=>{const k=++seq;timers.set(k,{fn,at:now+delay});return k;},
   cancel:k=>timers.delete(k)});
 return {r,events,send:(code,button=3)=>r.ingest({candidateCode:code,button}),
   advance(ms){const goal=now+ms;while(true){const due=[...timers.entries()].filter(([,v])=>v.at<=goal).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;const [k,v]=due;timers.delete(k);now=v.at;v.fn();}now=goal;}};
}
test('single only after recognition window',()=>{const h=harness();h.send(0);h.advance(100);h.send(2);assert.equal(h.events.length,0);h.advance(350);assert.deepEqual(h.events,[{button:3,action:'single',count:1}]);});
test('double suppresses single',()=>{const h=harness();h.send(0);h.advance(80);h.send(2);h.advance(200);h.send(0);h.advance(60);h.send(2);h.advance(350);assert.deepEqual(h.events,[{button:3,action:'double',count:2}]);});
test('triple press',()=>{const h=harness();for(let i=0;i<3;i++){h.send(0);h.advance(50);h.send(2);h.advance(120)}h.advance(350);assert.deepEqual(h.events,[{button:3,action:'triple',count:3}]);});
test('hold emits no single; release distinct',()=>{const h=harness();h.send(0);h.advance(827);h.send(1);h.advance(313);h.send(3);h.advance(500);assert.deepEqual(h.events,[{button:3,action:'hold',count:0},{button:3,action:'long_release',count:0}]);});
test('different buttons have separate state',()=>{const h=harness();h.send(0,1);h.advance(50);h.send(2,1);h.send(0,2);h.advance(70);h.send(2,2);h.advance(350);assert.deepEqual(h.events.map(e=>[e.button,e.action]),[[1,'single'],[2,'single']]);});
test('long release without hold does not emit phantom event',()=>{const h=harness();h.send(0);h.send(3);h.advance(500);assert.equal(h.events.length,0);});
