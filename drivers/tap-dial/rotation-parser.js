'use strict';
/** Parse ZCL Level Control Step with On/Off (0x06) from RDM002. */
function parseRotationFrame(frame) {
  if (!Buffer.isBuffer(frame) || frame.length !== 7) return null;
  // ZCL frame header: frame control, transaction sequence, command ID.
  if (frame[0] !== 0x01 || frame[2] !== 0x06) return null;
  const mode = frame[3];
  if (mode !== 0x00 && mode !== 0x01) return null;
  const stepSize = frame[4];
  const transitionTime = frame.readUInt16LE(5);
  // 0xff is used during button holds, not a normal rotary adjustment.
  if (stepSize === 0xff || stepSize === 0) return null;
  const direction = mode === 0 ? 'clockwise' : 'counterclockwise';
  const signedStep = mode === 0 ? stepSize : -stepSize;
  return {
    sequence: frame[1], direction, stepSize, transitionTime,
    signedStep, deltaPercent: Math.round((signedStep / 255) * 10000) / 100,
    deltaFraction: signedStep / 255,
  };
}
module.exports = {parseRotationFrame};
