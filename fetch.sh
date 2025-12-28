set -e

OUT="data"
STAMP="$OUT/.last_fetch"

DAYS=30
SECONDS=$((DAYS * 24 * 60 * 60))
NOW=$(date +%s)

mkdir -p "$OUT"

force=false
if [[ "$1" == "--force" ]]; then
  force=true
fi

last=0
if [[ -f "$STAMP" ]]; then
  last=$(cat "$STAMP")
fi

age=$((NOW - last))

if [[ "$force" == false && "$age" -lt "$SECONDS" ]]; then
  echo "Last fetch: $(date -d @"$last")"
  exit 0
fi

echo "Detecting Tomato.gg build ID…"

BUILD_ID=$(
curl -s https://tomato.gg \
  | grep -oE '/_next/static/[A-Za-z0-9_-]+/_buildManifest\.js' \
  | head -n1 \
  | cut -d/ -f4
)

if [[ -z "$BUILD_ID" ]]; then
  echo "Failed to detect build ID."
  exit 1
fi

echo "Build ID: $BUILD_ID"

BASE="https://tomato.gg/_next/data/$BUILD_ID/en"

echo "Fetching data…"

curl -s "$BASE/meta-insights/EU.json?server=EU" \
  -o "$OUT/meta.json"

curl -s "$BASE/tier-list.json?server=EU" \
  -o "$OUT/tier-list.json"

curl -s "$BASE/economics/all/30.json?mode=all&days=30" \
  -o "$OUT/economics.json"

curl -s "$BASE/tank-performance/recent/EU/30.json?mode=recent&server=EU&days=30" \
  -o "$OUT/performance.json"

curl -s "$BASE/mastery/EU.json?server=EU" \
  -o "$OUT/mastery.json"

curl -s "$BASE/moe/EU.json?server=EU" \
  -o "$OUT/moe.json"

curl -s "$BASE/tanks.json" \
  -o "$OUT/tanks.json"

curl -s "$BASE/tank-stats.json" \
  -o "$OUT/tank-stats.json"

echo "$NOW" > "$STAMP"

echo "OK"
echo "Fetched at: $(date -d @"$NOW")"
