/**
 * Multi-Panel Dashboard Card
 * Unified single card: cameras top, sections below in configurable columns
 * Author: robman2026
 * GitHub: https://github.com/robman2026/multi-panel-dashboard-card
 * Version: 2.0.0
 * License: MIT
 */

const CARD_VERSION = "2.3.3";

// LitElement base — needed for editor + MpdCamStream
const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css  = LitElement.prototype.css;

// ── MDI icon paths ──────────────────────────────────────────────────────────
const MDI = {
  camera:      'M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z',
  globe:       'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0c-2.5 2.5-4 6-4 10s1.5 7.5 4 10m0-20c2.5 2.5 4 6 4 10s-1.5 7.5-4 10M2 12h20',
  monitor:     'M20 3H4a1 1 0 00-1 1v13a1 1 0 001 1h7v2H8v2h8v-2h-3v-2h7a1 1 0 001-1V4a1 1 0 00-1-1zm-1 13H5V5h14v11z',
  printer3d:   'M7 17a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0zM5 6l1.5-3h11L19 6M3 6h18v4H3zm2 4h14l-1 7H6z',
  wrench:      'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-.7.7-4.3 4.3-.7-.7a1 1 0 00-1.4 0L5 14a1 1 0 000 1.4l3.6 3.6a1 1 0 001.4 0l5.3-5.3a1 1 0 000-1.4l-.7-.7 4.3-4.3.7-.7zm-9.4 9.4l-1.6-1.6 5.3-5.3 1.6 1.6-5.3 5.3z',
  motion:      'M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4m7-3.93c.5.43.94.86 1.31 1.3C21.42 16.46 22 17.67 22 19v2h-2v-2c0-.86-.38-1.67-1-2.36V16.06m-1-5.06a4 4 0 000 8v-2a2 2 0 000-4V11m-3-7a2 2 0 012 2 2 2 0 01-2 2V4z',
  bulb:        'M9 21h6m-3-3v3M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6 6 0 016 9a6 6 0 016-6z',
  home:        'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zm6 11V12h6v8',
  stairs:      'M3 18h3v-3h3v-3h3v-3h3V6h6v2h-4v3h-3v3h-3v3H8v3H3v-2z',
  door:        'M8 3h8a2 2 0 012 2v16H6V5a2 2 0 012-2zm4 9a1 1 0 100-2 1 1 0 000 2z',
  lightbulb:   'M9 21h6m-3-3v3M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6 6 0 016 9a6 6 0 016-6z',
  server:      'M20 3H4a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1zm0 8H4a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1v-4a1 1 0 00-1-1zm-1 3a1 1 0 11-2 0 1 1 0 012 0zm-4 0a1 1 0 11-2 0 1 1 0 012 0zm5-8a1 1 0 11-2 0 1 1 0 012 0zm-4 0a1 1 0 11-2 0 1 1 0 012 0z',
  vibration:   'M0 11h2v2H0zm4-4h2v10H4zm16 4h2v2h-2zm-4-4h2v10h-2zm-4-3h2v16h-2z',
  tilt:        'M12 2L2 19h20L12 2zm0 3.5L19.5 18h-15L12 5.5zm-1 4v5h2v-5h-2zm0 6v2h2v-2h-2z',
  thermometer: 'M15 13V5a3 3 0 00-6 0v8a5 5 0 106 0zm-3 7a3 3 0 110-6 3 3 0 010 6z',
  water:       'M12 2c-5.33 4.55-8 8.48-8 11.8a8 8 0 0016 0c0-3.32-2.67-7.25-8-11.8z',
  salt:        'M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  person:      'M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z',
  switch_icon: 'M17 6H7c-3.31 0-6 2.69-6 6s2.69 6 6 6h10c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 10H7c-2.21 0-4-1.79-4-4s1.79-4 4-4h10c2.21 0 4 1.79 4 4s-1.79-4 4-4zm0-6a2 2 0 100 4 2 2 0 000-4z',
  warning:     'M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6zm-1 4v5h2v-5h-2zm0 6v2h2v-2h-2z',
  sensor:      'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 4a6 6 0 016 6 6 6 0 01-6 6 6 6 0 01-6-6 6 6 0 016-6zm0 2a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z',
  bolt:        'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
};

const CATEGORY_ICON = {
  camera: 'camera', switch: 'switch_icon', door: 'door', motion: 'motion',
  light: 'lightbulb', person: 'person', server: 'server', vibration: 'vibration',
  tilt: 'tilt', stairs: 'stairs', sensor: 'sensor', temp: 'thermometer',
  humidity: 'water', salt: 'salt',
};

function mdiIcon(name, color, size) {
  color = color || 'rgba(255,255,255,.38)';
  size  = size  || 18;
  const path = MDI[name] || MDI.sensor;
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="' + path + '"/></svg>';
}

function renderIcon(iconName, color, size) {
  if (!iconName) return mdiIcon('sensor', color, size);
  const hasMdi     = iconName.startsWith('mdi:');
  const knownLocal = MDI[iconName.replace('mdi:', '')];
  if (hasMdi || !knownLocal) {
    const n = hasMdi ? iconName : 'mdi:' + iconName;
    return '<ha-icon icon="' + n + '" style="color:' + color + ';--mdc-icon-size:' + size + 'px;display:inline-flex;align-items:center;justify-content:center;width:' + size + 'px;height:' + size + 'px;"></ha-icon>';
  }
  return mdiIcon(iconName, color, size);
}

// ── Threshold helpers ───────────────────────────────────────────────────────
function colorFromThresholds(value, thresholds) {
  if (!thresholds || !thresholds.length) return '#4fa3e0';
  for (var i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i].max) return thresholds[i].color;
  }
  return thresholds[thresholds.length - 1].color;
}

function parseTh(raw, fallback) {
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch(e) { return fallback; }
}

const DEFAULT_THRESHOLDS = {
  temperature: [
    { max: 10,  color: '#4fa3e0' },
    { max: 25,  color: '#6ddb99' },
    { max: 35,  color: '#e0b44f' },
    { max: 999, color: '#e05050' },
  ],
  humidity: [
    { max: 30,  color: '#e0b44f' },
    { max: 60,  color: '#6ddb99' },
    { max: 80,  color: '#e0b44f' },
    { max: 999, color: '#e05050' },
  ],
  salt: [
    { max: 30,  color: '#e05050' },
    { max: 60,  color: '#e0b44f' },
    { max: 999, color: '#6ddb99' },
  ],
  power: [
    { max: 0,    color: 'rgba(255,255,255,.15)' },
    { max: 500,  color: '#6ddb99' },
    { max: 1500, color: '#e0b44f' },
    { max: 9999, color: '#e05050' },
  ],
};

// ── State helpers ───────────────────────────────────────────────────────────
function stateVal(hass, id) {
  if (!id || !hass) return null;
  var e = hass.states[id];
  return e ? e.state : null;
}
function stateNum(hass, id) {
  var v = stateVal(hass, id);
  return v !== null ? (parseFloat(v) || 0) : 0;
}
function isOn(s)      { return s === 'on' || s === 'true' || s === 'home' || s === 'open'; }
function isUnavail(s) { return !s || s === 'unavailable' || s === 'unknown'; }
function stateLabel(s){ if (!s || isUnavail(s)) return '—'; return s.charAt(0).toUpperCase() + s.slice(1); }

// ── SVG builders ────────────────────────────────────────────────────────────
function gaugeSVG(size, outerPct, outerColor, innerPct, innerColor) {
  var r1 = size * 0.41, r2 = size * 0.32, cx = size / 2;
  var c1 = 2 * Math.PI * r1, c2 = 2 * Math.PI * r2;
  var o1 = c1 * (1 - Math.max(0, Math.min(1, outerPct)));
  var o2 = c2 * (1 - Math.max(0, Math.min(1, innerPct)));
  var oc = outerColor || '#4fa3e0', ic = innerColor || '#6ddb99';
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="overflow:visible;display:block">' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r1 + '" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="3.5"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r1 + '" fill="none" stroke="' + oc + '" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="' + c1.toFixed(1) + '" stroke-dashoffset="' + o1.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cx + ')" style="filter:drop-shadow(0 0 4px ' + oc + ')"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r2 + '" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="2.5"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r2 + '" fill="none" stroke="' + ic + '" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="' + c2.toFixed(1) + '" stroke-dashoffset="' + o2.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cx + ')" style="filter:drop-shadow(0 0 3px ' + ic + ')" opacity="0.7"/>' +
    '</svg>';
}

function saltSVG(size, pct, color) {
  var r = size * 0.42, cx = size / 2;
  var c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, pct)));
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="overflow:visible;display:block">' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="5"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cx + ')" style="filter:drop-shadow(0 0 4px ' + color + ')"/>' +
    '</svg>';
}

function powerSVG(size, pct, color) {
  var r = size * 0.38, cx = size / 2;
  var full = 2 * Math.PI * r;
  var arc  = full * 0.75;
  var fill = Math.max(0, Math.min(arc, pct * arc));
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="transform:rotate(-135deg);overflow:visible;display:block">' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="4" stroke-dasharray="' + arc.toFixed(1) + ' ' + (full - arc).toFixed(1) + '" stroke-linecap="round"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="4" stroke-dasharray="' + fill.toFixed(1) + ' ' + (full - fill).toFixed(1) + '" stroke-linecap="round" style="filter:drop-shadow(0 0 4px ' + color + ')"/>' +
    '</svg>';
}

// ── Salt % calculation ──────────────────────────────────────────────────────
function calcSaltPct(hass, cfg) {
  var saltVal = stateNum(hass, cfg.salt_entity);
  if (cfg.salt_pct_entity) {
    var pctEnt = stateNum(hass, cfg.salt_pct_entity);
    return Math.min(1, Math.max(0, pctEnt / 100));
  }
  if (cfg.salt_max_entity) {
    var maxEnt = stateNum(hass, cfg.salt_max_entity);
    if (maxEnt > 0) return Math.min(1, Math.max(0, saltVal / maxEnt));
  }
  if (cfg.salt_max_value) {
    var maxVal = parseFloat(cfg.salt_max_value) || 0;
    if (maxVal > 0) return Math.min(1, Math.max(0, saltVal / maxVal));
  }
  if (saltVal > 1 && saltVal <= 100) return saltVal / 100;
  if (saltVal > 0 && saltVal <= 1)   return saltVal;
  return 0;
}

// ── Default config ──────────────────────────────────────────────────────────
function getStubConfig() {
  return {
    cameras:         [{ entity: '', label: 'Camera 1', icon: 'camera' }],
    cameras_columns: 3,
    switches:        [{ entity: '', label: 'Switch 1', icon: 'switch_icon', category: 'switch' }],
    switches_columns: 2,
    sensors:         [{ entity: '', label: 'Sensor 1', icon: 'sensor', category: 'sensor' }],
    sensors_columns:  2,
    gauges:          [{ temp_entity: '', humidity_entity: '', label: 'Room 1',
                        temp_thresholds: JSON.stringify(DEFAULT_THRESHOLDS.temperature),
                        hum_thresholds:  JSON.stringify(DEFAULT_THRESHOLDS.humidity), gauge_size: 54 }],
    gauges_columns:   2,
    power_circuits:  [{ entity: '', label: 'Circuit 1', energy_entity: '', current_entity: '', max_w: 3000 }],
    power_columns:    2,
    salt_entity: '', salt_pct_entity: '', salt_max_entity: '', salt_max_value: '',
    salt_label: 'Salt Level', salt_warn_threshold: 30,
    salt_thresholds: JSON.stringify(DEFAULT_THRESHOLDS.salt),
    label_surveillance: 'Surveillance', label_switches: 'Switches',
    label_sensors: 'Sensors', label_climate: 'Climate',
    label_salt: 'Salt Level', label_power: 'Power',
    accordion_switches: false,
    accordion_sensors:  false,
    accordion_climate:  false,
    accordion_power:    false,
    accordion_default_open: true,
  };
}

// ── CSS ─────────────────────────────────────────────────────────────────────
var STYLES = [
  "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');",
  ":host{display:block;font-family:'DM Sans',sans-serif;}",
  "*{box-sizing:border-box;margin:0;padding:0}",
  ".mpd-card{background:#181c27;border-radius:24px;border:1px solid rgba(255,255,255,.07);box-shadow:0 4px 40px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.06);padding:18px;position:relative;overflow:hidden;}",".mpd-inner{width:100%;}",
  ".mpd-card::before{content:'';position:absolute;width:300px;height:300px;border-radius:50%;top:-100px;right:-80px;background:#4fa3e0;filter:blur(80px);opacity:.06;pointer-events:none;}",
  ".sec{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.22);font-weight:500;margin-bottom:9px;display:flex;align-items:center;gap:5px;white-space:nowrap;overflow:hidden;}",
  ".sec-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}",
  ".divider{height:1px;background:rgba(255,255,255,.05);margin:14px 0;}",
  ".cam-strip{display:grid;gap:8px;}",
  ".cam-tile{border-radius:11px;overflow:hidden;background:#090d1a;border:1px solid rgba(255,255,255,.07);position:relative;cursor:pointer;transition:border-color .2s;min-height:90px;}",
  ".cam-tile:hover{border-color:rgba(79,163,224,.35);}",
  "mpd-cam-stream{display:block;width:100%;}",
  ".cam-placeholder{width:100%;min-height:90px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0d1220,#111827);}",
  ".bottom-grid{display:grid;gap:12px;grid-template-columns:repeat(var(--mpd-cols,4),minmax(0,1fr));}",
  ".mpd-inner.bp-sm .bottom-grid{grid-template-columns:repeat(2,minmax(0,1fr));}",
  ".mpd-inner.bp-sm .cam-tile,.mpd-inner.bp-xs .cam-tile{min-height:0;}",
  ".mpd-inner.bp-xs .bottom-grid{grid-template-columns:repeat(1,minmax(0,1fr));}",
  ".mpd-inner.bp-sm .sec{letter-spacing:.06em;font-size:8px;}",
  ".mpd-inner.bp-sm .gauge-tile,.mpd-inner.bp-sm .power-tile{padding:7px 5px;gap:6px;}",
  ".mpd-inner.bp-sm .salt-tile{padding:7px 8px;gap:8px;}",
  ".mpd-inner.bp-xs .gauge-tile,.mpd-inner.bp-xs .power-tile{padding:6px 4px;gap:4px;}",
  ".mpd-inner.bp-xs .salt-tile{padding:6px 6px;gap:6px;}",
  ".mpd-inner.bp-xs .sw-tile{padding:8px 5px;}",
  ".mpd-inner.bp-xs .sensor-tile{padding:6px 3px;}",
  ".sec-col{min-width:0;overflow:hidden;}",
  ".acc-section{border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden;margin-bottom:6px;}",
  ".acc-header{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;cursor:pointer;background:rgba(255,255,255,.03);user-select:none;}",
  ".acc-header:hover{background:rgba(255,255,255,.06);}",
  ".acc-title{display:flex;align-items:center;gap:8px;font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.5);font-weight:500;}",
  ".acc-arrow{font-size:10px;color:rgba(255,255,255,.3);transition:transform .25s;display:inline-block;}",
  ".acc-arrow.acc-open{transform:rotate(180deg);}",
  ".acc-body{overflow:hidden;max-height:0;transition:max-height .3s ease;}",
  ".acc-body.acc-open{max-height:2000px;}",
  ".acc-inner{padding:10px 0 2px;}",
  ".sw-grid{display:grid;gap:6px;min-width:0;}",
  ".sw-tile{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:10px 7px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;transition:background .15s,border-color .15s;}",
  ".sw-tile:active{transform:scale(.97);}",
  ".sw-tile.sw-on{background:rgba(79,163,224,.07);border-color:rgba(79,163,224,.2);}",
  ".sw-tile.sw-motion{background:rgba(255,170,80,.07);border-color:rgba(255,170,80,.2);}",
  ".sw-tile.sw-unavail{opacity:.35;pointer-events:none;}",
  ".sw-name{font-size:9px;font-weight:500;color:rgba(255,255,255,.75);text-align:center;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;}",
  ".sw-state{font-size:8px;letter-spacing:.06em;text-transform:uppercase;font-family:'DM Mono',monospace;color:rgba(255,255,255,.28);}",
  ".sw-state.s-on{color:#6dbfff;}.sw-state.s-motion{color:#ffaa6d;}.sw-state.s-open{color:#ffd26d;}",
  ".sensor-grid{display:grid;gap:5px;min-width:0;}",
  ".sensor-grid.scols-1 .sensor-tile{flex-direction:row;padding:7px 9px;text-align:left;}",
  ".sensor-grid.scols-1 .sensor-name{flex:1;text-align:left;}",
  ".sensor-grid.scols-2 .sensor-tile,.sensor-grid.scols-3 .sensor-tile,.sensor-grid.scols-4 .sensor-tile{flex-direction:column;padding:8px 4px;text-align:center;}",
  ".sensor-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:9px;display:flex;align-items:center;gap:6px;cursor:pointer;transition:background .15s;min-width:0;overflow:hidden;}",
  ".sensor-tile:hover{background:rgba(255,255,255,.06);}",
  ".sensor-name{font-size:8px;color:rgba(255,255,255,.28);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;min-width:0;}",
  ".sensor-val{font-size:9px;font-weight:500;font-family:'DM Mono',monospace;color:rgba(255,255,255,.38);flex-shrink:0;min-width:0;}",
  ".sv-on{color:#6dbfff;}.sv-open{color:#ffd26d;}.sv-motion{color:#ff8a6d;}.sv-off{color:rgba(255,255,255,.2);}",
  ".gauge-grid{display:grid;gap:7px;min-width:0;}",
  ".gauge-grid.gcols-1 .gauge-tile{flex-direction:row;}.gauge-grid.gcols-1 .g-name{text-align:left;}",
  ".gauge-grid.gcols-2 .gauge-tile,.gauge-grid.gcols-3 .gauge-tile{flex-direction:column;align-items:center;}",
  ".gauge-grid.gcols-2 .g-name,.gauge-grid.gcols-3 .g-name{text-align:center;}",
  ".gauge-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:10px 8px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:background .15s;min-width:0;overflow:hidden;}",
  ".gauge-tile:hover{background:rgba(255,255,255,.06);}",
  ".gauge-wrap{position:relative;flex-shrink:0;width:54px;height:54px;}",
  ".gauge-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;}",
  ".g-val{font-size:12px;font-weight:600;display:block;line-height:1.15;font-family:'DM Mono',monospace;}",
  ".g-sub{font-size:8px;display:block;margin-top:1px;font-family:'DM Mono',monospace;}",
  ".g-name{font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.28);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;}",
  ".salt-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:10px 12px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:background .15s;min-width:0;overflow:hidden;}",
  ".salt-tile:hover{background:rgba(255,255,255,.06);}",
  ".salt-wrap{position:relative;flex-shrink:0;width:60px;height:60px;}",
  ".salt-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;}",
  ".s-val{font-size:11px;font-weight:600;color:rgba(255,255,255,.9);font-family:'DM Mono',monospace;display:block;line-height:1.1;}",
  ".s-pct{font-size:8px;color:rgba(255,255,255,.38);display:block;}",
  ".salt-info{flex:1;min-width:0;overflow:hidden;}",
  ".salt-title{font-size:9px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:5px;}",
  ".salt-bar-wrap{background:rgba(255,255,255,.06);border-radius:3px;height:3px;overflow:hidden;margin-bottom:4px;}",
  ".salt-bar{height:3px;border-radius:3px;transition:width .6s;}",
  ".salt-meta{font-size:8px;color:rgba(255,255,255,.25);font-family:'DM Mono',monospace;}",
  ".salt-warn{font-size:8px;color:#ffd26d;margin-top:3px;display:flex;align-items:center;gap:3px;}",
  ".power-grid{display:grid;gap:7px;min-width:0;}",
  ".power-grid.pcols-1 .power-tile{flex-direction:row;}.power-grid.pcols-1 .power-name{text-align:left;}",
  ".power-grid.pcols-2 .power-tile,.power-grid.pcols-3 .power-tile{flex-direction:column;align-items:center;}",
  ".power-grid.pcols-2 .power-name,.power-grid.pcols-3 .power-name{text-align:center;}",
  ".power-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:10px 8px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:background .15s;min-width:0;overflow:hidden;}",
  ".power-tile:hover{background:rgba(255,255,255,.06);}",
  ".power-arc-wrap{position:relative;flex-shrink:0;width:52px;height:52px;}",
  ".power-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;}",
  ".p-val{font-size:12px;font-weight:600;color:rgba(255,255,255,.9);font-family:'DM Mono',monospace;line-height:1;}",
  ".p-unit{font-size:7px;color:rgba(255,255,255,.35);letter-spacing:.04em;text-transform:uppercase;}",
  ".power-info{min-width:0;overflow:hidden;}",
  ".power-name{font-size:8px;color:rgba(255,255,255,.28);letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
  ".power-subs{display:flex;gap:8px;flex-wrap:wrap;}",
  ".p-sub{display:flex;flex-direction:column;}",
  ".p-sub-val{font-size:9px;font-weight:600;color:rgba(255,255,255,.55);font-family:'DM Mono',monospace;}",
  ".p-sub-lbl{font-size:7px;color:rgba(255,255,255,.2);letter-spacing:.05em;text-transform:uppercase;}",
].join('');

// ── Main Card ───────────────────────────────────────────────────────────────
class MultiPanelDashboardCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass   = null;
    this._built  = false;
  }

  static getConfigElement() { return document.createElement('multi-panel-dashboard-card-editor'); }
  static getStubConfig()    { return getStubConfig(); }

  setConfig(config) {
    this._config = Object.assign({}, getStubConfig(), config);
    this._built  = false;
    this._render();
  }

  set hass(hass) {
    var firstHass = !this._hass;
    this._hass = hass;
    if (!this._built || firstHass) {
      this._render();
    } else {
      this._update();
      this._initStreams();
    }
  }

  _moreInfo(id) {
    if (!id) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: id } }));
  }

  _toggle(id) {
    if (!id || !this._hass) return;
    this._hass.callService('homeassistant', 'toggle', { entity_id: id });
  }

  // Wraps a section in either a plain sec-col div or an accordion
  // accordion=true adds a tappable header that expands/collapses the body
  _wrapSection(id, accordion, defaultOpen, dotColor, label, innerHTML) {
    if (!accordion) {
      return '<div class="sec-col">' +
        '<div class="sec"><span class="sec-dot" style="background:' + dotColor + ';box-shadow:0 0 5px ' + dotColor + '"></span>' + label + '</div>' +
        innerHTML +
        '</div>';
    }
    var open = defaultOpen !== false;
    return '<div class="sec-col acc-section">' +
      '<div class="acc-header" data-acc="' + id + '">' +
        '<span class="acc-title"><span style="width:6px;height:6px;border-radius:50%;background:' + dotColor + ';box-shadow:0 0 5px ' + dotColor + ';display:inline-block;flex-shrink:0"></span>' + label + '</span>' +
        '<span class="acc-arrow' + (open ? ' acc-open' : '') + '" id="acc-arr-' + id + '">▼</span>' +
      '</div>' +
      '<div class="acc-body' + (open ? ' acc-open' : '') + '" id="acc-body-' + id + '">' +
        '<div class="acc-inner">' + innerHTML + '</div>' +
      '</div>' +
    '</div>';
  }

  _buildHTML() {
    var cfg  = this._config;
    var hass = this._hass;

    // Cameras
    var camCols = parseInt(cfg.cameras_columns) || 3;
    var camsHTML = (cfg.cameras || []).map(function(cam, i) {
      var hasEnt = cam.entity && hass && hass.states[cam.entity];
      var icon   = renderIcon(cam.icon || 'camera', 'rgba(255,255,255,.22)', 28);
      return '<div class="cam-tile" data-action="camera" data-entity="' + (cam.entity||'') + '" data-idx="' + i + '">' +
        (hasEnt
          ? '<mpd-cam-stream data-entity="' + cam.entity + '" data-idx="' + i + '"></mpd-cam-stream>'
          : '<div class="cam-placeholder">' + icon + '</div>') +
        '</div>';
    }).join('');

    // Switches
    var swCols = parseInt(cfg.switches_columns) || 2;
    var swHTML = (cfg.switches || []).map(function(sw, i) {
      var state    = stateVal(hass, sw.entity);
      var on       = isOn(state), unavail = isUnavail(state), isMotion = sw.category === 'motion';
      var cls = 'sw-tile' + (unavail ? ' sw-unavail' : isMotion && on ? ' sw-motion' : on ? ' sw-on' : '');
      var icolor = unavail ? 'rgba(255,255,255,.2)' : isMotion && on ? '#ffaa6d' : on ? '#6dbfff' : 'rgba(255,255,255,.4)';
      var scls   = isMotion && on ? 's-motion' : on ? 's-on' : '';
      var stxt   = unavail ? 'N/A' : isMotion ? (on ? 'Detected' : 'Clear') : stateLabel(state);
      return '<div class="' + cls + '" data-action="toggle" data-entity="' + (sw.entity||'') + '" data-idx="' + i + '">' +
        renderIcon(sw.icon || 'switch_icon', icolor, 11) +
        '<span class="sw-name">' + (sw.label||'—') + '</span>' +
        '<span class="sw-state ' + scls + '">' + stxt + '</span>' +
        '</div>';
    }).join('');

    // Sensors
    var sCols = parseInt(cfg.sensors_columns) || 2;
    var sensHTML = (cfg.sensors || []).map(function(s, i) {
      var state = stateVal(hass, s.entity), on = isOn(state), cat = s.category || 'sensor', unavail = isUnavail(state);
      var vcls = 'sensor-val' + (cat==='motion'&&on?' sv-motion':cat==='door'&&on?' sv-open':on?' sv-on':!unavail&&!on?' sv-off':'');
      var icolor = cat==='motion'&&on?'#ff8a6d':cat==='door'&&on?'#ffd26d':on?'#6dbfff':'rgba(255,255,255,.3)';
      var disp = unavail?'—':cat==='motion'?(on?'Motion':'Clear'):cat==='door'?(on?'Open':'Closed'):cat==='light'?(on?'On':'Off'):cat==='person'?(on?'Home':'Away'):stateLabel(state);
      return '<div class="sensor-tile" data-action="more-info" data-entity="' + (s.entity||'') + '" data-idx="' + i + '">' +
        renderIcon(s.icon || CATEGORY_ICON[cat] || 'sensor', icolor, 13) +
        '<div class="sensor-name">' + (s.label||'—') + '</div>' +
        '<div class="' + vcls + '">' + disp + '</div>' +
        '</div>';
    }).join('');

    // Climate gauges
    var gCols = parseInt(cfg.gauges_columns) || 2;
    var gaugesHTML = (cfg.gauges || []).map(function(g, i) {
      var size      = parseInt(g.gauge_size) || 54;
      var tempVal   = stateNum(hass, g.temp_entity), humVal = stateNum(hass, g.humidity_entity);
      var tempTh    = parseTh(g.temp_thresholds, DEFAULT_THRESHOLDS.temperature);
      var humTh     = parseTh(g.hum_thresholds,  DEFAULT_THRESHOLDS.humidity);
      var tempColor = colorFromThresholds(tempVal, tempTh), humColor = colorFromThresholds(humVal, humTh);
      var tempPct   = Math.min(1, Math.max(0, tempVal / 50)), humPct = Math.min(1, Math.max(0, humVal / 100));
      var tempStr   = g.temp_entity     ? tempVal.toFixed(1) + '°C' : '—';
      var humStr    = g.humidity_entity ? humVal.toFixed(1)  + '%'  : '—';
      return '<div class="gauge-tile" data-action="more-info" data-entity="' + (g.temp_entity||'') + '" data-idx="' + i + '">' +
        '<div class="gauge-wrap" style="width:' + size + 'px;height:' + size + 'px">' +
        gaugeSVG(size, tempPct, tempColor, humPct, humColor) +
        '<div class="gauge-center">' +
        '<span class="g-val" id="g-temp-' + i + '" style="color:' + tempColor + '">' + tempStr + '</span>' +
        '<span class="g-sub" id="g-hum-'  + i + '" style="color:' + humColor  + '">' + humStr  + '</span>' +
        '</div></div>' +
        '<div class="g-name">' + (g.label||('Gauge '+(i+1))) + '</div>' +
        '</div>';
    }).join('');

    // Salt
    var saltVal     = stateNum(hass, cfg.salt_entity);
    var saltPct     = (hass && cfg.salt_entity) ? calcSaltPct(hass, cfg) : 0;
    var saltPctDisp = (saltPct * 100).toFixed(1);
    var saltRaw     = stateNum(hass, cfg.salt_entity);
    var saltIsPct   = !cfg.salt_pct_entity && saltRaw > 1;
    var saltPctVal  = cfg.salt_pct_entity ? stateNum(hass, cfg.salt_pct_entity) : (saltIsPct ? saltRaw : parseFloat(saltPctDisp));
    var saltDistVal = !saltIsPct && !cfg.salt_pct_entity && saltRaw > 0 ? saltRaw : null;
    var saltMainDisp = (hass && cfg.salt_entity) ? saltPctVal.toFixed(1) + '%' : '—';
    var saltMetaDisp = (saltDistVal ? saltDistVal.toFixed(2) + ' m · ' : '') + saltPctDisp + '% full';
    var saltTh      = parseTh(cfg.salt_thresholds, DEFAULT_THRESHOLDS.salt);
    var saltColor   = colorFromThresholds(parseFloat(saltPctDisp), saltTh);
    var saltWarn    = parseFloat(saltPctDisp) < (cfg.salt_warn_threshold || 30);
    var saltSize    = 60;
    var saltHTML    = cfg.salt_entity ? (
      '<div class="divider" style="margin:10px 0 8px"></div>' +
      '<div class="sec" style="margin-bottom:8px">' +
        '<span class="sec-dot" style="background:#ffd26d;box-shadow:0 0 5px #ffd26d"></span>' +
        (cfg.label_salt || 'Salt Level') +
      '</div>' +
      '<div class="salt-tile" data-action="more-info" data-entity="' + cfg.salt_entity + '">' +
        '<div class="salt-wrap" style="width:' + saltSize + 'px;height:' + saltSize + 'px">' +
          saltSVG(saltSize, saltPct, saltColor) +
          '<div class="salt-center">' +
            '<span class="s-val">' + (hass && cfg.salt_entity ? saltMainDisp : '—') + '</span>' +
            '<span class="s-pct">' + (saltDistVal !== null && saltDistVal > 0 ? saltDistVal.toFixed(2)+'m' : '') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="salt-info">' +
          '<div class="salt-title">' + (cfg.salt_label || 'Salt Level') + '</div>' +
          '<div class="salt-bar-wrap"><div class="salt-bar" style="width:' + saltPctDisp + '%;background:' + saltColor + '"></div></div>' +
          '<div class="salt-meta">' + saltMetaDisp + '</div>' +
          (saltWarn ? '<div class="salt-warn"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffd26d" stroke-width="2.5" stroke-linecap="round"><path d="' + MDI.warning + '"/></svg>Below ' + (cfg.salt_warn_threshold||30) + '% — buy salt!</div>' : '') +
        '</div>' +
      '</div>'
    ) : '';

    // Power
    var pCols = parseInt(cfg.power_columns) || 2;
    var pSize = pCols >= 2 ? 52 : 60;
    var powerHTML = (cfg.power_circuits || []).map(function(p, i) {
      var watts   = stateNum(hass, p.entity);
      var maxW    = parseFloat(p.max_w) || 3000;
      var pct     = Math.min(1, Math.max(0, watts / maxW));
      var pTh     = parseTh(p.power_thresholds, DEFAULT_THRESHOLDS.power);
      var pcolor  = colorFromThresholds(watts, pTh);
      var energy  = p.energy_entity  ? stateNum(hass, p.energy_entity).toFixed(2)  : null;
      var current = p.current_entity ? stateNum(hass, p.current_entity).toFixed(2) : null;
      var subs = (energy  ? '<div class="p-sub"><div class="p-sub-val">' + energy  + 'kWh</div><div class="p-sub-lbl">Energy</div></div>'  : '') +
                 (current ? '<div class="p-sub"><div class="p-sub-val">' + current + 'A</div><div class="p-sub-lbl">Current</div></div>' : '');
      return '<div class="power-tile" data-action="more-info" data-entity="' + (p.entity||'') + '" data-idx="' + i + '">' +
        '<div class="power-arc-wrap" style="width:' + pSize + 'px;height:' + pSize + 'px">' +
          powerSVG(pSize, pct, pcolor) +
          '<div class="power-center">' +
            '<span class="p-val" style="color:' + pcolor + '">' + Math.round(watts) + '</span>' +
            '<span class="p-unit">W</span>' +
          '</div>' +
        '</div>' +
        '<div class="power-info">' +
          '<div class="power-name">' + (p.label||('Circuit '+(i+1))) + '</div>' +
          '<div class="power-subs">' + subs + '</div>' +
        '</div>' +
        '</div>';
    }).join('');

    // Determine how many bottom columns to show
    var hasSw    = (cfg.switches       || []).length > 0;
    var hasSens  = (cfg.sensors        || []).length > 0;
    var hasClim  = (cfg.gauges         || []).length > 0 || !!cfg.salt_entity;
    var hasPower = (cfg.power_circuits || []).length > 0;
    var bottomCols = [hasSw, hasSens, hasClim, hasPower].filter(Boolean).length || 1;

    var wrapSection = this._wrapSection.bind(this);
    var swSec = hasSw ? wrapSection(
      'sw', cfg.accordion_switches, cfg.accordion_default_open !== false,
      '#ffd26d', cfg.label_switches||'Switches',
      '<div class="sw-grid" style="grid-template-columns:repeat(' + swCols + ',1fr)">' + swHTML + '</div>'
    ) : '';

    var sensSec = hasSens ? wrapSection(
      'sens', cfg.accordion_sensors, cfg.accordion_default_open !== false,
      '#6ddb99', cfg.label_sensors||'Sensors',
      '<div class="sensor-grid scols-' + sCols + '" style="grid-template-columns:repeat(' + sCols + ',1fr)">' + sensHTML + '</div>'
    ) : '';

    var climSec = hasClim ? wrapSection(
      'clim', cfg.accordion_climate, cfg.accordion_default_open !== false,
      '#6ddb99', cfg.label_climate||'Climate',
      ((cfg.gauges||[]).length > 0 ?
        '<div class="gauge-grid gcols-' + gCols + '" style="grid-template-columns:repeat(' + gCols + ',1fr)">' + gaugesHTML + '</div>' : '') +
      saltHTML
    ) : '';

    var powerSec = hasPower ? wrapSection(
      'pwr', cfg.accordion_power, cfg.accordion_default_open !== false,
      '#e07c4f', cfg.label_power||'Power',
      '<div class="power-grid pcols-' + pCols + '" style="grid-template-columns:repeat(' + pCols + ',1fr)">' + powerHTML + '</div>'
    ) : '';

    return '<style>' + STYLES + '</style>' +
      '<div class="mpd-card"><div class="mpd-inner">' +
        '<div class="sec"><span class="sec-dot" style="background:#4fa3e0;box-shadow:0 0 5px #4fa3e0"></span>' + (cfg.label_surveillance||'Surveillance') + '</div>' +
        '<div class="cam-strip" style="grid-template-columns:repeat(' + camCols + ',1fr)">' + camsHTML + '</div>' +
        '<div class="divider"></div>' +
        '<div class="bottom-grid" style="--mpd-cols:' + bottomCols + '">' +
          swSec + sensSec + climSec + powerSec +
        '</div>' +
      '</div></div>';
  }

  _render() {
    this.shadowRoot.innerHTML = this._buildHTML();
    this._attachListeners();
    this._initStreams();
    this._startResizeObserver();
    this._built = true;
  }

  _startResizeObserver() {
    if (this._ro) this._ro.disconnect();
    var inner = this.shadowRoot.querySelector('.mpd-inner');
    if (!inner) return;
    var self = this;
    this._ro = new ResizeObserver(function(entries) {
      var w = entries[0].contentRect.width;
      inner.classList.remove('bp-sm', 'bp-xs');
      if (w < 480)      inner.classList.add('bp-xs');
      else if (w < 900) inner.classList.add('bp-sm');
    });
    this._ro.observe(inner);
  }

  _update() {
    var cfg = this._config, hass = this._hass, sr = this.shadowRoot;

    // Switches
    (cfg.switches || []).forEach(function(sw, i) {
      var tile = sr.querySelector('.sw-tile[data-idx="' + i + '"]'); if (!tile) return;
      var state = stateVal(hass, sw.entity), on = isOn(state), unavail = isUnavail(state), isMotion = sw.category === 'motion';
      tile.className = 'sw-tile' + (unavail?' sw-unavail':isMotion&&on?' sw-motion':on?' sw-on':'');
      var stEl = tile.querySelector('.sw-state'); if (!stEl) return;
      stEl.className   = 'sw-state' + (isMotion&&on?' s-motion':on?' s-on':'');
      stEl.textContent = unavail?'N/A':isMotion?(on?'Detected':'Clear'):stateLabel(state);
    });

    // Sensors
    (cfg.sensors || []).forEach(function(s, i) {
      var tile = sr.querySelector('.sensor-tile[data-idx="' + i + '"]'); if (!tile) return;
      var state = stateVal(hass, s.entity), on = isOn(state), cat = s.category||'sensor', unavail = isUnavail(state);
      var disp = unavail?'—':cat==='motion'?(on?'Motion':'Clear'):cat==='door'?(on?'Open':'Closed'):cat==='light'?(on?'On':'Off'):cat==='person'?(on?'Home':'Away'):stateLabel(state);
      var valEl = tile.querySelector('.sensor-val'); if (!valEl) return;
      valEl.className   = 'sensor-val' + (cat==='motion'&&on?' sv-motion':cat==='door'&&on?' sv-open':on?' sv-on':!unavail&&!on?' sv-off':'');
      valEl.textContent = disp;
    });

    // Gauges — update text AND SVG rings
    (cfg.gauges || []).forEach(function(g, i) {
      var card   = sr.querySelector('.gauge-tile[data-idx="' + i + '"]');
      var tEl    = sr.getElementById('g-temp-' + i), hEl = sr.getElementById('g-hum-' + i);
      var tVal   = stateNum(hass, g.temp_entity), hVal = stateNum(hass, g.humidity_entity);
      var tTh    = parseTh(g.temp_thresholds, DEFAULT_THRESHOLDS.temperature);
      var hTh    = parseTh(g.hum_thresholds,  DEFAULT_THRESHOLDS.humidity);
      var tColor = colorFromThresholds(tVal, tTh), hColor = colorFromThresholds(hVal, hTh);
      var tPct   = Math.min(1, Math.max(0, tVal / 50)), hPct = Math.min(1, Math.max(0, hVal / 100));
      if (tEl) { tEl.textContent = g.temp_entity     ? tVal.toFixed(1)+'°C' : '—'; tEl.style.color = tColor; }
      if (hEl) { hEl.textContent = g.humidity_entity ? hVal.toFixed(1)+'%'  : '—'; hEl.style.color = hColor; }
      if (card) {
        var size = parseInt(g.gauge_size) || 54;
        var r1 = size*0.41, r2 = size*0.32;
        var c1 = 2*Math.PI*r1, c2 = 2*Math.PI*r2;
        var circles = card.querySelectorAll('circle');
        if (circles.length >= 4) {
          circles[1].setAttribute('stroke', tColor);
          circles[1].setAttribute('stroke-dashoffset', (c1*(1-tPct)).toFixed(1));
          circles[1].style.filter = 'drop-shadow(0 0 4px ' + tColor + ')';
          circles[3].setAttribute('stroke', hColor);
          circles[3].setAttribute('stroke-dashoffset', (c2*(1-hPct)).toFixed(1));
          circles[3].style.filter = 'drop-shadow(0 0 3px ' + hColor + ')';
        }
      }
    });

    // Salt
    if (cfg.salt_entity) {
      var saltCard = sr.querySelector('.salt-tile');
      if (saltCard) {
        var saltVal     = stateNum(hass, cfg.salt_entity);
        var saltPct     = calcSaltPct(hass, cfg);
        var saltPctDisp = (saltPct * 100).toFixed(1);
        var saltRaw     = stateNum(hass, cfg.salt_entity);
        var saltIsPct   = !cfg.salt_pct_entity && saltRaw > 1;
        var saltPctVal  = cfg.salt_pct_entity ? stateNum(hass, cfg.salt_pct_entity) : (saltIsPct ? saltRaw : parseFloat(saltPctDisp));
        var saltDistVal = !saltIsPct && !cfg.salt_pct_entity && saltRaw > 0 ? saltRaw : null;
        var saltMainDisp = saltPctVal.toFixed(1) + '%';
        var saltMetaDisp = (saltDistVal ? saltDistVal.toFixed(2) + ' m · ' : '') + saltPctDisp + '% full';
        var saltTh      = parseTh(cfg.salt_thresholds, DEFAULT_THRESHOLDS.salt);
        var saltColor   = colorFromThresholds(parseFloat(saltPctDisp), saltTh);
        var r = 64*0.42, c = 2*Math.PI*r, off = c*(1-saltPct);
        var sVal  = saltCard.querySelector('.s-val');
        var sPct  = saltCard.querySelector('.s-pct');
        var sMeta = saltCard.querySelector('.salt-meta');
        var sBar  = saltCard.querySelector('.salt-bar');
        var sCir  = saltCard.querySelectorAll('circle')[1];
        if (sVal)  sVal.textContent  = saltMainDisp;
        if (sPct)  sPct.textContent  = (saltDistVal !== null && saltDistVal > 0 ? saltDistVal.toFixed(2)+'m' : '');
        if (sMeta) sMeta.textContent = saltMetaDisp;
        if (sBar)  { sBar.style.width = saltPctDisp+'%'; sBar.style.background = saltColor; }
        if (sCir)  { sCir.setAttribute('stroke', saltColor); sCir.setAttribute('stroke-dashoffset', off.toFixed(1)); }
      }
    }

    // Power
    (cfg.power_circuits || []).forEach(function(p, i) {
      var tile  = sr.querySelector('.power-tile[data-idx="' + i + '"]'); if (!tile) return;
      var watts = stateNum(hass, p.entity);
      var maxW  = parseFloat(p.max_w) || 3000;
      var pct   = Math.min(1, Math.max(0, watts / maxW));
      var pTh   = parseTh(p.power_thresholds, DEFAULT_THRESHOLDS.power);
      var pcolor = colorFromThresholds(watts, pTh);
      var pSize = parseInt(cfg.power_columns) >= 2 ? 60 : 68;
      var r = pSize*0.38, full = 2*Math.PI*r, arc = full*0.75, fill = Math.max(0, Math.min(arc, pct*arc));
      var circles = tile.querySelectorAll('circle');
      if (circles.length >= 2) {
        circles[1].setAttribute('stroke', pcolor);
        circles[1].setAttribute('stroke-dasharray', fill.toFixed(1) + ' ' + (full-fill).toFixed(1));
        circles[1].style.filter = 'drop-shadow(0 0 4px ' + pcolor + ')';
      }
      var pVal = tile.querySelector('.p-val');
      if (pVal) { pVal.textContent = Math.round(watts); pVal.style.color = pcolor; }
      if (p.energy_entity || p.current_entity) {
        var subVals = tile.querySelectorAll('.p-sub-val');
        if (p.energy_entity  && subVals[0]) subVals[0].textContent = stateNum(hass, p.energy_entity).toFixed(2)  + 'kWh';
        if (p.current_entity && subVals[1]) subVals[1].textContent = stateNum(hass, p.current_entity).toFixed(2) + 'A';
      }
    });
  }

  // Camera stream init — UNCHANGED (working)
  _initStreams() {
    if (!this._hass) return;
    var cfg  = this._config, hass = this._hass, sr = this.shadowRoot;
    var doInit = function() {
      sr.querySelectorAll('mpd-cam-stream').forEach(function(el) {
        var idx      = parseInt(el.dataset.idx);
        var cam      = (cfg.cameras || [])[idx] || {};
        var entityId = el.dataset.entity || cam.entity || '';
        var stateObj = hass.states[entityId];
        if (!stateObj) return;
        el.hass     = hass;
        el.stateObj = stateObj;
        el.label    = cam.label || entityId;
        el.entityId = entityId;
      });
    };
    if (customElements.get('mpd-cam-stream')) {
      setTimeout(doInit, 50);
    } else {
      customElements.whenDefined('mpd-cam-stream').then(function() { setTimeout(doInit, 50); });
    }
  }

  _attachListeners() {
    // Accordion toggles
    this.shadowRoot.querySelectorAll('[data-acc]').forEach(function(el) {
      el.addEventListener('click', function() {
        var id   = el.dataset.acc;
        var body = el.parentNode.querySelector('#acc-body-' + id);
        var arr  = el.parentNode.querySelector('#acc-arr-'  + id);
        if (body) body.classList.toggle('acc-open');
        if (arr)  arr.classList.toggle('acc-open');
      });
    });
    this.shadowRoot.querySelectorAll('[data-action]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        var action = el.dataset.action, entity = el.dataset.entity;
        if (!entity || entity === 'undefined' || entity === '') return;
        if (action === 'toggle') {
          if (this._hass) this._hass.callService('homeassistant', 'toggle', { entity_id: entity });
        } else {
          this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: entity } }));
        }
      }.bind(this));
    }.bind(this));
  }

  getCardSize() { return 10; }
}

// ── Editor ───────────────────────────────────────────────────────────────────
class MultiPanelDashboardCardEditor extends LitElement {
  static get properties() {
    return { hass: {}, _config: { state: true }, _search: { state: true }, _tab: { state: true } };
  }

  constructor() { super(); this._search = {}; this._tab = 'cameras'; }

  setConfig(config) { this._config = Object.assign({}, getStubConfig(), config); }

  _fire() {
    var ev = new Event('config-changed', { bubbles: true, composed: true });
    ev.detail = { config: this._config };
    this.dispatchEvent(ev);
  }

  _set(k, v)              { this._config = Object.assign({}, this._config, { [k]: v }); this._fire(); }
  _addItem(k, d)          { var a = (this._config[k]||[]).concat([d]); this._set(k, a); }
  _removeItem(k, i)       { var a = (this._config[k]||[]).slice(); a.splice(i,1); this._set(k,a); }
  _updateItem(k, i, f, v) { var a = (this._config[k]||[]).slice(); a[i] = Object.assign({},a[i],{[f]:v}); this._set(k,a); }

  _entitySearch(sk, cur, onChange, domains, ph) {
    var self = this;
    var all  = this.hass ? Object.keys(this.hass.states).sort() : [];
    var filt = domains && domains.length ? all.filter(function(id){ return domains.some(function(d){ return id.startsWith(d+'.'); }); }) : all;
    var q    = ((this._search||{})[sk]||'').toLowerCase().trim();
    var res  = q ? filt.filter(function(e){ return e.toLowerCase().includes(q); }) : filt;
    var lbl  = function(eid) {
      var fn = self.hass && self.hass.states[eid] && self.hass.states[eid].attributes && self.hass.states[eid].attributes.friendly_name;
      return fn ? fn + '  (' + eid + ')' : eid;
    };
    return html`
      <div class="sw">
        <input class="ei si" type="text" placeholder="Search entities..."
          .value="${(this._search||{})[sk]||''}"
          @input="${function(e){ self._search = Object.assign({},self._search,{[sk]:e.target.value}); }}" />
        <select class="es" @change="${function(e){ onChange(e.target.value); self._search = Object.assign({},self._search,{[sk]:''}); }}">
          <option value="">${ph||'— select entity —'}</option>
          ${res.slice(0,200).map(function(eid){ return html`<option value="${eid}" ?selected="${eid===cur}">${lbl(eid)}</option>`; })}
          ${res.length>200 ? html`<option disabled>...${res.length-200} more — refine search</option>` : ''}
        </select>
        ${cur ? html`<div class="sb">${cur}</div>` : ''}
      </div>`;
  }

  _txt(lbl, v, onChange, ph) {
    return html`<label class="el">${lbl}</label><input class="ei" type="text" .value="${v||''}" placeholder="${ph||''}" @input="${function(e){onChange(e.target.value);}}" />`;
  }
  _toggle(lbl, v, onChange) {
    return html`<div class="trow"><span class="el" style="margin:0">${lbl}</span><label class="tgl"><input type="checkbox" ?checked="${!!v}" @change="${function(e){onChange(e.target.checked);}}"/><span class="tslider"></span></label></div>`;
  }

  _num(lbl, v, onChange, ph) {
    return html`<label class="el">${lbl}</label><input class="ei" type="number" .value="${v!==undefined&&v!==null?String(v):''}" placeholder="${ph||''}" @input="${function(e){onChange(e.target.value);}}" />`;
  }

  _tabCameras() {
    var cfg = this._config, self = this, items = cfg.cameras||[];
    return html`
      <div class="section"><div class="st">Camera grid</div>${this._num('Columns', cfg.cameras_columns, function(v){self._set('cameras_columns',parseInt(v)||3);}, '3')}</div>
      <div class="section"><div class="st">Cameras</div>
        ${items.map(function(cam,i){ return html`
          <div class="li">
            <div class="lh"><span class="ln">Camera ${i+1}</span><button class="br" @click="${function(){self._removeItem('cameras',i);}}">Remove</button></div>
            <label class="el">Camera entity</label>
            ${self._entitySearch('cam_'+i, cam.entity, function(v){self._updateItem('cameras',i,'entity',v);}, ['camera'], '— select camera —')}
            ${self._txt('Label', cam.label, function(v){self._updateItem('cameras',i,'label',v);}, 'Camera name')}
            ${self._txt('Icon key', cam.icon, function(v){self._updateItem('cameras',i,'icon',v);}, 'camera')}
          </div>`; })}
        <button class="ba" @click="${function(){self._addItem('cameras',{entity:'',label:'',icon:'camera'});}}">+ Add Camera</button>
      </div>`;
  }

  _tabSwitches() {
    var cfg = this._config, self = this, items = cfg.switches||[];
    return html`
      <div class="section"><div class="st">Switch grid</div>${this._num('Columns', cfg.switches_columns, function(v){self._set('switches_columns',parseInt(v)||2);}, '2')}</div>
      <div class="section"><div class="st">Switches</div>
        <p class="hint">Category: switch, motion, light, door, person</p>
        ${items.map(function(sw,i){ return html`
          <div class="li">
            <div class="lh"><span class="ln">Switch ${i+1}</span><button class="br" @click="${function(){self._removeItem('switches',i);}}">Remove</button></div>
            <label class="el">Entity</label>
            ${self._entitySearch('sw_'+i, sw.entity, function(v){self._updateItem('switches',i,'entity',v);}, ['switch','light','input_boolean','fan','automation','binary_sensor'], '— select entity —')}
            ${self._txt('Label', sw.label, function(v){self._updateItem('switches',i,'label',v);}, 'Switch name')}
            ${self._txt('Icon key', sw.icon, function(v){self._updateItem('switches',i,'icon',v);}, 'switch_icon')}
            ${self._txt('Category', sw.category, function(v){self._updateItem('switches',i,'category',v);}, 'switch / motion / light / door / person')}
          </div>`; })}
        <button class="ba" @click="${function(){self._addItem('switches',{entity:'',label:'',icon:'switch_icon',category:'switch'});}}">+ Add Switch</button>
      </div>`;
  }

  _tabSensors() {
    var cfg = this._config, self = this, items = cfg.sensors||[];
    return html`
      <div class="section"><div class="st">Sensor grid</div>
        ${this._num('Columns', cfg.sensors_columns, function(v){self._set('sensors_columns',parseInt(v)||2);}, '2')}
        <p class="hint">1 col = row layout. 2-4 cols = compact tiles.</p>
      </div>
      <div class="section"><div class="st">Sensors</div>
        ${items.map(function(s,i){ return html`
          <div class="li">
            <div class="lh"><span class="ln">Sensor ${i+1}</span><button class="br" @click="${function(){self._removeItem('sensors',i);}}">Remove</button></div>
            <label class="el">Entity</label>
            ${self._entitySearch('s_'+i, s.entity, function(v){self._updateItem('sensors',i,'entity',v);}, ['binary_sensor','sensor','input_boolean','switch','light'], '— select entity —')}
            ${self._txt('Label', s.label, function(v){self._updateItem('sensors',i,'label',v);}, 'Sensor name')}
            ${self._txt('Icon key', s.icon, function(v){self._updateItem('sensors',i,'icon',v);}, 'sensor')}
            ${self._txt('Category', s.category, function(v){self._updateItem('sensors',i,'category',v);}, 'door / motion / light / person / sensor')}
          </div>`; })}
        <button class="ba" @click="${function(){self._addItem('sensors',{entity:'',label:'',icon:'sensor',category:'sensor'});}}">+ Add Sensor</button>
      </div>`;
  }

  _tabClimate() {
    var cfg = this._config, self = this, items = cfg.gauges||[];
    return html`
      <div class="section"><div class="st">Climate grid</div>
        ${this._num('Columns', cfg.gauges_columns, function(v){self._set('gauges_columns',parseInt(v)||2);}, '2')}
        <p class="hint">1 col = horizontal row. 2-3 cols = centered tile.</p>
      </div>
      <div class="section"><div class="st">Climate Gauges</div>
        ${items.map(function(g,i){ return html`
          <div class="li">
            <div class="lh"><span class="ln">Gauge ${i+1}</span><button class="br" @click="${function(){self._removeItem('gauges',i);}}">Remove</button></div>
            <label class="el">Temperature entity</label>
            ${self._entitySearch('gt_'+i, g.temp_entity, function(v){self._updateItem('gauges',i,'temp_entity',v);}, ['sensor'], '— select temp sensor —')}
            <label class="el">Humidity entity</label>
            ${self._entitySearch('gh_'+i, g.humidity_entity, function(v){self._updateItem('gauges',i,'humidity_entity',v);}, ['sensor'], '— select humidity sensor —')}
            ${self._txt('Label', g.label, function(v){self._updateItem('gauges',i,'label',v);}, 'Room name')}
            ${self._num('Gauge size (px)', g.gauge_size, function(v){self._updateItem('gauges',i,'gauge_size',parseInt(v)||54);}, '54')}
            <label class="el">Temp thresholds (JSON)</label>
            <input class="ei mono" type="text" .value="${g.temp_thresholds||''}" placeholder='[{"max":25,"color":"#6ddb99"},...]' @change="${function(e){self._updateItem('gauges',i,'temp_thresholds',e.target.value);}}" />
            <label class="el">Humidity thresholds (JSON)</label>
            <input class="ei mono" type="text" .value="${g.hum_thresholds||''}" placeholder='[{"max":60,"color":"#6ddb99"},...]' @change="${function(e){self._updateItem('gauges',i,'hum_thresholds',e.target.value);}}" />
          </div>`; })}
        <button class="ba" @click="${function(){self._addItem('gauges',{temp_entity:'',humidity_entity:'',label:'',temp_thresholds:JSON.stringify(DEFAULT_THRESHOLDS.temperature),hum_thresholds:JSON.stringify(DEFAULT_THRESHOLDS.humidity),gauge_size:54});}}">+ Add Gauge</button>
      </div>`;
  }

  _tabSalt() {
    var cfg = this._config, self = this;
    return html`
      <div class="section"><div class="st">Salt Level</div>
        <p class="hint">Provide a % entity, OR a max entity/value to compute % from distance.</p>
        <label class="el">Salt distance entity</label>
        ${this._entitySearch('salt_ent', cfg.salt_entity, function(v){self._set('salt_entity',v);}, ['sensor'], '— select salt sensor —')}
        <label class="el">Salt % entity (optional)</label>
        ${this._entitySearch('salt_pct', cfg.salt_pct_entity, function(v){self._set('salt_pct_entity',v);}, ['sensor'], '— select % sensor —')}
        <label class="el">Salt max entity (optional — distance at 100%)</label>
        ${this._entitySearch('salt_max', cfg.salt_max_entity, function(v){self._set('salt_max_entity',v);}, ['sensor'], '— select max sensor —')}
        ${this._txt('Salt max value (fixed, e.g. 0.31)', cfg.salt_max_value, function(v){self._set('salt_max_value',v);}, 'e.g. 0.31')}
        ${this._txt('Label', cfg.salt_label, function(v){self._set('salt_label',v);}, 'Salt Level')}
        ${this._num('Warn below (%)', cfg.salt_warn_threshold, function(v){self._set('salt_warn_threshold',parseFloat(v)||30);}, '30')}
        <label class="el">Thresholds (JSON)</label>
        <input class="ei mono" type="text" .value="${cfg.salt_thresholds||''}" placeholder='[{"max":30,"color":"#e05050"},...]' @change="${function(e){self._set('salt_thresholds',e.target.value);}}" />
      </div>`;
  }

  _tabPower() {
    var cfg = this._config, self = this, items = cfg.power_circuits||[];
    return html`
      <div class="section"><div class="st">Power grid</div>
        ${this._num('Columns', cfg.power_columns, function(v){self._set('power_columns',parseInt(v)||2);}, '2')}
        <p class="hint">1 col = horizontal with energy+current. 2-3 cols = centered arc tile.</p>
      </div>
      <div class="section"><div class="st">Power Circuits</div>
        ${items.map(function(p,i){ return html`
          <div class="li">
            <div class="lh"><span class="ln">Circuit ${i+1}</span><button class="br" @click="${function(){self._removeItem('power_circuits',i);}}">Remove</button></div>
            <label class="el">Power entity (W)</label>
            ${self._entitySearch('pw_'+i, p.entity, function(v){self._updateItem('power_circuits',i,'entity',v);}, ['sensor'], '— select power sensor —')}
            <label class="el">Energy entity (kWh) — optional</label>
            ${self._entitySearch('pe_'+i, p.energy_entity, function(v){self._updateItem('power_circuits',i,'energy_entity',v);}, ['sensor'], '— select energy sensor —')}
            <label class="el">Current entity (A) — optional</label>
            ${self._entitySearch('pc_'+i, p.current_entity, function(v){self._updateItem('power_circuits',i,'current_entity',v);}, ['sensor'], '— select current sensor —')}
            ${self._txt('Label', p.label, function(v){self._updateItem('power_circuits',i,'label',v);}, 'Circuit name')}
            ${self._num('Max watts', p.max_w, function(v){self._updateItem('power_circuits',i,'max_w',parseFloat(v)||3000);}, '3000')}
          </div>`; })}
        <button class="ba" @click="${function(){self._addItem('power_circuits',{entity:'',label:'',energy_entity:'',current_entity:'',max_w:3000});}}">+ Add Circuit</button>
      </div>`;
  }

  _tabLabels() {
    var cfg = this._config, self = this;
    return html`
      <div class="section"><div class="st">Section Labels</div>
        ${this._txt('Surveillance', cfg.label_surveillance, function(v){self._set('label_surveillance',v);}, 'Surveillance')}
        ${this._txt('Switches',     cfg.label_switches,     function(v){self._set('label_switches',v);},     'Switches')}
        ${this._txt('Sensors',      cfg.label_sensors,      function(v){self._set('label_sensors',v);},      'Sensors')}
        ${this._txt('Climate',      cfg.label_climate,      function(v){self._set('label_climate',v);},      'Climate')}
        ${this._txt('Salt',         cfg.label_salt,         function(v){self._set('label_salt',v);},         'Salt Level')}
        ${this._txt('Power',        cfg.label_power,        function(v){self._set('label_power',v);},        'Power')}
      </div>
      <div class="section"><div class="st">Accordion (collapsible sections)</div>
        <p class="hint">Enable accordion per section — shows a tap-to-expand header instead of always-visible content. Useful on mobile to save space.</p>
        ${this._toggle('Accordion: Switches', cfg.accordion_switches, function(v){self._set('accordion_switches',v);})}
        ${this._toggle('Accordion: Sensors',  cfg.accordion_sensors,  function(v){self._set('accordion_sensors',v);})}
        ${this._toggle('Accordion: Climate',  cfg.accordion_climate,  function(v){self._set('accordion_climate',v);})}
        ${this._toggle('Accordion: Power',    cfg.accordion_power,    function(v){self._set('accordion_power',v);})}
        ${this._toggle('Default: expanded',   cfg.accordion_default_open !== false, function(v){self._set('accordion_default_open',v);})}
      </div>`;
  }

  render() {
    if (!this._config) return html``;
    var self = this;
    var tabs = [
      {id:'cameras',label:'Cameras'},{id:'switches',label:'Switches'},{id:'sensors',label:'Sensors'},
      {id:'climate',label:'Climate'},{id:'salt',label:'Salt'},{id:'power',label:'Power'},{id:'labels',label:'Labels'},
    ];
    return html`
      <div class="er">
        <div class="tb">${tabs.map(function(t){ return html`<button class="tab ${self._tab===t.id?'active':''}" @click="${function(){self._tab=t.id;}}">${t.label}</button>`; })}</div>
        <div class="tc">
          ${this._tab==='cameras'  ? this._tabCameras()  : ''}
          ${this._tab==='switches' ? this._tabSwitches() : ''}
          ${this._tab==='sensors'  ? this._tabSensors()  : ''}
          ${this._tab==='climate'  ? this._tabClimate()  : ''}
          ${this._tab==='salt'     ? this._tabSalt()     : ''}
          ${this._tab==='power'    ? this._tabPower()    : ''}
          ${this._tab==='labels'   ? this._tabLabels()   : ''}
        </div>
      </div>`;
  }

  static get styles() {
    return css`
      :host{display:block;font-family:'Segoe UI',system-ui,sans-serif;}
      .er{display:flex;flex-direction:column;}
      .tb{display:flex;flex-wrap:wrap;border-bottom:1px solid rgba(0,0,0,.15);background:var(--card-background-color,#1e293b);border-radius:8px 8px 0 0;}
      .tab{flex:1;min-width:55px;padding:8px 4px;font-size:.68rem;font-weight:600;letter-spacing:.04em;border:none;background:transparent;color:var(--secondary-text-color,#94a3b8);cursor:pointer;text-transform:uppercase;}
      .tab.active{color:var(--primary-color,#4fa3e0);border-bottom:2px solid var(--primary-color,#4fa3e0);background:rgba(79,163,224,.06);}
      .tc{padding:12px 4px;display:flex;flex-direction:column;gap:4px;}
      .section{margin-bottom:10px;}
      .st{font-size:.76rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--primary-color,#4fa3e0);margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid rgba(79,163,224,.2);}
      .hint{font-size:.7rem;color:var(--secondary-text-color,#94a3b8);margin:0 0 8px;line-height:1.5;}
      .el{display:block;font-size:.68rem;font-weight:600;color:var(--secondary-text-color,#64748b);margin-bottom:3px;margin-top:6px;text-transform:uppercase;letter-spacing:.05em;}
      .ei{width:100%;padding:7px 10px;font-size:.8rem;border:1px solid var(--divider-color,#334155);border-radius:6px;background:var(--secondary-background-color,#0f172a);color:var(--primary-text-color,#e2e8f0);box-sizing:border-box;}
      .ei:focus{outline:none;border-color:var(--primary-color,#4fa3e0);}
      .ei.mono{font-family:monospace;font-size:.7rem;}
      .es{width:100%;padding:7px 10px;font-size:.8rem;border:1px solid var(--divider-color,#334155);border-radius:6px;background:var(--secondary-background-color,#0f172a);color:var(--primary-text-color,#e2e8f0);box-sizing:border-box;cursor:pointer;margin-top:4px;}
      .sw{display:flex;flex-direction:column;gap:4px;margin-bottom:4px;}
      .si{margin-bottom:0;}
      .sb{font-size:.65rem;color:var(--primary-color,#4fa3e0);background:rgba(79,163,224,.1);border-radius:4px;padding:2px 6px;word-break:break-all;}
      .li{background:var(--secondary-background-color,rgba(0,0,0,.2));border:1px solid var(--divider-color,#334155);border-radius:8px;padding:10px;margin-bottom:8px;}
      .lh{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;}
      .ln{font-size:.7rem;font-weight:700;color:var(--primary-color,#4fa3e0);text-transform:uppercase;letter-spacing:.06em;}
      .ba{width:100%;padding:8px;font-size:.76rem;font-weight:600;border:1px dashed var(--primary-color,#4fa3e0);border-radius:6px;background:transparent;color:var(--primary-color,#4fa3e0);cursor:pointer;}
      .ba:hover{background:rgba(79,163,224,.08);}
      .br{padding:3px 8px;font-size:.68rem;border:1px solid #ef4444;border-radius:4px;background:transparent;color:#ef4444;cursor:pointer;}
      .br:hover{background:rgba(239,68,68,.1);}
      .trow{display:flex;align-items:center;justify-content:space-between;padding:7px 0;}
      .tgl{position:relative;display:inline-block;width:38px;height:21px;flex-shrink:0;}
      .tgl input{display:none;}
      .tslider{position:absolute;inset:0;background:#334155;border-radius:11px;cursor:pointer;transition:background .2s;}
      .tslider::before{content:'';position:absolute;left:3px;top:3px;width:15px;height:15px;background:white;border-radius:50%;transition:transform .2s;}
      .tgl input:checked + .tslider{background:var(--primary-color,#4fa3e0);}
      .tgl input:checked + .tslider::before{transform:translateX(17px);}
    `;
  }
}

// ── MpdCamStream — verbatim copy of RoomCardStream (working) ─────────────────
class MpdCamStream extends LitElement {
  static get properties() {
    return { hass: {}, stateObj: {}, label: {}, entityId: {} };
  }

  _fireMoreInfo() {
    if (!this.entityId) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true, detail: { entityId: this.entityId },
    }));
  }

  updated(changedProps) {
    if (!changedProps.has('stateObj') && !changedProps.has('hass')) return;
    var stream = this.shadowRoot.querySelector('ha-camera-stream');
    if (!stream) return;
    if (stream._rcLastStateObj === this.stateObj && stream._rcLastHass === this.hass) return;
    stream._rcLastStateObj = this.stateObj;
    stream._rcLastHass     = this.hass;
    stream.hass     = this.hass;
    stream.stateObj = this.stateObj;
    if (typeof stream.requestUpdate === 'function') stream.requestUpdate();
  }

  render() {
    if (!this.stateObj) return html``;
    var self = this;
    return html`
      <div class="stream-wrap" @click="${function(){self._fireMoreInfo();}}">
        <ha-camera-stream allow-exoplayer muted playsinline></ha-camera-stream>
    
      </div>`;
  }

  static get styles() {
    return css`
      :host{display:block;}
      .stream-wrap{position:relative;border-radius:11px;overflow:hidden;background:#0a0e1a;border:1px solid rgba(255,255,255,.08);min-height:90px;cursor:pointer;}
      ha-camera-stream{width:100%;display:block;max-height:350px;object-fit:cover;--video-border-radius:0;}
      
      .stream-fs-btn:active{transform:scale(.92);}
    `;
  }
}

// ── Register ─────────────────────────────────────────────────────────────────
customElements.define('mpd-cam-stream', MpdCamStream);
customElements.define('multi-panel-dashboard-card', MultiPanelDashboardCard);
customElements.define('multi-panel-dashboard-card-editor', MultiPanelDashboardCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type:             'multi-panel-dashboard-card',
  name:             'Multi-Panel Dashboard Card',
  description:      'Unified card: cameras + switches + sensors + climate + salt + power — Samsung Premium style',
  preview:          true,
  documentationURL: 'https://github.com/robman2026/multi-panel-dashboard-card',
});

console.info(
  '%c MULTI-PANEL-DASHBOARD-CARD %c v' + CARD_VERSION + ' ',
  'background:#4fa3e0;color:#fff;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;',
  'background:#181c27;color:#6dbfff;font-weight:600;padding:2px 6px;border-radius:0 4px 4px 0;'
);
