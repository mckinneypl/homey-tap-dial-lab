'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {parseRotationFrame}=require('../drivers/tap-dial/rotation-parser');
test('clockwise small movement',()=>{
 const r=parseRotationFrame(Buffer.from('01010600080400','hex'));
 assert.equal(r.direction,'clockwise'); assert.equal(r.stepSize,8);
 assert.equal(r.deltaPercent,3.14); assert.equal(r.transitionTime,4);
});
test('clockwise larger movement',()=>{
 const r=parseRotationFrame(Buffer.from('010406001a0400','hex'));
 assert.equal(r.stepSize,26); assert.equal(r.deltaPercent,10.2);
});
test('counterclockwise',()=>{
 const r=parseRotationFrame(Buffer.from('01290601380400','hex'));
 assert.equal(r.direction,'counterclockwise'); assert.equal(r.signedStep,-56);
 assert.equal(r.deltaPercent,-21.96);
});
test('hold marker ignored',()=>{
 assert.equal(parseRotationFrame(Buffer.from('014a0601ff0800','hex')),null);
});
test('bad frames ignored',()=>{
 for(const h of ['','010106','01010602080400','01010400080400','01010600000400']){
 assert.equal(parseRotationFrame(Buffer.from(h,'hex')),null);
 }
});
