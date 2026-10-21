#!/usr/bin/env bash
# render-pdf.sh — turn handout .md files into print-ready PDFs (Letter, one sheet per page).
# Usage (from anywhere):  docs/products/practice-handouts/tools/render-pdf.sh OUTDIR file.md [file.md ...]
# Step 1 is md-to-pdf (MIT, https://github.com/simonhaenisch/md-to-pdf) in --as-html mode; step 2 prints the
# HTML with headless Chrome, with tools/handout.css added to each page. One-step alternative, run from
# docs/products/practice-handouts:  npx md-to-pdf --config-file tools/md-to-pdf.config.json samples/<file>.md
# (that config points md-to-pdf at tools/handout.css). Use this script where Puppeteer's own Chrome will not launch.
set -euo pipefail
CSS_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/handout.css"
OUT="$1"; shift
mkdir -p "$OUT"
for f in "$@"; do cp "$f" "$OUT/"; done
cd "$OUT"
# md-to-pdf can stay alive after writing the HTML on some machines; wait for the files, then stop it.
npx -y md-to-pdf@5.2.4 --as-html ./*.md >/dev/null 2>&1 &
PID=$!
WANT=$(ls ./*.md | wc -l)
for _ in $(seq 1 120); do
  [ "$(ls ./*.html 2>/dev/null | wc -l)" -ge "$WANT" ] && break
  sleep 1
done
sleep 1; kill "$PID" 2>/dev/null || true; pkill -f "md-to-pdf@5.2.4 --as-html" 2>/dev/null || true
# The .md files carry no styling; put tools/handout.css into each page's <head>.
python3 - "$CSS_FILE" ./*.html <<'PY'
import sys
css = open(sys.argv[1], encoding='utf-8').read()
for h in sys.argv[2:]:
    t = open(h, encoding='utf-8').read()
    open(h, 'w', encoding='utf-8').write(t.replace('</head>', '<style>\n' + css + '</style></head>', 1))
PY
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
for h in ./*.html; do
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${h%.html}.pdf" "file://$PWD/${h#./}" >/dev/null 2>&1
done
rm -f ./*.md ./*.html
ls -1 "$OUT"/*.pdf
