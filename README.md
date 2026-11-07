# Tap Dial Lab for Homey Pro — v0.5.2

Experimental community source release for the Philips Hue Tap Dial, Zigbee
model RDM002. Independent software, not an official Philips Hue, Signify,
or Athom app, and not a Homey App Store release.

## Requirements

- Zigbee-capable Homey Pro, software >=12.0.0 as declared in the manifest.
- RDM002 remote paired directly to Homey, rather than to a Hue Bridge.
- Node.js, npm and an installed Homey CLI on your development computer.
- Homey account access to the target Homey Pro.

## Flow cards

- **A Tap Dial button action was recognized:** choose Button 1–4 and
  Single, Double, Triple, Quadruple, Hold or Long Release.
  Tokens: Button number, Recognized action and Press count.
- **Tap Dial ring requests a brightness adjustment:** provides a signed
  relative dim adjustment (-1 to +1), with the existing 50% gain.
- Raw Zigbee and decoded button/rotation diagnostic cards remain available
  for troubleshooting.

The app does not automatically bind lights or fans. Your Flows control
what happens. The ring token is a relative change, not an absolute brightness.

## Install

Extract the source ZIP into an empty directory. Open a terminal in that
directory and run:

```bash
npm test
homey app validate
homey app install
```

This version declares no npm dependencies; no dependency installation is
required. The Homey CLI must already be installed and authenticated.
Select the intended Homey Pro if prompted. For temporary development,
use `homey app run` instead of `homey app install`.

For a new device, select the Tap Dial Lab driver when adding a device in
Homey. Follow Homey's pairing guidance and the manufacturer's reset
instructions if moving from another Zigbee network.

For an existing lab device, keep app ID `com.percy.tapdial.lab` and driver ID
`tap-dial`. Do not delete or re-pair a working device just to update the app.

## Example Flows

- Button: choose Button 3 / Hold on the combined button card, then connect
  an action such as toggling a light.
- Ring: pass **Relative dim adjustment (-1 to +1)** to a light action that
  accepts signed relative changes. Do not use it as an absolute dim level.

The six old individual button-action cards were removed before this release.
Flows using them must be changed manually to the combined card.

## Verification and limitations

- All 24 automated tests passed. The author's Homey installation also passed
  publish-level validation.
- Reported physical checks include Button 3 Hold and clockwise/counterclockwise
  dimming. Buttons 1, 2 and 4 remain provisionally decoded; tests do not
  establish physical verification of every button/gesture combination.
- Single presses wait for a recognition window to distinguish multiple presses.
- Hold and Long Release are separate actions.
- No battery capability is declared.
- Diagnostic cards can generate many events; they are not needed for normal use.
- The device initialization message still says v0.5.1; manifest/package
  versions are v0.5.2. That cosmetic discrepancy is retained to avoid code changes.

Test every gesture you intend to use, verify double presses suppress the
single action, and verify rotation direction with your chosen light action.

## License and maintenance

MIT License, copyright 2026 Percy McKinney. See LICENSE.
Shared as-is, with no guaranteed maintenance, support or response time.
Community forks and volunteer maintainers are welcome.

Community packaging changes only README, LICENSE and ignore rules.
Device code, Flow IDs, gain and behavior remain unchanged.
