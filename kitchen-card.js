/**
 * Kitchen Dashboard Card
 * Power-first layout with Appliances, Lights, Climate gauges, and Sensors
 * Author: robman2026
 * GitHub: https://github.com/robman2026/Multi-panel-dashboard-card
 * Version: 1.0.0
 * License: MIT
 *
 * Sections (top → bottom):
 *  1. Header (title, icon, date/time, status dot)
 *  2. Power  — total + sub-circuits (arc gauges, kWh, current) [FEATURED]
 *  3. Appliances — configurable list with optional temp gauge (oven, dishwasher, etc.)
 *  4. Lights — toggle tiles (switch/light entities)
 *  5. Climate gauges — temp + humidity circular gauges
 *  6. Sensors — motion, door, illuminance, occupancy etc.
 */

const CARD_VERSION = "1.0.0";

// ── LitElement bootstrap (same pattern as all robman2026 cards) ──────────────
const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const { html, css } = LitElement.prototype;

// ════════════════════════════════════════════════════════════════════════════
// Inline MDI paths
// ════════════════════════════════════════════════════════════════════════════
const MDI = {
  kitchen:     'M6 2v20h12V2H6zm10 16H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V8h8v2zm0-4H8V4h8v2z',
  bolt:        'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  thermometer: 'M15 13V5a3 3 0 00-6 0v8a5 5 0 106 0zm-3 7a3 3 0 110-6 3 3 0 010 6z',
  water:       'M12 2c-5.33 4.55-8 8.48-8 11.8a8 8 0 0016 0c0-3.32-2.67-7.25-8-11.8z',
  bulb:        'M9 21h6m-3-3v3M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6 6 0 016 9a6 6 0 016-6z',
  motion:      'M13.5 5.5a2 2 0 11-4 0 2 2 0 014 0zM10 21l1.5-8-2.5 1v4h-2v-5.5l5-2.5c.75-.3 1.6-.1 2.15.45L16.5 13l3 1v2l-4-1-3-3-1 4h2l4 5h-2l-3.5-4.5L10 21z',
  door:        'M8 3h8a2 2 0 012 2v16H6V5a2 2 0 012-2zm4 9a1 1 0 100-2 1 1 0 000 2z',
  sensor:      'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 4a6 6 0 016 6 6 6 0 01-6 6 6 6 0 01-6-6 6 6 0 016-6z',
  switch_icon: 'M17 6H7c-3.31 0-6 2.69-6 6s2.69 6 6 6h10c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 10a4 4 0 010-8 4 4 0 010 8z',
  person:      'M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z',
  oven:        'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm1 3v8h14V7H5zm9 1a1 1 0 011 1v6a1 1 0 01-2 0V9a1 1 0 011-1zm-4 0a1 1 0 011 1v6a1 1 0 01-2 0V9a1 1 0 011-1zm-4 0h2v2H6V8z',
  dishwasher:  'M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v14h14V5H5zm2 2h10v2H7V7zm0 4h4v2H7v-2z',
  appliance:   'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm1 3v3h12V6H6zm0 5v6h5v-6H6zm7 0v6h5v-6h-5z',
  warning:     'M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6zm-1 4v5h2v-5h-2zm0 6v2h2v-2h-2z',
};

function mdiSVG(name, color, size) {
  color = color || 'rgba(255,255,255,.38)';
  size  = size  || 18;
  const path = MDI[name] || MDI.sensor;
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="' + path + '"/></svg>';
}

function renderIcon(iconName, color, size) {
  if (!iconName) return mdiSVG('sensor', color, size);
  size  = size  || 18;
  color = color || 'rgba(255,255,255,.38)';
  if (iconName.includes(':')) {
    return '<ha-icon icon="' + iconName + '" style="color:' + color + ';--mdc-icon-size:' + size + 'px;display:inline-flex;align-items:center;justify-content:center;width:' + size + 'px;height:' + size + 'px;"></ha-icon>';
  }
  if (MDI[iconName]) return mdiSVG(iconName, color, size);
  return '<ha-icon icon="mdi:' + iconName + '" style="color:' + color + ';--mdc-icon-size:' + size + 'px;display:inline-flex;align-items:center;justify-content:center;width:' + size + 'px;height:' + size + 'px;"></ha-icon>';
}

// ════════════════════════════════════════════════════════════════════════════
// Motion detection
// ════════════════════════════════════════════════════════════════════════════
const MOTION_DC     = ["motion", "occupancy", "presence", "moving"];
const MOTION_ACTIVE = ["on", "detected", "occupied", "home", "moving"];

function isMotionSensor(entityId, deviceClass) {
  if (!entityId) return false;
  if (MOTION_DC.includes((deviceClass || "").toLowerCase())) return true;
  const id = entityId.toLowerCase();
  return id.includes("motion") || id.includes("presence") || id.includes("occupancy") || id.includes("movement");
}

// ════════════════════════════════════════════════════════════════════════════
// Threshold helpers
// ════════════════════════════════════════════════════════════════════════════
function colorFromThresholds(value, thresholds) {
  if (!thresholds || !thresholds.length) return '#4fa3e0';
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i].max) return thresholds[i].color;
  }
  return thresholds[thresholds.length - 1].color;
}
function parseTh(raw, fallback) {
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch (e) { return fallback; }
}

const TH = {
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
  power: [
    { max: 0,    color: 'rgba(255,255,255,.15)' },
    { max: 500,  color: '#6ddb99' },
    { max: 1500, color: '#e0b44f' },
    { max: 9999, color: '#e05050' },
  ],
  // Appliance temperature (oven: cold → warm → hot)
  applianceTemp: [
    { max: 40,  color: '#4fa3e0' },
    { max: 100, color: '#e0b44f' },
    { max: 250, color: '#e0804f' },
    { max: 999, color: '#e05050' },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// State helpers
// ════════════════════════════════════════════════════════════════════════════
function stateVal(hass, id)  { if (!id || !hass) return null; const e = hass.states[id]; return e ? e.state : null; }
function stateNum(hass, id)  { const v = stateVal(hass, id); return v !== null ? (parseFloat(v) || 0) : 0; }
function stateAttr(hass, id, attr) { if (!id || !hass) return undefined; const e = hass.states[id]; return e ? e.attributes[attr] : undefined; }
function isOn(s)      { return s === 'on' || s === 'true' || s === 'home' || s === 'open'; }
function isUnavail(s) { return !s || s === 'unavailable' || s === 'unknown'; }
function stateLabel(s){ if (!s || isUnavail(s)) return '—'; return s.charAt(0).toUpperCase() + s.slice(1); }

function agoStr(lastChanged) {
  if (!lastChanged) return "";
  const diff = Math.floor((Date.now() - new Date(lastChanged).getTime()) / 1000);
  if (diff < 60)    return diff + "s ago";
  if (diff < 3600)  return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

// ════════════════════════════════════════════════════════════════════════════
// SVG builders
// ════════════════════════════════════════════════════════════════════════════

// Power arc gauge (270° sweep, bottom-open)
function powerSVG(size, pct, color) {
  const r    = size * 0.38;
  const cx   = size / 2;
  const full = 2 * Math.PI * r;
  const arc  = full * 0.75;
  const fill = Math.max(0, Math.min(arc, pct * arc));
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="transform:rotate(-135deg);overflow:visible;display:block">' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="4" stroke-dasharray="' + arc.toFixed(1) + ' ' + (full - arc).toFixed(1) + '" stroke-linecap="round"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="4" stroke-dasharray="' + fill.toFixed(1) + ' ' + (full - fill).toFixed(1) + '" stroke-linecap="round" style="filter:drop-shadow(0 0 4px ' + color + ')"/>' +
    '</svg>';
}

// Dual-ring climate gauge (outer = temp, inner = humidity)
function climateSVG(size, outerPct, outerColor, innerPct, innerColor) {
  const r1 = size * 0.41, r2 = size * 0.32, cx = size / 2;
  const c1 = 2 * Math.PI * r1, c2 = 2 * Math.PI * r2;
  const o1 = c1 * (1 - Math.max(0, Math.min(1, outerPct)));
  const o2 = c2 * (1 - Math.max(0, Math.min(1, innerPct)));
  const oc = outerColor || '#4fa3e0', ic = innerColor || '#6ddb99';
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="overflow:visible;display:block">' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r1 + '" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="3.5"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r1 + '" fill="none" stroke="' + oc + '" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="' + c1.toFixed(1) + '" stroke-dashoffset="' + o1.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cx + ')" style="filter:drop-shadow(0 0 4px ' + oc + ')"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r2 + '" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="2.5"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r2 + '" fill="none" stroke="' + ic + '" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="' + c2.toFixed(1) + '" stroke-dashoffset="' + o2.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cx + ')" style="filter:drop-shadow(0 0 3px ' + ic + ')" opacity="0.7"/>' +
    '</svg>';
}

// Single-ring appliance temp gauge
function applTempSVG(size, pct, color) {
  const r  = size * 0.41;
  const cx = size / 2;
  const c  = 2 * Math.PI * r;
  const o  = c * (1 - Math.max(0, Math.min(1, pct)));
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="overflow:visible;display:block">' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="3.5"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + o.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cx + ')" style="filter:drop-shadow(0 0 4px ' + color + ')"/>' +
    '</svg>';
}

// ════════════════════════════════════════════════════════════════════════════
// Default / stub config
// ════════════════════════════════════════════════════════════════════════════
function getStubConfig() {
  return {
    // Header
    card_title:      'Kitchen',
    card_icon:       'mdi:chef-hat',
    title_position:  'left',
    show_datetime:   true,
    show_status_dot: false,
    status_entity:   '',

    // Section labels (all user-configurable)
    label_power:      'Power',
    label_appliances: 'Appliances',
    label_lights:     'Lights',
    label_climate:    'Climate',
    label_sensors:    'Sensors',

    // Power circuits — first one is the "total", rest are sub-circuits
    power_circuits: [],
    power_columns:  2,
    power_max_w:    5000,

    // Appliances — each can have a state entity + optional temp entity
    appliances:         [],
    appliances_columns: 1,

    // Lights — switch/light toggles
    lights:         [],
    lights_columns: 2,

    // Climate gauges
    gauges:         [],
    gauges_columns: 2,

    // Sensors — binary sensors, numeric, etc.
    sensors:         [],
    sensors_columns: 1,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// CSS
// ════════════════════════════════════════════════════════════════════════════
const CARD_CSS = [
  // Base
  "ha-card{background:transparent!important;box-shadow:none!important;border:none!important;border-radius:0!important;}",
  ":host{display:block;font-family:'Segoe UI',system-ui,sans-serif;}",
  "*{box-sizing:border-box;margin:0;padding:0;}",
  ".kc-card{background:linear-gradient(145deg,#1a1f35,#0f1628,#141929);border-radius:16px;border:1px solid rgba(99,179,237,0.15);box-shadow:0 0 0 1px rgba(255,255,255,0.04),0 8px 32px rgba(0,0,0,0.6),0 0 60px rgba(99,179,237,0.05);padding:18px;position:relative;overflow:hidden;}",
  ".kc-card::before{content:'';position:absolute;width:280px;height:280px;border-radius:50%;top:-100px;right:-60px;background:#e07c4f;filter:blur(80px);opacity:.05;pointer-events:none;}",
  ".kc-inner{width:100%;position:relative;z-index:1;}",

  // Header
  ".kc-header{display:flex;align-items:center;gap:10px;padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,.05);position:relative;}",
  ".kc-header.pos-left{justify-content:space-between;}",
  ".kc-header.pos-center{justify-content:space-between;}",
  ".kc-header.pos-center .kc-title-wrap{position:absolute;left:50%;transform:translateX(-50%);}",
  ".kc-title-wrap{display:flex;align-items:center;gap:8px;min-width:0;}",
  ".kc-title-icon{color:rgba(255,255,255,.45);display:flex;align-items:center;flex-shrink:0;}",
  ".kc-title-icon ha-icon{--mdc-icon-size:20px;}",
  ".kc-title{font-size:16px;font-weight:700;letter-spacing:1.4px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
  ".kc-head-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}",
  ".kc-datetime{display:flex;flex-direction:column;align-items:flex-end;gap:1px;}",
  ".kc-date{font-size:12px;font-weight:600;color:rgba(255,255,255,.75);letter-spacing:.5px;}",
  ".kc-time{font-size:11px;font-weight:400;color:rgba(255,255,255,.4);letter-spacing:1px;font-family:monospace;}",
  ".kc-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}",
  ".kc-dot.online{background:#34d399;box-shadow:0 0 8px rgba(52,211,153,.8);animation:kc-pulse-dot 2s ease-in-out infinite;}",
  ".kc-dot.offline{background:#6b7280;}",
  "@keyframes kc-pulse-dot{0%,100%{opacity:1;box-shadow:0 0 8px rgba(52,211,153,.8);}50%{opacity:.6;box-shadow:0 0 14px rgba(52,211,153,.4);}}",

  // Section header
  ".kc-sec{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.9);font-weight:500;margin-bottom:9px;display:flex;align-items:center;gap:5px;}",
  ".kc-sec-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}",
  ".kc-divider{height:1px;background:rgba(255,255,255,.05);margin:14px 0;}",

  // ── POWER (featured section) ──
  // Total circuit: large tile, full width
  ".kc-power-total{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:13px;padding:14px 16px;display:flex;align-items:center;gap:16px;cursor:pointer;transition:background .15s;margin-bottom:9px;}",
  ".kc-power-total:hover{background:rgba(255,255,255,.06);}",
  ".kc-power-arc-lg{position:relative;flex-shrink:0;width:68px;height:68px;}",
  ".kc-power-center-lg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;}",
  ".kc-pw-val-lg{font-size:16px;font-weight:700;color:rgba(255,255,255,.9);font-family:monospace;line-height:1;}",
  ".kc-pw-unit-lg{font-size:9px;color:rgba(255,255,255,.4);font-family:monospace;letter-spacing:.05em;}",
  ".kc-power-total-info{flex:1;min-width:0;}",
  ".kc-power-total-name{font-size:13px;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
  ".kc-power-total-subs{display:flex;gap:14px;flex-wrap:wrap;}",
  ".kc-pw-sub{display:flex;flex-direction:column;gap:1px;}",
  ".kc-pw-sub-val{font-size:11px;font-weight:600;color:rgba(255,255,255,.8);font-family:monospace;}",
  ".kc-pw-sub-lbl{font-size:8px;color:rgba(255,255,255,.4);letter-spacing:.05em;text-transform:uppercase;}",
  // Sub-circuits grid
  ".kc-power-grid{display:grid;gap:6px;}",
  ".kc-power-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:10px 8px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:background .15s;min-width:0;}",
  ".kc-power-tile:hover{background:rgba(255,255,255,.06);}",
  ".kc-power-arc{position:relative;flex-shrink:0;width:52px;height:52px;}",
  ".kc-power-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;}",
  ".kc-pw-val{font-size:12px;font-weight:600;color:rgba(255,255,255,.9);font-family:monospace;line-height:1;}",
  ".kc-pw-unit{font-size:8px;color:rgba(255,255,255,.35);font-family:monospace;}",
  ".kc-power-info{flex:1;min-width:0;overflow:hidden;}",
  ".kc-power-name{font-size:10px;color:rgba(255,255,255,.75);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;}",
  ".kc-power-subs{display:flex;gap:10px;flex-wrap:wrap;}",

  // ── APPLIANCES ──
  ".kc-appl-list{display:flex;flex-direction:column;gap:6px;}",
  ".kc-appl-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:10px 12px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:background .15s;min-width:0;}",
  ".kc-appl-tile:hover{background:rgba(255,255,255,.06);}",
  ".kc-appl-tile.appl-active{background:rgba(224,180,79,.05);border-color:rgba(224,180,79,.2);}",
  ".kc-appl-temp-wrap{position:relative;flex-shrink:0;width:46px;height:46px;}",
  ".kc-appl-temp-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;}",
  ".kc-appl-temp-val{font-size:10px;font-weight:600;font-family:monospace;line-height:1;}",
  ".kc-appl-temp-unit{font-size:7px;color:rgba(255,255,255,.4);font-family:monospace;}",
  ".kc-appl-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.05);flex-shrink:0;}",
  ".kc-appl-info{flex:1;min-width:0;}",
  ".kc-appl-name{font-size:12px;font-weight:600;color:rgba(255,255,255,.88);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
  ".kc-appl-sub{font-size:10px;color:rgba(255,255,255,.45);margin-top:2px;}",
  ".kc-appl-state{flex-shrink:0;}",
  ".kc-badge{font-size:9px;font-weight:600;padding:3px 8px;border-radius:10px;letter-spacing:.04em;}",
  ".kc-badge-on{background:rgba(34,197,94,.15);color:#4ade80;}",
  ".kc-badge-off{background:rgba(255,255,255,.07);color:rgba(255,255,255,.45);}",
  ".kc-badge-idle{background:rgba(79,163,224,.1);color:#6dbfff;}",

  // ── LIGHTS ──
  ".kc-lights-grid{display:grid;gap:5px;}",
  ".kc-light-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:9px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:background .15s,border-color .15s,transform .1s;min-width:0;}",
  ".kc-light-tile:hover{background:rgba(255,255,255,.06);}",
  ".kc-light-tile:active{transform:scale(.97);}",
  ".kc-light-tile.lt-on{background:rgba(255,210,109,.07);border-color:rgba(255,210,109,.2);}",
  ".kc-light-tile.lt-unavail{opacity:.35;pointer-events:none;}",
  ".kc-light-name{font-size:9px;font-weight:500;color:rgba(255,255,255,.75);text-align:center;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;}",
  ".kc-light-state{font-size:8px;letter-spacing:.06em;text-transform:uppercase;font-family:monospace;color:rgba(255,255,255,.28);}",
  ".kc-light-state.ls-on{color:#ffd26d;}",

  // ── CLIMATE GAUGES ──
  ".kc-gauge-grid{display:grid;gap:7px;}",
  ".kc-gauge-grid.gcols-1 .kc-gauge-tile{flex-direction:row;}",
  ".kc-gauge-grid.gcols-1 .kc-g-name{text-align:left;}",
  ".kc-gauge-grid.gcols-2 .kc-gauge-tile,.kc-gauge-grid.gcols-3 .kc-gauge-tile{flex-direction:column;align-items:center;}",
  ".kc-gauge-grid.gcols-2 .kc-g-name,.kc-gauge-grid.gcols-3 .kc-g-name{text-align:center;}",
  ".kc-gauge-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:10px 8px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:background .15s;min-width:0;}",
  ".kc-gauge-tile:hover{background:rgba(255,255,255,.06);}",
  ".kc-gauge-wrap{position:relative;flex-shrink:0;width:54px;height:54px;}",
  ".kc-gauge-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;}",
  ".kc-g-val{font-size:12px;font-weight:600;display:block;line-height:1.15;font-family:monospace;}",
  ".kc-g-sub{font-size:8px;display:block;margin-top:1px;font-family:monospace;}",
  ".kc-g-name{font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;}",

  // ── SENSORS ──
  ".kc-sensor-list{display:flex;flex-direction:column;gap:5px;}",
  ".kc-sensor-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:9px;padding:7px 10px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:background .15s;min-width:0;}",
  ".kc-sensor-tile:hover{background:rgba(255,255,255,.06);}",
  ".kc-sensor-tile.motion-active{background:rgba(255,170,80,.08);border-color:rgba(255,170,80,.22);}",
  ".kc-sensor-icon-wrap{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.04);flex-shrink:0;}",
  ".kc-sensor-icon-wrap.motion-active{background:rgba(255,170,80,.12);animation:kc-motion-pulse 1.4s ease-in-out infinite;}",
  "@keyframes kc-motion-pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,170,80,.35);}50%{box-shadow:0 0 0 5px rgba(255,170,80,0);}}",
  ".kc-motion-emoji{font-size:14px;line-height:1;}",
  ".kc-sensor-name{font-size:10px;font-weight:500;color:rgba(255,255,255,.75);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
  ".kc-sensor-sub{font-size:9px;color:rgba(255,255,255,.35);white-space:nowrap;}",
  ".kc-sensor-val{font-size:10px;font-weight:600;font-family:monospace;color:rgba(255,255,255,.8);flex-shrink:0;}",
  ".ksv-on{color:#6dbfff;}.ksv-open{color:#ffd26d;}.ksv-motion{color:#ff8a6d;}.ksv-off{color:rgba(255,255,255,.6);}",

  // ── RESPONSIVE ──
  ".kc-inner.bp-sm .kc-power-total{flex-direction:column;text-align:center;}",
  ".kc-inner.bp-sm .kc-power-total-subs{justify-content:center;}",
  ".kc-inner.bp-xs .kc-power-grid{grid-template-columns:1fr!important;}",
  ".kc-inner.bp-xs .kc-gauge-grid{grid-template-columns:1fr!important;}",
  ".kc-inner.bp-xs .kc-lights-grid{grid-template-columns:repeat(2,1fr)!important;}",
].join('');

// ════════════════════════════════════════════════════════════════════════════
// MAIN CARD
// ════════════════════════════════════════════════════════════════════════════
class KitchenCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config  = {};
    this._hass    = null;
    this._built   = false;
    this._tickInt = null;
  }

  static getConfigElement() { return document.createElement('kitchen-card-editor'); }
  static getStubConfig()    { return getStubConfig(); }

  setConfig(config) {
    this._config = Object.assign({}, getStubConfig(), config || {});
    this._built  = false;
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass  = hass;
    if (!this._built || first) {
      this._render();
    } else {
      this._update();
    }
  }

  connectedCallback() {
    if (!this._tickInt) {
      this._tickInt = setInterval(() => this._tickClock(), 1000);
    }
  }
  disconnectedCallback() {
    if (this._tickInt)  { clearInterval(this._tickInt); this._tickInt = null; }
    if (this._ro)       { this._ro.disconnect(); this._ro = null; }
  }

  _moreInfo(id) {
    if (!id) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: id } }));
  }
  _toggle(id) {
    if (!id || !this._hass) return;
    this._hass.callService('homeassistant', 'toggle', { entity_id: id });
  }

  // ── Header ──────────────────────────────────────────────────────────────
  _headerHTML() {
    const cfg = this._config;
    const iconHTML = cfg.card_icon
      ? '<span class="kc-title-icon"><ha-icon icon="' + cfg.card_icon + '"></ha-icon></span>'
      : '';
    const titleHTML = '<div class="kc-title-wrap">' + iconHTML +
      '<div class="kc-title">' + String(cfg.card_title || 'Kitchen').toUpperCase() + '</div></div>';

    const now = new Date();
    const dtHTML = cfg.show_datetime
      ? '<div class="kc-datetime">' +
          '<div class="kc-date" id="kc-date">' + now.toLocaleDateString(undefined, { month:'long', day:'numeric', year:'numeric' }) + '</div>' +
          '<div class="kc-time" id="kc-time">' + now.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit', second:'2-digit' }) + '</div>' +
        '</div>'
      : '';

    let dotHTML = '';
    if (cfg.show_status_dot) {
      const online = cfg.status_entity ? !isUnavail(stateVal(this._hass, cfg.status_entity)) : true;
      dotHTML = '<div class="kc-dot ' + (online ? 'online' : 'offline') + '"></div>';
    }

    const pos = cfg.title_position === 'center' ? 'pos-center' : 'pos-left';
    const rightHTML = (dtHTML || dotHTML) ? '<div class="kc-head-right">' + dtHTML + dotHTML + '</div>' : '';
    return '<div class="kc-header ' + pos + '">' + titleHTML + rightHTML + '</div>';
  }

  _tickClock() {
    const sr = this.shadowRoot;
    const dEl = sr && sr.getElementById('kc-date');
    const tEl = sr && sr.getElementById('kc-time');
    const now = new Date();
    if (dEl) dEl.textContent = now.toLocaleDateString(undefined, { month:'long', day:'numeric', year:'numeric' });
    if (tEl) tEl.textContent = now.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  }

  // ── Power section (Option A: total circuit featured, sub-circuits below) ──
  _powerHTML() {
    const cfg   = this._config;
    const hass  = this._hass;
    const circs = cfg.power_circuits || [];
    if (!circs.length) return '';

    const total   = circs[0];
    const subs    = circs.slice(1);
    const pCols   = Math.max(1, Math.min(4, parseInt(cfg.power_columns) || 2));
    const maxW    = parseFloat(cfg.power_max_w) || 5000;

    // ── Total tile (large) ──
    const tWatts  = stateNum(hass, total.entity);
    const tMaxW   = parseFloat(total.max_w) || maxW;
    const tPct    = Math.min(1, Math.max(0, tWatts / tMaxW));
    const tTh     = parseTh(total.power_thresholds, TH.power);
    const tColor  = colorFromThresholds(tWatts, tTh);
    const tEnergy = total.energy_entity  ? stateNum(hass, total.energy_entity).toFixed(2)  : null;
    const tCurr   = total.current_entity ? stateNum(hass, total.current_entity).toFixed(2) : null;
    const tSubsHTML =
      (tEnergy ? '<div class="kc-pw-sub"><div class="kc-pw-sub-val">' + tEnergy + ' kWh</div><div class="kc-pw-sub-lbl">Total Energy</div></div>' : '') +
      (tCurr   ? '<div class="kc-pw-sub"><div class="kc-pw-sub-val">' + tCurr   + ' A</div><div class="kc-pw-sub-lbl">Current</div></div>'       : '');

    const totalHTML =
      '<div class="kc-power-total" data-action="more-info" data-entity="' + (total.entity || '') + '" data-idx="kct">' +
        '<div class="kc-power-arc-lg">' +
          powerSVG(68, tPct, tColor) +
          '<div class="kc-power-center-lg">' +
            '<span class="kc-pw-val-lg" id="kc-pw-tot-v" style="color:' + tColor + '">' + Math.round(tWatts) + '</span>' +
            '<span class="kc-pw-unit-lg">W</span>' +
          '</div>' +
        '</div>' +
        '<div class="kc-power-total-info">' +
          '<div class="kc-power-total-name">' + (total.label || 'Kitchen Power') + '</div>' +
          '<div class="kc-power-total-subs">' + tSubsHTML + '</div>' +
        '</div>' +
      '</div>';

    // ── Sub-circuit tiles ──
    const subHTML = subs.map(function(p, i) {
      const watts  = stateNum(hass, p.entity);
      const maxPW  = parseFloat(p.max_w) || maxW;
      const pct    = Math.min(1, Math.max(0, watts / maxPW));
      const pTh    = parseTh(p.power_thresholds, TH.power);
      const pcolor = colorFromThresholds(watts, pTh);
      const energy = p.energy_entity  ? stateNum(hass, p.energy_entity).toFixed(2)  : null;
      const curr   = p.current_entity ? stateNum(hass, p.current_entity).toFixed(2) : null;
      const subs2  =
        (energy ? '<div class="kc-pw-sub"><div class="kc-pw-sub-val">' + energy + ' kWh</div><div class="kc-pw-sub-lbl">Energy</div></div>'  : '') +
        (curr   ? '<div class="kc-pw-sub"><div class="kc-pw-sub-val">' + curr   + ' A</div><div class="kc-pw-sub-lbl">Current</div></div>' : '');
      return '<div class="kc-power-tile" data-action="more-info" data-entity="' + (p.entity || '') + '" data-idx="' + i + '">' +
        '<div class="kc-power-arc">' +
          powerSVG(52, pct, pcolor) +
          '<div class="kc-power-center">' +
            '<span class="kc-pw-val" id="kc-pw-sub-v-' + i + '" style="color:' + pcolor + '">' + Math.round(watts) + '</span>' +
            '<span class="kc-pw-unit">W</span>' +
          '</div>' +
        '</div>' +
        '<div class="kc-power-info">' +
          '<div class="kc-power-name">' + (p.label || ('Circuit ' + (i + 2))) + '</div>' +
          '<div class="kc-power-subs">' + subs2 + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    const gridHTML = subs.length
      ? '<div class="kc-power-grid" style="grid-template-columns:repeat(' + pCols + ',minmax(0,1fr))">' + subHTML + '</div>'
      : '';

    return (
      '<div class="kc-divider" style="margin-top:0"></div>' +
      '<div class="kc-sec"><span class="kc-sec-dot" style="background:#e07c4f;box-shadow:0 0 5px #e07c4f"></span>' + (cfg.label_power || 'Power') + '</div>' +
      totalHTML +
      gridHTML
    );
  }

  // ── Appliances ────────────────────────────────────────────────────────────
  _appliancesHTML() {
    const cfg   = this._config;
    const hass  = this._hass;
    const items = cfg.appliances || [];
    if (!items.length) return '';

    const tilesHTML = items.map(function(a, i) {
      const state   = stateVal(hass, a.entity);
      const on      = isOn(state);
      const unavail = isUnavail(state);
      const ago     = hass && a.entity && hass.states[a.entity] ? agoStr(hass.states[a.entity].last_changed) : '';

      // Optional temperature entity
      let leftHTML;
      if (a.temp_entity) {
        const tempVal  = stateNum(hass, a.temp_entity);
        const tempMax  = parseFloat(a.temp_max) || 300;
        const tempPct  = Math.min(1, Math.max(0, tempVal / tempMax));
        const tempTh   = parseTh(a.temp_thresholds, TH.applianceTemp);
        const tempColor = colorFromThresholds(tempVal, tempTh);
        const unit     = stateAttr(hass, a.temp_entity, 'unit_of_measurement') || '°C';
        leftHTML = '<div class="kc-appl-temp-wrap">' +
          applTempSVG(46, tempPct, tempColor) +
          '<div class="kc-appl-temp-center">' +
            '<span class="kc-appl-temp-val" id="kc-appl-tv-' + i + '" style="color:' + tempColor + '">' + Math.round(tempVal) + '</span>' +
            '<span class="kc-appl-temp-unit">' + unit + '</span>' +
          '</div>' +
        '</div>';
      } else {
        const icolor = unavail ? 'rgba(255,255,255,.2)' : on ? '#e0b44f' : 'rgba(255,255,255,.35)';
        leftHTML = '<div class="kc-appl-icon">' + renderIcon(a.icon || 'appliance', icolor, 20) + '</div>';
      }

      // State badge
      let badgeCls = 'kc-badge kc-badge-off', badgeTxt = 'Off';
      if (unavail)    { badgeCls = 'kc-badge kc-badge-off'; badgeTxt = '—'; }
      else if (on)    { badgeCls = 'kc-badge kc-badge-on';  badgeTxt = a.state_on_label  || 'On'; }
      else            { badgeCls = 'kc-badge kc-badge-off'; badgeTxt = a.state_off_label || 'Off'; }

      // Optional program/mode sub-entity
      let subTxt = ago;
      if (a.mode_entity) {
        const modeVal = stateVal(hass, a.mode_entity);
        if (modeVal && !isUnavail(modeVal)) subTxt = stateLabel(modeVal) + (ago ? ' · ' + ago : '');
      }

      const tileCls = 'kc-appl-tile' + (on && !unavail ? ' appl-active' : '');
      return '<div class="' + tileCls + '" data-action="more-info" data-entity="' + (a.entity || '') + '" data-idx="' + i + '">' +
        leftHTML +
        '<div class="kc-appl-info">' +
          '<div class="kc-appl-name">' + (a.label || ('Appliance ' + (i + 1))) + '</div>' +
          '<div class="kc-appl-sub">' + subTxt + '</div>' +
        '</div>' +
        '<div class="kc-appl-state"><span class="' + badgeCls + '">' + badgeTxt + '</span></div>' +
      '</div>';
    }).join('');

    return (
      '<div class="kc-divider"></div>' +
      '<div class="kc-sec"><span class="kc-sec-dot" style="background:#e0b44f;box-shadow:0 0 5px #e0b44f"></span>' + (cfg.label_appliances || 'Appliances') + '</div>' +
      '<div class="kc-appl-list">' + tilesHTML + '</div>'
    );
  }

  // ── Lights ────────────────────────────────────────────────────────────────
  _lightsHTML() {
    const cfg   = this._config;
    const hass  = this._hass;
    const items = cfg.lights || [];
    if (!items.length) return '';
    const cols  = Math.max(1, Math.min(4, parseInt(cfg.lights_columns) || 2));

    const tilesHTML = items.map(function(lt, i) {
      const state   = stateVal(hass, lt.entity);
      const on      = isOn(state), unavail = isUnavail(state);
      const cls     = 'kc-light-tile' + (unavail ? ' lt-unavail' : on ? ' lt-on' : '');
      const icolor  = unavail ? 'rgba(255,255,255,.2)' : on ? '#ffd26d' : 'rgba(255,255,255,.38)';
      const scls    = on ? 'ls-on' : '';
      const stxt    = unavail ? 'N/A' : (on ? 'On' : 'Off');
      return '<div class="' + cls + '" data-action="toggle" data-entity="' + (lt.entity || '') + '" data-idx="' + i + '">' +
        renderIcon(lt.icon || 'bulb', icolor, 18) +
        '<span class="kc-light-name">' + (lt.label || '—') + '</span>' +
        '<span class="kc-light-state ' + scls + '">' + stxt + '</span>' +
      '</div>';
    }).join('');

    return (
      '<div class="kc-divider"></div>' +
      '<div class="kc-sec"><span class="kc-sec-dot" style="background:#ffd26d;box-shadow:0 0 5px #ffd26d"></span>' + (cfg.label_lights || 'Lights') + '</div>' +
      '<div class="kc-lights-grid" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">' + tilesHTML + '</div>'
    );
  }

  // ── Climate gauges ────────────────────────────────────────────────────────
  _climateHTML() {
    const cfg   = this._config;
    const hass  = this._hass;
    const items = cfg.gauges || [];
    if (!items.length) return '';
    const gCols = Math.max(1, Math.min(4, parseInt(cfg.gauges_columns) || 2));

    const tilesHTML = items.map(function(g, i) {
      const size      = 54;
      const tempVal   = stateNum(hass, g.temp_entity);
      const humVal    = stateNum(hass, g.humidity_entity);
      const tempTh    = parseTh(g.temp_thresholds, TH.temperature);
      const humTh     = parseTh(g.hum_thresholds,  TH.humidity);
      const tempColor = colorFromThresholds(tempVal, tempTh);
      const humColor  = colorFromThresholds(humVal, humTh);
      const tempPct   = Math.min(1, Math.max(0, tempVal / 50));
      const humPct    = Math.min(1, Math.max(0, humVal / 100));
      const tempStr   = g.temp_entity     ? tempVal.toFixed(1) + '°C' : '—';
      const humStr    = g.humidity_entity ? humVal.toFixed(1)  + '%'  : '—';
      return '<div class="kc-gauge-tile" data-action="more-info" data-entity="' + (g.temp_entity || '') + '" data-idx="' + i + '">' +
        '<div class="kc-gauge-wrap">' +
          climateSVG(size, tempPct, tempColor, humPct, humColor) +
          '<div class="kc-gauge-center">' +
            '<span class="kc-g-val" id="kc-g-t-' + i + '" style="color:' + tempColor + '">' + tempStr + '</span>' +
            '<span class="kc-g-sub" id="kc-g-h-' + i + '" style="color:' + humColor  + '">' + humStr  + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="kc-g-name">' + (g.label || ('Sensor ' + (i + 1))) + '</div>' +
      '</div>';
    }).join('');

    return (
      '<div class="kc-divider"></div>' +
      '<div class="kc-sec"><span class="kc-sec-dot" style="background:#6ddb99;box-shadow:0 0 5px #6ddb99"></span>' + (cfg.label_climate || 'Climate') + '</div>' +
      '<div class="kc-gauge-grid gcols-' + gCols + '" style="grid-template-columns:repeat(' + gCols + ',minmax(0,1fr))">' + tilesHTML + '</div>'
    );
  }

  // ── Sensors ───────────────────────────────────────────────────────────────
  _sensorsHTML() {
    const cfg   = this._config;
    const hass  = this._hass;
    const items = cfg.sensors || [];
    if (!items.length) return '';

    const tilesHTML = items.map(function(s, i) {
      const state   = stateVal(hass, s.entity);
      const on      = isOn(state);
      const cat     = s.category || 'sensor';
      const unavail = isUnavail(state);
      const dc      = stateAttr(hass, s.entity, 'device_class') || '';
      const motion  = cat === 'motion' || isMotionSensor(s.entity, dc);
      const motionActive = motion && MOTION_ACTIVE.includes((state || '').toLowerCase());
      const ago     = hass && s.entity && hass.states[s.entity] ? agoStr(hass.states[s.entity].last_changed) : '';

      const disp = unavail ? '—'
                 : motion  ? (motionActive ? 'Detected' : 'Clear')
                 : cat === 'door'   ? (on ? 'Open' : 'Closed')
                 : cat === 'light'  ? (on ? 'On'   : 'Off')
                 : cat === 'person' ? (on ? 'Home' : 'Away')
                 : stateLabel(state);

      const vcls = 'kc-sensor-val' + (motion && motionActive ? ' ksv-motion' : cat === 'door' && on ? ' ksv-open' : on ? ' ksv-on' : !unavail && !on ? ' ksv-off' : '');

      let iconHTML;
      if (motion) {
        const wrapCls = 'kc-sensor-icon-wrap' + (motionActive ? ' motion-active' : '');
        iconHTML = '<div class="' + wrapCls + '"><span class="kc-motion-emoji">🚶</span></div>';
      } else {
        const icolor = cat === 'door' && on ? '#ffd26d' : on ? '#6dbfff' : 'rgba(255,255,255,.4)';
        const iconKey = { door: 'door', bulb: 'bulb', light: 'bulb', person: 'person', thermometer: 'thermometer', water: 'water' }[cat] || 'sensor';
        iconHTML = '<div class="kc-sensor-icon-wrap">' + renderIcon(s.icon || iconKey, icolor, 13) + '</div>';
      }

      const tileCls = 'kc-sensor-tile' + (motion && motionActive ? ' motion-active' : '');
      return '<div class="' + tileCls + '" data-action="more-info" data-entity="' + (s.entity || '') + '" data-idx="' + i + '">' +
        iconHTML +
        '<div class="kc-sensor-name">' + (s.label || '—') + '</div>' +
        '<div class="kc-sensor-sub">' + ago + '</div>' +
        '<div class="' + vcls + '">' + disp + '</div>' +
      '</div>';
    }).join('');

    return (
      '<div class="kc-divider"></div>' +
      '<div class="kc-sec"><span class="kc-sec-dot" style="background:#4fa3e0;box-shadow:0 0 5px #4fa3e0"></span>' + (cfg.label_sensors || 'Sensors') + '</div>' +
      '<div class="kc-sensor-list">' + tilesHTML + '</div>'
    );
  }

  // ── Full render ───────────────────────────────────────────────────────────
  _buildHTML() {
    return '<style>' + CARD_CSS + '</style>' +
      '<div class="kc-card"><div class="kc-inner">' +
        this._headerHTML() +
        this._powerHTML() +
        this._appliancesHTML() +
        this._lightsHTML() +
        this._climateHTML() +
        this._sensorsHTML() +
      '</div></div>';
  }

  _render() {
    this.shadowRoot.innerHTML = this._buildHTML();
    this._attachListeners();
    this._startResizeObserver();
    this._built = true;
  }

  _startResizeObserver() {
    if (this._ro) this._ro.disconnect();
    const inner = this.shadowRoot.querySelector('.kc-inner');
    if (!inner) return;
    this._ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      inner.classList.remove('bp-sm', 'bp-xs');
      if (w < 380)      inner.classList.add('bp-xs');
      else if (w < 700) inner.classList.add('bp-sm');
    });
    this._ro.observe(inner);
  }

  // ── Lightweight update (no full re-render) ────────────────────────────────
  _update() {
    const cfg  = this._config;
    const hass = this._hass;
    const sr   = this.shadowRoot;

    // Status dot
    if (cfg.show_status_dot) {
      const dot = sr.querySelector('.kc-dot');
      if (dot) {
        const online = cfg.status_entity ? !isUnavail(stateVal(hass, cfg.status_entity)) : true;
        dot.className = 'kc-dot ' + (online ? 'online' : 'offline');
      }
    }

    // Power — total
    const circs = cfg.power_circuits || [];
    if (circs.length) {
      const total  = circs[0];
      const maxW   = parseFloat(cfg.power_max_w) || 5000;
      const tWatts = stateNum(hass, total.entity);
      const tMaxW  = parseFloat(total.max_w) || maxW;
      const tPct   = Math.min(1, Math.max(0, tWatts / tMaxW));
      const tTh    = parseTh(total.power_thresholds, TH.power);
      const tColor = colorFromThresholds(tWatts, tTh);
      const totTile = sr.querySelector('.kc-power-total');
      if (totTile) {
        const vEl = sr.getElementById('kc-pw-tot-v');
        if (vEl) { vEl.textContent = Math.round(tWatts); vEl.style.color = tColor; }
        const circles = totTile.querySelectorAll('circle');
        if (circles.length >= 2) {
          const r = 68 * 0.38, full = 2 * Math.PI * r, arc = full * 0.75, fill = Math.max(0, Math.min(arc, tPct * arc));
          circles[1].setAttribute('stroke', tColor);
          circles[1].setAttribute('stroke-dasharray', fill.toFixed(1) + ' ' + (full - fill).toFixed(1));
          circles[1].style.filter = 'drop-shadow(0 0 4px ' + tColor + ')';
        }
      }
      // Sub-circuits
      circs.slice(1).forEach(function(p, i) {
        const tile = sr.querySelector('.kc-power-tile[data-idx="' + i + '"]');
        if (!tile) return;
        const watts = stateNum(hass, p.entity);
        const maxPW = parseFloat(p.max_w) || maxW;
        const pct   = Math.min(1, Math.max(0, watts / maxPW));
        const pTh   = parseTh(p.power_thresholds, TH.power);
        const pc    = colorFromThresholds(watts, pTh);
        const vEl2  = sr.getElementById('kc-pw-sub-v-' + i);
        if (vEl2) { vEl2.textContent = Math.round(watts); vEl2.style.color = pc; }
        const circles2 = tile.querySelectorAll('circle');
        if (circles2.length >= 2) {
          const r = 52 * 0.38, full = 2 * Math.PI * r, arc = full * 0.75, fill = Math.max(0, Math.min(arc, pct * arc));
          circles2[1].setAttribute('stroke', pc);
          circles2[1].setAttribute('stroke-dasharray', fill.toFixed(1) + ' ' + (full - fill).toFixed(1));
          circles2[1].style.filter = 'drop-shadow(0 0 4px ' + pc + ')';
        }
      });
    }

    // Appliances
    (cfg.appliances || []).forEach(function(a, i) {
      const tile = sr.querySelector('.kc-appl-tile[data-idx="' + i + '"]');
      if (!tile) return;
      const state   = stateVal(hass, a.entity);
      const on      = isOn(state), unavail = isUnavail(state);
      tile.className = 'kc-appl-tile' + (on && !unavail ? ' appl-active' : '');
      const badge = tile.querySelector('.kc-badge');
      if (badge) {
        badge.className = 'kc-badge ' + (unavail ? 'kc-badge-off' : on ? 'kc-badge-on' : 'kc-badge-off');
        badge.textContent = unavail ? '—' : on ? (a.state_on_label || 'On') : (a.state_off_label || 'Off');
      }
      const sub = tile.querySelector('.kc-appl-sub');
      if (sub) {
        const ago = hass && a.entity && hass.states[a.entity] ? agoStr(hass.states[a.entity].last_changed) : '';
        let subTxt = ago;
        if (a.mode_entity) {
          const mv = stateVal(hass, a.mode_entity);
          if (mv && !isUnavail(mv)) subTxt = stateLabel(mv) + (ago ? ' · ' + ago : '');
        }
        sub.textContent = subTxt;
      }
      // Update temp gauge if present
      if (a.temp_entity) {
        const tvEl = sr.getElementById('kc-appl-tv-' + i);
        const tempVal   = stateNum(hass, a.temp_entity);
        const tempMax   = parseFloat(a.temp_max) || 300;
        const tempPct   = Math.min(1, Math.max(0, tempVal / tempMax));
        const tempTh    = parseTh(a.temp_thresholds, TH.applianceTemp);
        const tempColor = colorFromThresholds(tempVal, tempTh);
        if (tvEl) { tvEl.textContent = Math.round(tempVal); tvEl.style.color = tempColor; }
        const wrap    = tile.querySelector('.kc-appl-temp-wrap');
        if (wrap) {
          const circles = wrap.querySelectorAll('circle');
          if (circles.length >= 2) {
            const r = 46 * 0.41, c = 2 * Math.PI * r, o = c * (1 - tempPct);
            circles[1].setAttribute('stroke', tempColor);
            circles[1].setAttribute('stroke-dashoffset', o.toFixed(1));
            circles[1].style.filter = 'drop-shadow(0 0 4px ' + tempColor + ')';
          }
        }
      }
    });

    // Lights
    (cfg.lights || []).forEach(function(lt, i) {
      const tile = sr.querySelector('.kc-light-tile[data-idx="' + i + '"]');
      if (!tile) return;
      const state = stateVal(hass, lt.entity), on = isOn(state), unavail = isUnavail(state);
      tile.className = 'kc-light-tile' + (unavail ? ' lt-unavail' : on ? ' lt-on' : '');
      const stEl = tile.querySelector('.kc-light-state');
      if (stEl) { stEl.className = 'kc-light-state' + (on ? ' ls-on' : ''); stEl.textContent = unavail ? 'N/A' : (on ? 'On' : 'Off'); }
    });

    // Climate gauges
    (cfg.gauges || []).forEach(function(g, i) {
      const tEl = sr.getElementById('kc-g-t-' + i);
      const hEl = sr.getElementById('kc-g-h-' + i);
      const tVal  = stateNum(hass, g.temp_entity);
      const hVal  = stateNum(hass, g.humidity_entity);
      const tTh   = parseTh(g.temp_thresholds, TH.temperature);
      const hTh   = parseTh(g.hum_thresholds,  TH.humidity);
      const tc    = colorFromThresholds(tVal, tTh);
      const hc    = colorFromThresholds(hVal, hTh);
      const tPct  = Math.min(1, Math.max(0, tVal / 50));
      const hPct  = Math.min(1, Math.max(0, hVal / 100));
      if (tEl) { tEl.textContent = g.temp_entity     ? tVal.toFixed(1) + '°C' : '—'; tEl.style.color = tc; }
      if (hEl) { hEl.textContent = g.humidity_entity ? hVal.toFixed(1) + '%'  : '—'; hEl.style.color = hc; }
      const tile = sr.querySelector('.kc-gauge-tile[data-idx="' + i + '"]');
      if (tile) {
        const size = 54;
        const r1 = size * 0.41, r2 = size * 0.32, c1 = 2 * Math.PI * r1, c2 = 2 * Math.PI * r2;
        const circles = tile.querySelectorAll('circle');
        if (circles.length >= 4) {
          circles[1].setAttribute('stroke', tc);
          circles[1].setAttribute('stroke-dashoffset', (c1 * (1 - tPct)).toFixed(1));
          circles[1].style.filter = 'drop-shadow(0 0 4px ' + tc + ')';
          circles[3].setAttribute('stroke', hc);
          circles[3].setAttribute('stroke-dashoffset', (c2 * (1 - hPct)).toFixed(1));
          circles[3].style.filter = 'drop-shadow(0 0 3px ' + hc + ')';
        }
      }
    });

    // Sensors
    (cfg.sensors || []).forEach(function(s, i) {
      const tile = sr.querySelector('.kc-sensor-tile[data-idx="' + i + '"]');
      if (!tile) return;
      const state = stateVal(hass, s.entity);
      const on    = isOn(state), cat = s.category || 'sensor', unavail = isUnavail(state);
      const dc    = stateAttr(hass, s.entity, 'device_class') || '';
      const motion = cat === 'motion' || isMotionSensor(s.entity, dc);
      const mActive = motion && MOTION_ACTIVE.includes((state || '').toLowerCase());
      tile.className = 'kc-sensor-tile' + (motion && mActive ? ' motion-active' : '');
      const disp = unavail ? '—'
                 : motion  ? (mActive ? 'Detected' : 'Clear')
                 : cat === 'door'   ? (on ? 'Open' : 'Closed')
                 : cat === 'light'  ? (on ? 'On'   : 'Off')
                 : cat === 'person' ? (on ? 'Home' : 'Away')
                 : stateLabel(state);
      if (motion) {
        const wrap = tile.querySelector('.kc-sensor-icon-wrap');
        if (wrap) wrap.className = 'kc-sensor-icon-wrap' + (mActive ? ' motion-active' : '');
      }
      const vEl = tile.querySelector('.kc-sensor-val');
      if (vEl) {
        vEl.className = 'kc-sensor-val' + (motion && mActive ? ' ksv-motion' : cat === 'door' && on ? ' ksv-open' : on ? ' ksv-on' : !unavail && !on ? ' ksv-off' : '');
        vEl.textContent = disp;
      }
      const subEl = tile.querySelector('.kc-sensor-sub');
      if (subEl && hass && s.entity && hass.states[s.entity]) {
        subEl.textContent = agoStr(hass.states[s.entity].last_changed);
      }
    });
  }

  _attachListeners() {
    const self = this;
    this.shadowRoot.querySelectorAll('[data-action]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        const action = el.dataset.action, entity = el.dataset.entity;
        if (!entity || entity === '' || entity === 'undefined') return;
        if (action === 'toggle') self._toggle(entity);
        else self._moreInfo(entity);
      });
    });
  }

  getCardSize() { return 8; }
}

// ════════════════════════════════════════════════════════════════════════════
// VISUAL EDITOR
// ════════════════════════════════════════════════════════════════════════════
class KitchenCardEditor extends LitElement {
  static get properties() {
    return {
      hass:           {},
      _config:        { state: true },
      _openSections:  { state: true },
      _pickersReady:  { state: true },
    };
  }

  constructor() {
    super();
    this._openSections = { header: true };
    this._pickersReady = false;
  }

  async firstUpdated() {
    const timeout = setTimeout(() => { this._pickersReady = true; this.requestUpdate(); }, 3000);
    try {
      if (!customElements.get('ha-entity-picker')) {
        const helpers = await window.loadCardHelpers();
        const c = await helpers.createCardElement({ type: 'entities', entities: [] });
        await c.constructor.getConfigElement();
      }
    } catch (_) {}
    this._pickersReady = true;
    clearTimeout(timeout);
    this.requestUpdate();
  }

  setConfig(config) {
    this._config = Object.assign({}, getStubConfig(), config || {});
  }

  _fire() {
    const ev = new Event('config-changed', { bubbles: true, composed: true });
    ev.detail = { config: this._config };
    this.dispatchEvent(ev);
  }

  _set(key, val) {
    this._config = Object.assign({}, this._config, { [key]: val });
    this._fire();
  }
  _addItem(key, defaults) {
    this._set(key, (this._config[key] || []).concat([defaults]));
  }
  _removeItem(key, idx) {
    const arr = (this._config[key] || []).slice();
    arr.splice(idx, 1);
    this._set(key, arr);
  }
  _updateItem(key, idx, field, val) {
    const arr = (this._config[key] || []).slice();
    arr[idx] = Object.assign({}, arr[idx], { [field]: val });
    this._set(key, arr);
  }
  _toggleSec(id) {
    this._openSections = Object.assign({}, this._openSections, { [id]: !this._openSections[id] });
  }

  // ── Atomic editor widgets ─────────────────────────────────────────────────
  _txt(label, value, onChange, ph) {
    return html`<div class="ed-field">
      <label class="ed-label">${label}</label>
      <input class="ed-input" type="text" .value="${value || ''}" placeholder="${ph || ''}"
        @change="${(e) => onChange(e.target.value)}" />
    </div>`;
  }
  _num(label, value, onChange, ph) {
    return html`<div class="ed-field">
      <label class="ed-label">${label}</label>
      <input class="ed-input" type="number" .value="${value || ''}" placeholder="${ph || ''}"
        @change="${(e) => onChange(e.target.value)}" />
    </div>`;
  }
  _toggle(label, checked, onChange) {
    return html`<div class="toggle-row">
      <span class="toggle-label">${label}</span>
      <label class="toggle-wrap">
        <input type="checkbox" .checked="${!!checked}" @change="${(e) => onChange(e.target.checked)}" />
        <span class="toggle-slider"></span>
      </label>
    </div>`;
  }
  _seg(label, value, options, onChange) {
    return html`<div class="ed-field">
      <label class="ed-label">${label}</label>
      <div class="segmented">
        ${options.map((o) => html`<div class="seg-opt ${value === o.val ? 'active' : ''}" @click="${() => onChange(o.val)}">${o.label}</div>`)}
      </div>
    </div>`;
  }
  _select(label, value, options, onChange) {
    return html`<div class="ed-field">
      <label class="ed-label">${label}</label>
      <select class="ed-select" .value="${value || ''}" @change="${(e) => onChange(e.target.value)}">
        ${options.map((o) => html`<option value="${o.val}" ?selected=${String(value) === String(o.val)}>${o.label}</option>`)}
      </select>
    </div>`;
  }
  _entityPicker(value, onChange, domains, label) {
    return html`<div class="ed-field">
      <label class="ed-label">${label || 'Entity'}</label>
      <ha-entity-picker
        .hass=${this.hass}
        .value=${value || ''}
        .includeDomains=${domains && domains.length ? domains : undefined}
        allow-custom-entity
        @value-changed=${(e) => { const v = e.detail.value || ''; if (v !== (value || '')) onChange(v); }}
      ></ha-entity-picker>
    </div>`;
  }
  _iconPicker(value, onChange, ph) {
    return html`<div class="ed-field">
      <label class="ed-label">Icon</label>
      <ha-icon-picker
        .hass=${this.hass}
        .value=${value || ''}
        .placeholder=${ph || 'mdi:...'}
        @value-changed=${(e) => { const v = e.detail.value || ''; if (v !== (value || '')) onChange(v); }}
      ></ha-icon-picker>
    </div>`;
  }
  _section(id, title, count, content) {
    const open = !!this._openSections[id];
    return html`<div class="ed-section ${open ? 'open' : ''}">
      <div class="ed-section-header" @click="${() => this._toggleSec(id)}">
        <div class="ed-section-title">
          ${title}
          ${count !== undefined ? html`<span class="ed-section-count">${count}</span>` : ''}
        </div>
        <span class="ed-section-arrow">▾</span>
      </div>
      <div class="ed-section-body">${open ? content : ''}</div>
    </div>`;
  }

  // ── Section content ───────────────────────────────────────────────────────
  _headerContent() {
    const cfg = this._config;
    return html`
      ${this._txt('Card Title', cfg.card_title, (v) => this._set('card_title', v), 'Kitchen')}
      ${this._seg('Title Position', cfg.title_position || 'left',
        [{ val:'left', label:'Left' }, { val:'center', label:'Center' }],
        (v) => this._set('title_position', v))}
      ${this._iconPicker(cfg.card_icon, (v) => this._set('card_icon', v), 'mdi:chef-hat')}
      ${this._toggle('Show Date & Time', cfg.show_datetime, (v) => this._set('show_datetime', v))}
      ${this._toggle('Show Status Dot', cfg.show_status_dot, (v) => this._set('show_status_dot', v))}
      ${cfg.show_status_dot ? this._entityPicker(cfg.status_entity, (v) => this._set('status_entity', v),
          ['binary_sensor','sensor','switch'], 'Status Entity') : ''}
    `;
  }

  _powerContent() {
    const cfg  = this._config, self = this;
    const items = cfg.power_circuits || [];
    const colOpts = [{ val:'1', label:'1' },{ val:'2', label:'2' },{ val:'3', label:'3' },{ val:'4', label:'4' }];
    return html`
      ${this._txt('Section Label', cfg.label_power, (v) => this._set('label_power', v), 'Power')}
      <p class="hint">First circuit = featured total gauge. Additional circuits show as sub-tiles below.</p>
      ${this._num('Default Max Watts (all circuits)', cfg.power_max_w, (v) => this._set('power_max_w', parseFloat(v) || 5000), '5000')}
      ${this._select('Sub-circuit Columns', String(cfg.power_columns || 2), colOpts, (v) => this._set('power_columns', parseInt(v)))}
      ${items.map((p, i) => html`
        <div class="entity-item">
          <div class="entity-item-hd">
            <span class="entity-item-num">${i === 0 ? '⚡ Total Circuit' : ('Sub-circuit ' + i)}</span>
            <button class="btn-remove" @click="${() => self._removeItem('power_circuits', i)}">Remove</button>
          </div>
          ${self._entityPicker(p.entity, (v) => {
            self._updateItem('power_circuits', i, 'entity', v);
            if (v && !p.label) {
              const fn = stateAttr(self.hass, v, 'friendly_name');
              if (fn) self._updateItem('power_circuits', i, 'label', fn);
            }
          }, ['sensor'], 'Power Entity (W)')}
          ${self._entityPicker(p.energy_entity,  (v) => self._updateItem('power_circuits', i, 'energy_entity',  v), ['sensor'], 'Energy Entity (kWh) — optional')}
          ${self._entityPicker(p.current_entity, (v) => self._updateItem('power_circuits', i, 'current_entity', v), ['sensor'], 'Current Entity (A) — optional')}
          ${self._txt('Label', p.label, (v) => self._updateItem('power_circuits', i, 'label', v), i === 0 ? 'Kitchen Power' : 'Circuit name')}
          ${self._num('Max Watts (override)', p.max_w, (v) => self._updateItem('power_circuits', i, 'max_w', parseFloat(v) || null), 'leave blank to use default')}
        </div>
      `)}
      <button class="btn-add" @click="${() => self._addItem('power_circuits', { entity:'', label:'', energy_entity:'', current_entity:'' })}">+ Add Power Circuit</button>
    `;
  }

  _appliancesContent() {
    const cfg  = this._config, self = this;
    const items = cfg.appliances || [];
    return html`
      ${this._txt('Section Label', cfg.label_appliances, (v) => this._set('label_appliances', v), 'Appliances')}
      <p class="hint">Add oven, dishwasher, fridge, etc. Optionally link a temperature sensor to show a live arc gauge.</p>
      ${items.map((a, i) => html`
        <div class="entity-item">
          <div class="entity-item-hd">
            <span class="entity-item-num">Appliance ${i + 1}</span>
            <button class="btn-remove" @click="${() => self._removeItem('appliances', i)}">Remove</button>
          </div>
          ${self._entityPicker(a.entity, (v) => {
            self._updateItem('appliances', i, 'entity', v);
            if (v && !a.label) {
              const fn = stateAttr(self.hass, v, 'friendly_name');
              if (fn) self._updateItem('appliances', i, 'label', fn);
            }
          }, ['switch','binary_sensor','sensor','input_boolean','climate'], 'State Entity')}
          ${self._entityPicker(a.temp_entity, (v) => self._updateItem('appliances', i, 'temp_entity', v), ['sensor'], 'Temperature Sensor — optional (shows arc gauge)')}
          ${a.temp_entity ? self._num('Temp Max (°C)', a.temp_max, (v) => self._updateItem('appliances', i, 'temp_max', parseFloat(v) || 300), '300') : ''}
          ${self._entityPicker(a.mode_entity, (v) => self._updateItem('appliances', i, 'mode_entity', v), ['sensor','input_select'], 'Program/Mode Entity — optional')}
          ${self._txt('Label', a.label, (v) => self._updateItem('appliances', i, 'label', v), 'Appliance name')}
          ${self._txt('"On" State Label', a.state_on_label, (v) => self._updateItem('appliances', i, 'state_on_label', v), 'On')}
          ${self._txt('"Off" State Label', a.state_off_label, (v) => self._updateItem('appliances', i, 'state_off_label', v), 'Off')}
          ${self._iconPicker(a.icon, (v) => self._updateItem('appliances', i, 'icon', v), 'mdi:stove')}
        </div>
      `)}
      <button class="btn-add" @click="${() => self._addItem('appliances', { entity:'', label:'', icon:'mdi:stove', temp_entity:'', mode_entity:'' })}">+ Add Appliance</button>
    `;
  }

  _lightsContent() {
    const cfg  = this._config, self = this;
    const items = cfg.lights || [];
    const colOpts = [{ val:'1', label:'1' },{ val:'2', label:'2' },{ val:'3', label:'3' },{ val:'4', label:'4' }];
    return html`
      ${this._txt('Section Label', cfg.label_lights, (v) => this._set('label_lights', v), 'Lights')}
      ${this._select('Columns', String(cfg.lights_columns || 2), colOpts, (v) => this._set('lights_columns', parseInt(v)))}
      ${items.map((lt, i) => html`
        <div class="entity-item">
          <div class="entity-item-hd">
            <span class="entity-item-num">Light ${i + 1}</span>
            <button class="btn-remove" @click="${() => self._removeItem('lights', i)}">Remove</button>
          </div>
          ${self._entityPicker(lt.entity, (v) => {
            self._updateItem('lights', i, 'entity', v);
            if (v && !lt.label) {
              const fn = stateAttr(self.hass, v, 'friendly_name');
              if (fn) self._updateItem('lights', i, 'label', fn);
            }
          }, ['light','switch','input_boolean'], 'Entity')}
          ${self._txt('Label', lt.label, (v) => self._updateItem('lights', i, 'label', v), 'Light name')}
          ${self._iconPicker(lt.icon, (v) => self._updateItem('lights', i, 'icon', v), 'mdi:lightbulb')}
        </div>
      `)}
      <button class="btn-add" @click="${() => self._addItem('lights', { entity:'', label:'', icon:'mdi:lightbulb' })}">+ Add Light</button>
    `;
  }

  _climateContent() {
    const cfg  = this._config, self = this;
    const items = cfg.gauges || [];
    const colOpts = [{ val:'1', label:'1' },{ val:'2', label:'2' },{ val:'3', label:'3' }];
    return html`
      ${this._txt('Section Label', cfg.label_climate, (v) => this._set('label_climate', v), 'Climate')}
      ${this._select('Columns', String(cfg.gauges_columns || 2), colOpts, (v) => this._set('gauges_columns', parseInt(v)))}
      ${items.map((g, i) => html`
        <div class="entity-item">
          <div class="entity-item-hd">
            <span class="entity-item-num">Gauge ${i + 1}</span>
            <button class="btn-remove" @click="${() => self._removeItem('gauges', i)}">Remove</button>
          </div>
          ${self._entityPicker(g.temp_entity,     (v) => self._updateItem('gauges', i, 'temp_entity',     v), ['sensor'], 'Temperature Entity')}
          ${self._entityPicker(g.humidity_entity, (v) => self._updateItem('gauges', i, 'humidity_entity', v), ['sensor'], 'Humidity Entity — optional')}
          ${self._txt('Label', g.label, (v) => self._updateItem('gauges', i, 'label', v), 'Sensor name')}
        </div>
      `)}
      <button class="btn-add" @click="${() => self._addItem('gauges', { temp_entity:'', humidity_entity:'', label:'' })}">+ Add Climate Gauge</button>
    `;
  }

  _sensorsContent() {
    const cfg  = this._config, self = this;
    const items = cfg.sensors || [];
    const catOpts = [
      { val:'sensor',  label:'Sensor'  },
      { val:'motion',  label:'Motion'  },
      { val:'door',    label:'Door'    },
      { val:'light',   label:'Light'   },
      { val:'person',  label:'Person'  },
    ];
    return html`
      ${this._txt('Section Label', cfg.label_sensors, (v) => this._set('label_sensors', v), 'Sensors')}
      ${items.map((s, i) => html`
        <div class="entity-item">
          <div class="entity-item-hd">
            <span class="entity-item-num">Sensor ${i + 1}</span>
            <button class="btn-remove" @click="${() => self._removeItem('sensors', i)}">Remove</button>
          </div>
          ${self._entityPicker(s.entity, (v) => {
            self._updateItem('sensors', i, 'entity', v);
            if (v && !s.label) {
              const fn = stateAttr(self.hass, v, 'friendly_name');
              if (fn) self._updateItem('sensors', i, 'label', fn);
            }
            if (v) {
              const dc = stateAttr(self.hass, v, 'device_class') || '';
              if (isMotionSensor(v, dc) && !s.category) {
                self._updateItem('sensors', i, 'category', 'motion');
              }
            }
          }, ['binary_sensor','sensor','input_boolean'], 'Entity')}
          ${self._txt('Label', s.label, (v) => self._updateItem('sensors', i, 'label', v), 'Sensor name')}
          ${self._select('Category', s.category || 'sensor', catOpts, (v) => self._updateItem('sensors', i, 'category', v))}
          ${self._iconPicker(s.icon, (v) => self._updateItem('sensors', i, 'icon', v), 'mdi:eye')}
        </div>
      `)}
      <button class="btn-add" @click="${() => self._addItem('sensors', { entity:'', label:'', icon:'', category:'sensor' })}">+ Add Sensor</button>
    `;
  }

  render() {
    try {
      if (!this._config) return html``;
      const cfg = this._config;
      const counts = {
        power:      (cfg.power_circuits || []).length,
        appliances: (cfg.appliances     || []).length,
        lights:     (cfg.lights         || []).length,
        gauges:     (cfg.gauges         || []).length,
        sensors:    (cfg.sensors        || []).length,
      };
      return html`
        <div class="ed-root">
          ${this._section('header',     '🏠 Header',               undefined,          this._headerContent())}
          ${this._section('power',      '⚡ Power',                counts.power,       this._powerContent())}
          ${this._section('appliances', '🍳 Appliances',           counts.appliances,  this._appliancesContent())}
          ${this._section('lights',     '💡 Lights',              counts.lights,      this._lightsContent())}
          ${this._section('climate',    '🌡️ Climate Gauges',       counts.gauges,      this._climateContent())}
          ${this._section('sensors',    '📡 Sensors',              counts.sensors,     this._sensorsContent())}
        </div>
      `;
    } catch (err) {
      console.error('[KITCHEN-CARD editor error]', err);
      return html`<div style="padding:16px;color:#ef4444;font-size:12px;font-family:monospace;white-space:pre-wrap">Editor error — check browser console:\n${err && err.message ? err.message : String(err)}</div>`;
    }
  }

  static get styles() {
    return css`
      :host { display: block; font-family: 'Segoe UI', system-ui, sans-serif; }
      .ed-root { display: flex; flex-direction: column; padding: 8px 0; }

      .ed-label { display: block; font-size: 12px; font-weight: 500; color: var(--primary-text-color, rgba(255,255,255,.7)); margin-bottom: 6px; letter-spacing: .2px; }
      .ed-field { margin-bottom: 12px; }

      .ed-input, .ed-select {
        width: 100%; padding: 10px 12px; font-size: 14px; font-family: inherit;
        border: 1px solid var(--divider-color, rgba(255,255,255,.1));
        border-radius: 8px;
        background: var(--secondary-background-color, rgba(255,255,255,.04));
        color: var(--primary-text-color, #fff);
        transition: border-color .15s; box-sizing: border-box;
      }
      .ed-input:focus, .ed-select:focus { outline: none; border-color: var(--primary-color, #4fa3e0); }

      .hint { font-size: 12px; color: var(--secondary-text-color, rgba(255,255,255,.5)); margin: 0 0 10px; line-height: 1.5; }

      ha-entity-picker, ha-icon-picker { display: block; width: 100%; }

      .ed-section { background: var(--secondary-background-color, rgba(255,255,255,.025)); border: 1px solid var(--divider-color, rgba(255,255,255,.06)); border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
      .ed-section-header { padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; transition: background .15s; }
      .ed-section-header:hover { background: rgba(255,255,255,.03); }
      .ed-section-title { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; color: var(--primary-text-color, #fff); }
      .ed-section-count { font-size: 11px; font-weight: 500; color: var(--secondary-text-color, rgba(255,255,255,.4)); background: rgba(255,255,255,.05); padding: 2px 8px; border-radius: 10px; }
      .ed-section-arrow { color: var(--secondary-text-color, rgba(255,255,255,.4)); font-size: 12px; transition: transform .2s; }
      .ed-section.open .ed-section-arrow { transform: rotate(180deg); }
      .ed-section-body { padding: 0 14px; }
      .ed-section.open .ed-section-body { padding: 4px 14px 14px; }

      .entity-item { background: rgba(0,0,0,.18); border: 1px solid var(--divider-color, rgba(255,255,255,.05)); border-radius: 9px; padding: 10px; margin-bottom: 10px; }
      .entity-item-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .entity-item-num { font-size: 11px; font-weight: 600; color: var(--primary-color, #e07c4f); letter-spacing: .05em; text-transform: uppercase; }

      .btn-add { width: 100%; padding: 10px; font-size: 13px; font-weight: 500; border: 1px dashed var(--primary-color, #e07c4f); border-radius: 8px; background: transparent; color: var(--primary-color, #e07c4f); cursor: pointer; transition: background .15s; }
      .btn-add:hover { background: rgba(224,124,79,.08); }
      .btn-remove { padding: 4px 10px; font-size: 11px; border: 1px solid #ef4444; border-radius: 6px; background: transparent; color: #ef4444; cursor: pointer; transition: background .15s; }
      .btn-remove:hover { background: rgba(239,68,68,.1); }

      /* Segmented control */
      .segmented { display: flex; border: 1px solid var(--divider-color, rgba(255,255,255,.1)); border-radius: 8px; overflow: hidden; }
      .seg-opt { flex: 1; padding: 8px 4px; font-size: 12px; text-align: center; cursor: pointer; color: var(--secondary-text-color, rgba(255,255,255,.5)); transition: background .15s, color .15s; }
      .seg-opt:hover { background: rgba(255,255,255,.04); }
      .seg-opt.active { background: var(--primary-color, #e07c4f); color: #fff; font-weight: 500; }

      /* Toggle */
      .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; margin-bottom: 10px; }
      .toggle-label { font-size: 13px; color: var(--primary-text-color, rgba(255,255,255,.85)); }
      .toggle-wrap { position: relative; display: inline-block; width: 40px; height: 22px; }
      .toggle-wrap input { opacity: 0; width: 0; height: 0; }
      .toggle-slider { position: absolute; inset: 0; background: rgba(255,255,255,.15); border-radius: 11px; transition: background .2s; cursor: pointer; }
      .toggle-slider::before { content: ''; position: absolute; width: 16px; height: 16px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: transform .2s; }
      input:checked + .toggle-slider { background: var(--primary-color, #e07c4f); }
      input:checked + .toggle-slider::before { transform: translateX(18px); }
    `;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Register
// ════════════════════════════════════════════════════════════════════════════
customElements.define('kitchen-card', KitchenCard);
customElements.define('kitchen-card-editor', KitchenCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type:             'kitchen-card',
  name:             'Kitchen Card',
  description:      'Power-first kitchen dashboard — power gauges · appliances · lights · climate · sensors',
  preview:          true,
  documentationURL: 'https://github.com/robman2026/Multi-panel-dashboard-card',
});

console.info(
  '%c KITCHEN-CARD %c v' + CARD_VERSION + ' ',
  'background:#e07c4f;color:#fff;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;',
  'background:#181c27;color:#ffd26d;font-weight:600;padding:2px 6px;border-radius:0 4px 4px 0;'
);
