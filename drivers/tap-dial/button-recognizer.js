'use strict';
/**
 * One recognizer per RDM002. Events are emitted only once a gesture is known.
 * A short release starts a 350 ms window for a subsequent press; an on-device
 * hold code cancels any pending short-press action.
 * No lighting or other device actions occur in this module.
 */
class ButtonRecognizer {
  constructor({emit, multiPressMs=350, clock=()=>Date.now(), schedule=setTimeout, cancel=clearTimeout}) {
    this.emit=emit;this.multiPressMs=multiPressMs;this.clock=clock;
    this.schedule=schedule;this.cancel=cancel;
    this.states=new Map();
  }
  state(button) {
    if (!this.states.has(button)) this.states.set(button,{down:false,held:false,count:0,timer:null,lastRelease:0});
    return this.states.get(button);
  }
  clearTimer(s) {if(s.timer!==null){this.cancel(s.timer);s.timer=null;}}
  flush(button,s) {
    this.clearTimer(s);
    const count=s.count;
    s.count=0;s.lastRelease=0;
    if(count>0)this.emit({button,action:['','single','double','triple','quadruple'][Math.min(count,4)] || 'quadruple',count});
  }
  ingest({button,candidateCode}) {
    if(!Number.isInteger(button)||button<1||button>4)return;
    const s=this.state(button),now=this.clock();
    switch(candidateCode){
      case 0: // press: do not emit single immediately
        if(s.timer!==null && now-s.lastRelease>this.multiPressMs)this.flush(button,s);
        this.clearTimer(s);
        s.down=true;s.held=false;
        break;
      case 1: // hold start; never emit pending single for this gesture
        if(s.held)break;
        if(s.count>0)this.flush(button,s);
        this.clearTimer(s);
        s.down=true;s.held=true;
        this.emit({button,action:'hold',count:0});
        break;
      case 2: // short release
        if(!s.down || s.held)break;
        s.down=false;
        s.count++;
        s.lastRelease=now;
        this.clearTimer(s);
        if(s.count>=4){this.flush(button,s);break;}
        s.timer=this.schedule(()=>{s.timer=null;this.flush(button,s);},this.multiPressMs);
        break;
      case 3: // long release; a hold must not also turn into a single
        this.clearTimer(s);
        s.down=false;
        if(s.held)this.emit({button,action:'long_release',count:0});
        s.held=false;
        s.count=0;s.lastRelease=0;
        break;
      default:break;
    }
  }
  dispose(){for(const s of this.states.values())this.clearTimer(s);this.states.clear();}
}
module.exports={ButtonRecognizer};
