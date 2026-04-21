/**
 * Multi-Panel Dashboard Card
 * A custom Home Assistant Lovelace card featuring:
 *   - Surveillance cameras (live feed + fullscreen tap)
 *   - Configurable switches grid
 *   - Configurable sensor rows
 *   - Temp/Humidity circular gauges with threshold-based colors
 *   - Salt Level gauge with threshold-based colors
 *
 * Author: robman2026
 * GitHub: https://github.com/robman2026/multi-panel-dashboard-card
 * Version: 1.0.0
 * License: MIT
 */

const CARD_VERSION = "1.1.0";
// LitElement base — gives html/css tags and proper reactive rendering for editor
const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css  = LitElement.prototype.css;


// ── MDI icon paths (inline SVG, no external dependency) ────────────────────
const MDI = {
  camera:       'M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z',
  expand:       'M15 3h6v6m-6 0l6-6M9 21H3v-6m0 6l6-6',
  globe:        'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0c-2.5 2.5-4 6-4 10s1.5 7.5 4 10m0-20c2.5 2.5 4 6 4 10s-1.5 7.5-4 10M2 12h20',
  monitor:      'M20 3H4a1 1 0 00-1 1v13a1 1 0 001 1h7v2H8v2h8v-2h-3v-2h7a1 1 0 001-1V4a1 1 0 00-1-1zm-1 13H5V5h14v11z',
  printer3d:    'M7 17a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0zM5 6l1.5-3h11L19 6M3 6h18v4H3zm2 4h14l-1 7H6z',
  wrench:       'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-.7.7-4.3 4.3-.7-.7a1 1 0 00-1.4 0L5 14a1 1 0 000 1.4l3.6 3.6a1 1 0 001.4 0l5.3-5.3a1 1 0 000-1.4l-.7-.7 4.3-4.3.7-.7zm-9.4 9.4l-1.6-1.6 5.3-5.3 1.6 1.6-5.3 5.3z',
  motion:       'M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4m7-3.93c.5.43.94.86 1.31 1.3C21.42 16.46 22 17.67 22 19v2h-2v-2c0-.86-.38-1.67-1-2.36V16.06m-1-5.06a4 4 0 000 8v-2a2 2 0 000-4V11m-3-7a2 2 0 012 2 2 2 0 01-2 2V4z',
  bulb:         'M9 21h6m-3-3v3M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6 6 0 016 9a6 6 0 016-6z',
  home:         'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zm6 11V12h6v8',
  stairs:       'M3 18h3v-3h3v-3h3v-3h3V6h6v2h-4v3h-3v3h-3v3H8v3H3v-2z',
  door:         'M8 3h8a2 2 0 012 2v16H6V5a2 2 0 012-2zm4 9a1 1 0 100-2 1 1 0 000 2z',
  motion_sensor:'M12 8a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m-8.93 4c0-4.93 4-8.93 8.93-8.93S20.93 7.07 20.93 12 16.93 20.93 12 20.93 3.07 16.93 3.07 12M5 12a7 7 0 007 7 7 7 0 007-7 7 7 0 00-7-7 7 7 0 00-7 7z',
  lightbulb:    'M9 21h6m-3-3v3M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6 6 0 016 9a6 6 0 016-6z',
  server:       'M20 3H4a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1zm0 8H4a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1v-4a1 1 0 00-1-1zm-1 3a1 1 0 11-2 0 1 1 0 012 0zm-4 0a1 1 0 11-2 0 1 1 0 012 0zm5-8a1 1 0 11-2 0 1 1 0 012 0zm-4 0a1 1 0 11-2 0 1 1 0 012 0z',
  vibration:    'M0 11h2v2H0zm4-4h2v10H4zm16 4h2v2h-2zm-4-4h2v10h-2zm-4-3h2v16h-2z',
  tilt:         'M12 2L2 19h20L12 2zm0 3.5L19.5 18h-15L12 5.5zm-1 4v5h2v-5h-2zm0 6v2h2v-2h-2z',
  thermometer:  'M15 13V5a3 3 0 00-6 0v8a5 5 0 106 0zm-3 7a3 3 0 110-6 3 3 0 010 6z',
  water:        'M12 2c-5.33 4.55-8 8.48-8 11.8a8 8 0 0016 0c0-3.32-2.67-7.25-8-11.8z',
  salt:         'M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  person:       'M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z',
  switch_icon:  'M17 6H7c-3.31 0-6 2.69-6 6s2.69 6 6 6h10c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 10H7c-2.21 0-4-1.79-4-4s1.79-4 4-4h10c2.21 0 4 1.79 4 4s-1.79-4 4-4zm0-6a2 2 0 100 4 2 2 0 000-4z',
  warning:      'M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6zm-1 4v5h2v-5h-2zm0 6v2h2v-2h-2z',
  sensor:       'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 4a6 6 0 016 6 6 6 0 01-6 6 6 6 0 01-6-6 6 6 0 016-6zm0 2a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z',
};

// Default icon per entity category
const CATEGORY_ICON = {
  camera:    'camera',
  switch:    'switch_icon',
  door:      'door',
  motion:    'motion',
  light:     'lightbulb',
  person:    'person',
  server:    'server',
  vibration: 'vibration',
  tilt:      'tilt',
  stairs:    'stairs',
  sensor:    'sensor',
  temp:      'thermometer',
  humidity:  'water',
  salt:      'salt',
};

function mdiIcon(name, color = 'rgba(255,255,255,.38)', size = 18) {
  const path = MDI[name] || MDI['sensor'];
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
}

// ── Gauge color from thresholds ────────────────────────────────────────────
// thresholds: [{max: number, color: string}, ...] sorted ascending, last = default
function colorFromThresholds(value, thresholds) {
  if (!thresholds || !thresholds.length) return '#4fa3e0';
  for (const t of thresholds) {
    if (value <= t.max) return t.color;
  }
  return thresholds[thresholds.length - 1].color;
}

// Default threshold sets
const DEFAULT_THRESHOLDS = {
  temperature: [
    { max: 10,  color: '#4fa3e0' }, // cold — blue
    { max: 25,  color: '#6ddb99' }, // ok   — green
    { max: 35,  color: '#e0b44f' }, // warm — amber
    { max: 999, color: '#e05050' }, // hot  — red
  ],
  humidity: [
    { max: 30,  color: '#e0b44f' }, // too dry  — amber
    { max: 60,  color: '#6ddb99' }, // ok       — green
    { max: 80,  color: '#e0b44f' }, // high     — amber
    { max: 999, color: '#e05050' }, // very high— red
  ],
  salt: [
    { max: 30,  color: '#e05050' }, // low      — red
    { max: 60,  color: '#e0b44f' }, // medium   — amber
    { max: 999, color: '#6ddb99' }, // full     — green
  ],
  power: [
    { max: 0,   color: 'rgba(255,255,255,.15)' },
    { max: 999, color: '#4fa3e0' },
  ],
};

// ── SVG ring math ──────────────────────────────────────────────────────────
function ringDashOffset(pct, r) {
  const circ = 2 * Math.PI * r;
  return circ * (1 - Math.max(0, Math.min(1, pct)));
}

// ── State helpers ──────────────────────────────────────────────────────────
function stateVal(hass, entityId) {
  if (!entityId || !hass) return null;
  const e = hass.states[entityId];
  return e ? e.state : null;
}

function stateNum(hass, entityId) {
  const v = stateVal(hass, entityId);
  return v !== null ? parseFloat(v) : 0;
}

function stateAttr(hass, entityId, attr) {
  if (!entityId || !hass) return null;
  const e = hass.states[entityId];
  return e && e.attributes ? e.attributes[attr] : null;
}

function entityIcon(hass, entityId) {
  return stateAttr(hass, entityId, 'icon') || null;
}

function isOn(state) {
  return state === 'on' || state === 'true' || state === 'home' || state === 'open';
}

function isUnavail(state) {
  return !state || state === 'unavailable' || state === 'unknown';
}

function stateLabel(state) {
  if (!state || isUnavail(state)) return '—';
  return state.charAt(0).toUpperCase() + state.slice(1);
}

// ── Styles ─────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  :host { display: block; font-family: 'DM Sans', sans-serif; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .mpd-root {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 2px 0;
  }
  @media (max-width: 600px) {
    .mpd-root { grid-template-columns: 1fr; }
  }

  .mpd-panel {
    background: linear-gradient(135deg, rgba(15,20,40,0.97) 0%, rgba(20,28,55,0.93) 100%);
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 16px;
    position: relative;
    overflow: hidden;
  }
  .mpd-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    background: linear-gradient(160deg, rgba(255,255,255,0.03) 0%, transparent 50%);
    pointer-events: none;
  }

  /* Section label */
  .mpd-sec {
    font-size: 9px;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: rgba(255,255,255,.22);
    font-weight: 500;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .mpd-sec-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .divider {
    height: 1px;
    background: rgba(255,255,255,.05);
    margin: 12px 0;
  }

  /* ── Cameras ── */
  .mpd-cam-strip {
    display: grid;
    gap: 7px;
    margin-bottom: 14px;
  }
  .mpd-cam-tile {
    border-radius: 11px;
    overflow: hidden;
    background: #090d1a;
    border: 1px solid rgba(255,255,255,.07);
    position: relative;
    cursor: pointer;
    transition: border-color .2s;
    min-height: 140px;
  }
  .mpd-cam-tile:hover { border-color: rgba(79,163,224,.35); }
  mpd-cam-stream { display: block; width: 100%; }
  .mpd-cam-placeholder {
    width: 100%; height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #090d1a;
  }
  .cam-label {
    position: absolute;
    bottom: 5px; left: 7px;
    font-size: 8px;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: rgba(255,255,255,.45);
    font-family: 'DM Mono', monospace;
    text-shadow: 0 1px 3px rgba(0,0,0,.8);
    pointer-events: none;
  }
  .cam-live {
    position: absolute;
    top: 5px; right: 6px;
    font-size: 7px;
    color: #6ddb99;
    font-family: 'DM Mono', monospace;
    display: flex;
    align-items: center;
    gap: 3px;
    text-shadow: 0 1px 3px rgba(0,0,0,.8);
    pointer-events: none;
  }
  .live-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #6ddb99;
    animation: livepulse 1.5s ease infinite;
  }
  @keyframes livepulse {
    0%,100% { opacity: 1; }
    50%      { opacity: .25; }
  }
  .cam-expand {
    position: absolute;
    top: 5px; left: 6px;
    opacity: .4;
    pointer-events: none;
  }

  /* ── Switches ── */
  .mpd-sw-grid {
    gap: 7px;
    margin-bottom: 14px;
    display: grid;
  }
  .mpd-sw-tile {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 12px;
    padding: 11px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: background .15s, border-color .15s;
  }
  .mpd-sw-tile:active { transform: scale(.97); }
  .mpd-sw-tile.sw-on  { background: rgba(79,163,224,.07); border-color: rgba(79,163,224,.2); }
  .mpd-sw-tile.sw-motion { background: rgba(255,170,80,.07); border-color: rgba(255,170,80,.2); }
  .mpd-sw-tile.sw-unavail { opacity: .35; pointer-events: none; }
  .sw-name {
    font-size: 10px;
    font-weight: 500;
    color: rgba(255,255,255,.78);
    text-align: center;
    line-height: 1.2;
  }
  .sw-state {
    font-size: 9px;
    letter-spacing: .06em;
    text-transform: uppercase;
    font-family: 'DM Mono', monospace;
    color: rgba(255,255,255,.28);
  }
  .sw-state.s-on     { color: #6dbfff; }
  .sw-state.s-motion { color: #ffaa6d; }
  .sw-state.s-open   { color: #ffd26d; }

  /* ── Sensors ── */
  .mpd-sensor-grid {
    display: grid;
    gap: 6px;
  }
  .mpd-sensor-tile {
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.05);
    border-radius: 10px;
    padding: 8px 5px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    cursor: pointer;
    transition: background .15s;
  }
  .mpd-sensor-tile:hover { background: rgba(255,255,255,.06); }
  .sensor-name {
    font-size: 8px;
    color: rgba(255,255,255,.28);
    letter-spacing: .03em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    text-align: center;
  }
  .sensor-val {
    font-size: 9px;
    font-weight: 500;
    font-family: 'DM Mono', monospace;
    color: rgba(255,255,255,.38);
  }
  .sensor-val.sv-on     { color: #6dbfff; }
  .sensor-val.sv-open   { color: #ffd26d; }
  .sensor-val.sv-motion { color: #ff8a6d; }
  .sensor-val.sv-off    { color: rgba(255,255,255,.2); }

  /* ── Gauges ── */
  .mpd-gauge-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }
  .mpd-gauge-card {
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 14px;
    padding: 14px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: background .15s;
  }
  .mpd-gauge-card:hover { background: rgba(255,255,255,.06); }
  .gauge-wrap {
    position: relative;
    margin-bottom: 8px;
  }
  .gauge-center {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
  }
  .g-val {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,.92);
    font-family: 'DM Mono', monospace;
    display: block;
    line-height: 1.15;
  }
  .g-sub {
    font-size: 9px;
    color: rgba(255,255,255,.38);
    display: block;
    margin-top: 1px;
  }
  .g-name {
    font-size: 9px;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: rgba(255,255,255,.28);
    text-align: center;
  }

  /* ── Salt ── */
  .mpd-salt-card {
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: background .15s;
  }
  .mpd-salt-card:hover { background: rgba(255,255,255,.06); }
  .salt-gauge-wrap {
    flex-shrink: 0;
    position: relative;
  }
  .salt-center {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
  }
  .s-val {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255,255,255,.9);
    font-family: 'DM Mono', monospace;
    display: block;
    line-height: 1.1;
  }
  .s-pct {
    font-size: 9px;
    color: rgba(255,255,255,.38);
    display: block;
  }
  .salt-info { flex: 1; min-width: 0; }
  .salt-title {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: rgba(255,255,255,.55);
    margin-bottom: 6px;
  }
  .salt-bar-wrap {
    background: rgba(255,255,255,.06);
    border-radius: 4px;
    height: 4px;
    overflow: hidden;
    margin-bottom: 5px;
  }
  .salt-bar { height: 4px; border-radius: 4px; transition: width .6s ease; }
  .salt-meta {
    font-size: 8px;
    color: rgba(255,255,255,.28);
    font-family: 'DM Mono', monospace;
    margin-bottom: 5px;
  }
  .salt-warn {
    font-size: 9px;
    color: #ffd26d;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* ── Editor ── */
  .mpd-editor {
    padding: 16px;
    font-family: 'DM Sans', sans-serif;
    color: var(--primary-text-color);
  }
  .mpd-editor h3 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--divider-color);
    padding-bottom: 8px;
  }
  .mpd-editor-section { margin-bottom: 20px; }
  .mpd-editor-section h4 {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--secondary-text-color);
    margin-bottom: 10px;
  }
  .mpd-field { margin-bottom: 10px; }
  .mpd-field label {
    display: block;
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
  }
  .mpd-field ha-entity-picker,
  .mpd-field ha-textfield,
  .mpd-field ha-select {
    width: 100%;
    display: block;
  }
  .mpd-row { display: flex; gap: 8px; align-items: flex-start; }
  .mpd-row .mpd-field { flex: 1; }
  .mpd-add-btn {
    background: rgba(79,163,224,.15);
    color: #6dbfff;
    border: 1px solid rgba(79,163,224,.25);
    border-radius: 8px;
    padding: 7px 14px;
    font-size: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background .15s;
    margin-top: 4px;
  }
  .mpd-add-btn:hover { background: rgba(79,163,224,.28); }
  .mpd-remove-btn {
    background: rgba(255,80,80,.1);
    color: #ff6b6b;
    border: 1px solid rgba(255,80,80,.2);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 11px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    margin-top: 22px;
    flex-shrink: 0;
  }
  .mpd-item-card {
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 8px;
  }
`;

// ── Default config stub ────────────────────────────────────────────────────
function getStubConfig() {
  return {
    // Left panel
    cameras: [
      { entity: '', label: 'Camera 1', icon: 'camera' },
    ],
    cameras_columns: 3,

    switches: [
      { entity: '', label: 'Switch 1', icon: 'switch_icon', category: 'switch' },
    ],
    switches_columns: 2,

    sensors: [
      { entity: '', label: 'Sensor 1', icon: 'sensor', category: 'sensor' },
    ],
    sensors_columns: 4,

    // Right panel
    gauges: [
      {
        temp_entity:     '',
        humidity_entity: '',
        label:           'Room 1',
        temp_thresholds: JSON.stringify(DEFAULT_THRESHOLDS.temperature),
        hum_thresholds:  JSON.stringify(DEFAULT_THRESHOLDS.humidity),
        gauge_size:      88,
      },
    ],

    salt_entity:          '',
    salt_max_entity:      '',
    salt_label:           'Salt Level',
    salt_warn_threshold:  30,
    salt_thresholds:      JSON.stringify(DEFAULT_THRESHOLDS.salt),

    // Panel section labels
    label_surveillance: 'Surveillance',
    label_switches:     'Switches',
    label_sensors:      'Sensors',
    label_climate:      'Temp & Humidity',
    label_salt:         'Salt Level',
  };
}

// ── Render helpers ─────────────────────────────────────────────────────────
function renderIcon(iconName, color, size) {
  const key = (iconName || 'sensor').replace('mdi:', '');
  return mdiIcon(key, color, size);
}

function parseTh(raw, fallback) {
  try { return JSON.parse(raw); } catch { return fallback; }
}

// ── Main Card ──────────────────────────────────────────────────────────────
class MultiPanelDashboardCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass   = null;
    this._built  = false;
  }

  static getConfigElement() {
    return document.createElement('multi-panel-dashboard-card-editor');
  }

  static getStubConfig() { return getStubConfig(); }

  setConfig(config) {
    this._config = { ...getStubConfig(), ...config };
    this._built  = false;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) {
      this._render();
    } else {
      this._update();
      this._initStreams();
    }
  }

  _moreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true, detail: { entityId },
    }));
  }

  _toggle(entityId) {
    if (!entityId || !this._hass) return;
    this._hass.callService('homeassistant', 'toggle', { entity_id: entityId });
  }

  // ── Gauge SVG ──────────────────────────────────────────────────────────
  _gaugeSVG(size, outerPct, outerColor, innerPct, innerColor) {
    const r1   = size * 0.41;
    const r2   = size * 0.32;
    const cx   = size / 2;
    const c1   = 2 * Math.PI * r1;
    const c2   = 2 * Math.PI * r2;
    const off1 = c1 * (1 - Math.max(0, Math.min(1, outerPct)));
    const off2 = c2 * (1 - Math.max(0, Math.min(1, innerPct)));
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${cx}" cy="${cx}" r="${r1}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="3.5"/>
        <circle cx="${cx}" cy="${cx}" r="${r1}" fill="none" stroke="${outerColor}" stroke-width="3.5"
          stroke-linecap="round" stroke-dasharray="${c1.toFixed(1)}" stroke-dashoffset="${off1.toFixed(1)}"
          transform="rotate(-90 ${cx} ${cx})"/>
        <circle cx="${cx}" cy="${cx}" r="${r2}" fill="none" stroke="rgba(255,255,255,.04)" stroke-width="2.5"/>
        <circle cx="${cx}" cy="${cx}" r="${r2}" fill="none" stroke="${innerColor}" stroke-width="2.5"
          stroke-linecap="round" stroke-dasharray="${c2.toFixed(1)}" stroke-dashoffset="${off2.toFixed(1)}"
          transform="rotate(-90 ${cx} ${cx})" opacity="0.55"/>
      </svg>`;
  }

  _saltSVG(size, pct, color) {
    const r   = size * 0.42;
    const cx  = size / 2;
    const c   = 2 * Math.PI * r;
    const off = c * (1 - Math.max(0, Math.min(1, pct)));
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="5"/>
        <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${color}" stroke-width="5"
          stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"
          transform="rotate(-90 ${cx} ${cx})"/>
      </svg>`;
  }

  // ── Build full DOM ─────────────────────────────────────────────────────
  _buildHTML() {
    const cfg  = this._config;
    const hass = this._hass;

    // ── Left: Cameras ──
    const cols_cam = parseInt(cfg.cameras_columns) || 3;
    const cameras  = (cfg.cameras || []).map((cam, i) => {
      const entityId = cam.entity || '';
      const hasEntity = entityId && this._hass && this._hass.states[entityId];
      const iconSvg = renderIcon(cam.icon || 'camera', 'rgba(255,255,255,.25)', 28);
      return `
        <div class="mpd-cam-tile" data-action="camera" data-entity="${entityId}" data-idx="${i}">
          ${hasEntity
            ? `<mpd-cam-stream data-entity="${entityId}" data-idx="${i}"></mpd-cam-stream>`
            : `<div class="mpd-cam-placeholder">${iconSvg}</div>`}
          ${!hasEntity ? `<div class="cam-label">${cam.label || ''}</div>` : ''}
        </div>`;
    }).join('');

    // ── Left: Switches ──
    const cols_sw = parseInt(cfg.switches_columns) || 2;
    const switches = (cfg.switches || []).map((sw, i) => {
      const state    = stateVal(hass, sw.entity);
      const on       = isOn(state);
      const unavail  = isUnavail(state);
      const isMotion = sw.category === 'motion';
      let tileClass  = 'mpd-sw-tile';
      if (unavail)      tileClass += ' sw-unavail';
      else if (isMotion && on) tileClass += ' sw-motion';
      else if (on)      tileClass += ' sw-on';
      const iconColor = unavail ? 'rgba(255,255,255,.2)'
        : isMotion && on ? '#ffaa6d'
        : on ? '#6dbfff'
        : 'rgba(255,255,255,.4)';
      const stateClass = unavail ? '' : isMotion && on ? 's-motion' : on ? 's-on' : '';
      const stateText  = unavail ? 'N/A' : isMotion ? (on ? 'Detected' : 'Clear') : stateLabel(state);
      return `
        <div class="${tileClass}" data-action="toggle" data-entity="${sw.entity || ''}" data-idx="${i}">
          ${renderIcon(sw.icon || 'switch_icon', iconColor, 18)}
          <span class="sw-name">${sw.label || sw.entity || '—'}</span>
          <span class="sw-state ${stateClass}">${stateText}</span>
        </div>`;
    }).join('');

    // ── Left: Sensors ──
    const cols_s = parseInt(cfg.sensors_columns) || 4;
    const sensors = (cfg.sensors || []).map((s, i) => {
      const state   = stateVal(hass, s.entity);
      const unavail = isUnavail(state);
      const on      = isOn(state);
      const cat     = s.category || 'sensor';
      let svClass   = 'sensor-val';
      if (cat === 'motion' && on)  svClass += ' sv-motion';
      else if (cat === 'door' && on) svClass += ' sv-open';
      else if (on) svClass += ' sv-on';
      else if (!unavail && !on) svClass += ' sv-off';
      const iconColor = (cat === 'motion' && on) ? '#ff8a6d'
        : (cat === 'door' && on) ? '#ffd26d'
        : on ? '#6dbfff'
        : 'rgba(255,255,255,.3)';
      const dispState = unavail ? '—'
        : cat === 'motion' ? (on ? 'Motion' : 'Clear')
        : cat === 'door'   ? (on ? 'Open' : 'Closed')
        : cat === 'light'  ? (on ? 'On' : 'Off')
        : cat === 'person' ? (on ? 'Home' : 'Away')
        : stateLabel(state);
      return `
        <div class="mpd-sensor-tile" data-action="more-info" data-entity="${s.entity || ''}" data-idx="${i}">
          ${renderIcon(s.icon || CATEGORY_ICON[cat] || 'sensor', iconColor, 14)}
          <div class="sensor-name">${s.label || s.entity || '—'}</div>
          <div class="${svClass}">${dispState}</div>
        </div>`;
    }).join('');

    // ── Right: Gauges ──
    const gauges = (cfg.gauges || []).map((g, i) => {
      const size    = parseInt(g.gauge_size) || 88;
      const tempVal = stateNum(hass, g.temp_entity);
      const humVal  = stateNum(hass, g.humidity_entity);
      const tempTh  = parseTh(g.temp_thresholds, DEFAULT_THRESHOLDS.temperature);
      const humTh   = parseTh(g.hum_thresholds,  DEFAULT_THRESHOLDS.humidity);
      const tempColor = colorFromThresholds(tempVal, tempTh);
      const humColor  = colorFromThresholds(humVal,  humTh);
      const tempPct   = Math.min(1, Math.max(0, tempVal / 50));
      const humPct    = Math.min(1, Math.max(0, humVal  / 100));
      const tempStr   = g.temp_entity     ? `${tempVal.toFixed(1)}°C` : '—';
      const humStr    = g.humidity_entity ? `${humVal.toFixed(1)}%`   : '—';
      return `
        <div class="mpd-gauge-card" data-action="more-info" data-entity="${g.temp_entity || ''}" data-idx="${i}">
          <div class="gauge-wrap" style="width:${size}px;height:${size}px">
            ${this._gaugeSVG(size, tempPct, tempColor, humPct, humColor)}
            <div class="gauge-center">
              <span class="g-val" id="g-temp-${i}">${tempStr}</span>
              <span class="g-sub"  id="g-hum-${i}">${humStr}</span>
            </div>
          </div>
          <div class="g-name">${g.label || `Gauge ${i+1}`}</div>
        </div>`;
    }).join('');

    // ── Right: Salt ──
    const saltVal   = stateNum(hass, cfg.salt_entity);
    const saltMaxV  = cfg.salt_max_entity ? stateNum(hass, cfg.salt_max_entity) : 1;
    const saltRaw   = parseFloat(cfg.salt_value_override) || saltVal;
    const saltPct   = cfg.salt_entity
      ? (saltMaxV > 0 ? Math.min(1, saltVal / saltMaxV) : 0)
      : 0;
    const saltPctDisp = (saltPct * 100).toFixed(1);
    const saltTh    = parseTh(cfg.salt_thresholds, DEFAULT_THRESHOLDS.salt);
    const saltColor = colorFromThresholds(parseFloat(saltPctDisp), saltTh);
    const saltWarn  = parseFloat(saltPctDisp) < (cfg.salt_warn_threshold || 30);
    const saltLabel = cfg.salt_label || 'Salt Level';
    const saltSize  = 96;

    const saltHTML = cfg.salt_entity ? `
      <div class="mpd-salt-card" data-action="more-info" data-entity="${cfg.salt_entity}">
        <div class="salt-gauge-wrap" style="width:${saltSize}px;height:${saltSize}px">
          ${this._saltSVG(saltSize, saltPct, saltColor)}
          <div class="salt-center">
            <span class="s-val">${saltVal.toFixed(2)}m</span>
            <span class="s-pct">${saltPctDisp}%</span>
          </div>
        </div>
        <div class="salt-info">
          <div class="salt-title">${saltLabel}</div>
          <div class="salt-bar-wrap">
            <div class="salt-bar" style="width:${saltPctDisp}%;background:${saltColor}"></div>
          </div>
          <div class="salt-meta">${saltVal.toFixed(2)} m · ${saltPctDisp}% full</div>
          ${saltWarn ? `<div class="salt-warn">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffd26d" stroke-width="2.5" stroke-linecap="round"><path d="${MDI.warning}"/></svg>
            Below ${cfg.salt_warn_threshold || 30}% — buy more salt!
          </div>` : ''}
        </div>
      </div>` : '';

    // ── Section label colors ──
    const dotCam  = '#4fa3e0';
    const dotSw   = '#ffd26d';
    const dotSens = '#6ddb99';
    const dotClim = '#6ddb99';
    const dotSalt = '#ffd26d';

    return `
      <style>${STYLES}</style>
      <div class="mpd-root">

        <!-- LEFT PANEL -->
        <div class="mpd-panel">

          ${cameras.length ? `
          <div class="mpd-sec">
            <span class="mpd-sec-dot" style="background:${dotCam};box-shadow:0 0 5px ${dotCam}"></span>
            ${cfg.label_surveillance || 'Surveillance'}
          </div>
          <div class="mpd-cam-strip" style="grid-template-columns:repeat(${cols_cam},1fr)">
            ${cameras}
          </div>
          <div class="divider"></div>` : ''}

          ${switches.length ? `
          <div class="mpd-sec" style="margin-top:4px">
            <span class="mpd-sec-dot" style="background:${dotSw};box-shadow:0 0 5px ${dotSw}"></span>
            ${cfg.label_switches || 'Switches'}
          </div>
          <div class="mpd-sw-grid" style="grid-template-columns:repeat(${cols_sw},1fr)">
            ${switches}
          </div>
          <div class="divider"></div>` : ''}

          ${sensors.length ? `
          <div class="mpd-sec" style="margin-top:4px">
            <span class="mpd-sec-dot" style="background:${dotSens};box-shadow:0 0 5px ${dotSens}"></span>
            ${cfg.label_sensors || 'Sensors'}
          </div>
          <div class="mpd-sensor-grid" style="grid-template-columns:repeat(${cols_s},1fr)">
            ${sensors}
          </div>` : ''}

        </div>

        <!-- RIGHT PANEL -->
        <div class="mpd-panel">

          ${gauges.length ? `
          <div class="mpd-sec">
            <span class="mpd-sec-dot" style="background:${dotClim};box-shadow:0 0 5px ${dotClim}"></span>
            ${cfg.label_climate || 'Temp & Humidity'}
          </div>
          <div class="mpd-gauge-grid">
            ${gauges}
          </div>
          <div class="divider"></div>` : ''}

          ${saltHTML ? `
          <div class="mpd-sec">
            <span class="mpd-sec-dot" style="background:${dotSalt};box-shadow:0 0 5px ${dotSalt}"></span>
            ${cfg.label_salt || 'Salt Level'}
          </div>
          ${saltHTML}` : ''}

        </div>
      </div>`;
  }

  _render() {
    this.shadowRoot.innerHTML = this._buildHTML();
    this._attachListeners();
    this._initStreams();
    this._built = true;
  }

  // Push hass+stateObj+label+entityId into every mpd-cam-stream element.
  // Uses requestAnimationFrame to ensure custom elements are fully upgraded
  // before property assignment — this is the critical fix for the blank feed.
  _initStreams() {
    if (!this._hass) return;
    const cfg  = this._config;
    const hass = this._hass;
    const sr   = this.shadowRoot;
    requestAnimationFrame(() => {
      sr.querySelectorAll('mpd-cam-stream').forEach(el => {
        const idx      = parseInt(el.dataset.idx);
        const cam      = (cfg.cameras || [])[idx] || {};
        const entityId = el.dataset.entity || cam.entity || '';
        const stateObj = hass.states[entityId];
        if (!stateObj) return;
        el.hass     = hass;
        el.stateObj = stateObj;
        el.label    = cam.label || entityId;
        el.entityId = entityId;
      });
    });
  }

  // Patch only changed values without full re-render
  _update() {
    const cfg  = this._config;
    const hass = this._hass;
    const sr   = this.shadowRoot;

    // Update switch states
    (cfg.switches || []).forEach((sw, i) => {
      const tile = sr.querySelector(`.mpd-sw-tile[data-idx="${i}"]`);
      if (!tile) return;
      const state    = stateVal(hass, sw.entity);
      const on       = isOn(state);
      const unavail  = isUnavail(state);
      const isMotion = sw.category === 'motion';
      tile.className = 'mpd-sw-tile' + (unavail ? ' sw-unavail' : isMotion && on ? ' sw-motion' : on ? ' sw-on' : '');
      const stEl = tile.querySelector('.sw-state');
      if (stEl) {
        stEl.className  = 'sw-state' + (unavail ? '' : isMotion && on ? ' s-motion' : on ? ' s-on' : '');
        stEl.textContent = unavail ? 'N/A' : isMotion ? (on ? 'Detected' : 'Clear') : stateLabel(state);
      }
    });

    // Update sensor states
    (cfg.sensors || []).forEach((s, i) => {
      const tile = sr.querySelector(`.mpd-sensor-tile[data-idx="${i}"]`);
      if (!tile) return;
      const state   = stateVal(hass, s.entity);
      const on      = isOn(state);
      const cat     = s.category || 'sensor';
      const unavail = isUnavail(state);
      const dispState = unavail ? '—'
        : cat === 'motion' ? (on ? 'Motion' : 'Clear')
        : cat === 'door'   ? (on ? 'Open' : 'Closed')
        : cat === 'light'  ? (on ? 'On' : 'Off')
        : cat === 'person' ? (on ? 'Home' : 'Away')
        : stateLabel(state);
      const valEl = tile.querySelector('.sensor-val');
      if (valEl) {
        valEl.className  = 'sensor-val' + (cat === 'motion' && on ? ' sv-motion' : cat === 'door' && on ? ' sv-open' : on ? ' sv-on' : !unavail && !on ? ' sv-off' : '');
        valEl.textContent = dispState;
      }
    });

    // Update gauge values (text only — full re-render for color changes)
    (cfg.gauges || []).forEach((g, i) => {
      const tempEl = sr.getElementById(`g-temp-${i}`);
      const humEl  = sr.getElementById(`g-hum-${i}`);
      if (tempEl) tempEl.textContent = g.temp_entity     ? `${stateNum(hass, g.temp_entity).toFixed(1)}°C` : '—';
      if (humEl)  humEl.textContent  = g.humidity_entity ? `${stateNum(hass, g.humidity_entity).toFixed(1)}%` : '—';
    });
  }

  _attachListeners() {
    this.shadowRoot.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const action = el.dataset.action;
        const entity = el.dataset.entity;
        if (!entity || entity === 'undefined' || entity === '') return;
        if (action === 'toggle')    this._toggle(entity);
        if (action === 'more-info') this._moreInfo(entity);
        if (action === 'camera')    this._moreInfo(entity);
      });
    });
  }

  getCardSize() { return 8; }
}

// Editor (LitElement — searchable dropdowns, tab layout, same pattern as room-card)
class MultiPanelDashboardCardEditor extends LitElement {
  static get properties() {
    return {
      hass:       {},
      _config:    { state: true },
      _search:    { state: true },
      _activeTab: { state: true },
    };
  }

  constructor() {
    super();
    this._search    = {};
    this._activeTab = "cameras";
  }

  setConfig(config) {
    this._config = { ...getStubConfig(), ...config };
  }

  _fire(config) {
    const ev = new Event("config-changed", { bubbles: true, composed: true });
    ev.detail = { config };
    this.dispatchEvent(ev);
  }

  _set(key, value) {
    this._config = { ...this._config, [key]: value };
    this._fire(this._config);
  }

  _addItem(listKey, defaults) {
    this._set(listKey, [...(this._config[listKey] || []), defaults]);
  }

  _removeItem(listKey, idx) {
    const list = [...(this._config[listKey] || [])];
    list.splice(idx, 1);
    this._set(listKey, list);
  }

  _updateItem(listKey, idx, field, value) {
    const list = [...(this._config[listKey] || [])];
    list[idx] = { ...list[idx], [field]: value };
    this._set(listKey, list);
  }

  // Searchable entity dropdown (same pattern as room-card _renderEntitySearch)
  _entitySearch(searchKey, currentVal, onChange, domains, placeholder) {
    const all      = this.hass ? Object.keys(this.hass.states).sort() : [];
    const filtered = domains && domains.length
      ? all.filter(id => domains.some(d => id.startsWith(d + ".")))
      : all;
    const query   = ((this._search || {})[searchKey] || "").toLowerCase().trim();
    const results = query ? filtered.filter(e => e.toLowerCase().includes(query)) : filtered;
    const label   = eid => {
      const fn = this.hass?.states[eid]?.attributes?.friendly_name;
      return fn ? fn + "  (" + eid + ")" : eid;
    };
    return html`
      <div class="search-wrap">
        <input class="ed-input search-input" type="text"
          placeholder="Search entities..."
          .value="${(this._search || {})[searchKey] || ""}"
          @input="${e => { this._search = { ...this._search, [searchKey]: e.target.value }; }}" />
        <select class="ed-select"
          @change="${e => { onChange(e.target.value); this._search = { ...this._search, [searchKey]: "" }; }}">
          <option value="">${placeholder || "— select entity —"}</option>
          ${results.slice(0, 200).map(eid => html`
            <option value="${eid}" ?selected="${eid === currentVal}">${label(eid)}</option>
          `)}
          ${results.length > 200 ? html`<option disabled>...${results.length - 200} more — refine search</option>` : ""}
        </select>
        ${currentVal ? html`<div class="selected-badge">${currentVal}</div>` : ""}
      </div>
    `;
  }

  _txt(lbl, val, onChange, ph) {
    return html`
      <label class="ed-label">${lbl}</label>
      <input class="ed-input" type="text" .value="${val || ""}" placeholder="${ph || ""}"
        @input="${e => onChange(e.target.value)}" />
    `;
  }

  _numTxt(lbl, val, onChange, ph) {
    return html`
      <label class="ed-label">${lbl}</label>
      <input class="ed-input" type="number" .value="${String(val !== undefined && val !== null ? val : "")}" placeholder="${ph || ""}"
        @input="${e => onChange(e.target.value)}" />
    `;
  }

  _tabCameras() {
    const cfg = this._config;
    const items = cfg.cameras || [];
    return html`
      <div class="section">
        <div class="sec-title">Camera grid</div>
        ${this._numTxt("Columns", cfg.cameras_columns, v => this._set("cameras_columns", parseInt(v) || 3), "3")}
      </div>
      <div class="section">
        <div class="sec-title">Cameras</div>
        ${items.map((cam, i) => html`
          <div class="list-item">
            <div class="list-hdr">
              <span class="list-num">Camera ${i + 1}</span>
              <button class="btn-remove" @click="${() => this._removeItem("cameras", i)}">Remove</button>
            </div>
            <label class="ed-label">Camera entity</label>
            ${this._entitySearch("cam_" + i, cam.entity,
                v => this._updateItem("cameras", i, "entity", v),
                ["camera"], "— select camera —")}
            ${this._txt("Label", cam.label, v => this._updateItem("cameras", i, "label", v), "Camera name")}
            ${this._txt("Icon key", cam.icon, v => this._updateItem("cameras", i, "icon", v), "camera")}
          </div>
        `)}
        <button class="btn-add" @click="${() => this._addItem("cameras", { entity: "", label: "", icon: "camera" })}">+ Add Camera</button>
      </div>
    `;
  }

  _tabSwitches() {
    const cfg = this._config;
    const items = cfg.switches || [];
    return html`
      <div class="section">
        <div class="sec-title">Switch grid</div>
        ${this._numTxt("Columns", cfg.switches_columns, v => this._set("switches_columns", parseInt(v) || 2), "2")}
      </div>
      <div class="section">
        <div class="sec-title">Switches</div>
        <p class="hint">Category controls icon color and state text. Options: switch, motion, light, person, door.</p>
        ${items.map((sw, i) => html`
          <div class="list-item">
            <div class="list-hdr">
              <span class="list-num">Switch ${i + 1}</span>
              <button class="btn-remove" @click="${() => this._removeItem("switches", i)}">Remove</button>
            </div>
            <label class="ed-label">Entity</label>
            ${this._entitySearch("sw_" + i, sw.entity,
                v => this._updateItem("switches", i, "entity", v),
                ["switch", "light", "input_boolean", "fan", "automation", "binary_sensor"],
                "— select entity —")}
            ${this._txt("Label", sw.label, v => this._updateItem("switches", i, "label", v), "Switch name")}
            ${this._txt("Icon key", sw.icon, v => this._updateItem("switches", i, "icon", v), "switch_icon")}
            ${this._txt("Category", sw.category, v => this._updateItem("switches", i, "category", v), "switch / motion / light / door / person")}
          </div>
        `)}
        <button class="btn-add" @click="${() => this._addItem("switches", { entity: "", label: "", icon: "switch_icon", category: "switch" })}">+ Add Switch</button>
      </div>
    `;
  }

  _tabSensors() {
    const cfg = this._config;
    const items = cfg.sensors || [];
    return html`
      <div class="section">
        <div class="sec-title">Sensor grid</div>
        ${this._numTxt("Columns", cfg.sensors_columns, v => this._set("sensors_columns", parseInt(v) || 4), "4")}
      </div>
      <div class="section">
        <div class="sec-title">Sensors</div>
        <p class="hint">Category controls state text and color. Options: door, motion, light, person, sensor.</p>
        ${items.map((s, i) => html`
          <div class="list-item">
            <div class="list-hdr">
              <span class="list-num">Sensor ${i + 1}</span>
              <button class="btn-remove" @click="${() => this._removeItem("sensors", i)}">Remove</button>
            </div>
            <label class="ed-label">Entity</label>
            ${this._entitySearch("s_" + i, s.entity,
                v => this._updateItem("sensors", i, "entity", v),
                ["binary_sensor", "sensor", "input_boolean", "switch", "light"],
                "— select entity —")}
            ${this._txt("Label", s.label, v => this._updateItem("sensors", i, "label", v), "Sensor name")}
            ${this._txt("Icon key", s.icon, v => this._updateItem("sensors", i, "icon", v), "sensor")}
            ${this._txt("Category", s.category, v => this._updateItem("sensors", i, "category", v), "door / motion / light / person / sensor")}
          </div>
        `)}
        <button class="btn-add" @click="${() => this._addItem("sensors", { entity: "", label: "", icon: "sensor", category: "sensor" })}">+ Add Sensor</button>
      </div>
    `;
  }

  _tabClimate() {
    const cfg = this._config;
    const items = cfg.gauges || [];
    return html`
      <div class="section">
        <div class="sec-title">Climate Gauges</div>
        <p class="hint">Outer ring = temperature, inner ring = humidity. Colors driven by threshold JSON arrays.</p>
        ${items.map((g, i) => html`
          <div class="list-item">
            <div class="list-hdr">
              <span class="list-num">Gauge ${i + 1}</span>
              <button class="btn-remove" @click="${() => this._removeItem("gauges", i)}">Remove</button>
            </div>
            <label class="ed-label">Temperature entity</label>
            ${this._entitySearch("gt_" + i, g.temp_entity,
                v => this._updateItem("gauges", i, "temp_entity", v),
                ["sensor"], "— select temperature sensor —")}
            <label class="ed-label">Humidity entity</label>
            ${this._entitySearch("gh_" + i, g.humidity_entity,
                v => this._updateItem("gauges", i, "humidity_entity", v),
                ["sensor"], "— select humidity sensor —")}
            ${this._txt("Label", g.label, v => this._updateItem("gauges", i, "label", v), "Room name")}
            ${this._numTxt("Gauge size (px)", g.gauge_size, v => this._updateItem("gauges", i, "gauge_size", parseInt(v) || 88), "88")}
            <label class="ed-label">Temp thresholds (JSON)</label>
            <input class="ed-input mono" type="text" .value="${g.temp_thresholds || ""}"
              placeholder='[{"max":10,"color":"#4fa3e0"},{"max":25,"color":"#6ddb99"},...]'
              @change="${e => this._updateItem("gauges", i, "temp_thresholds", e.target.value)}" />
            <label class="ed-label">Humidity thresholds (JSON)</label>
            <input class="ed-input mono" type="text" .value="${g.hum_thresholds || ""}"
              placeholder='[{"max":60,"color":"#6ddb99"},{"max":80,"color":"#e0b44f"},...]'
              @change="${e => this._updateItem("gauges", i, "hum_thresholds", e.target.value)}" />
          </div>
        `)}
        <button class="btn-add" @click="${() => this._addItem("gauges", {
          temp_entity: "", humidity_entity: "", label: "",
          temp_thresholds: JSON.stringify(DEFAULT_THRESHOLDS.temperature),
          hum_thresholds:  JSON.stringify(DEFAULT_THRESHOLDS.humidity),
          gauge_size: 88,
        })}">+ Add Gauge</button>
      </div>
    `;
  }

  _tabSalt() {
    const cfg = this._config;
    return html`
      <div class="section">
        <div class="sec-title">Salt Level</div>
        <label class="ed-label">Salt level entity</label>
        ${this._entitySearch("salt_ent", cfg.salt_entity,
            v => this._set("salt_entity", v),
            ["sensor"], "— select salt level sensor —")}
        <label class="ed-label">Salt max entity (optional — used to compute %)</label>
        ${this._entitySearch("salt_max", cfg.salt_max_entity,
            v => this._set("salt_max_entity", v),
            ["sensor"], "— select max sensor —")}
        ${this._txt("Label", cfg.salt_label, v => this._set("salt_label", v), "Salt Level")}
        ${this._numTxt("Warn below (%)", cfg.salt_warn_threshold, v => this._set("salt_warn_threshold", parseFloat(v) || 30), "30")}
        <label class="ed-label">Thresholds (JSON)</label>
        <input class="ed-input mono" type="text" .value="${cfg.salt_thresholds || ""}"
          placeholder='[{"max":30,"color":"#e05050"},{"max":60,"color":"#e0b44f"},{"max":999,"color":"#6ddb99"}]'
          @change="${e => this._set("salt_thresholds", e.target.value)}" />
      </div>
    `;
  }

  _tabLabels() {
    const cfg = this._config;
    return html`
      <div class="section">
        <div class="sec-title">Section Labels</div>
        ${this._txt("Surveillance", cfg.label_surveillance, v => this._set("label_surveillance", v), "Surveillance")}
        ${this._txt("Switches",     cfg.label_switches,     v => this._set("label_switches", v),     "Switches")}
        ${this._txt("Sensors",      cfg.label_sensors,      v => this._set("label_sensors", v),      "Sensors")}
        ${this._txt("Climate",      cfg.label_climate,      v => this._set("label_climate", v),      "Temp & Humidity")}
        ${this._txt("Salt",         cfg.label_salt,         v => this._set("label_salt", v),         "Salt Level")}
      </div>
    `;
  }

  render() {
    if (!this._config) return html``;
    const tabs = [
      { id: "cameras",  label: "Cameras"  },
      { id: "switches", label: "Switches" },
      { id: "sensors",  label: "Sensors"  },
      { id: "climate",  label: "Climate"  },
      { id: "salt",     label: "Salt"     },
      { id: "labels",   label: "Labels"   },
    ];
    return html`
      <div class="editor-root">
        <div class="tab-bar">
          ${tabs.map(t => html`
            <button class="tab-btn ${this._activeTab === t.id ? "active" : ""}"
              @click="${() => { this._activeTab = t.id; }}">${t.label}</button>
          `)}
        </div>
        <div class="tab-content">
          ${this._activeTab === "cameras"  ? this._tabCameras()  : ""}
          ${this._activeTab === "switches" ? this._tabSwitches() : ""}
          ${this._activeTab === "sensors"  ? this._tabSensors()  : ""}
          ${this._activeTab === "climate"  ? this._tabClimate()  : ""}
          ${this._activeTab === "salt"     ? this._tabSalt()     : ""}
          ${this._activeTab === "labels"   ? this._tabLabels()   : ""}
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host { display: block; font-family: "Segoe UI", system-ui, sans-serif; }
      .editor-root { display: flex; flex-direction: column; }
      .tab-bar { display: flex; flex-wrap: wrap; border-bottom: 1px solid rgba(0,0,0,0.15); background: var(--card-background-color, #1e293b); border-radius: 8px 8px 0 0; }
      .tab-btn { flex: 1; min-width: 60px; padding: 8px 4px; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.04em; border: none; background: transparent; color: var(--secondary-text-color, #94a3b8); cursor: pointer; text-transform: uppercase; }
      .tab-btn.active { color: var(--primary-color, #4fa3e0); border-bottom: 2px solid var(--primary-color, #4fa3e0); background: rgba(79,163,224,0.06); }
      .tab-content { padding: 12px 4px; display: flex; flex-direction: column; gap: 4px; }
      .section { margin-bottom: 10px; }
      .sec-title { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary-color, #4fa3e0); margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid rgba(79,163,224,0.2); }
      .hint { font-size: 0.72rem; color: var(--secondary-text-color, #94a3b8); margin: 0 0 8px; line-height: 1.5; }
      .ed-label { display: block; font-size: 0.7rem; font-weight: 600; color: var(--secondary-text-color, #64748b); margin-bottom: 3px; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
      .ed-input { width: 100%; padding: 7px 10px; font-size: 0.82rem; border: 1px solid var(--divider-color, #334155); border-radius: 6px; background: var(--secondary-background-color, #0f172a); color: var(--primary-text-color, #e2e8f0); box-sizing: border-box; }
      .ed-input:focus { outline: none; border-color: var(--primary-color, #4fa3e0); }
      .ed-input.mono { font-family: monospace; font-size: 0.72rem; }
      .ed-select { width: 100%; padding: 7px 10px; font-size: 0.82rem; border: 1px solid var(--divider-color, #334155); border-radius: 6px; background: var(--secondary-background-color, #0f172a); color: var(--primary-text-color, #e2e8f0); box-sizing: border-box; cursor: pointer; margin-top: 4px; }
      .search-wrap { display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px; }
      .search-input { margin-bottom: 0; }
      .selected-badge { font-size: 0.67rem; color: var(--primary-color, #4fa3e0); background: rgba(79,163,224,0.1); border-radius: 4px; padding: 2px 6px; word-break: break-all; }
      .list-item { background: var(--secondary-background-color, rgba(0,0,0,0.2)); border: 1px solid var(--divider-color, #334155); border-radius: 8px; padding: 10px; margin-bottom: 8px; }
      .list-hdr  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
      .list-num  { font-size: 0.72rem; font-weight: 700; color: var(--primary-color, #4fa3e0); text-transform: uppercase; letter-spacing: 0.06em; }
      .btn-add { width: 100%; padding: 8px; font-size: 0.78rem; font-weight: 600; border: 1px dashed var(--primary-color, #4fa3e0); border-radius: 6px; background: transparent; color: var(--primary-color, #4fa3e0); cursor: pointer; }
      .btn-add:hover { background: rgba(79,163,224,0.08); }
      .btn-remove { padding: 3px 8px; font-size: 0.7rem; border: 1px solid #ef4444; border-radius: 4px; background: transparent; color: #ef4444; cursor: pointer; }
      .btn-remove:hover { background: rgba(239,68,68,0.1); }
    `;
  }
}

// MpdCamStream — verbatim copy of RoomCardStream from room-card.js
// Isolates ha-camera-stream from the parent card render cycle.
// Only reconfigures the stream when stateObj reference actually changes.
class MpdCamStream extends LitElement {
  static get properties() {
    return {
      hass:     {},
      stateObj: {},
      label:    {},
      entityId: {},
    };
  }

  _fireMoreInfo() {
    if (!this.entityId) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true,
      detail: { entityId: this.entityId },
    }));
  }

  updated(changedProps) {
    if (!changedProps.has('stateObj') && !changedProps.has('hass')) return;
    const stream = this.shadowRoot.querySelector('ha-camera-stream');
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
    return html`
      <div class="stream-wrap" @click="${() => this._fireMoreInfo()}">
        <ha-camera-stream
          allow-exoplayer
          muted
          playsinline
        ></ha-camera-stream>
        <div class="stream-overlay">
          <span class="stream-label">${(this.label || '').toUpperCase()}</span>
          <div class="stream-right">
            <span class="stream-live">● LIVE</span>
            <button class="stream-fs-btn"
              title="Open fullscreen"
              @click="${(e) => { e.stopPropagation(); this._fireMoreInfo(); }}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.2"
                   stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host { display: block; }
      .stream-wrap {
        position: relative; border-radius: 11px; overflow: hidden;
        background: #0a0e1a; border: 1px solid rgba(255,255,255,0.08);
        min-height: 140px;
      }
      ha-camera-stream {
        width: 100%; display: block;
        max-height: 350px; object-fit: cover;
        --video-border-radius: 0;
      }
      .stream-overlay {
        position: absolute; bottom: 0; left: 0; right: 0;
        padding: 8px 12px;
        background: linear-gradient(transparent, rgba(0,0,0,0.6));
        display: flex; justify-content: space-between; align-items: flex-end;
      }
      .stream-label { font-size: 9px; letter-spacing: 1px; color: rgba(255,255,255,0.5); text-transform: uppercase; }
      .stream-live  { font-size: 8px; letter-spacing: 1px; color: #6ddb99; font-weight: 600; border: 1px solid rgba(109,219,153,0.4); padding: 2px 6px; border-radius: 4px; }
      .stream-right { display: flex; align-items: center; gap: 6px; }
      .stream-wrap  { cursor: pointer; }
      .stream-fs-btn {
        width: 26px; height: 26px; border-radius: 6px;
        background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: rgba(255,255,255,0.75);
        transition: background 0.2s; padding: 0;
      }
      .stream-fs-btn:hover  { background: rgba(79,163,224,0.3); color: #fff; }
      .stream-fs-btn:active { transform: scale(0.92); }
    `;
  }
}


customElements.define('mpd-cam-stream', MpdCamStream);
customElements.define('multi-panel-dashboard-card', MultiPanelDashboardCard);
customElements.define('multi-panel-dashboard-card-editor', MultiPanelDashboardCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type:             'multi-panel-dashboard-card',
  name:             'Multi-Panel Dashboard Card',
  description:      'Cameras · Switches · Sensors · Climate Gauges · Salt Level — Samsung Premium style',
  preview:          true,
  documentationURL: 'https://github.com/robman2026/multi-panel-dashboard-card',
});

console.info(
  `%c MULTI-PANEL-DASHBOARD-CARD %c v${CARD_VERSION} `,
  'background:#4fa3e0;color:#fff;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;',
  'background:#0d1120;color:#6dbfff;font-weight:600;padding:2px 6px;border-radius:0 4px 4px 0;'
);
