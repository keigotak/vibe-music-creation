#!/usr/bin/env python3
"""Strudelパターンの静的チェック。

機械的に検証できる項目を strudel-reviewer の目視レビュー前に洗い出す:
  🔴 ミニノーテーション文字列内の括弧 [ ] < > ( ) の不対応
  🔴 JSレベルの括弧 ( ) [ ] { } の不対応
  🔴 setcpm() の欠落
  🟡 同一チェーン内の同じエフェクト重複（後者で上書きされる）
  🟡 <> のトップレベル要素数がパターン間で不一致（位相ずれの可能性。意図的なポリメーターなら無視してよい）

使い方:
  python3 scripts/lint_strudel.py strudel/foo.js [strudel/bar.js ...]
  python3 scripts/lint_strudel.py            # strudel/*.js 全部

終了コード: 🔴があれば1、なければ0
"""

import glob
import re
import sys
from collections import Counter

QUOTES = {'"', "'", "`"}


def strip_comments(src: str) -> str:
    """文字列リテラル外の // コメントを除去（行構造は維持）。"""
    out = []
    in_str = None
    i = 0
    while i < len(src):
        c = src[i]
        if in_str:
            out.append(c)
            if c == in_str:
                in_str = None
        elif c in QUOTES:
            in_str = c
            out.append(c)
        elif c == "/" and i + 1 < len(src) and src[i + 1] == "/":
            while i < len(src) and src[i] != "\n":
                i += 1
            continue
        else:
            out.append(c)
        i += 1
    return "".join(out)


def extract_strings(src: str):
    """(開始行番号, 文字列内容) のリストを返す。"""
    results = []
    in_str = None
    buf = []
    line = 1
    start_line = 0
    for c in src:
        if c == "\n":
            line += 1
        if in_str:
            if c == in_str:
                results.append((start_line, "".join(buf)))
                in_str = None
                buf = []
            else:
                buf.append(c)
        elif c in QUOTES:
            in_str = c
            start_line = line
    return results


def check_brackets(text: str, pairs: str) -> str | None:
    """pairs 例: "[]<>()"。不対応があれば説明文字列を返す。"""
    openers = {pairs[i]: pairs[i + 1] for i in range(0, len(pairs), 2)}
    closers = {v: k for k, v in openers.items()}
    stack = []
    for c in text:
        if c in openers:
            stack.append(c)
        elif c in closers:
            if not stack or stack[-1] != closers[c]:
                return f"'{c}' に対応する開き括弧がない"
            stack.pop()
    if stack:
        return f"'{stack[-1]}' が閉じられていない"
    return None


def split_statements(src: str):
    """(開始行番号, 文コード) のリスト。$: / _$: / setcpm / samples 開始行で区切る。"""
    lines = src.split("\n")
    statements = []
    current, current_start = [], None
    for idx, raw in enumerate(lines, 1):
        stripped = raw.strip()
        if re.match(r"^(_?\$:|setcpm\s*\(|samples\s*\()", stripped):
            if current:
                statements.append((current_start, "\n".join(current)))
            current, current_start = [raw], idx
        elif current and stripped:
            current.append(raw)
        elif current and not stripped:
            statements.append((current_start, "\n".join(current)))
            current, current_start = [], None
    if current:
        statements.append((current_start, "\n".join(current)))
    return statements


def toplevel_methods(stmt: str):
    """チェーン深度0（コールバック内を除く）のメソッド名リスト。"""
    methods = []
    depth = 0
    in_str = None
    i = 0
    while i < len(stmt):
        c = stmt[i]
        if in_str:
            if c == in_str:
                in_str = None
        elif c in QUOTES:
            in_str = c
        elif c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
        elif c == "." and depth == 0:
            m = re.match(r"\.([a-zA-Z_]\w*)\s*\(", stmt[i:])
            if m:
                methods.append(m.group(1))
        i += 1
    return methods


def angle_element_count(s: str) -> list[int]:
    """文字列内の各 <...> グループのトップレベル要素数（!N は展開）。"""
    counts = []
    i = 0
    while i < len(s):
        if s[i] == "<":
            depth = 1
            j = i + 1
            while j < len(s) and depth > 0:
                if s[j] == "<":
                    depth += 1
                elif s[j] == ">":
                    depth -= 1
                j += 1
            inner = s[i + 1 : j - 1]
            counts.append(_count_elements(inner))
            i = j
        else:
            i += 1
    return counts


def _count_elements(inner: str) -> int:
    """スペース区切りのトップレベル要素数。[..] (..) <..> は1要素、a!N はN要素。"""
    count = 0
    depth = 0
    token = []
    for c in inner + " ":
        if c in "[(<":
            depth += 1
            token.append(c)
        elif c in "])>":
            depth -= 1
            token.append(c)
        elif c.isspace() and depth == 0:
            if token:
                t = "".join(token)
                m = re.search(r"!(\d+)$", t)
                count += int(m.group(1)) if m else 1
                token = []
        else:
            token.append(c)
    return count


def lint_file(path: str):
    with open(path, encoding="utf-8") as f:
        src = f.read()
    src = strip_comments(src)
    red, yellow = [], []

    # setcpm
    if "setcpm" not in src:
        red.append("setcpm() がない（テンポ未設定）")

    # JSレベル括弧（文字列内を除外して全体チェック）
    js_only = re.sub(r'"[^"]*"|\'[^\']*\'|`[^`]*`', '""', src)
    err = check_brackets(js_only, "()[]{}")
    if err:
        red.append(f"JSレベルの括弧不対応: {err}")

    # ミニノーテーション文字列
    for line_no, s in extract_strings(src):
        err = check_brackets(s, "[]<>()")
        if err:
            red.append(f'L{line_no} 文字列 "{s[:40]}..." : {err}')

    # 文単位のチェック
    angle_counts = {}  # 開始行 -> 最大<>要素数
    for start, stmt in split_statements(src):
        if not stmt.strip().startswith(("$:", "_$:")):
            continue
        dup = [m for m, n in Counter(toplevel_methods(stmt)).items() if n > 1]
        if dup:
            yellow.append(f"L{start} 同一チェーンにエフェクト重複（後者で上書き）: {', '.join(dup)}")
        counts = []
        for _, s in extract_strings(stmt):
            counts.extend(angle_element_count(s))
        if counts:
            angle_counts[start] = max(counts)

    # <> 要素数の不一致（最頻値と比べる）
    if len(angle_counts) >= 2:
        modal, _ = Counter(angle_counts.values()).most_common(1)[0]
        for start, n in angle_counts.items():
            if n != modal and modal % n != 0 and n % modal != 0:
                yellow.append(
                    f"L{start} <> のトップレベル要素数 {n}（他パターンの最頻値は {modal}）。"
                    "位相ずれの可能性（意図的なポリメーターなら無視）"
                )

    return red, yellow


def main():
    paths = sys.argv[1:] or sorted(glob.glob("strudel/*.js"))
    if not paths:
        print("対象ファイルがありません")
        return 1
    any_red = False
    for path in paths:
        red, yellow = lint_file(path)
        status = "🔴" if red else ("🟡" if yellow else "🟢")
        print(f"{status} {path}")
        for msg in red:
            print(f"  🔴 {msg}")
        for msg in yellow:
            print(f"  🟡 {msg}")
        any_red |= bool(red)
    return 1 if any_red else 0


if __name__ == "__main__":
    sys.exit(main())
