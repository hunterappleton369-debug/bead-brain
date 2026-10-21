// ui.js — the small helpers the member pages (account, library, instructors) share. Same as the ones in app.js.
export const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const COACH = '<img src="img/coach-bolt-sm.webp" alt="" width="56" height="56">';
export const tip = (text, cls = '', who = 'Coach tip') => `<div class="tip ${cls}">${COACH}<div class="bubble"><span class="who">${who}</span>${text}</div></div>`;
export const crumbs = (...items) => `<div class="crumbs">${items.map((it, i) => i ? `<span>${it}</span>` : it).join('')}</div>`;
export const day = d => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
export const shortDay = d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
export const mailto = (to, subject, body = '') => `mailto:${to}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;
export const stageColor = s => ({ sprout: 'green', explorer: 'orange', apprentice: 'blue', adept: 'purple', ace: 'yellow', wizard: 'purple', champion: 'red', prodigy: 'pink', grandmaster: 'teal', legend: 'blue' }[s.key] || 'blue');
