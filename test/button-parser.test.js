'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {parseButtonFrame}=require('../drivers/tap-dial/button-parser');
test('decodes press for Button 3',()=>{const r=parseButtonFrame(Buffer.from('1d0b102f000300003000210000','hex'));assert.equal(r.button,3);assert.equal(r.sequence,47);assert.equal(r.candidateCode,0);});
test('decodes short release',()=>{const r=parseButtonFrame(Buffer.from('1d0b1030000300003002210100','hex'));assert.equal(r.candidateCode,2);assert.equal(r.candidateDetail,1);});
test('decodes hold and long release',()=>{assert.equal(parseButtonFrame(Buffer.from('1d0b1037000300003001210800','hex')).candidateCode,1);assert.equal(parseButtonFrame(Buffer.from('1d0b1038000300003003210a00','hex')).candidateCode,3);});
test('ignores rotary manufacturer-specific frame',()=>{assert.equal(parseButtonFrame(Buffer.from('1d0b1002001400013001290f00216400290f00216400290f00219001','hex')),null);});
test('other buttons parsed provisionally',()=>{const b=Buffer.from('1d0b102f000300003000210000','hex');b[5]=4;assert.equal(parseButtonFrame(b).button,4);});
