#!/bin/bash
# 溯源覆盖率报告 — 机械化阻塞门 G5
# 自推导：从 requirements.md 自动提取追踪条目，不依赖手动清单。
#   - R 条目：匹配 ### X.Y 格式的标题（顶层需求）
#   - F 条目：匹配走查表中 S0/S1 行的 F-ID
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
REQ_FILE="$PROJECT_ROOT/docs/product-specs/requirements.md"
SRC_DIR="$PROJECT_ROOT/src"
TEST_DIR="$PROJECT_ROOT/tests"

STRICT=false
[[ "${1:-}" == "--strict" ]] && STRICT=true

IDS=()
NAMES=()

# ── 提取 R 条目：匹配 ### X.Y 格式标题 ──────────────────────────────
# 格式：### 1.1 简历内容编辑（P0）
while IFS= read -r line; do
  if echo "$line" | grep -qE '^### [0-9]+\.[0-9]+ '; then
    num=$(echo "$line" | sed -E 's/^### ([0-9]+\.[0-9]+) .*/\1/')
    name=$(echo "$line" | sed -E 's/^### [0-9]+\.[0-9]+ (.*)$/\1/' | sed -E 's/ *\(P[0-9]\) *$//')
    IDS+=("R${num}")
    NAMES+=("$name")
  fi
done < "$REQ_FILE"

# ── 提取 F 条目：匹配走查表中 S0/S1 行 ──────────────────────────────
# 格式：| F05 | S0 | 编辑 | R1.1 | 待实现 | 撤销/重做 |
while IFS= read -r line; do
  if echo "$line" | grep -qE '^\| F[0-9]+ \| S[01] '; then
    fid=$(echo "$line" | sed -E 's/^\| *(F[0-9]+) *\|.*/\1/')
    desc=$(echo "$line" | awk -F'|' '{print $(NF-1)}' | sed 's/^ *//;s/ *$//')
    IDS+=("$fid")
    NAMES+=("$desc")
  fi
done < "$REQ_FILE"

TOTAL=${#IDS[@]}
COVERED=0
MISSING=0

echo "═══════════════════════════════════════════════"
echo "  溯源覆盖率报告（自推导）"
echo "  来源: requirements.md"
echo "  R 条目: ### X.Y 标题"
echo "  F 条目: 走查表 S0/S1 行"
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
