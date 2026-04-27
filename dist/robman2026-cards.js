/**
 * robman2026-cards.js
 * Single loader for all robman2026 Home Assistant custom cards.
 * Place in: dist/robman2026-cards.js
 * GitHub: https://github.com/robman2026/multi-panel-dashboard-card
 *
 * Add ONE resource in Home Assistant:
 *   /hacsfiles/multi-panel-dashboard-card/dist/robman2026-cards.js
 *
 * Cards included:
 *   - multi-panel-dashboard-card
 *   - kitchen-card
 *   - room-card
 *   - garage-dashboard-card
 *   - kids-room-card
 *   - power-monitor-card
 *   - samsung-laundry-card
 */

const BASE = new URL('.', import.meta.url).href.replace(/dist\/?$/, '');

const CARDS = [
  'multi-panel-dashboard-card.js',
  'kitchen-card.js',
  'room-card.js',
  'garage-dashboard-card.js',
  'kids-room-card.js',
  'power-monitor-card.js',
  'samsung-laundry-card.js',
];

const VERSION = '1.0.0';

(async () => {
  let loaded = 0, failed = 0;
  for (const card of CARDS) {
    try {
      await import(BASE + card);
      loaded++;
      console.info(
        '%c robman2026-cards %c loaded: ' + card,
        'background:#4fa3e0;color:#fff;font-weight:700;padding:1px 5px;border-radius:3px 0 0 3px;',
        'background:#181c27;color:#6dbfff;padding:1px 5px;border-radius:0 3px 3px 0;'
      );
    } catch (err) {
      failed++;
      console.warn('[robman2026-cards] Failed to load ' + card + ':', err.message || err);
    }
  }
  console.info(
    '%c robman2026-cards %c v' + VERSION + ' — ' + loaded + ' cards loaded' + (failed ? ', ' + failed + ' failed' : ''),
    'background:#4fa3e0;color:#fff;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;',
    'background:#181c27;color:#6dbfff;font-weight:600;padding:2px 6px;border-radius:0 4px 4px 0;'
  );
})();
