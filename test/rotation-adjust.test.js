'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {parseRotationFrame}=require('../drivers/tap-dial/rotation-parser');
const {toBrightnessAdjustment,GAIN}=require('../drivers/tap-dial/rotation-adjust');
test('default gain halves the Zigbee relative delta',()=>{
 assert.equal(GAIN,0.5);
 const a=toBrightnessAdjustment(parseRotationFrame(Buffer.from('010106000e0400','hex')));
 assert.equal(a.delta,0.02745); assert.equal(a.percent,2.75);
});
test('direction is preserved and hold marker is ignored',()=>{
 const a=toBrightnessAdjustment(parseRotationFrame(Buffer.from('01170601140400','hex')));
 assert(a.delta<0);assert.equal(a.step,20);
 assert.equal(toBrightnessAdjustment(parseRotationFrame(Buffer.from('014a0601ff0800','hex'))),null);
});
test('gain validation',()=>{
 const r=parseRotationFrame(Buffer.from('01170601080400','hex'));
 assert.equal(toBrightnessAdjustment(r,0),null);
 assert.equal(toBrightnessAdjustment(r,2),null);
});
