'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('Flow trigger calls match app-level manifest cards',()=>{
  const manifest=require('../app.json');
  const js=fs.readFileSync(path.join(__dirname,'../drivers/tap-dial/device.js'),'utf8');
  const ids=new Set(manifest.flow.triggers.map(x=>x.id));
  assert.ok(ids.has('rotation_brightness'));
  assert.ok(js.includes("getTriggerCard('rotation_brightness').trigger(adjustment)"));
  assert.ok(!js.includes('getDeviceTriggerCard('));
});
