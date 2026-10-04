# TimeKeeper

A web app shown on an iPad that tells conference speakers how much time they have left in their slot. Read `CONTEXT.md` for the domain glossary and use those terms in code and UI text.

## Requirements

- Remaining time fills most of the screen, readable from a distance. Format `M:SS`, both orientations.
- Slots: 5 min (warn at 2 min left), 15 min (warn at 5 min left), plus custom length (warn at about 1/3 of the slot).
- Three states: Normal, Warning, Time's Up. At 0:00 keep counting up as Overtime ("+0:32") with a slow flash.
- Colors must be distinguishable under deuteranopia, protanopia, and tritanopia. Differ in lightness as well as hue, and always add non-color cues (text label such as "2 MIN LEFT" / "TIME'S UP", plus a progress bar or border). Dark background. Suggested start: Normal = white/cyan on near-black, Warning = amber/yellow background with black text, Time's Up = magenta/blue background with white text. Validate with a CVD simulation.
- Two modes in one app: a chrome-free Display mode and a Control panel opened by a low-key gesture (long-press or corner tap). The Operator uses the same iPad; no remote sync in v1.
- Optional small speaker-name line. No current clock time.

## Architecture

- Static PWA, no backend. Plain HTML/CSS/JS or a tiny framework.
- Service worker for offline use (conference Wi-Fi is unreliable). Installed to the Home Screen for fullscreen.
- Screen Wake Lock API to keep the screen on (iPadOS 16.4+).
- Compute remaining time from timestamps (`Date.now()` against an end time), never by decrementing a counter, so throttled tabs stay accurate.

## Conventions

- Keep `CONTEXT.md` a glossary only; no implementation detail.
- Write an ADR in `docs/adr/` only for decisions that are hard to reverse, surprising, and a real trade-off.
- Test on a real iPad (Safari and Home Screen mode) before calling a change done.
