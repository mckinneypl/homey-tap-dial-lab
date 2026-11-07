'use strict';
const Homey = require('homey');
module.exports = class TapDialLabApp extends Homey.App {
  async onInit() {
    // App-level Flow trigger dropdowns require a run listener to filter by button.
    this.homey.flow.getTriggerCard('button_recognized')
      .registerRunListener(async (args, state) =>
        String(args.button) === String(state.button) && args.action === state.action);
    this.log('Tap Dial Lab v0.5.2 started: combined button Flow trigger, proportional dimming retained.');
  }
};
