#!/bin/bash
# 溯源覆盖率报告 — 机械化阻塞门 G5
# 数据源：requirements.trace.yaml（sidecar）
#   - trackable 列表：需要追踪的 R/F ID
#   - requirements / findings 段：ID → name 映射
#
# 约定：代码中使用 @req <ID> 标注实现了哪个需求
#   例：// @req R1.1 — rich text editing
#   例：// @req F05 — undo/redo
#
# Q 不出现在代码标注中（Q 是决策记录，不是可追踪需求）。
#
# 用法：bash .claude/scripts/trace.sh
#       bash .claude/scripts/trace.sh --strict   (有未覆盖则 exit 1)

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TRACE_FILE="$PROJECT_ROOT/docs/product-specs/requirements.trace.yaml"
SRC_DIR="$PROJECT_ROOT/src"
TEST_DIR="$PROJECT_ROOT/tests"

STRICT=false
[[ "${1:-}" == "--strict" ]] && STRICT=true

if [[ ! -f "$TRACE_FILE" ]]; then
  echo "ERROR: $TRACE_FILE not found."
  echo "Run req-review agent to generate the sidecar."
  exit 1
fi

# ── 从 sidecar 提取 trackable IDs + names ────────────────────────────
# python3 读 YAML，输出 TSV：id<TAB>name
TRACE_DATA=$(python3 -c "
import yaml, sys

with open(sys.argv[1]) as f:
    data = yaml.safe_load(f)

# build name lookup
names = {}
for r in data.get('requirements', []):
    names[r['id']] = r.get('name', '')
for f in data.get('findings', []):
    names[f['id']] = f.get('name', '')

for tid in data.get('trackable', []):
    print(f\"{tid}\t{names.get(tid, '')}\")
" "$TRACE_FILE")

IDS=()
NAMES=()

while IFS=$'\t' read -r id name; do
  IDS+=("$id")
  NAMES+=("$name")
done <<< "$TRACE_DATA"

TOTAL=${#IDS[@]}
COVERED=0
MISSING=0

echo "═══════════════════════════════════════════════"
echo "  溯源覆盖率报告"
echo "  来源: requirements.trace.yaml (sidecar)"
echo "  总计: $TOTAL 条"
echo "  扫描: src/ + tests/"
echo "  约定: @req <ID>"
echo "═══════════════════════════════════════════════"
echo ""

MISSING_IDS=""
MISSING_NAMES=""

for i in $(seq 0 $((TOTAL - 1))); do
  id="${IDS[$i]}"
  name="${NAMES[$i]}"

  hits=$(grep -rn --include="*.ts" --include="*.tsx" --include="*.css" \
    -E "@req ${id}([^0-9A-Za-z]|$)" \
    "$SRC_DIR" "$TEST_DIR" 2>/dev/null || true)

  if [[ -n "$hits" ]]; then
    COVERED=$((COVERED + 1))
    file_count=$(echo "$hits" | wc -l | tr -d ' ')
    echo "  ✅ ${id} ${name}"
    echo "$hits" | head -3 | while IFS= read -r h; do
      short="${h#$PROJECT_ROOT/}"
      echo "     └─ $short"
    done
    [[ "$file_count" -gt 3 ]] && echo "     └─ ... (+$((file_count - 3)) more)"
  else
    MISSING=$((MISSING + 1))
    MISSING_IDS="$MISSING_IDS $id"
    MISSING_NAMES="$MISSING_NAMES|${id} ${name}"
    echo "  ❌ ${id} ${name}"
  fi
done

echo ""
echo "───────────────────────────────────────────────"
if [[ $TOTAL -gt 0 ]]; then
  COVERAGE=$((COVERED * 100 / TOTAL))
else
  COVERAGE=0
fi
echo "  覆盖: ${COVERED}/${TOTAL} (${COVERAGE}%)"
echo "  缺失: ${MISSING}/${TOTAL}"

if [[ $MISSING -gt 0 ]]; then
  echo ""
  echo "  未覆盖:"
  IFS='|'
  for entry in $MISSING_NAMES; do
    [[ -n "$entry" ]] && echo "    - $entry"
  done
  unset IFS
fi

echo "═══════════════════════════════════════════════"

if $STRICT && [[ $MISSING -gt 0 ]]; then
  echo ""
  echo "FAIL: ${MISSING} requirements not traced to code."
  exit 1
fi
