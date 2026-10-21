#!/usr/bin/env python3
"""Build the public legal pages (site/*.html) from their markdown sources in this folder.

    python3 tools/build_pages.py            # draft build: [HUNTER] gaps highlighted, draft banner shown
    python3 tools/build_pages.py --final    # publish build: refuses while any [HUNTER: ...] remains

The markdown files are the source of truth. Edit them, then rebuild, so the .md and .html never drift.
Everything after a line `<!-- internal-only -->` in a source file is left out of the page.
No dependencies beyond the Python standard library.

The pages link ../css/style.css the way the free-abacus pages do, so they render with the site
stylesheet once copied to a folder one level below the site root (recommended: Bead-Brain/legal/).
They also carry their own small style block, so they still look right when opened from this folder.
"""
import html
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
OUT = HERE / "site"

PAGES = [  # (source, output, short label for the footer)
    ("privacy-policy.md", "privacy-policy.html", "Privacy"),
    ("terms.md", "terms.html", "Terms"),
    ("guarantees.md", "refund-policy.html", "Refunds"),
    ("earnings-disclaimer.md", "earnings-disclaimer.html", "Earnings disclaimer"),
]

FACEBOOK = ("This site is not a part of the Facebook website or Facebook Inc. Additionally, this site is "
            "NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.")

LOGO = ('<svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true"><rect x="3" y="3" width="58" '
        'height="58" rx="16" fill="#2457f5" stroke="#121826" stroke-width="3"></rect><path d="M 36 8 L 20 36 '
        'L 31 36 L 26 56 L 46 26 L 35 26 L 41 8 Z" fill="#ffd23f" stroke="#121826" stroke-width="3" '
        'stroke-linejoin="round"></path></svg>')

STYLE = """
:root { --ink:#121826; --ink-2:#4b5567; --ink-3:#8a93a6; --hair:#e6e8ee; --paper:#fff; --paper-2:#f7f8fb;
  --blue:#2457f5; --yellow:#ffd23f; --yellow-soft:#fff6d6; --red:#f03e3e;
  --font-display:'Unbounded','Inter',system-ui,sans-serif; --font-body:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif; }
body { margin:0; font-family:var(--font-body); font-size:17px; line-height:1.6; color:var(--ink); background-color:var(--paper); }
.lg-top { border-bottom:1px solid var(--hair); background:rgba(255,255,255,.94); }
.lg-top-in { max-width:820px; margin:0 auto; padding:0 16px; height:56px; display:flex; align-items:center; justify-content:space-between; }
.lg-top .logo { display:inline-flex; align-items:center; gap:8px; color:var(--ink); text-decoration:none; }
.lg-top .logo .word { font-family:var(--font-display); font-weight:600; font-size:16px; letter-spacing:-.02em; }
.lg-top .logo .word b { font-weight:800; color:var(--blue); }
.lg-top .back { font-size:14px; font-weight:600; color:var(--ink-2); }
.legal { max-width:820px; margin:0 auto; padding:48px 16px 24px; }
.legal .eyebrow { font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); margin:0 0 10px; display:block; }
.legal h1 { font-family:var(--font-display); font-size:40px; font-weight:700; letter-spacing:-.025em; line-height:1.08; margin:0 0 12px; }
.legal .lede { font-size:19px; color:var(--ink-2); margin:0 0 8px; }
.legal .meta { font-size:14.5px; color:var(--ink-3); margin:0 0 28px; }
.legal .draft { border-left:4px solid var(--ink); background:var(--yellow-soft); padding:12px 16px; font-size:14.5px; margin:0 0 28px; }
.legal nav.toc { border-top:1px solid var(--hair); margin:0 0 40px; }
.legal nav.toc p { font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); margin:16px 0 4px; }
.legal nav.toc ol { list-style:none; padding:0; margin:0; columns:2; column-gap:32px; }
.legal nav.toc li { margin:0; padding:7px 0; border-bottom:1px solid var(--hair); break-inside:avoid; font-size:15px; }
.legal nav.toc a { color:var(--ink); }
.legal section { border-top:1px solid var(--hair); padding-top:28px; margin-top:36px; }
.legal h2 { font-family:var(--font-display); font-size:26px; font-weight:700; letter-spacing:-.02em; line-height:1.15; margin:0 0 14px; scroll-margin-top:16px; }
.legal h3 { font-family:var(--font-display); font-size:18px; font-weight:600; letter-spacing:-.01em; margin:24px 0 8px; }
.legal p, .legal li { color:var(--ink); }
.legal ul, .legal ol { padding-left:1.3em; margin:0 0 1em; }
.legal li { margin:.35em 0; }
.legal a { color:var(--blue); text-decoration:none; }
.legal a:hover { text-decoration:underline; text-underline-offset:3px; }
.legal code { font-size:.9em; background:var(--paper-2); padding:1px 5px; border-radius:6px; }
.legal .tbl { overflow-x:auto; margin:0 0 1.2em; }
.legal table { width:100%; border-collapse:collapse; font-size:15px; }
.legal th { text-align:left; font-weight:700; border-bottom:2px solid var(--ink); padding:8px 10px 8px 0; }
.legal td { border-bottom:1px solid var(--hair); padding:9px 10px 9px 0; vertical-align:top; }
.legal mark.todo { background:var(--yellow); color:var(--ink); padding:0 4px; border-radius:4px; font-weight:600; font-size:.92em; }
.lg-foot { max-width:820px; margin:40px auto 0; padding:22px 16px 40px; border-top:1px solid var(--hair); font-size:12.5px; color:var(--ink-3); line-height:1.55; }
.lg-foot p { margin:0 0 8px; }
.lg-foot a { color:var(--ink-2); }
.lg-foot .links a { margin-right:14px; }
@media (max-width:720px) { .legal { padding-top:32px; } .legal h1 { font-size:30px; } .legal h2 { font-size:21px; } .legal nav.toc ol { columns:1; } }
@media print { .lg-top, .legal nav.toc, .lg-foot .links { display:none; } .legal section { break-inside:auto; } body { background:none; } }
"""


def slug(text):
    t = re.sub(r"^\d+(\.\d+)*\.?\s*", "", text)
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-") or "section"


def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"\[(HUNTER:[^\]]*)\]", r'<mark class="todo">[\1]</mark>', s)
    s = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", r'<a href="\2">\1</a>', s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"(?<![\w.@/>\"])([\w.+-]+@[\w-]+\.[\w.]+[a-z])", r'<a href="mailto:\1">\1</a>', s)
    s = re.sub(r"(?<![\w./>\"])(coag\.gov)\b", r'<a href="https://coag.gov">\1</a>', s)
    return s


def md_to_html(md):
    """A small markdown subset: #/##/### headings, paragraphs, - and 1. lists, pipe tables, inline marks."""
    md = md.split("<!-- internal-only -->")[0]
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S)
    lines = md.splitlines()
    title, lede, meta, body, toc = "", "", "", [], []
    i, open_section = 0, False
    para = []

    def flush_para():
        if para:
            body.append("<p>" + inline(" ".join(para)) + "</p>")
            para.clear()

    while i < len(lines):
        ln = lines[i].rstrip()
        if not ln.strip():
            flush_para(); i += 1; continue
        if ln.startswith("# "):
            title = ln[2:].strip(); i += 1
            # the next non-blank line is the standfirst, then an optional "Effective date" line
            while i < len(lines) and not lines[i].strip(): i += 1
            if i < len(lines) and not lines[i].startswith("#"): lede = lines[i].strip(); i += 1
            while i < len(lines) and not lines[i].strip(): i += 1
            if i < len(lines) and lines[i].startswith("Effective date"): meta = lines[i].strip(); i += 1
            continue
        if ln.startswith("## "):
            flush_para()
            if open_section: body.append("</section>")
            text = ln[3:].strip(); sid = slug(text); toc.append((sid, text))
            body.append(f'<section><h2 id="{sid}">{inline(text)}</h2>'); open_section = True
            i += 1; continue
        if ln.startswith("### "):
            flush_para(); body.append(f"<h3>{inline(ln[4:].strip())}</h3>"); i += 1; continue
        if ln.startswith("|"):
            flush_para(); rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{3,}:?", c) for c in cells): rows.append(cells)
                i += 1
            head, rest = rows[0], rows[1:]
            out = ['<div class="tbl"><table><thead><tr>' + "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr></thead><tbody>"]
            out += ["<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rest]
            body.append("".join(out) + "</tbody></table></div>"); continue
        m_ul, m_ol = re.match(r"^- (.*)", ln), re.match(r"^\d+\. (.*)", ln)
        if m_ul or m_ol:
            flush_para(); tag = "ul" if m_ul else "ol"; pat = r"^- (.*)" if m_ul else r"^\d+\. (.*)"
            items = []
            while i < len(lines) and re.match(pat, lines[i]):
                items.append(re.match(pat, lines[i]).group(1)); i += 1
            body.append(f"<{tag}>" + "".join(f"<li>{inline(x)}</li>" for x in items) + f"</{tag}>"); continue
        para.append(ln.strip()); i += 1
    flush_para()
    if open_section: body.append("</section>")
    return title, lede, meta, "\n".join(body), toc


def page(src, out, final):
    title, lede, meta, body, toc = md_to_html((HERE / src).read_text(encoding="utf-8"))
    toc_html = ('<nav class="toc" aria-label="Contents"><p>Contents</p><ol>'
                + "".join(f'<li><a href="#{sid}">{inline(t)}</a></li>' for sid, t in toc) + "</ol></nav>") if len(toc) > 3 else ""
    draft = "" if final else ('<p class="draft"><strong>Draft for counsel review.</strong> Not yet in force. '
                              'Highlighted items need a decision before this page goes live.</p>')
    links = " ".join(f'<a href="{o}">{lbl}</a>' for _, o, lbl in PAGES)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{html.escape(title)} | Child Phenoms</title>
<meta name="description" content="{html.escape(lede)}">
<meta name="theme-color" content="#2457f5">
{'' if final else '<meta name="robots" content="noindex">'}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Inter:wght@400;600;700&display=swap">
<link rel="stylesheet" href="../css/style.css">
<link rel="icon" href="../img/favicon.svg" type="image/svg+xml">
<style>{STYLE}</style>
</head>
<body>
<header class="lg-top"><div class="lg-top-in">
  <a class="logo" href="../">{LOGO}<span class="word">Child <b>Phenoms</b></span></a>
  <a class="back" href="../">Home</a>
</div></header>
<main class="legal">
<span class="eyebrow">Legal</span>
<h1>{inline(title)}</h1>
<p class="lede">{inline(lede)}</p>
<p class="meta">{inline(meta)}</p>
{draft}
{toc_html}
{body}
</main>
<footer class="lg-foot">
  <p class="links">{links}</p>
  <p>&copy; 2026 Child Phenoms &middot; <a href="mailto:hello@childphenoms.com">hello@childphenoms.com</a></p>
  <p>{FACEBOOK}</p>
</footer>
</body>
</html>
"""


def main():
    final = "--final" in sys.argv
    OUT.mkdir(exist_ok=True)
    problems = 0
    for src, out, _ in PAGES:
        text = (HERE / src).read_text(encoding="utf-8").split("<!-- internal-only -->")[0]
        todo = re.findall(r"\[HUNTER:[^\]]*\]", text)
        if final and todo:
            print(f"  {src}: {len(todo)} open [HUNTER] item(s); not built"); problems += 1; continue
        (OUT / out).write_text(page(src, out, final), encoding="utf-8")
        print(f"  site/{out}  ({len(todo)} open [HUNTER] item(s){'' if final else ', draft'})")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
