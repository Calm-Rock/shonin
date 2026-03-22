#!/bin/bash
# Shonin approval hook — enriched version
# Usage: shonin-approve.sh "COMMAND" "WHY"
# Install: cp scripts/shonin-approve.sh ~/shonin-approve.sh && chmod +x ~/shonin-approve.sh

COMMAND="$1"
WHY="$2"
CWD=$(pwd)
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

API_KEY="${SHONIN_API_KEY:-test-api-key-123}"
API_URL="${SHONIN_API_URL:-https://shonin.vercel.app/api/v1}"
APPROVER="${SHONIN_APPROVER:-cheetoda0x@gmail.com}"

# ── Classify command type ─────────────────────────────────────────────────────
classify_command() {
  local cmd="$1"
  local lower
  lower=$(echo "$cmd" | tr '[:upper:]' '[:lower:]')

  if echo "$lower" | grep -q "push" && echo "$lower" | grep -qE "( -f| --force|--force-with-lease)"; then
    echo "git_push_force"
  elif echo "$lower" | grep -q "reset" && echo "$lower" | grep -q "\-\-hard"; then
    echo "git_reset_hard"
  elif echo "$lower" | grep -qE "^rm "; then
    echo "rm"
  elif echo "$lower" | grep -qi "drop table"; then
    echo "sql_drop"
  elif echo "$lower" | grep -qiE "(migrat|migration)"; then
    echo "sql_migration"
  elif echo "$lower" | grep -q "push"; then
    echo "git_push"
  elif echo "$lower" | grep -q "commit"; then
    echo "git_commit"
  else
    echo "unknown"
  fi
}

COMMAND_TYPE=$(classify_command "$COMMAND")

# ── Gather git enrichment (5s timeout each) ──────────────────────────────────
FILES_JSON="[]"
DIFF_CONTENT=""

if git rev-parse --is-inside-work-tree &>/dev/null; then
  # Build files array from git diff --name-status
  RAW_FILES=$(timeout 5 git diff --name-status HEAD 2>/dev/null || echo "")
  if [ -n "$RAW_FILES" ]; then
    FILES_JSON=$(echo "$RAW_FILES" | python3 -c "
import sys, json
rows = []
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    parts = line.split('\t', 1)
    if len(parts) < 2:
        continue
    code, path = parts[0][0], parts[1]
    status_map = {'M': 'modified', 'A': 'added', 'D': 'deleted', 'R': 'renamed'}
    status = status_map.get(code, 'modified')
    rows.append({'path': path, 'status': status})
print(json.dumps(rows))
" 2>/dev/null || echo "[]")
  fi

  # For rm commands: use rm target as the files array
  if [ "$COMMAND_TYPE" = "rm" ]; then
    RM_TARGET=$(echo "$COMMAND" | sed 's/^rm[[:space:]]*//')
    FILES_JSON=$(python3 -c "import json; print(json.dumps([{'path': '$RM_TARGET', 'status': 'deleted'}]))" 2>/dev/null || echo "[]")
  fi

  # Capture diff (50KB cap)
  DIFF_CONTENT=$(timeout 5 git diff HEAD 2>/dev/null | head -c 51200 || echo "")
fi

echo "Requesting Shonin approval for: $COMMAND"

# ── Build and send request ────────────────────────────────────────────────────
# Export vars so python3 subprocess can read them via os.environ
export COMMAND WHY COMMAND_TYPE FILES_JSON DIFF_CONTENT APPROVER

RESPONSE=$(python3 -c "
import json, os, sys

command_type = os.environ.get('COMMAND_TYPE', 'unknown')
files_json = os.environ.get('FILES_JSON', '[]')
diff = os.environ.get('DIFF_CONTENT', '')

try:
    files = json.loads(files_json)
except Exception:
    files = []

payload = {
    'action': os.environ.get('COMMAND', ''),
    'approver_email': os.environ.get('APPROVER', ''),
    'context': os.environ.get('WHY', ''),
    'command_type': command_type if command_type != 'unknown' else None,
}

if files:
    payload['files'] = files
if diff:
    payload['diff'] = diff

# Remove None values
payload = {k: v for k, v in payload.items() if v is not None}
print(json.dumps(payload))
" | curl -s -X POST "$API_URL/approvals" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d @-)

APPROVAL_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

if [ -z "$APPROVAL_ID" ]; then
  echo "Failed to create approval. Response: $RESPONSE"
  exit 1
fi

echo "Email sent to $APPROVER. Waiting for your decision..."

for i in $(seq 1 60); do
  sleep 10
  STATUS=$(curl -s "$API_URL/approvals/$APPROVAL_ID" \
    -H "Authorization: Bearer $API_KEY" | \
    python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null)

  if [ "$STATUS" = "approved" ]; then
    echo "Approved. Proceeding."
    exit 0
  elif [ "$STATUS" = "rejected" ]; then
    echo "Rejected. Stopping."
    exit 1
  fi
  echo "Still pending... ($((i*10))s elapsed)"
done

echo "Timed out after 10 minutes."
exit 1
