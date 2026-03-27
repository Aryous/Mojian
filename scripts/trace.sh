#!/bin/bash
# 溯源覆盖率报告 — 机械化阻塞门 G5
# 检查 requirements.md 中的每个需求 ID 是否在 src/ 或 tests/ 中被引用
#
# 约定：代码中使用 @req <ID> 标注实现了哪个需求
#   例：// @req 1.1 — rich text editing
#   例：describe('[1.1] Content editing', () => {
#
# 用法：bash scripts/trace.sh
#       bash scripts/trace.sh --strict   (有未覆盖则 exit 1)

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REQ_FILE="$PROJECT_ROOT/docs/product-specs/requirements.md"
SRC_DIR="$PROJECT_ROOT/src"
TEST_DIR="$PROJECT_ROOT/tests"

STRICT=false
[[ "${1:-}" == "--strict" ]] && STRICT=true

# 1. 从 requirements.md 提取需求 ID 和名称
IDS=()
NAMES=()

while IFS= read -r line; do
  if echo "$line" | grep -qE '^### [0-9]+\.[0-9]+ '; then
    id=$(echo "$line" | sed -E 's/^### ([0-9]+\.[0-9]+) .*/\1/')
    name=$(echo "$line" | sed -E 's/^### [0-9]+\.[0-9]+ //')
    IDS+=("$id")
    NAMES+=("$name")
  fi
done < "$REQ_FILE"

TOTAL=${#IDS[@]}
COVERED=0
MISSING=0

echo "═══════════════════════════════════════════════"
echo "  溯源覆盖率报告"
echo "  需求文档: requirements.md ($TOTAL 条需求)"
echo "  扫描范围: src/ + tests/"
echo "  标注约定: @req <ID> 或 [<ID>]"
echo "═══════════════════════════════════════════════"
echo ""

MISSING_IDS=""
MISSING_NAMES=""

for i in $(seq 0 $((TOTAL - 1))); do
  id="${IDS[$i]}"
  name="${NAMES[$i]}"

  # 搜索 @req <id> 或 @req R<id> 或 [<id>] 模式
  hits=$(grep -rn --include="*.ts" --include="*.tsx" --include="*.css" \
    -E "@req R?${id}([^0-9]|$)|\[R?${id}\]" \
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
  echo "  未覆盖需求:"
  IFS='|'
  for entry in $MISSING_NAMES; do
    [[ -n "$entry" ]] && echo "    - $entry"
  done
  unset IFS
fi

echo "═══════════════════════════════════════════════"

# strict 模式：有缺失则失败
if $STRICT && [[ $MISSING -gt 0 ]]; then
  echo ""
  echo "FAIL: ${MISSING} requirements not traced to code."
  exit 1
fi
