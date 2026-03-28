#!/bin/bash
# 收口检查
# 在询问“是否可以 commit”前统一校验：关键文档、trace、lint、typecheck、tests。

set -euo pipefail
shopt -s nullglob

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DOC_LINT="$PROJECT_ROOT/.claude/scripts/doc-lint.sh"
TRACE_SCRIPT="$PROJECT_ROOT/.claude/scripts/trace.sh"
TRACE_EXEMPTION=""
BLOCKERS=0
WARNINGS=0

ok() {
  echo "  ✅ $1"
}

warn() {
  WARNINGS=$((WARNINGS + 1))
  echo "  ⚠️  $1"
}

block() {
  BLOCKERS=$((BLOCKERS + 1))
  echo "  ❌ $1"
}

frontmatter_value() {
  local file="$1"
  local key="$2"

  awk -v key="$key" '
    NR == 1 && $0 == "---" { in_fm = 1; next }
    in_fm && $0 == "---" { exit }
    in_fm && $0 ~ ("^" key ":") {
      sub("^[^:]+:[[:space:]]*", "", $0)
      print $0
      exit
    }
  ' "$file"
}

find_trace_exemption() {
  local today exemption status scope expires
  today="$(date +%F)"

  for exemption in "$PROJECT_ROOT"/docs/exemptions/*.md; do
    [[ -f "$exemption" ]] || continue
    status="$(frontmatter_value "$exemption" "status")"
    scope="$(frontmatter_value "$exemption" "scope")"
    expires="$(frontmatter_value "$exemption" "expires")"

    if [[ "$status" == "approved" && "$scope" == "trace" && -n "$expires" && ( "$expires" > "$today" || "$expires" == "$today" ) ]]; then
      echo "$exemption"
      return 0
    fi
  done

  return 1
}

collect_staged_docs() {
  git -C "$PROJECT_ROOT" diff --cached --name-only 2>/dev/null | while read -r path; do
    case "$path" in
      .claude/ARCHITECTURE.md|docs/design-docs/tech-decisions.md|docs/exec-plans/active/*.md|docs/exec-plans/completed/*.md|docs/exemptions/*.md)
        [[ "$path" == "docs/exemptions/template.md" ]] && continue
        echo "$PROJECT_ROOT/$path"
        ;;
    esac
  done
}

run_cmd() {
  local label="$1"
  shift

  if "$@"; then
    ok "$label"
  else
    block "$label"
  fi
}

DOCS=()
while (( $# > 0 )); do
  case "$1" in
    --doc)
      shift
      [[ $# -gt 0 ]] || { echo "缺少 --doc 参数"; exit 1; }
      if [[ "$1" = /* ]]; then
        DOCS+=("$1")
      else
        DOCS+=("$PROJECT_ROOT/$1")
      fi
      ;;
    --trace-exemption)
      shift
      [[ $# -gt 0 ]] || { echo "缺少 --trace-exemption 参数"; exit 1; }
      if [[ "$1" = /* ]]; then
        TRACE_EXEMPTION="$1"
      else
        TRACE_EXEMPTION="$PROJECT_ROOT/$1"
      fi
      ;;
    --help|-h)
      echo "用法: bash .claude/scripts/closeout.sh [--doc <file>]... [--trace-exemption <file>]"
      exit 0
      ;;
    *)
      echo "未知参数: $1"
      exit 1
      ;;
  esac
  shift
done

if (( ${#DOCS[@]} == 0 )); then
  while IFS= read -r file; do
    [[ -n "$file" ]] && DOCS+=("$file")
  done < <(collect_staged_docs)
fi

if [[ -z "$TRACE_EXEMPTION" ]]; then
  TRACE_EXEMPTION="$(find_trace_exemption || true)"
fi

echo "═══════════════════════════════════════════════"
echo "  Harness Closeout"
echo "═══════════════════════════════════════════════"
echo ""

if (( ${#DOCS[@]} > 0 )); then
  if bash "$DOC_LINT" "${DOCS[@]}"; then
    ok "关键文档交接检查"
  else
    block "关键文档交接检查"
  fi
else
  warn "未检测到需要收口的关键文档"
fi

if [[ -n "$TRACE_EXEMPTION" ]]; then
  if bash "$DOC_LINT" "$TRACE_EXEMPTION"; then
    warn "使用 trace 豁免：${TRACE_EXEMPTION#$PROJECT_ROOT/}"
    if bash "$TRACE_SCRIPT"; then
      ok "traceability 报告已输出（豁免模式）"
    else
      warn "traceability 仍未闭合（豁免模式）"
    fi
  else
    block "trace 豁免文档无效：${TRACE_EXEMPTION#$PROJECT_ROOT/}"
  fi
else
  if bash "$TRACE_SCRIPT" --strict; then
    ok "traceability 闭合"
  else
    block "traceability 未闭合"
  fi
fi

run_cmd "npm run lint" npm run lint
run_cmd "npx tsc -b --noEmit" npx tsc -b --noEmit
run_cmd "npm test" npm test

echo ""
echo "───────────────────────────────────────────────"
echo "  Blockers: $BLOCKERS"
echo "  Warnings: $WARNINGS"
echo "───────────────────────────────────────────────"

if (( BLOCKERS > 0 )); then
  exit 1
fi
