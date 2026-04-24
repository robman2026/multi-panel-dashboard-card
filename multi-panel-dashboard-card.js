/**

- Multi-Panel Dashboard Card
- Author: robman2026
- GitHub: https://github.com/robman2026/multi-panel-dashboard-card
- Version: 3.0.0
- License: MIT
- 
- v3.0.0 — MAJOR REWRITE
- - Header: configurable title (left/center), icon, datetime, status dot
- - Motion icons with pulsing amber-active / dim-clear states (ported from room-card)
- - NEW Devices section with Mower (animated SVG, battery, action buttons)
- - Runtime accordions removed — flat layout always
- - Editor completely rebuilt as tabbed UX (Config / Visibility / Layout)
- - Area-based smart prefill filtering all entity pickers
- - Pi-hole-style entity/icon pickers with HA native components
- - Climate: visual color-stop editor (like room-card v1.5.0)
- - Salt/Power: JSON textarea thresholds
- - DEVICE_TYPES registry for future expansion
    */

const CARD_VERSION = "3.0.0";

// LitElement base — needed for editor + MpdCamStream
const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css  = LitElement.prototype.css;

// ── Motion sensor detection ────────────────────────────────────────────────
const MOTION_DC     = ["motion", "occupancy", "presence", "moving"];
const MOTION_ACTIVE = ["on", "detected", "occupied", "home", "moving"];

function isMotionSensor(entityId, deviceClass) {
if (!entityId) return false;
if (MOTION_DC.includes((deviceClass || "").toLowerCase())) return true;
const id = entityId.toLowerCase();
return id.includes("motion") || id.includes("presence") ||
id.includes("occupancy") || id.includes("movement") ||
id.includes("miscare");
}

// ── MDI icon paths (for inline SVG fallback) ───────────────────────────────
const MDI = {
camera:      'M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z',
globe:       'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0c-2.5 2.5-4 6-4 10s1.5 7.5 4 10m0-20c2.5 2.5 4 6 4 10s-1.5 7.5-4 10M2 12h20',
monitor:     'M20 3H4a1 1 0 00-1 1v13a1 1 0 001 1h7v2H8v2h8v-2h-3v-2h7a1 1 0 001-1V4a1 1 0 00-1-1zm-1 13H5V5h14v11z',
printer3d:   'M7 17a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0zM5 6l1.5-3h11L19 6M3 6h18v4H3zm2 4h14l-1 7H6z',
wrench:      'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-.7.7-4.3 4.3-.7-.7a1 1 0 00-1.4 0L5 14a1 1 0 000 1.4l3.6 3.6a1 1 0 001.4 0l5.3-5.3a1 1 0 000-1.4l-.7-.7 4.3-4.3.7-.7z',
motion:      'M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4',
bulb:        'M9 21h6m-3-3v3M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6 6 0 016 9a6 6 0 016-6z',
home:        'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zm6 11V12h6v8',
stairs:      'M3 18h3v-3h3v-3h3v-3h3V6h6v2h-4v3h-3v3h-3v3H8v3H3v-2z',
door:        'M8 3h8a2 2 0 012 2v16H6V5a2 2 0 012-2zm4 9a1 1 0 100-2 1 1 0 000 2z',
lightbulb:   'M9 21h6m-3-3v3M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6 6 0 016 9a6 6 0 016-6z',
server:      'M20 3H4a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1zm0 8H4a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1v-4a1 1 0 00-1-1z',
vibration:   'M0 11h2v2H0zm4-4h2v10H4zm16 4h2v2h-2zm-4-4h2v10h-2zm-4-3h2v16h-2z',
tilt:        'M12 2L2 19h20L12 2zm0 3.5L19.5 18h-15L12 5.5z',
thermometer: 'M15 13V5a3 3 0 00-6 0v8a5 5 0 106 0zm-3 7a3 3 0 110-6 3 3 0 010 6z',
water:       'M12 2c-5.33 4.55-8 8.48-8 11.8a8 8 0 0016 0c0-3.32-2.67-7.25-8-11.8z',
salt:        'M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
person:      'M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z',
switch_icon: 'M17 6H7c-3.31 0-6 2.69-6 6s2.69 6 6 6h10c3.31 0 6-2.69 6-6s-2.69-6-6-6z',
warning:     'M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6zm-1 4v5h2v-5h-2zm0 6v2h2v-2h-2z',
sensor:      'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 4a6 6 0 016 6 6 6 0 01-6 6 6 6 0 01-6-6 6 6 0 016-6z',
bolt:        'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
mower:       'M4 12a4 4 0 014-4h8a4 4 0 014 4v4H4v-4zm2 2h12v2H6v-2zm1-3a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z',
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

// ── Threshold helpers ──────────────────────────────────────────────────────
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

// Visual color-stop defaults for climate editor (matches room-card v1.5.0 format)
const DEFAULT_TEMP_STOPS = [
{ pos: 0,  color: "#2391FF" },
{ pos: 19, color: "#14FF6A" },
{ pos: 27, color: "#F8FF42" },
{ pos: 35, color: "#FF3502" },
{ pos: 50, color: "#FF3502" },
];
const DEFAULT_HUM_STOPS = [
{ pos: 0,  color: "#f97316" },
{ pos: 30, color: "#f97316" },
{ pos: 35, color: "#eab308" },
{ pos: 40, color: "#22c55e" },
{ pos: 60, color: "#22c55e" },
{ pos: 70, color: "#eab308" },
{ pos: 80, color: "#ef4444" },
{ pos: 100,color: "#ef4444" },
];

// Convert color-stop pairs → threshold array used by colorFromThresholds
function stopsToThresholds(stops) {
if (!Array.isArray(stops) || stops.length === 0) return DEFAULT_THRESHOLDS.temperature;
const sorted = […stops].sort((a, b) => a.pos - b.pos);
return sorted.map((s, i) => ({ max: s.pos, color: s.color }));
}

// ── State helpers ──────────────────────────────────────────────────────────
function stateVal(hass, id) {
if (!id || !hass) return null;
var e = hass.states[id];
return e ? e.state : null;
}
function stateNum(hass, id) {
var v = stateVal(hass, id);
return v !== null ? (parseFloat(v) || 0) : 0;
}
function stateAttr(hass, id, attr) {
if (!id || !hass) return null;
var e = hass.states[id];
return e && e.attributes ? e.attributes[attr] : null;
}
function isOn(s)      { return s === 'on' || s === 'true' || s === 'home' || s === 'open'; }
function isUnavail(s) { return !s || s === 'unavailable' || s === 'unknown'; }
function stateLabel(s){ if (!s || isUnavail(s)) return '—'; return s.charAt(0).toUpperCase() + s.slice(1); }

function agoStr(lastChanged) {
if (!lastChanged) return '';
var diff = Math.floor((Date.now() - new Date(lastChanged).getTime()) / 1000);
if (diff < 60)    return diff + 's ago';
if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
return Math.floor(diff / 86400) + 'd ago';
}

// ── SVG builders ───────────────────────────────────────────────────────────
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

// Mower SVG (ported from room-card) — returns an HTML string
function mowerSVG(state) {
var isMowing    = state === "mowing";
var isReturning = state === "returning";
var isActive    = isMowing || isReturning;
var isError     = state === "error";
var isDocked    = state === "docked";
var opacity     = isDocked ? "0.5" : "1";
var spinCls     = isMowing ? "mow-spin" : "";
var bodyFill    = isError ? "#7f1d1d" : "#3d4a52";
var domeFill    = isError ? "#991b1b" : "#4a5760";
var stopFill    = isError ? "#fca5a5" : "#dc2626";
var grassOp     = isActive ? "1" : "0";
var bladeOp     = isMowing ? "1" : "0";
var motionOp    = isActive ? "0.18" : "0";

return '<svg viewBox="0 0 64 48" width="58" height="44" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:' + opacity + ';overflow:visible;flex-shrink:0">' +
'<g opacity="' + grassOp + '">' +
'<path d="M3 36 C3 29 1 25 1 20" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>' +
'<path d="M3 36 C4 27 7 24 8 19" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/>' +
'<path d="M9 36 C9 28 7 24 6 19" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>' +
'<line x1="9" y1="36" x2="64" y2="36" stroke="#fbbf24" stroke-width="0.9" stroke-dasharray="2.5 2" opacity="0.65"/>' +
'<path d="M55 36 C55 32 54 30 54 28" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round"/>' +
'<path d="M59 36 C59 32 60 30 61 28" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round"/>' +
'<path d="M62 36 C62 32 61 30 60 28" stroke="#4ade80" stroke-width="1.4" stroke-linecap="round"/>' +
'</g>' +
'<g opacity="' + motionOp + '">' +
'<line x1="14" y1="27" x2="10" y2="27" stroke="white" stroke-width="1" stroke-linecap="round"/>' +
'<line x1="14" y1="31" x2="9"  y2="31" stroke="white" stroke-width="1" stroke-linecap="round"/>' +
'</g>' +
'<path d="M14 36 Q14 24 20 22 L52 22 Q58 22 58 30 L58 36 Z" fill="' + bodyFill + '" opacity="0.98"/>' +
'<path d="M18 22 Q18 15 26 14 L48 14 Q56 14 56 20 L56 22 L18 22 Z" fill="' + domeFill + '" opacity="0.95"/>' +
'<path d="M20 18 L52 18" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>' +
'<rect x="22" y="14" width="7" height="3.5" rx="1.5" fill="' + stopFill + '" opacity="0.95"/>' +
'<rect x="22.5" y="14.5" width="6" height="1.5" rx="0.8" fill="#ef4444" opacity="0.6"/>' +
'<circle cx="50" cy="29" r="5" fill="#1a1f35" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>' +
'<line x1="47.5" y1="26.5" x2="47.5" y2="31.5" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.9"/>' +
'<line x1="52.5" y1="26.5" x2="52.5" y2="31.5" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.9"/>' +
'<line x1="47.5" y1="29"   x2="52.5" y2="29"   stroke="white" stroke-width="1.2" stroke-linecap="round" opacity="0.9"/>' +
'<circle cx="22" cy="36" r="9" fill="#2d3748"/>' +
'<circle cx="22" cy="36" r="7.5" fill="#1a202c"/>' +
'<g class="' + spinCls + '" style="transform-origin:22px 36px">' +
'<line x1="22" y1="28.5" x2="22" y2="43.5" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>' +
'<line x1="14.5" y1="36" x2="29.5" y2="36" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>' +
'<line x1="16.7" y1="30.7" x2="27.3" y2="41.3" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>' +
'<line x1="27.3" y1="30.7" x2="16.7" y2="41.3" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>' +
'</g>' +
'<circle cx="22" cy="36" r="3" fill="#4a5568"/>' +
'<circle cx="22" cy="36" r="1.5" fill="rgba(255,255,255,0.3)"/>' +
'<circle cx="50" cy="36" r="9" fill="#2d3748"/>' +
'<circle cx="50" cy="36" r="7.5" fill="#1a202c"/>' +
'<g class="' + spinCls + '" style="transform-origin:50px 36px">' +
'<line x1="50" y1="28.5" x2="50" y2="43.5" stroke="rgba(255,255,255,0.28)" stroke-width="1.2"/>' +
'<line x1="42.5" y1="36" x2="57.5" y2="36" stroke="rgba(255,255,255,0.28)" stroke-width="1.2"/>' +
'<line x1="44.7" y1="30.7" x2="55.3" y2="41.3" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>' +
'<line x1="55.3" y1="30.7" x2="44.7" y2="41.3" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>' +
'</g>' +
'<circle cx="50" cy="36" r="3" fill="#4a5568"/>' +
'<circle cx="50" cy="36" r="1.5" fill="rgba(255,255,255,0.3)"/>' +
'<ellipse cx="35" cy="37.5" rx="3" ry="2" fill="#2d3748"/>' +
'<g opacity="' + bladeOp + '">' +
'<circle cx="36" cy="37" r="3.5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="0.8"/>' +
'<g class="mow-spin-fast" style="transform-origin:36px 37px">' +
'<line x1="32.5" y1="37" x2="39.5" y2="37" stroke="#22c55e" stroke-width="1" stroke-linecap="round"/>' +
'<line x1="36" y1="33.5" x2="36" y2="40.5" stroke="#22c55e" stroke-width="1" stroke-linecap="round"/>' +
'</g>' +
'</g>' +
'</svg>';
}

// ── Salt % calculation ─────────────────────────────────────────────────────
function calcSaltPct(hass, cfg) {
var entityId = cfg.salt_pct_entity || cfg.salt_entity;
if (!entityId || !hass) return 0;
var val = stateNum(hass, entityId);
if (val > 1 && val <= 100) return val / 100;
if (val >= 0 && val <= 1)  return val;
return 0;
}

// ── DEVICE TYPES registry — scaffolding for future device types ────────────
const DEVICE_TYPES = {
mower: {
label: 'Mower',
icon: '🤖',
fields: ['entity', 'battery_entity', 'name'],
renderCard: function(hass, cfg, moreInfoFn, serviceFn) {
if (!cfg.mower_entity) return '';
var stateObj  = hass && hass.states[cfg.mower_entity];
var state     = stateObj ? stateObj.state : 'unknown';
var name      = cfg.mower_name || (stateObj && stateObj.attributes.friendly_name) || 'Mower';
var ago       = agoStr(stateObj ? stateObj.last_changed : null);
var battPct   = cfg.mower_battery_entity ? Math.round(stateNum(hass, cfg.mower_battery_entity)) : null;
var battColor = battPct === null ? '#6b7280'
: battPct > 50 ? '#22c55e'
: battPct > 20 ? '#fbbf24' : '#ef4444';

```
  var BADGES = {
    mowing:    { label: 'Mowing',    color: '#22c55e', bg: 'rgba(34,197,94,0.15)'  },
    docked:    { label: 'Docked',    color: '#60a5fa', bg: 'rgba(99,179,237,0.15)' },
    paused:    { label: 'Paused',    color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
    returning: { label: 'Returning', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
    error:     { label: 'Error',     color: '#ef4444', bg: 'rgba(239,68,68,0.18)'  },
  };
  var badge   = BADGES[state] || { label: state, color: '#6b7280', bg: 'rgba(107,114,128,0.15)' };
  var iconBg  = state === 'mowing' ? 'rgba(34,197,94,0.15)' : 'rgba(99,179,237,0.1)';
  var iconBdr = state === 'mowing' ? 'rgba(34,197,94,0.3)'  : 'rgba(99,179,237,0.2)';

  return '<div class="mower-tile" data-mower-id="' + cfg.mower_entity + '">' +
    '<div class="mower-head" data-action="more-info" data-target="' + cfg.mower_entity + '">' +
      '<div class="mower-icon-box" style="background:' + iconBg + ';border-color:' + iconBdr + '">🤖</div>' +
      '<div class="mower-info">' +
        '<div class="mower-name">' + name + '</div>' +
        '<div class="mower-status-row">' +
          (ago ? '<span class="mower-ago">' + ago + '</span>' : '') +
          '<span class="mower-badge" style="color:' + badge.color + ';background:' + badge.bg + '">' + badge.label + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="mower-svg-wrap">' + mowerSVG(state) + '</div>' +
    '</div>' +
    (battPct !== null ?
      '<div class="mower-batt">' +
        '<span class="mower-batt-ico">🔋</span>' +
        '<div class="mower-batt-track">' +
          '<div class="mower-batt-fill" style="width:' + battPct + '%;background:' + battColor + '"></div>' +
        '</div>' +
        '<div class="mower-batt-pct" style="color:' + battColor + '">' + battPct + '%</div>' +
      '</div>' : '') +
    '<div class="mower-btns">' +
      '<button class="mower-btn" data-action="mower-service" data-service="start_mowing" data-target="' + cfg.mower_entity + '">Start</button>' +
      '<button class="mower-btn" data-action="mower-service" data-service="pause" data-target="' + cfg.mower_entity + '">Pause</button>' +
      '<button class="mower-btn" data-action="mower-service" data-service="dock" data-target="' + cfg.mower_entity + '">Dock</button>' +
    '</div>' +
  '</div>';
},
```

},
// Future device types plug in here — e.g., vacuum, washer, dryer
};

// ── Default config (stub) ──────────────────────────────────────────────────
function getStubConfig() {
return {
// Header
title: 'My Room',
title_position: 'left',              // 'left' | 'center'
title_icon: 'mdi:home',
show_datetime: true,
show_status_dot: false,
status_entity: '',

```
// Cameras
cameras:         [],
cameras_columns: 3,

// Switches
switches:         [],
switches_columns: 2,

// Sensors
sensors:         [],
sensors_columns: 2,

// Climate (gauges)
gauges:         [],
gauges_columns: 2,
temp_color_stops: JSON.parse(JSON.stringify(DEFAULT_TEMP_STOPS)),
hum_color_stops:  JSON.parse(JSON.stringify(DEFAULT_HUM_STOPS)),

// Power
power_circuits:  [],
power_columns:   2,

// Salt
salt_entity: '',
salt_pct_entity: '',
salt_max_entity: '',
salt_max_value: '',
salt_label: 'Salt Level',
salt_warn_threshold: 30,
salt_thresholds: JSON.stringify(DEFAULT_THRESHOLDS.salt),

// Devices
show_mower: false,
mower_entity: '',
mower_battery_entity: '',
mower_name: '',

// Labels
label_surveillance: 'Surveillance',
label_switches: 'Switches',
label_sensors: 'Sensors',
label_climate: 'Climate',
label_salt: 'Salt Level',
label_power: 'Power',
label_devices: 'Devices',
```

};
}

// ── CSS ────────────────────────────────────────────────────────────────────
var STYLES = [
"@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');",
":host{display:block;font-family:'DM Sans',sans-serif;}",
"*{box-sizing:border-box;margin:0;padding:0}",

// Card shell
".mpd-card{background:#181c27;border-radius:24px;border:1px solid rgba(255,255,255,.07);box-shadow:0 4px 40px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.06);padding:18px;position:relative;overflow:hidden;}",
".mpd-inner{width:100%;position:relative;z-index:1;}",
".mpd-card::before{content:'';position:absolute;width:300px;height:300px;border-radius:50%;top:-100px;right:-80px;background:#4fa3e0;filter:blur(80px);opacity:.06;pointer-events:none;}",

// Header
".mpd-header{display:flex;align-items:center;padding:0 0 14px;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,.05);gap:10px;position:relative;min-height:30px;}",
".mpd-header.pos-left{justify-content:space-between;}",
".mpd-header.pos-center{justify-content:space-between;}",
".mpd-header.pos-center .mpd-title-wrap{position:absolute;left:50%;transform:translateX(-50%);}",
".mpd-title-wrap{display:flex;align-items:center;gap:8px;min-width:0;flex-shrink:1;}",
".mpd-title-icon{color:rgba(255,255,255,.5);display:flex;align-items:center;flex-shrink:0;}",
".mpd-title-icon ha-icon{–mdc-icon-size:20px;}",
".mpd-title{font-size:16px;font-weight:700;letter-spacing:1.4px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
".mpd-head-right{display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:auto;}",
".mpd-datetime{display:flex;flex-direction:column;align-items:flex-end;gap:1px;}",
".mpd-date{font-size:12px;font-weight:600;color:rgba(255,255,255,.75);letter-spacing:.5px;}",
".mpd-time{font-size:11px;font-weight:400;color:rgba(255,255,255,.4);letter-spacing:1px;font-family:'DM Mono',monospace;}",
".mpd-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}",
".mpd-dot.online{background:#34d399;box-shadow:0 0 8px rgba(52,211,153,.8);animation:pulse-dot 2s ease-in-out infinite;}",
".mpd-dot.offline{background:#6b7280;}",
"@keyframes pulse-dot{0%,100%{opacity:1;box-shadow:0 0 8px rgba(52,211,153,.8);}50%{opacity:.6;box-shadow:0 0 14px rgba(52,211,153,.4);}}",

// Sections
".sec{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.9);font-weight:500;margin-bottom:9px;display:flex;align-items:center;gap:5px;white-space:nowrap;overflow:hidden;}",
".sec-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}",
".divider{height:1px;background:rgba(255,255,255,.05);margin:14px 0;}",

// Cameras
".cam-strip{display:grid;gap:8px;grid-template-columns:repeat(var(–cam-cols,3),minmax(0,1fr));}",
".cam-tile{border-radius:11px;overflow:hidden;background:#090d1a;border:1px solid rgba(255,255,255,.07);position:relative;cursor:pointer;transition:border-color .2s;min-height:90px;}",
".cam-tile:hover{border-color:rgba(79,163,224,.35);}",
"mpd-cam-stream{display:block;width:100%;}",
".cam-placeholder{width:100%;min-height:90px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0d1220,#111827);}",

// Bottom grid
".bottom-grid{display:grid;gap:12px;grid-template-columns:repeat(var(–mpd-cols,4),minmax(0,1fr));}",
".mpd-inner.bp-sm .bottom-grid{grid-template-columns:repeat(2,minmax(0,1fr));}",
".mpd-inner.bp-sm .cam-tile,.mpd-inner.bp-xs .cam-tile{min-height:0;}",
".mpd-inner.bp-xs .bottom-grid{grid-template-columns:repeat(1,minmax(0,1fr));}",
".mpd-inner.bp-sm .sec{letter-spacing:.06em;font-size:8px;}",
".mpd-inner.bp-xs .mpd-title{font-size:14px;letter-spacing:1px;}",
".mpd-inner.bp-xs .mpd-date{font-size:11px;}",
".mpd-inner.bp-xs .mpd-time{font-size:10px;}",

// Sec col
".sec-col{min-width:0;}",

// Switches
".sw-grid{display:grid;gap:5px;grid-template-columns:repeat(var(–sw-cols,2),minmax(0,1fr));}",
".sw-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:9px;padding:10px 6px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:background .15s,border-color .15s,transform .12s;min-width:0;}",
".sw-tile:hover{background:rgba(255,255,255,.06);}",
".sw-tile:active{transform:scale(.97);}",
".sw-tile.sw-on{background:rgba(79,163,224,.07);border-color:rgba(79,163,224,.2);}",
".sw-tile.sw-motion{background:rgba(255,170,80,.07);border-color:rgba(255,170,80,.2);}",
".sw-tile.sw-unavail{opacity:.35;pointer-events:none;}",
".sw-name{font-size:9px;font-weight:500;color:rgba(255,255,255,.75);text-align:center;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;}",
".sw-state{font-size:8px;letter-spacing:.06em;text-transform:uppercase;font-family:'DM Mono',monospace;color:rgba(255,255,255,.28);}",
".sw-state.s-on{color:#6dbfff;}.sw-state.s-motion{color:#ffaa6d;}.sw-state.s-open{color:#ffd26d;}",

// Sensors — with ported motion icon styles
".sensor-grid{display:grid;gap:5px;min-width:0;grid-template-columns:repeat(var(–sn-cols,2),minmax(0,1fr));}",
".sensor-grid.scols-1 .sensor-tile{flex-direction:row;padding:7px 9px;text-align:left;align-items:center;}",
".sensor-grid.scols-1 .sensor-name{flex:1;text-align:left;}",
".sensor-grid.scols-2 .sensor-tile,.sensor-grid.scols-3 .sensor-tile,.sensor-grid.scols-4 .sensor-tile{flex-direction:column;padding:8px 4px;text-align:center;align-items:center;}",
".sensor-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:9px;display:flex;gap:6px;cursor:pointer;transition:background .15s,border-color .15s;min-width:0;overflow:hidden;}",
".sensor-tile:hover{background:rgba(255,255,255,.06);}",
".sensor-tile.motion-active{background:rgba(255,170,80,.08);border-color:rgba(255,170,80,.22);}",
".sensor-icon-wrap{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.05);flex-shrink:0;}",
".sensor-icon-wrap.motion-active{background:rgba(255,170,80,.15);animation:motion-pulse 1.4s ease-in-out infinite;}",
".sensor-icon-wrap.motion-clear{background:rgba(255,255,255,.04);}",
"@keyframes motion-pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,170,80,.35);}50%{box-shadow:0 0 0 6px rgba(255,170,80,0);}}",
".sensor-emoji{font-size:14px;line-height:1;}",
".sensor-emoji.clear{filter:grayscale(1) opacity(.5);}",
".sensor-name{font-size:8px;color:rgba(255,255,255,.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;min-width:0;}",
".sensor-val{font-size:9px;font-weight:500;font-family:'DM Mono',monospace;color:rgba(255,255,255,.8);flex-shrink:0;min-width:0;}",
".sv-on{color:#6dbfff;}.sv-open{color:#ffd26d;}.sv-motion{color:#ff8a6d;}.sv-off{color:rgba(255,255,255,.7);}",

// Gauges
".gauge-grid{display:grid;gap:7px;min-width:0;grid-template-columns:repeat(var(–g-cols,1),minmax(0,1fr));}",
".gauge-grid.gcols-1 .gauge-tile{flex-direction:row;}",
".gauge-grid.gcols-1 .g-name{text-align:left;}",
".gauge-grid.gcols-2 .gauge-tile,.gauge-grid.gcols-3 .gauge-tile{flex-direction:column;align-items:center;}",
".gauge-grid.gcols-2 .g-name,.gauge-grid.gcols-3 .g-name{text-align:center;}",
".gauge-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:10px 8px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:background .15s;min-width:0;overflow:hidden;}",
".gauge-tile:hover{background:rgba(255,255,255,.06);}",
".gauge-wrap{position:relative;flex-shrink:0;width:54px;height:54px;}",
".gauge-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;}",
".g-val{font-size:12px;font-weight:600;display:block;line-height:1.15;font-family:'DM Mono',monospace;color:#fff;}",
".g-sub{font-size:8px;display:block;margin-top:1px;font-family:'DM Mono',monospace;}",
".g-info{min-width:0;flex:1;}",
".g-name{font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;}",

// Salt
".salt-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:10px 12px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:background .15s;min-width:0;overflow:hidden;}",
".salt-tile:hover{background:rgba(255,255,255,.06);}",
".salt-wrap{position:relative;flex-shrink:0;width:60px;height:60px;}",
".salt-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;}",
".s-val{font-size:11px;font-weight:600;color:rgba(255,255,255,.9);font-family:'DM Mono',monospace;display:block;line-height:1.1;}",
".s-pct{font-size:8px;color:rgba(255,255,255,.38);display:block;}",
".salt-info{flex:1;min-width:0;overflow:hidden;}",
".salt-title{font-size:9px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.8);margin-bottom:5px;}",
".salt-bar-wrap{background:rgba(255,255,255,.06);border-radius:3px;height:3px;overflow:hidden;margin-bottom:4px;}",
".salt-bar{height:3px;border-radius:3px;transition:width .6s;}",
".salt-meta{font-size:8px;color:rgba(255,255,255,.5);font-family:'DM Mono',monospace;}",
".salt-warn{font-size:8px;color:#ffd26d;margin-top:3px;display:flex;align-items:center;gap:3px;}",

// Power
".power-grid{display:grid;gap:7px;min-width:0;grid-template-columns:repeat(var(–p-cols,2),minmax(0,1fr));}",
".power-grid.pcols-1 .power-tile{flex-direction:row;}",
".power-grid.pcols-1 .power-name{text-align:left;}",
".power-grid.pcols-2 .power-tile,.power-grid.pcols-3 .power-tile{flex-direction:column;align-items:center;}",
".power-grid.pcols-2 .power-name,.power-grid.pcols-3 .power-name{text-align:center;}",
".power-tile{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:11px;padding:10px 8px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:background .15s;min-width:0;overflow:hidden;}",
".power-tile:hover{background:rgba(255,255,255,.06);}",
".power-arc-wrap{position:relative;flex-shrink:0;width:52px;height:52px;}",
".power-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;}",
".p-val{font-size:12px;font-weight:600;color:rgba(255,255,255,.9);font-family:'DM Mono',monospace;line-height:1;}",
".p-unit{font-size:7px;color:rgba(255,255,255,.7);letter-spacing:.04em;text-transform:uppercase;}",
".power-info{min-width:0;overflow:hidden;}",
".power-name{font-size:8px;color:rgba(255,255,255,.8);letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
".power-subs{display:flex;gap:8px;flex-wrap:wrap;}",
".p-sub{display:flex;flex-direction:column;}",
".p-sub-val{font-size:9px;font-weight:600;color:rgba(255,255,255,.7);font-family:'DM Mono',monospace;}",
".p-sub-lbl{font-size:7px;color:rgba(255,255,255,.7);letter-spacing:.05em;text-transform:uppercase;}",

// Mower (ported from room-card)
".mower-tile{background:linear-gradient(145deg,rgba(34,197,94,.08),rgba(255,255,255,.03));border:1px solid rgba(34,197,94,.18);border-radius:13px;padding:12px;display:flex;flex-direction:column;gap:10px;min-width:0;}",
".mower-head{display:flex;align-items:center;gap:10px;cursor:pointer;min-width:0;}",
".mower-icon-box{width:36px;height:36px;border-radius:9px;background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}",
".mower-info{flex:1;min-width:0;}",
".mower-name{font-size:12px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
".mower-status-row{display:flex;align-items:center;gap:6px;margin-top:2px;flex-wrap:wrap;}",
".mower-ago{font-size:9px;color:rgba(255,255,255,.45);font-family:'DM Mono',monospace;}",
".mower-badge{font-size:9px;font-weight:600;padding:2px 7px;border-radius:10px;letter-spacing:.3px;}",
".mower-svg-wrap{flex-shrink:0;}",
"@keyframes mow-spin{from{transform:rotate(0);}to{transform:rotate(360deg);}}",
"@keyframes mow-spin-fast{from{transform:rotate(0);}to{transform:rotate(360deg);}}",
".mow-spin{animation:mow-spin 1.8s linear infinite;}",
".mow-spin-fast{animation:mow-spin-fast .4s linear infinite;}",
".mower-batt{display:flex;align-items:center;gap:8px;}",
".mower-batt-ico{font-size:13px;}",
".mower-batt-track{flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;}",
".mower-batt-fill{height:100%;border-radius:4px;box-shadow:0 0 6px rgba(34,197,94,.5);transition:width .6s;}",
".mower-batt-pct{font-size:11px;font-weight:600;font-family:'DM Mono',monospace;min-width:34px;text-align:right;}",
".mower-btns{display:flex;gap:6px;}",
".mower-btn{flex:1;padding:7px 8px;font-size:10px;font-weight:600;border:1px solid rgba(255,255,255,.1);border-radius:7px;background:rgba(255,255,255,.03);color:rgba(255,255,255,.75);cursor:pointer;transition:all .15s;letter-spacing:.3px;font-family:inherit;}",
".mower-btn:hover{background:rgba(79,163,224,.1);border-color:rgba(79,163,224,.3);color:#6dbfff;}",
".mower-btn:active{transform:scale(.96);}",
].join('');

// ── Main Card ──────────────────────────────────────────────────────────────
class MultiPanelDashboardCard extends HTMLElement {
constructor() {
super();
this.attachShadow({ mode: 'open' });
this._config = {};
this._hass   = null;
this._built  = false;
this._streamCache = {};
this._tickInterval = null;
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

connectedCallback() {
if (this._tickInterval) clearInterval(this._tickInterval);
this._tickInterval = setInterval(() => {
var clockEl = this.shadowRoot.querySelector('[data-live-clock]');
if (clockEl) {
var now = new Date();
var dateEl = clockEl.querySelector('.mpd-date');
var timeEl = clockEl.querySelector('.mpd-time');
if (dateEl) dateEl.textContent = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
if (timeEl) timeEl.textContent = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
}, 1000);
}

disconnectedCallback() {
if (this._tickInterval) clearInterval(this._tickInterval);
this._tickInterval = null;
}

_moreInfo(id) {
if (!id) return;
this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: id } }));
}

_toggle(id) {
if (!id || !this._hass) return;
this._hass.callService('homeassistant', 'toggle', { entity_id: id });
}

_callService(domain, service, entityId) {
if (!this._hass || !entityId) return;
this._hass.callService(domain, service, { entity_id: entityId });
}

// ── Render header ────────────────────────────────────────────────────────
_renderHeader() {
var cfg = this._config;
var now = new Date();
var date = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
var time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

```
var isOnline = true;
if (cfg.show_status_dot && cfg.status_entity) {
  var st = stateVal(this._hass, cfg.status_entity);
  isOnline = !isUnavail(st) && (st === 'on' || st === 'home' || st === 'connected' || st === 'online' || isOn(st));
}

var pos = cfg.title_position === 'center' ? 'pos-center' : 'pos-left';
var iconHtml = cfg.title_icon ? '<span class="mpd-title-icon">' + renderIcon(cfg.title_icon, 'rgba(255,255,255,.55)', 20) + '</span>' : '';

var dtHtml = '';
if (cfg.show_datetime) {
  dtHtml = '<div class="mpd-datetime"><div class="mpd-date">' + date + '</div><div class="mpd-time">' + time + '</div></div>';
}
var dotHtml = '';
if (cfg.show_status_dot) {
  dotHtml = '<div class="mpd-dot ' + (isOnline ? 'online' : 'offline') + '"></div>';
}

var headRight = '';
if (dtHtml || dotHtml) {
  headRight = '<div class="mpd-head-right">' + dtHtml + dotHtml + '</div>';
}

var titleText = (cfg.title || '').toUpperCase();
return '<div class="mpd-header ' + pos + '" data-live-clock>' +
  '<div class="mpd-title-wrap">' + iconHtml + '<div class="mpd-title">' + titleText + '</div></div>' +
  headRight +
'</div>';
```

}

// ── Render cameras section ───────────────────────────────────────────────
_renderCameras() {
var cfg = this._config;
var cams = (cfg.cameras || []).filter(c => c && c.entity);
if (cams.length === 0) return '';

```
var html = '<div class="sec"><span class="sec-dot" style="background:#4fa3e0;box-shadow:0 0 5px #4fa3e0"></span>' + (cfg.label_surveillance || 'Surveillance') + '</div>';
html += '<div class="cam-strip" style="--cam-cols:' + (parseInt(cfg.cameras_columns) || 3) + '">';
cams.forEach((c, i) => {
  var so = this._hass && this._hass.states[c.entity];
  if (!so || isUnavail(so.state)) {
    html += '<div class="cam-tile" data-action="more-info" data-target="' + c.entity + '"><div class="cam-placeholder">' + renderIcon(c.icon || 'camera', 'rgba(255,255,255,.3)', 24) + '</div></div>';
  } else {
    html += '<div class="cam-tile" data-cam-idx="' + i + '" data-target="' + c.entity + '" data-action="more-info"><mpd-cam-stream data-entity="' + c.entity + '"></mpd-cam-stream></div>';
  }
});
html += '</div>';
return html;
```

}

// ── Render switches section ──────────────────────────────────────────────
_renderSwitches() {
var cfg = this._config;
var list = (cfg.switches || []).filter(s => s && s.entity);
if (list.length === 0) return '';
var cols = parseInt(cfg.switches_columns) || 2;
var out = '<div class="sec"><span class="sec-dot" style="background:#4fa3e0;box-shadow:0 0 5px #4fa3e0"></span>' + (cfg.label_switches || 'Switches') + '</div>';
out += '<div class="sw-grid" style="--sw-cols:' + cols + '">';
list.forEach(s => {
var so   = this._hass && this._hass.states[s.entity];
var st   = so ? so.state : 'unknown';
var unav = isUnavail(st);
var on   = isOn(st);
var cat  = s.category || 'switch';
var cls  = 'sw-tile' + (unav ? ' sw-unavail' : '') + (on && cat === 'motion' ? ' sw-motion' : on ? ' sw-on' : '');
var stateCls = 'sw-state' + (on && cat === 'motion' ? ' s-motion' : on ? ' s-on' : '');
var label = s.label || (so && so.attributes.friendly_name) || s.entity;
var color = on ? (cat === 'motion' ? '#ffaa6d' : '#6dbfff') : 'rgba(255,255,255,.4)';
var icon  = s.icon || (cat === 'light' ? 'mdi:lightbulb' : 'mdi:toggle-switch');
out += '<div class="' + cls + '" data-action="toggle" data-target="' + s.entity + '">' +
'<div class="sw-icon">' + renderIcon(icon, color, 20) + '</div>' +
'<div class="sw-name">' + label + '</div>' +
'<div class="' + stateCls + '">' + (unav ? '—' : (on ? 'ON' : 'OFF')) + '</div>' +
'</div>';
});
out += '</div>';
return out;
}

// ── Render sensors section (with motion icons) ──────────────────────────
_renderSensors() {
var cfg = this._config;
var list = (cfg.sensors || []).filter(s => s && s.entity);
if (list.length === 0) return '';
var cols = Math.max(1, Math.min(4, parseInt(cfg.sensors_columns) || 2));
var out = '<div class="sec"><span class="sec-dot" style="background:#ffaa6d;box-shadow:0 0 5px #ffaa6d"></span>' + (cfg.label_sensors || 'Sensors') + '</div>';
out += '<div class="sensor-grid scols-' + cols + '" style="--sn-cols:' + cols + '">';
list.forEach(s => {
var so = this._hass && this._hass.states[s.entity];
var st = so ? so.state : 'unknown';
var dc = so && so.attributes ? so.attributes.device_class : '';
var label = s.label || (so && so.attributes.friendly_name) || s.entity;
var motion = isMotionSensor(s.entity, dc);
var active = motion && MOTION_ACTIVE.includes((st || '').toLowerCase());

```
  var wrapCls = 'sensor-icon-wrap';
  var emojiCls = 'sensor-emoji';
  if (motion) {
    wrapCls += active ? ' motion-active' : ' motion-clear';
    if (!active) emojiCls += ' clear';
  }

  var iconHtml;
  if (motion) {
    iconHtml = '<span class="' + emojiCls + '">🚶</span>';
  } else {
    iconHtml = renderIcon(s.icon || 'sensor', 'rgba(255,255,255,.6)', 16);
  }

  var tileCls = 'sensor-tile' + (motion && active ? ' motion-active' : '');
  var valCls  = 'sensor-val' + (motion && active ? ' sv-motion' : (isOn(st) ? ' sv-on' : ''));
  var valText = motion
    ? (active ? 'DETECTED' : 'Clear')
    : stateLabel(st);

  out += '<div class="' + tileCls + '" data-action="more-info" data-target="' + s.entity + '">' +
    '<div class="' + wrapCls + '">' + iconHtml + '</div>' +
    '<div class="sensor-name">' + label + '</div>' +
    '<div class="' + valCls + '">' + valText + '</div>' +
  '</div>';
});
out += '</div>';
return out;
```

}

// ── Render climate gauges ────────────────────────────────────────────────
_renderClimate() {
var cfg = this._config;
var list = (cfg.gauges || []).filter(g => g && (g.temp_entity || g.humidity_entity));
if (list.length === 0) return '';
var cols = Math.max(1, Math.min(3, parseInt(cfg.gauges_columns) || 2));
var tempTh = cfg.temp_color_stops && cfg.temp_color_stops.length ? stopsToThresholds(cfg.temp_color_stops) : DEFAULT_THRESHOLDS.temperature;
var humTh  = cfg.hum_color_stops  && cfg.hum_color_stops.length  ? stopsToThresholds(cfg.hum_color_stops)  : DEFAULT_THRESHOLDS.humidity;

```
var out = '<div class="sec"><span class="sec-dot" style="background:#6ddb99;box-shadow:0 0 5px #6ddb99"></span>' + (cfg.label_climate || 'Climate') + '</div>';
out += '<div class="gauge-grid gcols-' + cols + '" style="--g-cols:' + cols + '">';
list.forEach(g => {
  var size = parseInt(g.gauge_size) || 54;
  var tempV = g.temp_entity ? stateNum(this._hass, g.temp_entity) : 0;
  var humV  = g.humidity_entity ? stateNum(this._hass, g.humidity_entity) : 0;
  var tempPct = Math.max(0, Math.min(1, tempV / 40));
  var humPct  = Math.max(0, Math.min(1, humV / 100));
  var tempColor = colorFromThresholds(tempV, tempTh);
  var humColor  = colorFromThresholds(humV, humTh);
  var primaryEntity = g.temp_entity || g.humidity_entity;

  out += '<div class="gauge-tile" data-action="more-info" data-target="' + primaryEntity + '">' +
    '<div class="gauge-wrap">' + gaugeSVG(size, tempPct, tempColor, humPct, humColor) +
    '<div class="gauge-center">';
  if (g.temp_entity) {
    out += '<span class="g-val" style="color:' + tempColor + '">' + Math.round(tempV) + '°</span>';
  }
  if (g.humidity_entity) {
    out += '<span class="g-sub" style="color:' + humColor + '">' + Math.round(humV) + '%</span>';
  }
  out += '</div></div><div class="g-info"><div class="g-name">' + (g.label || 'Room') + '</div></div></div>';
});
out += '</div>';
return out;
```

}

// ── Render salt ──────────────────────────────────────────────────────────
_renderSalt() {
var cfg = this._config;
if (!cfg.salt_entity && !cfg.salt_pct_entity) return '';
var pct = calcSaltPct(this._hass, cfg);
var th = parseTh(cfg.salt_thresholds, DEFAULT_THRESHOLDS.salt);
var color = colorFromThresholds(pct * 100, th);
var pctText = Math.round(pct * 100) + '%';
var rawVal = cfg.salt_entity ? stateVal(this._hass, cfg.salt_entity) : '';
var warn = pct * 100 < (parseFloat(cfg.salt_warn_threshold) || 30);

```
var out = '<div class="sec"><span class="sec-dot" style="background:#e0b44f;box-shadow:0 0 5px #e0b44f"></span>' + (cfg.label_salt || 'Salt Level') + '</div>';
out += '<div class="salt-tile" data-action="more-info" data-target="' + (cfg.salt_pct_entity || cfg.salt_entity) + '">' +
  '<div class="salt-wrap">' + saltSVG(60, pct, color) +
    '<div class="salt-center"><span class="s-val" style="color:' + color + '">' + pctText + '</span></div>' +
  '</div>' +
  '<div class="salt-info">' +
    '<div class="salt-title">' + (cfg.salt_label || 'Salt Level') + '</div>' +
    '<div class="salt-bar-wrap"><div class="salt-bar" style="width:' + (pct * 100) + '%;background:' + color + '"></div></div>' +
    (rawVal ? '<div class="salt-meta">' + rawVal + '</div>' : '') +
    (warn ? '<div class="salt-warn">⚠ Low level</div>' : '') +
  '</div>' +
'</div>';
return out;
```

}

// ── Render power ─────────────────────────────────────────────────────────
_renderPower() {
var cfg = this._config;
var list = (cfg.power_circuits || []).filter(p => p && p.entity);
if (list.length === 0) return '';
var cols = Math.max(1, Math.min(3, parseInt(cfg.power_columns) || 2));
var out = '<div class="sec"><span class="sec-dot" style="background:#e05050;box-shadow:0 0 5px #e05050"></span>' + (cfg.label_power || 'Power') + '</div>';
out += '<div class="power-grid pcols-' + cols + '" style="--p-cols:' + cols + '">';
list.forEach(p => {
var watts = stateNum(this._hass, p.entity);
var maxW = parseFloat(p.max_w) || 3000;
var pct = Math.max(0, Math.min(1, watts / maxW));
var th = parseTh(p.thresholds, DEFAULT_THRESHOLDS.power);
var color = colorFromThresholds(watts, th);
var kwh = p.energy_entity ? stateNum(this._hass, p.energy_entity).toFixed(2) : null;
var amps = p.current_entity ? stateNum(this._hass, p.current_entity).toFixed(2) : null;

```
  out += '<div class="power-tile" data-action="more-info" data-target="' + p.entity + '">' +
    '<div class="power-arc-wrap">' + powerSVG(52, pct, color) +
      '<div class="power-center"><div class="p-val">' + Math.round(watts) + '</div><div class="p-unit">W</div></div>' +
    '</div>' +
    '<div class="power-info">' +
      '<div class="power-name">' + (p.label || 'Circuit') + '</div>' +
      '<div class="power-subs">' +
        (kwh ? '<div class="p-sub"><span class="p-sub-val">' + kwh + '</span><span class="p-sub-lbl">kWh</span></div>' : '') +
        (amps ? '<div class="p-sub"><span class="p-sub-val">' + amps + '</span><span class="p-sub-lbl">A</span></div>' : '') +
      '</div>' +
    '</div>' +
  '</div>';
});
out += '</div>';
return out;
```

}

// ── Render devices section (mower + future) ─────────────────────────────
_renderDevices() {
var cfg = this._config;
var out = '';

```
// Mower
if (cfg.show_mower && cfg.mower_entity && DEVICE_TYPES.mower) {
  out += DEVICE_TYPES.mower.renderCard(this._hass, cfg);
}

// Future: other device types iterate here, check their show_* flag

if (!out) return '';
return '<div class="sec"><span class="sec-dot" style="background:#22c55e;box-shadow:0 0 5px #22c55e"></span>' + (cfg.label_devices || 'Devices') + '</div>' + out;
```

}

// ── Build grid columns ───────────────────────────────────────────────────
_renderBottomGrid() {
var cols = [];
var cameras = this._renderCameras();
var switches = this._renderSwitches();
var sensors = this._renderSensors();
var climate = this._renderClimate();
var devices = this._renderDevices();
var salt = this._renderSalt();
var power = this._renderPower();

```
if (switches) cols.push('<div class="sec-col">' + switches + '</div>');
if (sensors) cols.push('<div class="sec-col">' + sensors + '</div>');
if (climate) cols.push('<div class="sec-col">' + climate + '</div>');
if (devices) cols.push('<div class="sec-col">' + devices + '</div>');
if (salt) cols.push('<div class="sec-col">' + salt + '</div>');
if (power) cols.push('<div class="sec-col">' + power + '</div>');

var colCount = cols.length || 1;
var gridColSetting = Math.min(colCount, 4);

var out = '';
if (cameras) {
  out += cameras + '<div class="divider"></div>';
}
if (cols.length > 0) {
  out += '<div class="bottom-grid" style="--mpd-cols:' + gridColSetting + '">' + cols.join('') + '</div>';
}
return out;
```

}

// ── Main render ──────────────────────────────────────────────────────────
_render() {
if (!this._config) return;
this.shadowRoot.innerHTML =
'<style>' + STYLES + '</style>' +
'<div class="mpd-card">' +
'<div class="mpd-inner" id="mpd-inner">' +
this._renderHeader() +
this._renderBottomGrid() +
'</div>' +
'</div>';

```
this._attachListeners();
this._applyBreakpoints();
this._initStreams();
this._built = true;
```

}

// Incremental update — re-render everything below header (simplest approach)
_update() {
if (!this._built) return;
var inner = this.shadowRoot.getElementById('mpd-inner');
if (!inner) { this._render(); return; }
inner.innerHTML = this._renderHeader() + this._renderBottomGrid();
this._attachListeners();
this._applyBreakpoints();
this._initStreams();
}

_attachListeners() {
var inner = this.shadowRoot.getElementById('mpd-inner');
if (!inner) return;
inner.querySelectorAll('[data-action]').forEach(el => {
el.addEventListener('click', (e) => {
e.stopPropagation();
var action = el.dataset.action;
var target = el.dataset.target;
if (action === 'more-info') this._moreInfo(target);
else if (action === 'toggle') this._toggle(target);
else if (action === 'mower-service') {
var service = el.dataset.service;
this._callService('lawn_mower', service, target);
}
});
});
}

_applyBreakpoints() {
var inner = this.shadowRoot.getElementById('mpd-inner');
if (!inner) return;
var w = this.clientWidth || this.offsetWidth || 800;
inner.classList.remove('bp-xs', 'bp-sm');
if (w < 400) inner.classList.add('bp-xs');
else if (w < 700) inner.classList.add('bp-sm');

```
// Observe size changes
if (!this._ro && typeof ResizeObserver !== 'undefined') {
  this._ro = new ResizeObserver(() => {
    var el = this.shadowRoot.getElementById('mpd-inner');
    if (!el) return;
    var w2 = this.clientWidth || this.offsetWidth || 800;
    el.classList.remove('bp-xs', 'bp-sm');
    if (w2 < 400) el.classList.add('bp-xs');
    else if (w2 < 700) el.classList.add('bp-sm');
  });
  this._ro.observe(this);
}
```

}

_initStreams() {
var nodes = this.shadowRoot.querySelectorAll('mpd-cam-stream');
nodes.forEach(n => {
var eid = n.dataset.entity;
if (!eid || !this._hass) return;
var so = this._hass.states[eid];
if (!so) return;
n.hass = this._hass;
n.stateObj = so;
});
}

getCardSize() {
return 4;
}
}

customElements.define('multi-panel-dashboard-card', MultiPanelDashboardCard);

// ── Camera stream sub-element ──────────────────────────────────────────────
class MpdCamStream extends LitElement {
static get properties() {
return { hass: {}, stateObj: {} };
}

updated(changed) {
if (!changed.has('stateObj') && !changed.has('hass')) return;
var stream = this.shadowRoot.querySelector('ha-camera-stream');
if (!stream) return;
stream.hass = this.hass;
stream.stateObj = this.stateObj;
if (typeof stream.requestUpdate === 'function') stream.requestUpdate();
}

render() {
if (!this.stateObj) return html``;
return html`<div style="position:relative"><ha-camera-stream allow-exoplayer muted playsinline></ha-camera-stream></div>`;
}

static get styles() {
return css`:host { display: block; } ha-camera-stream { width: 100%; display: block; max-height: 200px; object-fit: cover; --video-border-radius: 0; }`;
}
}
customElements.define('mpd-cam-stream', MpdCamStream);

// ════════════════════════════════════════════════════════════════════════════
//   EDITOR
// ════════════════════════════════════════════════════════════════════════════

class MultiPanelDashboardCardEditor extends LitElement {
static get properties() {
return {
hass: {},
_config: { state: true },
_activeTab: { state: true },
_openSections: { state: true },
_areaId: { state: true },   // UI-only filter state, not persisted
};
}

constructor() {
super();
this._activeTab = 'config';
this._openSections = { header: true };
this._areaId = null;
}

setConfig(config) {
this._config = Object.assign({}, getStubConfig(), config);
}

_updateConfig(patch) {
this._config = Object.assign({}, this._config, patch);
this.dispatchEvent(new CustomEvent('config-changed', {
detail: { config: this._config },
bubbles: true, composed: true,
}));
}

_updateListItem(listKey, index, patch) {
var list = […(this._config[listKey] || [])];
list[index] = Object.assign({}, list[index] || {}, patch);
this._updateConfig({ [listKey]: list });
}

_addListItem(listKey, template) {
var list = […(this._config[listKey] || []), template];
this._updateConfig({ [listKey]: list });
}

_removeListItem(listKey, index) {
var list = […(this._config[listKey] || [])];
list.splice(index, 1);
this._updateConfig({ [listKey]: list });
}

_toggleSection(name) {
this._openSections = Object.assign({}, this._openSections, { [name]: !this._openSections[name] });
}

_switchTab(tab) {
this._activeTab = tab;
}

// Determine if an entity belongs to the selected area
_entityInArea(entityId) {
if (!this._areaId) return true;  // no filter
if (!this.hass) return true;
// Use HA's areas/devices/entities registries when available
var ent = this.hass.entities && this.hass.entities[entityId];
if (ent && ent.area_id === this._areaId) return true;
if (ent && ent.device_id && this.hass.devices) {
var dev = this.hass.devices[ent.device_id];
if (dev && dev.area_id === this._areaId) return true;
}
return false;
}

// Entity-picker helper — returns filter function for ha-entity-picker
_buildEntityFilter(extraFilter) {
return (entity) => {
if (extraFilter && !extraFilter(entity)) return false;
if (this._areaId) return this._entityInArea(entity.entity_id);
return true;
};
}

render() {
if (!this._config) return html``;
return html`
<div class="ed-root">
<div class="ed-tabs">
<div class="ed-tab ${this._activeTab === 'config' ? 'active' : ''}"
@click="${() => this._switchTab('config')}">Config</div>
<div class="ed-tab ${this._activeTab === 'visibility' ? 'active' : ''}"
@click="${() => this._switchTab('visibility')}">Visibility</div>
<div class="ed-tab ${this._activeTab === 'layout' ? 'active' : ''}"
@click="${() => this._switchTab('layout')}">Layout</div>
</div>

```
    <div class="ed-body">
      ${this._activeTab === 'config' ? this._renderConfigTab() : ''}
      ${this._activeTab === 'visibility' ? this._renderVisibilityTab() : ''}
      ${this._activeTab === 'layout' ? this._renderLayoutTab() : ''}
    </div>
  </div>
`;
```

}

// ── CONFIG TAB ───────────────────────────────────────────────────────────
_renderConfigTab() {
return html`
<div class="ed-note">
<b>Smart prefill:</b> pick an area and every entity dropdown below will auto-filter to that area.
Clear the area to show all entities.
</div>

```
  <div class="ed-field">
    <label class="ed-label">Area (filter)</label>
    <ha-area-picker
      .hass="${this.hass}"
      .value="${this._areaId || ''}"
      @value-changed="${(e) => { this._areaId = e.detail.value || null; this.requestUpdate(); }}"
    ></ha-area-picker>
  </div>

  ${this._renderSection('header', 'Header', null, this._renderHeaderSection())}
  ${this._renderSection('cameras', 'Cameras', (this._config.cameras || []).length, this._renderListSection('cameras', 'Camera', () => ({ entity: '', label: '', icon: 'mdi:cctv' })))}
  ${this._renderSection('switches', 'Switches', (this._config.switches || []).length, this._renderSwitchesSection())}
  ${this._renderSection('sensors', 'Sensors', (this._config.sensors || []).length, this._renderSensorsSection())}
  ${this._renderSection('climate', 'Climate', (this._config.gauges || []).length, this._renderClimateSection())}
  ${this._renderSection('devices', 'Devices', null, this._renderDevicesSection(), true)}
  ${this._renderSection('salt', 'Salt Level', null, this._renderSaltSection())}
  ${this._renderSection('power', 'Power', (this._config.power_circuits || []).length, this._renderPowerSection())}
`;
```

}

_renderSection(id, label, count, content, highlight) {
var open = !!this._openSections[id];
return html` <div class="ed-section ${open ? 'open' : ''} ${highlight ? 'highlight' : ''}"> <div class="ed-section-header" @click="${() => this._toggleSection(id)}"> <div class="ed-section-title"> ${highlight ? html`<span class="dev-dot"></span>` : ''} ${label} ${count !== null && count !== undefined ? html`<span class="ed-section-count">${count}</span>` : ''} </div> <span class="ed-section-arrow">▾</span> </div> ${open ? html`<div class="ed-section-body">${content}</div>`: ''} </div>`;
}

// ── Header section editor ───────────────────────────────────────────────
_renderHeaderSection() {
var cfg = this._config;
return html`
<div class="ed-field">
<label class="ed-label">Card Title</label>
<input type="text" class="ed-input" .value="${cfg.title || ''}"
@input="${(e) => this._updateConfig({ title: e.target.value })}">
</div>

```
  <div class="ed-field">
    <label class="ed-label">Title Position</label>
    <div class="segmented">
      <div class="seg-opt ${cfg.title_position !== 'center' ? 'active' : ''}"
           @click="${() => this._updateConfig({ title_position: 'left' })}">Left</div>
      <div class="seg-opt ${cfg.title_position === 'center' ? 'active' : ''}"
           @click="${() => this._updateConfig({ title_position: 'center' })}">Center</div>
    </div>
  </div>

  <div class="ed-field">
    <label class="ed-label">Card Icon</label>
    <ha-icon-picker
      .hass="${this.hass}"
      .value="${cfg.title_icon || ''}"
      @value-changed="${(e) => this._updateConfig({ title_icon: e.detail.value || '' })}"
    ></ha-icon-picker>
  </div>

  <div class="toggle-row">
    <span class="toggle-label">Show Date &amp; Time</span>
    <label class="toggle-wrap">
      <input type="checkbox" .checked="${!!cfg.show_datetime}"
             @change="${(e) => this._updateConfig({ show_datetime: e.target.checked })}">
      <span class="toggle-slider"></span>
    </label>
  </div>

  <div class="toggle-row">
    <span class="toggle-label">Show Status Dot</span>
    <label class="toggle-wrap">
      <input type="checkbox" .checked="${!!cfg.show_status_dot}"
             @change="${(e) => this._updateConfig({ show_status_dot: e.target.checked })}">
      <span class="toggle-slider"></span>
    </label>
  </div>

  ${cfg.show_status_dot ? html`
    <div class="ed-field">
      <label class="ed-label">Status Entity (optional)</label>
      <ha-entity-picker
        .hass="${this.hass}"
        .value="${cfg.status_entity || ''}"
        .entityFilter="${this._buildEntityFilter()}"
        allow-custom-entity
        @value-changed="${(e) => this._updateConfig({ status_entity: e.detail.value || '' })}"
      ></ha-entity-picker>
    </div>
  ` : ''}
`;
```

}

// ── Generic list section (cameras — simple entity+label+icon) ───────────
_renderListSection(listKey, itemLabel, newItemFactory) {
var items = this._config[listKey] || [];
return html` ${items.map((item, idx) => html`
<div class="entity-item">
<div class="entity-item-hd">
<span class="entity-item-num">${itemLabel} ${idx + 1}</span>
<button class="btn-remove" @click="${() => this._removeListItem(listKey, idx)}">Remove</button>
</div>
<div class="ed-field">
<label class="ed-label">Entity</label>
<ha-entity-picker
.hass="${this.hass}"
.value="${item.entity || ''}"
.entityFilter="${this._buildEntityFilter((e) => listKey === 'cameras' ? e.entity_id.startsWith('camera.') : true)}"
allow-custom-entity
@value-changed="${(e) => this._handleEntityPicked(listKey, idx, e.detail.value)}"
></ha-entity-picker>
</div>
<div class="ed-field">
<label class="ed-label">Label</label>
<input type="text" class="ed-input" .value="${item.label || ''}"
@input="${(e) => this._updateListItem(listKey, idx, { label: e.target.value })}">
</div>
<div class="ed-field">
<label class="ed-label">Icon</label>
<ha-icon-picker
.hass="${this.hass}"
.value="${item.icon || ''}"
@value-changed="${(e) => this._updateListItem(listKey, idx, { icon: e.detail.value || '' })}"
></ha-icon-picker>
</div>
</div>
`)} <button class="btn-add" @click="${() => this._addListItem(listKey, newItemFactory())}">+ Add ${itemLabel}</button> `;
}

// When entity is picked, auto-fill label/icon if empty
_handleEntityPicked(listKey, idx, entityId) {
var list = this._config[listKey] || [];
var item = list[idx] || {};
var patch = { entity: entityId || '' };
if (entityId && this.hass && this.hass.states[entityId]) {
var so = this.hass.states[entityId];
if (!item.label) patch.label = so.attributes.friendly_name || entityId;
if (!item.icon && so.attributes.icon) patch.icon = so.attributes.icon;
}
this._updateListItem(listKey, idx, patch);
}

// ── Switches section ────────────────────────────────────────────────────
_renderSwitchesSection() {
var items = this._config.switches || [];
var CATEGORIES = ['switch', 'light', 'motion', 'door', 'person', 'server'];
return html` ${items.map((item, idx) => html`
<div class="entity-item">
<div class="entity-item-hd">
<span class="entity-item-num">Switch ${idx + 1}</span>
<button class="btn-remove" @click="${() => this._removeListItem('switches', idx)}">Remove</button>
</div>
<div class="ed-field">
<label class="ed-label">Entity</label>
<ha-entity-picker
.hass="${this.hass}"
.value="${item.entity || ''}"
.entityFilter="${this._buildEntityFilter((e) => {
var d = e.entity_id.split('.')[0];
return ['switch','light','input_boolean','fan','binary_sensor','script','automation'].includes(d);
})}"
allow-custom-entity
@value-changed="${(e) => this._handleEntityPicked('switches', idx, e.detail.value)}"
></ha-entity-picker>
</div>
<div class="ed-field">
<label class="ed-label">Label</label>
<input type="text" class="ed-input" .value="${item.label || ''}"
@input="${(e) => this._updateListItem('switches', idx, { label: e.target.value })}">
</div>
<div class="ed-field">
<label class="ed-label">Icon</label>
<ha-icon-picker
.hass="${this.hass}"
.value="${item.icon || ''}"
@value-changed="${(e) => this._updateListItem('switches', idx, { icon: e.detail.value || '' })}"
></ha-icon-picker>
</div>
<div class="ed-field">
<label class="ed-label">Category</label>
<select class="ed-select" .value="${item.category || 'switch'}"
@change="${(e) => this._updateListItem('switches', idx, { category: e.target.value })}">
${CATEGORIES.map(c => html`<option value="${c}" ?selected="${item.category === c}">${c}</option>`)}
</select>
</div>
</div>
`)} <button class="btn-add" @click="${() => this._addListItem('switches', { entity: '', label: '', icon: 'mdi:toggle-switch', category: 'switch' })}">+ Add Switch</button> `;
}

// ── Sensors section ─────────────────────────────────────────────────────
_renderSensorsSection() {
var items = this._config.sensors || [];
var CATEGORIES = ['sensor', 'motion', 'door', 'person', 'vibration', 'tilt'];
return html` <p style="font-size:11px;color:rgba(255,255,255,.5);margin-bottom:12px;line-height:1.5"> Motion sensors (device_class=motion/occupancy/presence) automatically show the animated walker icon with amber-pulse / clear states. </p> ${items.map((item, idx) => html`
<div class="entity-item">
<div class="entity-item-hd">
<span class="entity-item-num">Sensor ${idx + 1}</span>
<button class="btn-remove" @click="${() => this._removeListItem('sensors', idx)}">Remove</button>
</div>
<div class="ed-field">
<label class="ed-label">Entity</label>
<ha-entity-picker
.hass="${this.hass}"
.value="${item.entity || ''}"
.entityFilter="${this._buildEntityFilter((e) => {
var d = e.entity_id.split('.')[0];
return ['sensor','binary_sensor','device_tracker','person'].includes(d);
})}"
allow-custom-entity
@value-changed="${(e) => this._handleEntityPicked('sensors', idx, e.detail.value)}"
></ha-entity-picker>
</div>
<div class="ed-field">
<label class="ed-label">Label</label>
<input type="text" class="ed-input" .value="${item.label || ''}"
@input="${(e) => this._updateListItem('sensors', idx, { label: e.target.value })}">
</div>
<div class="ed-field">
<label class="ed-label">Icon (ignored if motion sensor)</label>
<ha-icon-picker
.hass="${this.hass}"
.value="${item.icon || ''}"
@value-changed="${(e) => this._updateListItem('sensors', idx, { icon: e.detail.value || '' })}"
></ha-icon-picker>
</div>
<div class="ed-field">
<label class="ed-label">Category</label>
<select class="ed-select" .value="${item.category || 'sensor'}"
@change="${(e) => this._updateListItem('sensors', idx, { category: e.target.value })}">
${CATEGORIES.map(c => html`<option value="${c}" ?selected="${item.category === c}">${c}</option>`)}
</select>
</div>
</div>
`)} <button class="btn-add" @click="${() => this._addListItem('sensors', { entity: '', label: '', icon: 'mdi:motion-sensor', category: 'sensor' })}">+ Add Sensor</button> `;
}

// ── Climate section with visual color-stop editors ──────────────────────
_renderClimateSection() {
var gauges = this._config.gauges || [];
return html`
<p style="font-size:11px;color:rgba(255,255,255,.5);margin-bottom:12px;line-height:1.5">
Add temperature & humidity pairs per room. Color stops are shared across all gauges.
</p>

```
  ${gauges.map((g, idx) => html`
    <div class="entity-item">
      <div class="entity-item-hd">
        <span class="entity-item-num">Room ${idx + 1}</span>
        <button class="btn-remove" @click="${() => this._removeListItem('gauges', idx)}">Remove</button>
      </div>
      <div class="ed-field">
        <label class="ed-label">Temperature Entity</label>
        <ha-entity-picker
          .hass="${this.hass}"
          .value="${g.temp_entity || ''}"
          .entityFilter="${this._buildEntityFilter((e) => {
            var so = this.hass && this.hass.states[e.entity_id];
            var dc = so && so.attributes ? so.attributes.device_class : '';
            return dc === 'temperature' || e.entity_id.toLowerCase().includes('temp');
          })}"
          allow-custom-entity
          @value-changed="${(e) => this._updateListItem('gauges', idx, { temp_entity: e.detail.value || '' })}"
        ></ha-entity-picker>
      </div>
      <div class="ed-field">
        <label class="ed-label">Humidity Entity</label>
        <ha-entity-picker
          .hass="${this.hass}"
          .value="${g.humidity_entity || ''}"
          .entityFilter="${this._buildEntityFilter((e) => {
            var so = this.hass && this.hass.states[e.entity_id];
            var dc = so && so.attributes ? so.attributes.device_class : '';
            return dc === 'humidity' || e.entity_id.toLowerCase().includes('humid');
          })}"
          allow-custom-entity
          @value-changed="${(e) => this._updateListItem('gauges', idx, { humidity_entity: e.detail.value || '' })}"
        ></ha-entity-picker>
      </div>
      <div class="ed-field">
        <label class="ed-label">Label</label>
        <input type="text" class="ed-input" .value="${g.label || ''}"
               @input="${(e) => this._updateListItem('gauges', idx, { label: e.target.value })}">
      </div>
      <div class="ed-field">
        <label class="ed-label">Gauge Size</label>
        <input type="number" class="ed-input" min="40" max="120" .value="${g.gauge_size || 54}"
               @input="${(e) => this._updateListItem('gauges', idx, { gauge_size: parseInt(e.target.value) || 54 })}">
      </div>
    </div>
  `)}
  <button class="btn-add" @click="${() => this._addListItem('gauges', { temp_entity: '', humidity_entity: '', label: 'Room', gauge_size: 54 })}">+ Add Room</button>

  <div style="margin-top:18px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06)">
    <div style="font-size:12px;font-weight:500;color:#fff;margin-bottom:8px;letter-spacing:.3px">Temperature Color Stops</div>
    ${this._renderColorStops('temp_color_stops', DEFAULT_TEMP_STOPS, '°C')}
  </div>

  <div style="margin-top:18px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06)">
    <div style="font-size:12px;font-weight:500;color:#fff;margin-bottom:8px;letter-spacing:.3px">Humidity Color Stops</div>
    ${this._renderColorStops('hum_color_stops', DEFAULT_HUM_STOPS, '%')}
  </div>
`;
```

}

_renderColorStops(configKey, fallback, unit) {
var stops = this._config[configKey] && this._config[configKey].length ? this._config[configKey] : fallback;
var gradient = this._buildGradientCss(stops);
return html` <div class="gradient-bar" style="background:${gradient}"></div> ${stops.map((s, idx) => html`
<div class="stop-row">
<div class="stop-dot" style="background:${s.color}"></div>
<input type="number" class="ed-input stop-val-input"
.value="${s.pos}"
@input="${(e) => this._updateStop(configKey, idx, { pos: parseFloat(e.target.value) || 0 })}">
<span class="stop-unit-lbl">${unit}</span>
<span class="stop-arrow">→</span>
<div class="color-swatch-wrap">
<input type="color" class="color-swatch-input" .value="${s.color}"
@input="${(e) => this._updateStop(configKey, idx, { color: e.target.value })}">
</div>
<button class="btn-remove-sm"
?disabled="${stops.length <= 2}"
@click="${() => this._removeStop(configKey, idx)}">✕</button>
</div>
`)} <div class="stop-actions"> <button class="btn-add sm" @click="${() => this._addStop(configKey, fallback)}">+ Add stop</button> <button class="btn-reset" @click="${() => this._updateConfig({ [configKey]: JSON.parse(JSON.stringify(fallback)) })}">Reset</button> </div> `;
}

_buildGradientCss(stops) {
if (!stops || !stops.length) return 'rgba(255,255,255,.1)';
var sorted = […stops].sort((a, b) => a.pos - b.pos);
var min = sorted[0].pos, max = sorted[sorted.length - 1].pos || 1;
var range = max - min || 1;
var parts = sorted.map(s => s.color + ' ' + (((s.pos - min) / range) * 100).toFixed(1) + '%');
return 'linear-gradient(to right,' + parts.join(',') + ')';
}

_updateStop(configKey, idx, patch) {
var list = […(this._config[configKey] || [])];
list[idx] = Object.assign({}, list[idx], patch);
this._updateConfig({ [configKey]: list });
}

_addStop(configKey, fallback) {
var list = […(this._config[configKey] || fallback)];
var last = list[list.length - 1];
list.push({ pos: (last ? last.pos + 10 : 50), color: last ? last.color : '#4fa3e0' });
this._updateConfig({ [configKey]: list });
}

_removeStop(configKey, idx) {
var list = […(this._config[configKey] || [])];
if (list.length <= 2) return;
list.splice(idx, 1);
this._updateConfig({ [configKey]: list });
}

// ── Devices section ─────────────────────────────────────────────────────
_renderDevicesSection() {
var cfg = this._config;
return html`
<p style="font-size:11px;color:rgba(255,255,255,.5);margin-bottom:12px;line-height:1.5">
Device-type integrations live here. More types coming soon.
</p>

```
  <div class="entity-item">
    <div class="entity-item-hd">
      <span class="entity-item-num">🤖 Mower</span>
    </div>

    <div class="toggle-row">
      <span class="toggle-label">Enable Mower</span>
      <label class="toggle-wrap">
        <input type="checkbox" .checked="${!!cfg.show_mower}"
               @change="${(e) => this._updateConfig({ show_mower: e.target.checked })}">
        <span class="toggle-slider"></span>
      </label>
    </div>

    ${cfg.show_mower ? html`
      <div class="ed-field">
        <label class="ed-label">Mower Entity</label>
        <ha-entity-picker
          .hass="${this.hass}"
          .value="${cfg.mower_entity || ''}"
          .entityFilter="${this._buildEntityFilter((e) => e.entity_id.startsWith('lawn_mower.') || e.entity_id.startsWith('vacuum.'))}"
          allow-custom-entity
          @value-changed="${(e) => this._handleMowerEntity(e.detail.value)}"
        ></ha-entity-picker>
      </div>

      <div class="ed-field">
        <label class="ed-label">Battery Entity (optional)</label>
        <ha-entity-picker
          .hass="${this.hass}"
          .value="${cfg.mower_battery_entity || ''}"
          .entityFilter="${this._buildEntityFilter((e) => {
            var so = this.hass && this.hass.states[e.entity_id];
            var dc = so && so.attributes ? so.attributes.device_class : '';
            return dc === 'battery' || e.entity_id.toLowerCase().includes('battery');
          })}"
          allow-custom-entity
          @value-changed="${(e) => this._updateConfig({ mower_battery_entity: e.detail.value || '' })}"
        ></ha-entity-picker>
      </div>

      <div class="ed-field">
        <label class="ed-label">Display Name (optional)</label>
        <input type="text" class="ed-input" .value="${cfg.mower_name || ''}"
               @input="${(e) => this._updateConfig({ mower_name: e.target.value })}">
      </div>
    ` : ''}
  </div>

  <div style="font-size:10px;color:rgba(255,255,255,.3);padding:8px 6px;text-align:center;letter-spacing:.4px">
    FUTURE: vacuum • washer • dryer • more
  </div>
`;
```

}

_handleMowerEntity(entityId) {
var patch = { mower_entity: entityId || '' };
if (entityId && this.hass && this.hass.states[entityId]) {
var so = this.hass.states[entityId];
if (!this._config.mower_name) patch.mower_name = so.attributes.friendly_name || '';
}
this._updateConfig(patch);
}

// ── Salt section ────────────────────────────────────────────────────────
_renderSaltSection() {
var cfg = this._config;
return html`
<div class="ed-field">
<label class="ed-label">Salt Level Entity (raw)</label>
<ha-entity-picker
.hass="${this.hass}"
.value="${cfg.salt_entity || ''}"
.entityFilter="${this._buildEntityFilter()}"
allow-custom-entity
@value-changed="${(e) => this._updateConfig({ salt_entity: e.detail.value || '' })}"
></ha-entity-picker>
</div>

```
  <div class="ed-field">
    <label class="ed-label">Salt % Entity (preferred)</label>
    <ha-entity-picker
      .hass="${this.hass}"
      .value="${cfg.salt_pct_entity || ''}"
      .entityFilter="${this._buildEntityFilter()}"
      allow-custom-entity
      @value-changed="${(e) => this._updateConfig({ salt_pct_entity: e.detail.value || '' })}"
    ></ha-entity-picker>
  </div>

  <div class="ed-field">
    <label class="ed-label">Label</label>
    <input type="text" class="ed-input" .value="${cfg.salt_label || ''}"
           @input="${(e) => this._updateConfig({ salt_label: e.target.value })}">
  </div>

  <div class="ed-field">
    <label class="ed-label">Warn Threshold (%)</label>
    <input type="number" class="ed-input" min="0" max="100" .value="${cfg.salt_warn_threshold || 30}"
           @input="${(e) => this._updateConfig({ salt_warn_threshold: parseFloat(e.target.value) || 30 })}">
  </div>

  <div class="ed-field">
    <label class="ed-label">Thresholds (JSON)</label>
    <textarea class="ed-input" rows="4" style="font-family:'DM Mono',monospace;font-size:11px"
              @input="${(e) => this._updateConfig({ salt_thresholds: e.target.value })}">${typeof cfg.salt_thresholds === 'string' ? cfg.salt_thresholds : JSON.stringify(cfg.salt_thresholds || DEFAULT_THRESHOLDS.salt)}</textarea>
    <p style="font-size:10px;color:rgba(255,255,255,.4);margin-top:4px">
      Format: [{"max":30,"color":"#e05050"}, …]
    </p>
  </div>
`;
```

}

// ── Power section ───────────────────────────────────────────────────────
_renderPowerSection() {
var items = this._config.power_circuits || [];
return html` ${items.map((p, idx) => html`
<div class="entity-item">
<div class="entity-item-hd">
<span class="entity-item-num">Circuit ${idx + 1}</span>
<button class="btn-remove" @click="${() => this._removeListItem('power_circuits', idx)}">Remove</button>
</div>
<div class="ed-field">
<label class="ed-label">Power Entity (W)</label>
<ha-entity-picker
.hass="${this.hass}"
.value="${p.entity || ''}"
.entityFilter="${this._buildEntityFilter((e) => {
var so = this.hass && this.hass.states[e.entity_id];
var dc = so && so.attributes ? so.attributes.device_class : '';
return dc === 'power' || e.entity_id.toLowerCase().includes('power') || e.entity_id.toLowerCase().includes('watt');
})}"
allow-custom-entity
@value-changed="${(e) => this._updateListItem('power_circuits', idx, { entity: e.detail.value || '' })}"
></ha-entity-picker>
</div>
<div class="ed-field">
<label class="ed-label">Label</label>
<input type="text" class="ed-input" .value="${p.label || ''}"
@input="${(e) => this._updateListItem('power_circuits', idx, { label: e.target.value })}">
</div>
<div class="ed-field">
<label class="ed-label">Energy Entity (kWh, optional)</label>
<ha-entity-picker
.hass="${this.hass}"
.value="${p.energy_entity || ''}"
.entityFilter="${this._buildEntityFilter()}"
allow-custom-entity
@value-changed="${(e) => this._updateListItem('power_circuits', idx, { energy_entity: e.detail.value || '' })}"
></ha-entity-picker>
</div>
<div class="ed-field">
<label class="ed-label">Current Entity (A, optional)</label>
<ha-entity-picker
.hass="${this.hass}"
.value="${p.current_entity || ''}"
.entityFilter="${this._buildEntityFilter()}"
allow-custom-entity
@value-changed="${(e) => this._updateListItem('power_circuits', idx, { current_entity: e.detail.value || '' })}"
></ha-entity-picker>
</div>
<div class="ed-field">
<label class="ed-label">Max Watts</label>
<input type="number" class="ed-input" min="100" max="100000" .value="${p.max_w || 3000}"
@input="${(e) => this._updateListItem('power_circuits', idx, { max_w: parseFloat(e.target.value) || 3000 })}">
</div>
<div class="ed-field">
<label class="ed-label">Thresholds (JSON)</label>
<textarea class="ed-input" rows="3" style="font-family:'DM Mono',monospace;font-size:11px"
@input="${(e) => this._updateListItem('power_circuits', idx, { thresholds: e.target.value })}">${typeof p.thresholds === 'string' ? p.thresholds : JSON.stringify(p.thresholds || DEFAULT_THRESHOLDS.power)}</textarea>
</div>
</div>
`)} <button class="btn-add" @click="${() => this._addListItem('power_circuits', { entity: '', label: '', energy_entity: '', current_entity: '', max_w: 3000 })}">+ Add Circuit</button> `;
}

// ── VISIBILITY TAB ───────────────────────────────────────────────────────
_renderVisibilityTab() {
return html`<div class="ed-note"> Use Home Assistant's standard visibility rules to show/hide this card based on user, state, or screen size. Edit those rules from the dashboard card settings (three-dot menu ⋮ → Edit → Visibility). </div> <p style="padding:16px;text-align:center;color:rgba(255,255,255,.4);font-size:12px"> Visibility is managed natively by Home Assistant. </p>`;
}

// ── LAYOUT TAB ───────────────────────────────────────────────────────────
_renderLayoutTab() {
var cfg = this._config;
var FIELDS = [
{ key: 'cameras_columns',  label: 'Cameras columns',      min: 1, max: 6 },
{ key: 'switches_columns', label: 'Switches columns',     min: 1, max: 4 },
{ key: 'sensors_columns',  label: 'Sensors columns',      min: 1, max: 4 },
{ key: 'gauges_columns',   label: 'Climate gauge columns',min: 1, max: 3 },
{ key: 'power_columns',    label: 'Power circuit columns',min: 1, max: 3 },
];
return html` <div class="ed-note"> Set how many columns each section uses. Small screens (mobile/tablet) automatically collapse to fewer columns. </div> ${FIELDS.map(f => html`
<div class="ed-field">
<label class="ed-label">${f.label}</label>
<select class="ed-select" .value="${cfg[f.key]}"
@change="${(e) => this.*updateConfig({ [f.key]: parseInt(e.target.value) })}">
${Array.from({ length: f.max - f.min + 1 }, (*, i) => i + f.min).map(n =>
html`<option value="${n}" ?selected="${cfg[f.key] === n}">${n}</option>`)}
</select>
</div>
`)}

```
  <div style="margin-top:18px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06)">
    <div style="font-size:12px;font-weight:500;color:#fff;margin-bottom:12px">Section Labels</div>
    ${[
      ['label_surveillance', 'Cameras section label'],
      ['label_switches', 'Switches section label'],
      ['label_sensors', 'Sensors section label'],
      ['label_climate', 'Climate section label'],
      ['label_devices', 'Devices section label'],
      ['label_salt', 'Salt section label'],
      ['label_power', 'Power section label'],
    ].map(([key, lbl]) => html`
      <div class="ed-field">
        <label class="ed-label">${lbl}</label>
        <input type="text" class="ed-input" .value="${cfg[key] || ''}"
               @input="${(e) => this._updateConfig({ [key]: e.target.value })}">
      </div>
    `)}
  </div>
`;
```

}

// ── Editor styles ───────────────────────────────────────────────────────
static get styles() {
return css`
:host {
display: block;
font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
}
.ed-root { display: block; }

```
  .ed-tabs {
    display: flex;
    border-bottom: 1px solid rgba(255,255,255,.08);
    margin-bottom: 16px;
  }
  .ed-tab {
    flex: 1;
    padding: 12px 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--secondary-text-color, rgba(255,255,255,.5));
    text-align: center;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color .15s, border-color .15s;
    letter-spacing: .3px;
    user-select: none;
  }
  .ed-tab:hover { color: var(--primary-text-color, rgba(255,255,255,.8)); }
  .ed-tab.active {
    color: var(--primary-color, #6dbfff);
    border-bottom-color: var(--primary-color, #6dbfff);
  }

  .ed-body { padding-bottom: 8px; }

  .ed-note {
    background: rgba(79,163,224,.08);
    border: 1px solid rgba(79,163,224,.18);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 11px;
    color: var(--secondary-text-color, rgba(255,255,255,.6));
    margin-bottom: 14px;
    line-height: 1.45;
  }
  .ed-note b { color: var(--primary-color, #6dbfff); }

  .ed-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: var(--secondary-text-color, rgba(255,255,255,.7));
    margin-bottom: 6px;
    letter-spacing: .2px;
  }
  .ed-field { margin-bottom: 14px; }
  .ed-input, .ed-select {
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    font-family: inherit;
    border: 1px solid var(--divider-color, rgba(255,255,255,.1));
    border-radius: 8px;
    background: var(--secondary-background-color, rgba(255,255,255,.04));
    color: var(--primary-text-color, #fff);
    box-sizing: border-box;
    transition: border-color .15s, background .15s;
  }
  .ed-input:focus, .ed-select:focus {
    outline: none;
    border-color: var(--primary-color, #4fa3e0);
  }
  textarea.ed-input { resize: vertical; min-height: 60px; }

  /* Sections */
  .ed-section {
    background: rgba(255,255,255,.025);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 12px;
    margin-bottom: 10px;
    overflow: hidden;
  }
  .ed-section.highlight {
    border-color: rgba(34,197,94,.25);
    background: rgba(34,197,94,.03);
  }
  .ed-section-header {
    padding: 14px 16px;
    display: flex; align-items: center; justify-content: space-between;
    cursor: pointer;
    user-select: none;
    transition: background .15s;
  }
  .ed-section-header:hover { background: rgba(255,255,255,.03); }
  .ed-section-title {
    display: flex; align-items: center; gap: 10px;
    font-size: 14px; font-weight: 500;
    color: var(--primary-text-color, #fff);
  }
  .ed-section-count {
    font-size: 11px; font-weight: 500;
    color: var(--secondary-text-color, rgba(255,255,255,.4));
    background: rgba(255,255,255,.05);
    padding: 2px 8px;
    border-radius: 10px;
  }
  .ed-section-arrow {
    color: var(--secondary-text-color, rgba(255,255,255,.4));
    font-size: 12px;
    transition: transform .2s;
  }
  .ed-section.open .ed-section-arrow { transform: rotate(180deg); }
  .ed-section-body { padding: 4px 16px 16px; }
  .dev-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,.5);
  }

  /* Entity item card */
  .entity-item {
    background: rgba(0,0,0,.18);
    border: 1px solid rgba(255,255,255,.05);
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 10px;
  }
  .entity-item-hd {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 10px;
  }
  .entity-item-num {
    font-size: 11px; font-weight: 600;
    color: var(--primary-color, #6dbfff);
    letter-spacing: .05em; text-transform: uppercase;
  }
  .btn-remove {
    padding: 4px 10px; font-size: 11px;
    border: 1px solid #ef4444; border-radius: 6px;
    background: transparent; color: #ef4444;
    cursor: pointer; font-family: inherit;
  }
  .btn-remove:hover { background: rgba(239,68,68,.1); }
  .btn-remove-sm {
    padding: 2px 7px; font-size: 10px;
    border: 1px solid #ef4444; border-radius: 4px;
    background: transparent; color: #ef4444;
    cursor: pointer; font-family: inherit;
    flex-shrink: 0;
  }
  .btn-remove-sm:disabled { opacity: .3; cursor: not-allowed; }
  .btn-add {
    width: 100%; padding: 10px;
    font-size: 13px; font-weight: 500;
    border: 1px dashed var(--primary-color, #4fa3e0);
    border-radius: 8px;
    background: transparent;
    color: var(--primary-color, #6dbfff);
    cursor: pointer; font-family: inherit;
    transition: background .15s;
  }
  .btn-add:hover { background: rgba(79,163,224,.08); }
  .btn-add.sm {
    width: auto; padding: 6px 10px; font-size: 11px;
  }

  /* Toggle */
  .toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 0; margin-bottom: 10px;
  }
  .toggle-label {
    font-size: 13px;
    color: var(--primary-text-color, rgba(255,255,255,.75));
  }
  .toggle-wrap {
    position: relative; display: inline-block;
    width: 40px; height: 22px; flex-shrink: 0;
  }
  .toggle-wrap input { display: none; }
  .toggle-slider {
    position: absolute; inset: 0;
    background: #334155;
    border-radius: 11px;
    cursor: pointer;
    transition: background .2s;
  }
  .toggle-slider::before {
    content: ""; position: absolute;
    left: 3px; top: 3px;
    width: 16px; height: 16px;
    background: #fff; border-radius: 50%;
    transition: transform .2s;
  }
  .toggle-wrap input:checked + .toggle-slider {
    background: var(--primary-color, #4fa3e0);
  }
  .toggle-wrap input:checked + .toggle-slider::before {
    transform: translateX(18px);
  }

  /* Segmented control */
  .segmented {
    display: inline-flex;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 8px;
    padding: 2px;
  }
  .seg-opt {
    padding: 7px 14px;
    font-size: 12px; font-weight: 500;
    color: var(--secondary-text-color, rgba(255,255,255,.55));
    cursor: pointer;
    border-radius: 6px;
    transition: all .15s;
    user-select: none;
  }
  .seg-opt.active {
    background: var(--primary-color, #4fa3e0);
    color: #fff;
  }

  /* Color-stop editor */
  .gradient-bar {
    height: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    border: 1px solid var(--divider-color, rgba(255,255,255,.1));
  }
  .stop-row {
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 6px;
  }
  .stop-dot {
    width: 12px; height: 12px; border-radius: 50%;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,.15);
  }
  .stop-val-input {
    width: 62px !important;
    padding: 5px 7px !important;
    font-size: 12px !important;
    flex: none !important;
  }
  .stop-unit-lbl {
    font-size: 11px;
    color: var(--secondary-text-color, rgba(255,255,255,.4));
    flex-shrink: 0;
    width: 18px;
  }
  .stop-arrow {
    font-size: 11px;
    color: var(--secondary-text-color, rgba(255,255,255,.4));
    flex-shrink: 0;
  }
  .color-swatch-wrap {
    width: 32px; height: 28px;
    border-radius: 5px;
    border: 1px solid var(--divider-color, rgba(255,255,255,.1));
    overflow: hidden;
    flex-shrink: 0;
  }
  .color-swatch-input {
    width: 200%; height: 200%;
    margin: -25%;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .stop-actions {
    display: flex; gap: 8px; margin-top: 8px;
  }
  .btn-reset {
    padding: 6px 10px;
    font-size: 11px; font-weight: 500;
    border: 1px solid var(--divider-color, rgba(255,255,255,.1));
    border-radius: 6px;
    background: transparent;
    color: var(--secondary-text-color, rgba(255,255,255,.6));
    cursor: pointer;
    font-family: inherit;
  }
  .btn-reset:hover { background: rgba(255,255,255,.05); }

  /* Native HA pickers spacing */
  ha-entity-picker, ha-icon-picker, ha-area-picker {
    display: block;
    width: 100%;
  }
`;
```

}
}

customElements.define('multi-panel-dashboard-card-editor', MultiPanelDashboardCardEditor);

// ── HACS registration ──────────────────────────────────────────────────────
window.customCards = window.customCards || [];
window.customCards.push({
type: 'multi-panel-dashboard-card',
name: 'Multi-Panel Dashboard Card',
description: 'Unified dashboard card with cameras, switches, sensors, climate gauges, mower, salt, and power — area-filtered editor with Pi-hole-style UX.',
preview: true,
documentationURL: 'https://github.com/robman2026/multi-panel-dashboard-card',
});

console.info(
'%c MULTI-PANEL-DASHBOARD-CARD %c v' + CARD_VERSION + ' ',
'color:white;background:#4fa3e0;font-weight:bold;padding:2px 4px;border-radius:3px 0 0 3px;',
'color:#4fa3e0;background:#181c27;font-weight:bold;padding:2px 4px;border-radius:0 3px 3px 0;'
);
