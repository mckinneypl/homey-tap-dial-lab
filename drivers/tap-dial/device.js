'use strict';
const Homey = require('homey');
const {parseButtonFrame} = require('./button-parser');
const {ButtonRecognizer} = require('./button-recognizer');
const {parseRotationFrame} = require('./rotation-parser');
const {toBrightnessAdjustment} = require('./rotation-adjust');
const INTERESTING = new Set([0xFC00,0x0008,0x0006]);
module.exports = class TapDialDevice extends Homey.Device {
  async onInit() {
    this.log('Tap Dial Lab v0.5.1: combined button Flow trigger and proven proportional rotation (no automatic light binding)');
    this._lastButtonTime=null;
    this._recognizer=new ButtonRecognizer({emit:({button,action,count})=>{
      this.log(`[BUTTON-RECOGNIZED] button=${button} action=${action} count=${count}`);
      const tokens={button,action,count};
      const state={button:String(button),action};
      // Dispatch the single configurable button trigger.
      this.homey.flow.getTriggerCard('button_recognized').trigger(tokens,state)
        .then(()=>this.log(`[FLOW-DISPATCHED] button_recognized button=${button} action=${action}`))
        .catch(err=>this.error('Recognized Flow trigger failed',err));
      this.log(`[FLOW-REQUESTED] button_recognized button=${button} action=${action}`);
    }});
    const node=await this.homey.zigbee.getNode(this);
    node.handleFrame=async(endpoint,cluster,frame,meta)=>{
      if(!INTERESTING.has(cluster))return;
      const buffer=Buffer.isBuffer(frame)?frame:Buffer.from(frame);
      const hex=buffer.toString('hex');
      const metadata=JSON.stringify({command:meta?.commandId??null,manufacturer:meta?.manufacturerId??null});
      this.log(`[RDM002] endpoint=${endpoint} cluster=0x${cluster.toString(16)} hex=${hex} meta=${metadata}`);
      if(cluster===0x0008){
        const rotation=parseRotationFrame(buffer);
        if(rotation){
          const {sequence,direction,stepSize,transitionTime,signedStep,deltaPercent,deltaFraction}=rotation;
          this.log(`[ROTATION-DECODED] sequence=${sequence} direction=${direction} step=${stepSize} signedStep=${signedStep} transitionTime=${transitionTime} deltaPercent=${deltaPercent} (diagnostic only)`);
          const adjustment=toBrightnessAdjustment(rotation);
          if(adjustment){
            this.log(`[ROTATION-ADJUST] direction=${adjustment.direction} step=${adjustment.step} delta=${adjustment.delta} percent=${adjustment.percent} (50% gain; Flow trigger)`);
            try{
              await this.homey.flow.getTriggerCard('rotation_brightness').trigger(adjustment);
              this.log(`[FLOW-DISPATCHED] rotation_brightness delta=${adjustment.delta}`);
            }catch(err){this.error('Brightness Flow trigger failed',err);}
          }
          try{
            await this.homey.flow.getTriggerCard('rotation_decoded').trigger(
              {sequence,direction,step_size:stepSize,signed_step:signedStep,transition_time:transitionTime,delta_percent:deltaPercent,delta_fraction:deltaFraction,hex},
              {direction});
          }catch(err){this.error('Rotation diagnostic Flow trigger failed',err);}
        } else if(buffer.length >= 5 && buffer[2]===0x06 && buffer[4]===0xff){
          this.log('[ROTATION-IGNORED] button-hold marker step=255');
        }
      }
      if(cluster===0xFC00){
        const button=parseButtonFrame(buffer);
        if(button){
          const now=Date.now();
          const elapsedMs=this._lastButtonTime==null?-1:now-this._lastButtonTime;
          this._lastButtonTime=now;
          this.log(`[BUTTON-CANDIDATE] button=${button.button} sequence=${button.sequence} code=${button.candidateCode} action=${button.candidateAction} detail=${button.candidateDetail} elapsedMs=${elapsedMs} payload=${button.payload}`);
          this._recognizer.ingest(button);
          try{await this.homey.flow.getTriggerCard('button_raw').trigger({
            sequence:button.sequence,candidate_action:button.candidateAction,
            candidate_code:button.candidateCode,candidate_detail:button.candidateDetail,
            elapsed_ms:elapsedMs,hex
          });}catch(err){this.error('Button diagnostic Flow trigger failed',err);}
        }
      }
      try{
        await this.homey.flow.getTriggerCard('raw_frame').trigger({cluster,endpoint,hex,meta:metadata});
        if(cluster===0x0008)await this.homey.flow.getTriggerCard('rotation_raw').trigger({cluster,hex});
      }catch(err){this.error('Diagnostic Flow trigger failed',err);}
    };
  }
  async onDeleted(){this._recognizer?.dispose();}
};
