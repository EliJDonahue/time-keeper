# TimeKeeper

A countdown display that shows conference speakers how much of their speaking time remains.

## Language

**Speaker**:
The person presenting, who reads the display from a distance.

**Operator**:
The person who starts, pauses, and resets the countdown. Often a stage manager; may be the same person as the owner of the iPad.

**Slot**:
The fixed length of time allotted to one Speaker. Presets are 5 minutes and 15 minutes; a custom length is also allowed.

**Warning threshold**:
The remaining time at which the display changes from Normal to Warning. 2 minutes for a 5-minute Slot, 5 minutes for a 15-minute Slot, about one third of the Slot for a custom length.

**State**:
Which of three conditions the display is in: Normal, Warning, or Time's Up. Each State has its own color and text label.

**Overtime**:
Time elapsed past the end of the Slot, shown counting up (e.g. "+0:32") while in the Time's Up State.

**Display mode**:
The fullscreen, chrome-free view the Speaker sees.

**Control panel**:
The Operator's setup and control view, reached from Display mode through a low-key gesture.
