# TimeKeeper

A countdown display for conference speakers. Put an iPad where the speaker can see it, and it shows how much time is left in their slot. The time fills most of the screen, uses high-contrast colors that stay distinct for common forms of color blindness, and changes color to warn the speaker when time is running low.

Live app: https://elijdonahue.github.io/time-keeper/

## States

| State | When | Look |
|---|---|---|
| Normal | Plenty of time left | White text on near-black, solid bar |
| Warning | 2 min left in a 5 min slot, 5 min left in a 15 min slot | Black text on amber, striped bar, "Wrap up" label |
| Time's Up | At 0:00 | White text on magenta, vertical-bar meter, slow flash, time counts up as `+0:32` |

Each state also differs in label and bar pattern, so color is never the only cue. A custom slot length warns when about a third of the time is left. The flash is turned off when the device has Reduce Motion enabled.

## Using it

1. Open the app. Tap **Controls** (top right) or long-press the screen to open the control panel.
2. Pick a slot length (5 min, 15 min, or custom) and optionally enter the speaker's name.
3. Tap **Start**. The panel closes and the countdown begins.
4. To pause, resume, or reset, open the control panel again. Opening it does not stop the clock.

## Install on an iPad

1. Open the live app URL in Safari.
2. Tap Share, then **Add to Home Screen**.
3. Launch it from the Home Screen for a fullscreen view.

Once loaded, it works offline. While a countdown is running, the screen stays awake.

## Development

There is no build step. The app is plain HTML, CSS and JavaScript.

```
python -m http.server 8765
```

Then open http://localhost:8765/. The service worker caches files, so after changing code, unregister it or do a hard reload to see the change.

| File | Purpose |
|---|---|
| `index.html` | Display and control panel markup |
| `styles.css` | Colors, layout, state styles |
| `app.js` | Timer logic, controls, wake lock |
| `sw.js` | Offline cache |
| `manifest.webmanifest`, `icon.svg` | Home Screen install |

See `DESIGN.md` for the design decisions and color-blindness check, and `CONTEXT.md` for the project glossary.

## Deploying

The app is served by GitHub Pages from the `main` branch root. Every push to `main` redeploys it. After a deploy, open the page twice (or close and reopen the Home Screen app) to pick up the new version, because the service worker serves cached files first.
