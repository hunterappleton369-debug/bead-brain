// store.js — progress saved in the browser (localStorage). One file per family, many kids.
// Key kept as beadbrain.v1 so progress from the Bead Brain name carries over.
// The store never talks to the network. auth.js listens to the hooks below and mirrors
// profiles to the parent's account when one is signed in; signed out, this file is the whole app.
const KEY = 'beadbrain.v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { profiles: {}, current: null }; }
  catch { return { profiles: {}, current: null }; }
}
const hooks = { change: new Set(), remove: new Set() };
// changedId: the profile that changed ('*' = every profile, null = selection only)
function save(db, changedId = null) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
  if (changedId) for (const fn of hooks.change) { try { fn(changedId); } catch (e) { console.error(e); } }
}

export const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();
const newId = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const store = {
  db: load(),
  get profile() {
    const db = this.db;
    if (!db.current || !db.profiles[db.current]) return null;
    return db.profiles[db.current];
  },
  profiles() { return Object.values(this.db.profiles); },
  // onChange(fn(profileId)) fires after every save that touched a profile; onRemove(fn(profileId)) after a removal.
  onChange(fn) { hooks.change.add(fn); return () => hooks.change.delete(fn); },
  onRemove(fn) { hooks.remove.add(fn); return () => hooks.remove.delete(fn); },
  addProfile(name, age, extra = {}) {
    const id = newId();
    this.db.profiles[id] = { id, name, age: Number(age) || 7, created: today(), updated: now(), parentEmail: extra.parentEmail || '', xp: 0, streak: 0, lastDay: null, lessons: {}, bosses: {}, tests: [], bests: {}, log: [], firstSteps: {} };
    this.db.current = id; save(this.db, id); return this.db.profiles[id];
  },
  select(id) { this.db.current = id; save(this.db); },
  update(fn) { const p = this.profile; if (!p) return; fn(p); p.updated = now(); save(this.db, p.id); },
  // Edit any profile (not just the current one) and stamp it.
  updateProfile(id, fn) { const p = this.db.profiles[id]; if (!p) return; fn(p); p.updated = now(); save(this.db, id); },
  // Replace or insert a whole profile that arrived from the account (does not fire onChange: the server already has it).
  putProfile(p) { this.db.profiles[p.id] = p; if (!this.db.current) this.db.current = p.id; save(this.db); },
  // Drop a profile locally only (it was removed on another device). No hooks.
  dropProfile(id) { delete this.db.profiles[id]; if (this.db.current === id) this.db.current = Object.keys(this.db.profiles)[0] || null; save(this.db); },
  removeProfile(id) {
    delete this.db.profiles[id];
    if (this.db.current === id) this.db.current = Object.keys(this.db.profiles)[0] || null;
    save(this.db);
    for (const fn of hooks.remove) { try { fn(id); } catch (e) { console.error(e); } }
  },
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
  importJSON(text) {
    const j = JSON.parse(text);
    if (!j || !j.profiles) throw new Error('not a progress file');
    // A file the parent chose on purpose wins over whatever the account holds.
    for (const [id, p] of Object.entries(j.profiles)) { p.id = id; p.name = String(p.name ?? 'Player'); p.age = Number(p.age) || 7; p.updated = now(); }
    this.db = j; save(this.db, '*');
  },
  reset() { this.db = { profiles: {}, current: null }; save(this.db); },
};

// Level from XP: a gentle curve so early wins come fast.
export function levelFromXP(xp) {
  let lvl = 1, need = 100, left = xp;
  while (left >= need) { left -= need; lvl++; need = Math.round(need * 1.18); }
  return { level: lvl, into: left, need, pct: Math.round(100 * left / need) };
}
