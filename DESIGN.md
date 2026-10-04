# TimeKeeper design

Stage countdown shown on an iPad. Read from several meters away, in dim rooms, in one glance. Terms follow `CONTEXT.md`.

## Design read

Utility stage display, not a marketing page. Dark, high-contrast, accessibility-first. Native HTML, CSS and JS, no framework, no icon library, no imagery. Dials: variance 2, motion 2, density 1.

## Layout

- The time (`M:SS`) is the whole composition: `min(31vw, 56vh)`, weight 800, tabular numerals, system SF font stack. It fills about 90 percent of the width in either orientation.
- Under the time: a state label in large tracked caps.
- Bottom: a progress meter with a tick at the warning threshold.
- Top left: optional speaker name, small. Top right: a faint "Controls" button.
- Nothing else. No clock time, no logo, no decoration.

## States

| State | Background | Text | Label | Meter pattern |
|---|---|---|---|---|
| Normal | near-black `#0b0f14` | off-white `#f2f5f8` | Remaining | solid cyan fill |
| Warning | amber `#ffc400` | near-black | "2 min left" or "5 min left", then "Last minute" | diagonal stripes |
| Time's Up | magenta `#d6006f` | white | TIME'S UP, with Overtime as `+0:32` | vertical bars, full width |

Each state differs in lightness and hue, and also in label text and meter pattern, so color is never the only cue. Time's Up also flashes slowly (1.4 s cycle, modest luminance swing). The flash is disabled under `prefers-reduced-motion`.

### Color-blindness check

Simulated with the Machado 2009 matrices (script was a throwaway). Contrast ratio between state backgrounds:

| Vision | Normal / Warning | Normal / Time's Up | Warning / Time's Up |
|---|---|---|---|
| Typical | 12.0 | 3.7 | 3.2 |
| Protanopia | 10.9 | 2.6 | 4.2 |
| Deuteranopia | 12.8 | 4.5 | 2.8 |
| Tritanopia | 11.0 | 4.2 | 2.7 |

Time's Up sits in the middle of the lightness range, which is the best a third level can do between near-black and bright yellow. That is why the label, meter pattern and flash exist. Red and green are deliberately not used. Still to do: check on the real iPad with an accessibility color filter (Settings > Accessibility > Display & Text Size > Color Filters).

## Operator controls

- Open the Control panel by tapping "Controls" or long-pressing the display for 0.6 s.
- Panel: slot length (5 min, 15 min, custom), custom minutes, speaker name, a line stating when the warning appears, then Start, Pause or Resume, Reset, Done.
- Opening the panel never stops the clock.
- All touch targets are at least 56 px high.

## Behavior

- Remaining time comes from timestamps (`Date.now()` against `endAt`), redrawn every 200 ms. Throttled tabs only delay redraws.
- State survives a reload through `localStorage`.
- Screen Wake Lock is held while running.
- Service worker caches the app shell so it works offline once loaded.

## Theme and motion

- One dark theme only. No light mode, because the display is read on stage.
- Motion: a 250 ms background fade between states, a 300 ms meter transition, and the Time's Up flash. All are off under reduced motion.

## Not done yet

- iOS Home Screen icon is an SVG only. Safari prefers a 180x180 PNG `apple-touch-icon`.
- Not yet tested on a physical iPad (Safari and Home Screen mode).
- No host chosen. Any static host works over HTTPS (needed for the service worker and wake lock).
