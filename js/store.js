// store.js — progress saved in the browser (localStorage). One file per family, many kids.
// Key kept as beadbrain.v1 so progress from the Bead Brain name carries over.
const KEY = 'beadbrain.v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { profiles: {}, current: null }; }
  catch { return { profiles: {}, current: null }; }
}
function save(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} }

export const today = () => new Date().toISOString().slice(0, 10);

export const store = {
  db: load(),
  get profile() {
    const db = this.db;
    if (!db.current || !db.profiles[db.current]) return null;
    return db.profiles[db.current];
  },
  profiles() { return Object.values(this.db.profiles); },
  addProfile(name, age, extra = {}) {
    const id = 'p' + Date.now().toString(36);
    this.db.profiles[id] = { id, name, age: Number(age) || 7, created: today(), parentEmail: extra.parentEmail || '', xp: 0, streak: 0, lastDay: null, lessons: {}, bosses: {}, tests: [], bests: {}, log: [], firstSteps: {} };
    this.db.current = id; save(this.db); return this.db.profiles[id];
  },
  select(id) { this.db.current = id; save(this.db); },
  update(fn) { const p = this.profile; if (!p) return; fn(p); save(this.db); },
  removeProfile(id) { delete this.db.profiles[id]; if (this.db.current === id) this.db.current = Object.keys(this.db.profiles)[0] || null; save(this.db); },
  touchStreak() {
    this.update(p => {
      const t = today();
      if (p.lastDay === t) return;
      const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      p.streak = p.lastDay === y ? p.streak + 1 : 1;
      p.lastDay = t;
    });
  },
  addXP(n, why) {
    this.update(p => { p.xp += n; p.log.push({ d: today(), xp: n, why }); if (p.log.length > 500) p.log.shift(); });
    this.touchStreak();
  },
  lessonDone(key, result) {
    this.update(p => {
      const prev = p.lessons[key] || { done: false, best: 0, tries: 0 };
      prev.tries++;
      prev.best = Math.max(prev.best, result.score || 0);
      if (result.passed) prev.done = true;
      prev.last = today();
      p.lessons[key] = prev;
    });
  },
  bossDone(stage, result) { this.update(p => { p.bosses[stage] = { passed: true, date: today(), ...result }; }); },
  addTest(t) { this.update(p => { p.tests.push({ date: today(), ...t }); }); },
  best(key, value, lowerIsBetter = false) {
    let improved = false;
    this.update(p => {
      const cur = p.bests[key];
      if (cur === undefined || (lowerIsBetter ? value < cur : value > cur)) { p.bests[key] = value; improved = true; }
    });
    return improved;
  },
  exportJSON() { return JSON.stringify(this.db, null, 2); },
  importJSON(text) { const j = JSON.parse(text); if (j && j.profiles) { this.db = j; save(this.db); } },
  reset() { this.db = { profiles: {}, current: null }; save(this.db); },
};

// Level from XP: a gentle curve so early wins come fast.
export function levelFromXP(xp) {
  let lvl = 1, need = 100, left = xp;
  while (left >= need) { left -= need; lvl++; need = Math.round(need * 1.18); }
  return { level: lvl, into: left, need, pct: Math.round(100 * left / need) };
}
