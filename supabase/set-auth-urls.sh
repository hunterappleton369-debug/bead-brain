#!/usr/bin/env bash
# Sets the Child Phenoms project's Site URL and redirect allow-list through the Supabase Management API.
# Needs a personal access token (https://supabase.com/dashboard/account/tokens) in SUPABASE_ACCESS_TOKEN.
#   SUPABASE_ACCESS_TOKEN=sbp_... supabase/set-auth-urls.sh
set -euo pipefail
REF="${PROJECT_REF:-fndemnipqtpmuvcidcxo}"
SITE_URL="https://childphenoms.com"
ALLOW_LIST="http://localhost:8787/**,https://hunterappleton369-debug.github.io/bead-brain/**,https://childphenoms.com/**,https://www.childphenoms.com/**"
: "${SUPABASE_ACCESS_TOKEN:?set SUPABASE_ACCESS_TOKEN to a personal access token (sbp_...)}"

curl -sS -f -X PATCH "https://api.supabase.com/v1/projects/$REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"site_url\":\"$SITE_URL\",\"uri_allow_list\":\"$ALLOW_LIST\"}" > /dev/null

echo "Now set on project $REF:"
curl -sS -f "https://api.supabase.com/v1/projects/$REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  | python3 -c 'import sys,json; d=json.load(sys.stdin); print("  site_url      =", d.get("site_url")); print("  uri_allow_list =", d.get("uri_allow_list"))'
