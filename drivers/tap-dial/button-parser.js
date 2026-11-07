'use strict';
const CANDIDATE = Object.freeze({0:'press',1:'hold',2:'short_release',3:'long_release'});
function parseButtonFrame(frame) {
  const b = Buffer.isBuffer(frame) ? frame : Buffer.from(frame);
  if (b.length < 13 || b[0] !== 0x1d || b.readUInt16LE(1) !== 0x100b || b[4] !== 0x00) return null;
  // Captures from Button 3 show b[5] = 3. The mapping for buttons 1/2/4
  // is provisionally inferred and MUST be checked with those physical buttons.
  if (b[5] < 1 || b[5] > 4 || b[6] !== 0x00 || b[7] !== 0x00 || b[8] !== 0x30 || b[10] !== 0x21) return null;
  const code = b[9];
  if (!Object.hasOwn(CANDIDATE, code)) return null;
  return {sequence:b[3], button:b[5], candidateCode:code,
    candidateAction:CANDIDATE[code], candidateDetail:b.readUInt16LE(11),
    payload:b.subarray(5).toString('hex')};
}
module.exports = {parseButtonFrame};
