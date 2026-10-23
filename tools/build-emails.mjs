#!/usr/bin/env node
// build-emails.mjs — turns the Quick-Start soap opera (docs/products/marketing-sequences/10-quickstart-soap-opera.md)
// into the three emails the stripe-webhook function sends, as simple HTML plus a text part.
//
//   node tools/build-emails.mjs            writes supabase/functions/stripe-webhook/emails.ts
//   node tools/build-emails.mjs --preview  also writes one .html per email to the folder given after the flag
//
// What it resolves here, once: the {{link_…}} tags (README "Link tags"), the shared footer (README "Shared email
// footer") and the "Already on the test drive?" swap block in Q3 (dropped: at kit checkout nobody is on the test
// drive yet). What stays for the function to fill per order: {{first_name}}, {{if_bump}}…{{end_if}} and
// {{unsubscribe}}. The function never reads docs/ at runtime; rerun this after editing the emails, then redeploy.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative } from 'node:path';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(REPO, 'docs/products/marketing-sequences/10-quickstart-soap-opera.md');
const README = join(REPO, 'docs/products/marketing-sequences/README.md');
const OUT = join(REPO, 'supabase/functions/stripe-webhook/emails.ts');
const rel = p => relative(REPO, p);
const previewAt = process.argv.includes('--preview') ? process.argv[process.argv.indexOf('--preview') + 1] : null;

// ───────── the link tags and the footer, from the README ─────────
const readme = readFileSync(README, 'utf8');
const LINKS = {};
for (const m of readme.matchAll(/^\| `(\{\{link_[a-z0-9_]+\}\})` \| (\S+)/gm)) if (/^https?:/.test(m[2])) LINKS[m[1]] = m[2];
LINKS['{{link_account}}'] = LINKS['{{link_account}}'] || 'https://childphenoms.com/#/account'; // the account page exists now: billing and cancel live there
const footerMd = (readme.match(/## Shared email footer[\s\S]*?\n((?:> .*\n)+)/) || [])[1];
if (!footerMd) throw new Error('README: shared email footer not found');
const FOOTER_LINES = footerMd.split('\n').filter(Boolean).map(l => l.replace(/^> /, '').trim());

// ───────── Markdown, the small subset the emails use ─────────
const escH = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const links = s => s.replace(/\{\{link_[a-z0-9_]+\}\}/g, t => {
  if (!LINKS[t]) throw new Error(`no URL for ${t} in the README link table`);
  return LINKS[t];
});
const A = 'color:#2457f5;text-decoration:underline';
const anchor = u => `<a href="${u}" style="${A}">${u.replace(/^https:\/\//, '')}</a>`;
function inline(s) {
  // Escape first; the tags carry no HTML characters, so they survive it. Then every {{link_…}} tag and every bare
  // address becomes one link (the tags resolve to addresses first, so one pass over addresses covers both).
  return links(escH(s))
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/https:\/\/[^\s<]+[^\s<.,)]/g, anchor);
}
const P = 'margin:0 0 18px;font-size:17px;line-height:1.55';
function toHTML(md) {
  const out = []; let para = [], list = null;
  const flush = () => {
    // A line that is only {{receipt}} stays bare: the function drops its own block (a table) in, not a paragraph.
    if (para.length === 1 && /^\{\{receipt\}\}$/.test(para[0])) { out.push(para[0]); para = []; return; }
    if (para.length) { out.push(`<p style="${P}">${para.map(inline).join('<br>')}</p>`); para = []; }
    if (list) { out.push(`<${list.tag} style="${P};padding-left:24px">${list.items.map(i => `<li style="margin:0 0 10px">${inline(i)}</li>`).join('')}</${list.tag}>`); list = null; }
  };
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { flush(); continue; }
    if ((m = line.match(/^(#{1,4}) (.*)$/))) { flush(); out.push(`<h2 style="margin:28px 0 14px;font-size:22px;line-height:1.25;color:#121826">${inline(m[2])}</h2>`); continue; }
    if (/^---+$/.test(line)) { flush(); out.push('<hr style="border:0;border-top:2px solid #e6e8ef;margin:26px 0">'); continue; }
    if ((m = line.match(/^- (.*)$/))) { if (para.length || (list && list.tag !== 'ul')) flush(); list = list || { tag: 'ul', items: [] }; list.items.push(m[1]); continue; }
    if ((m = line.match(/^\d+\. (.*)$/))) { if (para.length || (list && list.tag !== 'ol')) flush(); list = list || { tag: 'ol', items: [] }; list.items.push(m[1]); continue; }
    if (list) flush();
    para.push(line.trim());
  }
  flush();
  return out.join('\n');
}
// The text part: the same words, no markup, every link as its full address.
function toText(md) {
  const lines = [];
  let n = 0;
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd();
    let m;
    if (/^---+$/.test(line)) { lines.push('', '— — —', ''); n = 0; continue; }
    if ((m = line.match(/^#{1,4} (.*)$/))) { lines.push('', m[1].toUpperCase(), ''); n = 0; continue; }
    if ((m = line.match(/^- (.*)$/))) { lines.push(`• ${m[1]}`); continue; }
    if ((m = line.match(/^\d+\. (.*)$/))) { lines.push(`${++n}. ${m[1]}`); continue; }
    if (!line.trim()) n = 0;
    lines.push(line.trim());
  }
  return links(lines.join('\n').replace(/\*\*(.+?)\*\*/g, '$1')).replace(/\n{3,}/g, '\n\n').trim();
}

// ───────── the three emails ─────────
const md = readFileSync(SRC, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const parts = md.split(/^## (Q\d) · [^\n]*\n/m).slice(1); // [key, body, key, body, …]
if (parts.length !== 6) throw new Error(`expected Q1 to Q3 in ${rel(SRC)}, found ${parts.length / 2}`);
const emails = [];
for (let i = 0; i < parts.length; i += 2) {
  const key = parts[i].toLowerCase();
  let body = parts[i + 1];
  const meta = {};
  body = body.replace(/^- \*\*(Subject|Preview|Main link):\*\* (.*)$/gm, (_, k, v) => { meta[k.toLowerCase()] = v.trim(); return ''; });
  body = body.replace(/\n---\s*$/, '').replace(/\*\*Already on the test drive\?\*\*[\s\S]*$/, '').trim(); // Q3's swap block is for trial members, not kit buyers
  if (!meta.subject) throw new Error(`${key}: no subject line`);
  emails.push({ key, subject: meta.subject, preview: meta.preview || '', bodyMd: body });
}

const footerHtml = `<div style="margin-top:34px;padding-top:16px;border-top:1px solid #e6e8ef;font-size:12px;line-height:1.5;color:#6b7280">${FOOTER_LINES.map(l => `<p style="margin:0 0 6px">${inline(l)}</p>`).join('')}</div>`;
const footerText = `\n\n— — —\n${FOOTER_LINES.join('\n')}`;
const shell = (preview, bodyHtml) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Child Phenoms</title></head>
<body style="margin:0;padding:0;background:#f6f7fb;color:#121826;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escH(preview)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px"><tr><td style="padding:28px 26px 24px">
<p style="margin:0 0 22px;font-weight:800;font-size:18px;color:#121826">Child <span style="color:#2457f5">Phenoms</span></p>
${bodyHtml}
${footerHtml}
</td></tr></table>
</td></tr></table>
</body></html>`;

const out = emails.map(e => ({
  key: e.key,
  subject: e.subject,
  html: shell(e.preview, toHTML(e.bodyMd)),
  text: toText(e.bodyMd) + footerText,
}));

const file = `// GENERATED by tools/build-emails.mjs from ${rel(SRC)} and the README's link table and footer.
// Edit those, rerun the build, then redeploy the function. Per-order fields left for index.ts to fill:
// {{first_name}}, {{if_bump}}…{{end_if}} (Playbook lines), {{unsubscribe}}.
export interface QuickStartEmail { key: string; subject: string; html: string; text: string }
export const QUICKSTART: QuickStartEmail[] = ${JSON.stringify(out, null, 2)};
`;
writeFileSync(OUT, file);
console.log(`wrote ${rel(OUT)}: ${out.map(e => `${e.key} "${e.subject}" (${e.text.length} chars text)`).join(', ')}`);

if (previewAt) {
  mkdirSync(previewAt, { recursive: true });
  for (const e of out) {
    const receipt = '<div style="border:1.5px solid #e6e8ef;border-radius:12px;padding:14px 16px;margin:0 0 20px;font-size:15px;line-height:1.5"><p style="margin:0 0 6px;font-weight:700;font-size:16px">Your receipt</p><p style="margin:0 0 8px;color:#4b5567">October 23, 2026 · Visa ending 4242</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:15px"><tr><td style="padding:4px 0">Free Abacus Kit (shipping)</td><td align="right" style="padding:4px 0">$9.95</td></tr><tr><td style="padding:4px 0">Child Prodigy Secrets Playbook + Audiobook</td><td align="right" style="padding:4px 0">$27.00</td></tr><tr><td style="padding:6px 0 0;font-weight:700;border-top:1px solid #e6e8ef">Total paid</td><td align="right" style="padding:6px 0 0;font-weight:700;border-top:1px solid #e6e8ef">$36.95</td></tr></table><p style="margin:10px 0 0"><b>Ships to</b><br>Sam Parent<br>1309 Coffeen Avenue STE 1200<br>Sheridan, WY 82801</p></div>';
    const fill = s => s.replace(/\{\{first_name\}\}/g, 'Sam').replace(/\{\{if_bump\}\}([\s\S]*?)\{\{end_if\}\}/g, '$1').replace(/\{\{unsubscribe\}\}/g, 'mailto:hello@childphenoms.com?subject=Unsubscribe').replace(/\{\{receipt\}\}/g, s.includes('<html') ? receipt : 'YOUR RECEIPT\nOctober 23, 2026 · Visa ending 4242\nFree Abacus Kit (shipping)  $9.95\nChild Prodigy Secrets Playbook + Audiobook  $27.00\nTotal paid  $36.95\nShips to: Sam Parent, 1309 Coffeen Avenue STE 1200, Sheridan, WY 82801');
    writeFileSync(join(previewAt, `${e.key}.html`), fill(e.html));
    writeFileSync(join(previewAt, `${e.key}.txt`), fill(e.text));
  }
  console.log(`previews in ${previewAt}`);
}
