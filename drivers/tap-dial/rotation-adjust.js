'use strict';
/** Convert a measured Level Control step to a signed, scaled Homey dim delta.
 * Using raw cluster 0x0008 only prevents double processing of accompanying 0xFC00 frames.
 * Gain 0.5 is an initial user-adjustable test constant, not a calibrated physical mapping.
 */
const GAIN=0.5;
function toBrightnessAdjustment(rotation, gain=GAIN){
  if (!rotation || !Number.isFinite(rotation.signedStep) || Math.abs(rotation.signedStep)>254) return null;
  if (!Number.isFinite(gain) || gain<=0 || gain>1) return null;
  const delta=rotation.signedStep/255*gain;
  if (delta===0) return null;
  return {
    delta:Math.round(delta*100000)/100000,
    percent:Math.round(delta*10000)/100,
    step:rotation.stepSize,
    direction:rotation.direction,
    sequence:rotation.sequence,
  };
}
module.exports={toBrightnessAdjustment,GAIN};
