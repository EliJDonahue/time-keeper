(function () {
  "use strict";

  var STORAGE_KEY = "timekeeper.v1";
  var LONG_PRESS_MS = 600;

  var el = {
    time: document.getElementById("time"),
    label: document.getElementById("label"),
    speaker: document.getElementById("speaker"),
    stage: document.getElementById("stage"),
    fill: document.getElementById("meter-fill"),
    mark: document.getElementById("meter-mark"),
    openControls: document.getElementById("open-controls"),
    panel: document.getElementById("panel"),
    customField: document.getElementById("custom-field"),
    customMinutes: document.getElementById("custom-minutes"),
    warnSummary: document.getElementById("warn-summary"),
    speakerName: document.getElementById("speaker-name"),
    start: document.getElementById("btn-start"),
    pause: document.getElementById("btn-pause"),
    reset: document.getElementById("btn-reset"),
    close: document.getElementById("btn-close"),
    slotRadios: document.querySelectorAll('input[name="slot"]')
  };

  // run: "ready" | "running" | "paused"
  // endAt is set while running; remainingMs is set while ready or paused.
  var model = {
    slotMs: 5 * 60000,
    warnMs: 2 * 60000,
    run: "ready",
    endAt: 0,
    remainingMs: 5 * 60000,
    speaker: ""
  };

  var wakeLock = null;

  function warnFor(slotMs) {
    if (slotMs === 5 * 60000) return 2 * 60000;
    if (slotMs === 15 * 60000) return 5 * 60000;
    return Math.round(slotMs / 3 / 1000) * 1000;
  }

  function fmt(totalSeconds) {
    var m = Math.floor(totalSeconds / 60);
    var s = totalSeconds % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function spoken(ms) {
    var total = Math.round(ms / 1000);
    var m = Math.floor(total / 60);
    var s = total % 60;
    if (m && s) return m + " min " + s + " sec";
    if (m) return m + " min";
    return s + " sec";
  }

  function currentRemaining(now) {
    return model.run === "running" ? model.endAt - now : model.remainingMs;
  }

  function stateFor(remaining) {
    if (remaining <= 0) return "over";
    if (remaining <= model.warnMs) return "warning";
    return "normal";
  }

  function render() {
    var now = Date.now();
    var remaining = currentRemaining(now);
    var state = stateFor(remaining);
    var text;
    var label;

    if (remaining > 0) {
      text = fmt(Math.ceil(remaining / 1000));
      if (model.run === "paused") label = "Paused";
      else if (state === "warning") label = Math.ceil(remaining / 1000) <= 60 ? "Last minute" : "Wrap up";
      else label = model.run === "ready" ? "Ready" : "Remaining";
    } else {
      text = "+" + fmt(Math.floor(-remaining / 1000));
      label = "TIME'S UP";
    }

    document.body.dataset.state = state;
    document.body.dataset.run = model.run;
    document.body.dataset.long = text.length > 5 ? "true" : "false";
    if (el.time.textContent !== text) el.time.textContent = text;
    if (el.label.textContent !== label) el.label.textContent = label;

    var fraction = Math.max(0, Math.min(1, remaining / model.slotMs));
    el.fill.style.transform = "scaleX(" + fraction + ")";
    el.mark.style.left = "calc(" + (model.warnMs / model.slotMs) * 100 + "% - 2px)";

    el.speaker.hidden = !model.speaker;
    el.speaker.textContent = model.speaker;

    el.pause.hidden = model.run === "ready";
    el.pause.textContent = model.run === "running" ? "Pause" : "Resume";
    el.start.hidden = model.run !== "ready";
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(model)); } catch (e) { /* storage unavailable */ }
  }

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.slotMs > 0) {
        model = Object.assign(model, saved);
        el.speakerName.value = model.speaker || "";
        syncChoicesFromModel();
      }
    } catch (e) { /* ignore corrupt state */ }
  }

  function syncChoicesFromModel() {
    var minutes = model.slotMs / 60000;
    var choice = minutes === 5 ? "5" : minutes === 15 ? "15" : "custom";
    el.slotRadios.forEach(function (r) { r.checked = r.value === choice; });
    el.customField.hidden = choice !== "custom";
    if (choice === "custom") el.customMinutes.value = String(minutes);
    updateWarnText();
  }

  function selectedSlotMs() {
    var checked = document.querySelector('input[name="slot"]:checked').value;
    if (checked === "custom") {
      var mins = Math.max(1, Math.min(180, Math.round(Number(el.customMinutes.value) || 1)));
      return mins * 60000;
    }
    return Number(checked) * 60000;
  }

  function updateWarnText() {
    var slot = selectedSlotMs();
    var text = "Warning appears with " + spoken(warnFor(slot)) + " left.";
    el.warnSummary.textContent = text;
  }

  function applySlotChoice() {
    var slot = selectedSlotMs();
    model.slotMs = slot;
    model.warnMs = warnFor(slot);
    model.run = "ready";
    model.remainingMs = slot;
    model.endAt = 0;
    releaseWakeLock();
    save();
    render();
  }

  function start() {
    model.speaker = el.speakerName.value.trim();
    if (model.run === "ready") applySlotChoice();
    model.run = "running";
    model.endAt = Date.now() + model.remainingMs;
    requestWakeLock();
    save();
    render();
    el.panel.close();
  }

  function togglePause() {
    if (model.run === "running") {
      model.remainingMs = model.endAt - Date.now();
      model.run = "paused";
    } else if (model.run === "paused") {
      model.endAt = Date.now() + model.remainingMs;
      model.run = "running";
    }
    save();
    render();
  }

  function reset() {
    model.speaker = el.speakerName.value.trim();
    applySlotChoice();
  }

  function requestWakeLock() {
    if (!("wakeLock" in navigator) || wakeLock) return;
    navigator.wakeLock.request("screen").then(function (lock) {
      wakeLock = lock;
      lock.addEventListener("release", function () { wakeLock = null; });
    }).catch(function () { /* unsupported or denied; display still works */ });
  }

  function releaseWakeLock() {
    if (wakeLock) { wakeLock.release(); wakeLock = null; }
  }

  // Operator entry: tap the Controls button or long-press the display.
  var pressTimer = null;
  function cancelPress() { clearTimeout(pressTimer); pressTimer = null; }
  el.stage.addEventListener("pointerdown", function (e) {
    if (e.target === el.openControls) return;
    pressTimer = setTimeout(openPanel, LONG_PRESS_MS);
  });
  ["pointerup", "pointercancel", "pointerleave", "pointermove"].forEach(function (name) {
    el.stage.addEventListener(name, cancelPress);
  });
  el.stage.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  function openPanel() {
    cancelPress();
    syncChoicesFromModel();
    el.speakerName.value = model.speaker || "";
    if (!el.panel.open) el.panel.showModal();
  }

  el.openControls.addEventListener("click", openPanel);
  el.close.addEventListener("click", function () { el.panel.close(); });
  el.start.addEventListener("click", start);
  el.pause.addEventListener("click", function () { togglePause(); el.panel.close(); });
  el.reset.addEventListener("click", reset);
  el.slotRadios.forEach(function (r) {
    r.addEventListener("change", function () {
      el.customField.hidden = r.value !== "custom" || !r.checked;
      updateWarnText();
      if (model.run === "ready") applySlotChoice();
    });
  });
  el.customMinutes.addEventListener("input", function () {
    updateWarnText();
    if (model.run === "ready") applySlotChoice();
  });
  el.speakerName.addEventListener("input", function () {
    model.speaker = el.speakerName.value.trim();
    save();
    render();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      if (model.run === "running") requestWakeLock();
      render();
    }
  });

  load();
  render();
  if (model.run === "running") requestWakeLock();
  // Time is derived from timestamps, so a throttled timer only delays redraws.
  setInterval(render, 200);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline cache is optional */ });
    });
  }
})();
