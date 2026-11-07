'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const manifest = require('../app.json');
const appJs = fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const deviceJs = fs.readFileSync(path.join(__dirname,'../drivers/tap-dial/device.js'),'utf8');
test('combined button trigger has exactly two dropdowns and three numeric/text tags',()=>{
  const card=manifest.flow.triggers.find(t=>t.id==='button_recognized');
  assert.ok(card);
  assert.deepEqual(card.args.map(a=>a.name),['button','action']);
  assert.deepEqual(card.args[0].values.map(v=>v.id),['1','2','3','4']);
  assert.deepEqual(card.args[1].values.map(v=>v.id),['single','double','triple','quadruple','hold','long_release']);
  assert.deepEqual(card.tokens.map(t=>t.name),['button','action','count']);
});
test('six redundant button trigger definitions are removed',()=>{
  for(const action of ['single','double','triple','quadruple','hold','long_release']){
    assert.equal(manifest.flow.triggers.some(t=>t.id===`button_${action}`),false);
    assert.equal(deviceJs.includes(`button_${action}`),false);
  }
});
test('only combined button Flow listener and dispatch are retained',()=>{
  assert.ok(appJs.includes('registerRunListener'));
  assert.ok(appJs.includes('String(args.button) === String(state.button) && args.action === state.action'));
  assert.ok(deviceJs.includes("getTriggerCard('button_recognized').trigger(tokens,state)"));
  assert.ok(!deviceJs.includes('getTriggerCard(cardId)'));
});
test('known-good dimming trigger and gain are preserved',()=>{
  assert.ok(deviceJs.includes("getTriggerCard('rotation_brightness').trigger(adjustment)"));
  assert.ok(fs.readFileSync(path.join(__dirname,'../drivers/tap-dial/rotation-adjust.js'),'utf8').includes('0.5'));
});
