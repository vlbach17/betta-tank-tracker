// Sample data mirroring the Supabase schema (parameters + readings). Statuses computed like src/lib/status.ts.
window.BettabaseData = (() => {
  const day = 864e5, now = Date.now();
  const at = (d, h = 7, m = 2) => new Date(now - d * day).toISOString().slice(0, 10) + 'T' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  const series = (vals, step = 5, h = 7) => vals.map((v, i) => ({ value: v, tested_at: at((vals.length - 1 - i) * step, h), note: null }));
  const parameters = [
    { id: 'ph', name: 'pH', unit: '', ideal_min: 6.5, ideal_max: 7.5, active: true, readings: series([7.0, 7.1, 7.2, 7.0, 7.3, 7.2, 7.2]) },
    { id: 'nh3', name: 'Ammonia', unit: 'ppm', ideal_min: 0, ideal_max: 0, active: true, readings: series([0, 0, 0.25, 0, 0, 0, 0]) },
    { id: 'no2', name: 'Nitrite', unit: 'ppm', ideal_min: 0, ideal_max: 0, active: true, readings: series([0, 0, 0, 0, 0, 0, 0.25]) },
    { id: 'no3', name: 'Nitrate', unit: 'ppm', ideal_min: 0, ideal_max: 20, active: true, readings: series([5, 8, 7, 12, 15, 18, 22]) },
    { id: 'kh', name: 'KH', unit: 'dKH', ideal_min: 3, ideal_max: 8, active: true, readings: series([4, 4, 5, 5, 5], 7) },
    { id: 'gh', name: 'GH', unit: 'dGH', ideal_min: 3, ideal_max: 8, active: true, readings: series([3, 4, 4], 14).map((r, i, a) => i === a.length - 1 ? { ...r, tested_at: at(21) } : r) },
    { id: 'temp', name: 'Temperature', unit: '°F', ideal_min: 78, ideal_max: 80, active: true, readings: series([78, 79, 79, 80, 81, 79, 79, 78, 79], 1, 8) },
    { id: 'po4', name: 'Phosphate', unit: 'ppm', ideal_min: 0, ideal_max: 1, active: false, readings: [] },
  ];
  parameters[3].readings[6].note = 'day after water change';
  parameters[3].readings[6].tested_at = at(0);
  parameters[2].readings[6].tested_at = at(0);
  parameters[0].readings[6].tested_at = at(0);
  parameters[1].readings[6].tested_at = at(0);
  parameters[6].readings[8].tested_at = new Date(now - 5 * 6e4).toISOString();
  const status = (v, min, max) => { if (min == null || max == null) return 'unknown'; if (v >= min && v <= max) return 'in-range'; const m = (max - min) * 0.1; return v >= min - m && v <= max + m ? 'watch' : 'out-of-range'; };
  const overdue = (name, iso) => iso && (now - new Date(iso)) / day > (name === 'Temperature' ? 3 : 14);
  const rangeText = (min, max) => min == null && max == null ? null : min == null ? 'up to ' + max : max == null ? min + '+' : min === max ? 'ideal ' + min : min + '–' + max;
  const ago = (iso, terse) => { const s = (now - new Date(iso)) / 1000; const f = (n, u, t) => terse ? n + t : n + ' ' + u + (n === 1 ? '' : 's') + ' ago'; if (s < 60) return terse ? 'now' : 'just now'; if (s < 3600) return f(Math.floor(s / 60), 'minute', 'm'); if (s < 86400) return f(Math.floor(s / 3600), 'hour', 'h'); const dd = Math.floor(s / 86400); if (dd < 7) return f(dd, 'day', 'd'); if (dd < 30) return f(Math.floor(dd / 7), 'week', 'w'); return f(Math.floor(dd / 30), 'month', 'mo'); };
  const fullDate = (iso) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const shortDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const inRange = (iso, range) => range === 'all' || (now - new Date(iso)) / day <= Number(range);
  const fmt = (v) => v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return { parameters, status, overdue, rangeText, ago, fullDate, shortDate, inRange, fmt };
})();
