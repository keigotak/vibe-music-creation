#!/usr/bin/env python3
"""Strudel → Ableton ブリッジ: パターンをMIDIノートJSONに変換する。

strudel/*.js の `$: note("...")` / `$: sound("...")` 文をパースし、
AbletonOSC の /live/clip/add/notes に渡せる (pitch, start, duration, velocity, mute)
のリストを JSON で出力する。start/duration はビート単位（1サイクル=1小節=4拍）。

対応ミニノーテーション:
  シーケンス（スペース区切り） / `~` 休符 / `[..]` サブシーケンス / `<..>` サイクル交代
  `,` 並列（コード/多声） / `*N` 倍速 / `/N` 減速 / `!N` 複製 / `@N` 引き延ばし
  音名(c3, eb4, f#2...) / MIDI番号 / ドラム名(bd, sd, hh, oh, cp, rim...)

対応チェーンメソッド:
  .gain(数値 or パターン文字列) / .velocity(同) → ベロシティ（両方あれば乗算）
  .fast(N) / .slow(N) → パターン全体の速度
  ノートに影響する他のメソッド（add, off, ply, struct, degradeBy, euclid, echo,
  superimpose, n().scale() 等）は未対応 → warnings に列挙して無視する。
  エフェクト系（lpf, room, delay, crush...）は音に関係しないので黙って無視。

使い方:
  python3 scripts/strudel_to_notes.py strudel/foo.js            # 全パターン
  python3 scripts/strudel_to_notes.py strudel/foo.js --bars 8   # 8小節分書き出し
  python3 scripts/strudel_to_notes.py --selftest                # パーサー自己テスト
"""

import json
import math
import re
import sys
from fractions import Fraction

QUOTES = {'"', "'", "`"}

NOTE_BASE = {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}

# General MIDI準拠のドラムマップ（909/808系Drum Rackの標準配置）
DRUM_MAP = {
    "bd": 36, "rim": 37, "sd": 38, "cp": 39, "hh": 42, "lt": 43,
    "mt": 47, "oh": 46, "ht": 50, "cr": 49, "rd": 51, "sh": 70, "cb": 56,
}

# 無視すると音が変わるメソッド（警告対象）
NOTE_AFFECTING = {
    "add", "sub", "off", "ply", "struct", "degradeBy", "degrade", "euclid",
    "echo", "echoWith", "superimpose", "scale", "rev", "jux", "juxBy",
    "firstOf", "lastOf", "sometimesBy", "sometimes", "often", "rarely",
    "when", "chunk", "pick", "swingBy", "nudge", "late", "early", "speed",
}

DEFAULT_VELOCITY = 100


# ---------------------------------------------------------------- AST

class Leaf:
    def __init__(self, value):
        self.value = value  # int(MIDIノート) / float(数値パターン) / None(休符)

    def events(self, cycle):
        return [] if self.value is None else [(Fraction(0), Fraction(1), self.value)]

    def period(self):
        return 1


class Seq:
    def __init__(self, children, weights):
        self.children = children
        self.weights = weights

    def events(self, cycle):
        total = sum(self.weights)
        out, offset = [], Fraction(0)
        for child, w in zip(self.children, self.weights):
            span = Fraction(w, total)
            for s, d, v in child.events(cycle):
                out.append((offset + s * span, d * span, v))
            offset += span
        return out

    def period(self):
        return math.lcm(*(c.period() for c in self.children)) if self.children else 1


class Alt:
    """<a b c> : サイクルごとに交代。@N は N スロット分、!N は N 回展開済み前提。"""

    def __init__(self, slots):
        self.slots = slots  # 子ノードのリスト（重み展開済み）

    def events(self, cycle):
        k = len(self.slots)
        return self.slots[cycle % k].events(cycle // k)

    def period(self):
        return len(self.slots) * math.lcm(*(s.period() for s in self.slots))


class Poly:
    def __init__(self, children):
        self.children = children

    def events(self, cycle):
        return [e for c in self.children for e in c.events(cycle)]

    def period(self):
        return math.lcm(*(c.period() for c in self.children))


class Fast:
    def __init__(self, child, n):
        self.child, self.n = child, n

    def events(self, cycle):
        out = []
        for k in range(self.n):
            for s, d, v in self.child.events(cycle * self.n + k):
                out.append((Fraction(k, self.n) + s / self.n, d / self.n, v))
        return out

    def period(self):
        p = self.child.period()
        return p // self.n if p % self.n == 0 else max(1, p)


class Slow:
    def __init__(self, child, n):
        self.child, self.n = child, n

    def events(self, cycle):
        inner_cycle, window = divmod(cycle, self.n)
        lo, hi = Fraction(window, self.n), Fraction(window + 1, self.n)
        out = []
        for s, d, v in self.child.events(inner_cycle):
            if lo <= s < hi:
                out.append(((s - lo) * self.n, d * self.n, v))
        return out

    def period(self):
        return self.child.period() * self.n


# ---------------------------------------------------------------- パーサー

class MiniParser:
    """ミニノーテーション文字列 → AST。leaf_fn が値の解釈を担う。"""

    def __init__(self, text, leaf_fn, warnings):
        self.text = text
        self.pos = 0
        self.leaf_fn = leaf_fn
        self.warnings = warnings

    def parse(self):
        node = self.parse_parallel(closers="")
        return node

    def parse_parallel(self, closers):
        parts = [self.parse_sequence(closers)]
        while self.peek() == ",":
            self.pos += 1
            parts.append(self.parse_sequence(closers))
        return parts[0] if len(parts) == 1 else Poly(parts)

    def parse_sequence(self, closers):
        children, weights = [], []
        while True:
            self.skip_ws()
            c = self.peek()
            if c is None or c in closers or c == ",":
                break
            node, weight, repeat = self.parse_element(closers)
            for _ in range(repeat):
                children.append(node)
                weights.append(weight)
        if not children:
            return Leaf(None)
        if len(children) == 1 and weights[0] == 1:
            return children[0]
        return Seq(children, weights)

    def parse_element(self, closers):
        c = self.peek()
        if c == "[":
            self.pos += 1
            node = self.parse_parallel(closers="]")
            self.expect("]")
        elif c == "<":
            self.pos += 1
            inner = self.parse_alt_slots()
            self.expect(">")
            node = Alt(inner)
        else:
            node = Leaf(self.leaf_fn(self.read_word()))
        return self.parse_modifiers(node)

    def parse_alt_slots(self):
        """<> の中身: 要素ごとに @N はスロット複製として展開する。"""
        slots = []
        while True:
            self.skip_ws()
            c = self.peek()
            if c is None or c == ">":
                break
            if c == ",":
                self.warnings.add("<> 内の ',' は未対応（最初の声部のみ使用）")
                self.pos += 1
                continue
            node, weight, repeat = self.parse_element(closers=">")
            for _ in range(repeat):
                slots.extend([node] * weight)
        return slots or [Leaf(None)]

    def parse_modifiers(self, node):
        """*N /N !N @N ? をノード後置で処理。返り値: (node, weight, repeat)。"""
        weight, repeat = 1, 1
        while True:
            c = self.peek()
            if c == "*":
                self.pos += 1
                node = Fast(node, self.read_int())
            elif c == "/":
                self.pos += 1
                node = Slow(node, self.read_int())
            elif c == "!":
                self.pos += 1
                repeat = self.read_int()
            elif c == "@":
                self.pos += 1
                weight = self.read_int()
            elif c == "?":
                self.pos += 1
                m = re.match(r"[\d.]+", self.text[self.pos:])
                if m:
                    self.pos += len(m.group(0))
                self.warnings.add("'?'（確率ドロップ）は未対応（全ノート出力）")
            elif c == "(":
                depth = 0
                while self.pos < len(self.text):
                    if self.text[self.pos] == "(":
                        depth += 1
                    elif self.text[self.pos] == ")":
                        depth -= 1
                        if depth == 0:
                            self.pos += 1
                            break
                    self.pos += 1
                self.warnings.add("ユークリッドリズム (n,k) は未対応（単発ノートとして出力）")
            elif c == "|":
                self.warnings.add("'|'（ランダム選択）は未対応（最初の選択肢のみ使用）")
                while self.peek() is not None and self.peek() not in "]>,":
                    self.pos += 1
            else:
                break
        return node, weight, repeat

    # -- 低レベルユーティリティ
    def peek(self):
        return self.text[self.pos] if self.pos < len(self.text) else None

    def skip_ws(self):
        while self.peek() is not None and self.peek().isspace():
            self.pos += 1

    def expect(self, c):
        self.skip_ws()
        if self.peek() != c:
            raise ValueError(f"'{c}' が必要: ...{self.text[max(0, self.pos-10):self.pos+10]}...")
        self.pos += 1

    def read_word(self):
        m = re.match(r"[A-Za-z0-9#.\-:~]+", self.text[self.pos:])
        if not m:
            raise ValueError(f"要素を解釈できない: ...{self.text[self.pos:self.pos+15]}...")
        self.pos += len(m.group(0))
        return m.group(0)

    def read_int(self):
        m = re.match(r"\d+", self.text[self.pos:])
        if not m:
            raise ValueError("数値が必要")
        self.pos += len(m.group(0))
        return int(m.group(0))


def note_leaf(word, warnings):
    """音名/MIDI番号 → MIDIノート番号。c3=48（Strudel/中央C=c4=60）。"""
    if word == "~":
        return None
    if re.fullmatch(r"\d+", word):
        return int(word)
    m = re.fullmatch(r"([a-gA-G])([#b]*)(-?\d+)?", word)
    if not m:
        raise ValueError(f"音名を解釈できない: {word}")
    pitch = NOTE_BASE[m.group(1).lower()]
    for acc in m.group(2):
        pitch += 1 if acc == "#" else -1
    octave = int(m.group(3)) if m.group(3) else 3
    return (octave + 1) * 12 + pitch


def drum_leaf(word, warnings):
    if word == "~":
        return None
    name = word.split(":")[0]
    if name not in DRUM_MAP:
        warnings.add(f"未知のドラム名 '{name}'（スキップ）")
        return None
    return DRUM_MAP[name]


def number_leaf(word, warnings):
    return None if word == "~" else float(word)


# ---------------------------------------------------------------- 文の解析

def strip_comments(src):
    out, in_str, i = [], None, 0
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


def split_statements(src):
    lines = src.split("\n")
    statements, current, start = [], [], None
    for idx, raw in enumerate(lines, 1):
        s = raw.strip()
        if re.match(r"^(_?\$:|setcpm\s*\(|samples\s*\()", s):
            if current:
                statements.append((start, "\n".join(current)))
            current, start = [raw], idx
        elif current and s:
            current.append(raw)
        elif current:
            statements.append((start, "\n".join(current)))
            current, start = [], None
    if current:
        statements.append((start, "\n".join(current)))
    return statements


def toplevel_calls(stmt):
    """チェーン深度0のメソッド呼び出し (名前, 第1引数の生テキスト) のリスト。"""
    calls = []
    depth, in_str, i = 0, None, 0
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
        elif depth == 0:
            m = re.match(r"\.?([a-zA-Z_]\w*)\s*\(", stmt[i:])
            if m and (c == "." or (c.isalpha() and (i == 0 or not stmt[i - 1].isalnum()))):
                arg_start = i + m.end()
                d, j, s2 = 1, arg_start, None
                while j < len(stmt) and d > 0:
                    ch = stmt[j]
                    if s2:
                        if ch == s2:
                            s2 = None
                    elif ch in QUOTES:
                        s2 = ch
                    elif ch == "(":
                        d += 1
                    elif ch == ")":
                        d -= 1
                    j += 1
                calls.append((m.group(1), stmt[arg_start : j - 1].strip()))
        i += 1
    return calls


def parse_number_arg(raw):
    m = re.fullmatch(r"\.?\d+(\.\d+)?", raw)
    return float(raw) if m else None


def value_at(node, cycle, pos):
    """数値パターンから位置 pos（サイクル内 0-1）の値を取る（無ければ直近の前の値）。"""
    events = sorted(node.events(cycle), key=lambda e: e[0])
    current = None
    for s, d, v in events:
        if s <= pos:
            current = v
        else:
            break
    if current is None and events:
        current = events[0][2]
    return current


def convert_statement(start_line, stmt, bars):
    warnings = set()
    calls = toplevel_calls(stmt)
    names = [n for n, _ in calls]

    if "note" in names:
        kind, pattern_raw = "note", dict(calls)["note"]
        leaf = note_leaf
    elif "sound" in names and "n" not in names:
        kind, pattern_raw = "drum", dict(calls)["sound"]
        leaf = drum_leaf
    elif "n" in names:
        return None, {"line": start_line, "skipped": "n().scale() は未対応（note() で書き直すと変換可能）"}
    else:
        return None, None

    m = re.match(r'^["\'`](.*)["\'`]$', pattern_raw, re.S)
    if not m:
        return None, {"line": start_line, "skipped": "パターン引数が単純な文字列でない（変換不可）"}
    pattern_str = m.group(1)

    if kind == "drum" and not any(w.split(":")[0] in DRUM_MAP for w in re.findall(r"[a-z]+", pattern_str)):
        return None, None  # crackle等のテクスチャは対象外

    try:
        ast = MiniParser(pattern_str, lambda w: leaf(w, warnings), warnings).parse()
    except ValueError as e:
        return None, {"line": start_line, "skipped": f"パース失敗: {e}"}

    # fast/slow はパターン全体に適用
    for name, arg in calls:
        n = parse_number_arg(arg)
        if name == "fast" and n and n == int(n):
            ast = Fast(ast, int(n))
        elif name == "slow" and n and n == int(n):
            ast = Slow(ast, int(n))

    # ベロシティ: gain × velocity
    vel_sources = []
    for name in ("gain", "velocity"):
        if name in names:
            raw = dict(calls)[name]
            n = parse_number_arg(raw)
            if n is not None:
                vel_sources.append(("const", n))
            else:
                sm = re.match(r'^["\'`](.*)["\'`]$', raw, re.S)
                if sm:
                    try:
                        vel_ast = MiniParser(sm.group(1), lambda w: number_leaf(w, warnings), warnings).parse()
                        vel_sources.append(("pattern", vel_ast))
                    except ValueError:
                        warnings.add(f".{name}() のパターンを解釈できない（既定値を使用）")
                else:
                    warnings.add(f".{name}() が数値/文字列でない（既定値を使用）")

    ignored = sorted(set(n for n in names if n in NOTE_AFFECTING))
    if ignored:
        warnings.add(f"ノートに影響するメソッドを無視: {', '.join(ignored)}")

    sounds = [a for n, a in calls if n == "sound"]
    instrument = sounds[0].strip("\"'`") if kind == "note" and sounds else None

    period = min(ast.period(), 64)
    cycles = bars if bars else period
    notes = []
    for c in range(cycles):
        for s, d, v in sorted(ast.events(c), key=lambda e: e[0]):
            vel = 1.0
            has_src = False
            for src_kind, src in vel_sources:
                val = src if src_kind == "const" else value_at(src, c, s)
                if val is not None:
                    vel *= val
                    has_src = True
            velocity = min(127, max(1, round(vel * 127))) if has_src else DEFAULT_VELOCITY
            notes.append([int(v), float((c + s) * 4), float(d * 4), velocity, 0])

    return {
        "line": start_line,
        "kind": kind,
        "instrument": instrument,
        "pattern_period_bars": period,
        "bars": cycles,
        "note_count": len(notes),
        "warnings": sorted(warnings),
        "notes": notes,
    }, None


def convert_file(path, bars=None):
    with open(path, encoding="utf-8") as f:
        src = strip_comments(f.read())
    bpm = None
    m = re.search(r"setcpm\s*\(\s*([\d.]+)\s*/\s*4\s*\)", src)
    if m:
        bpm = float(m.group(1))
    patterns, skipped = [], []
    for start, stmt in split_statements(src):
        if not stmt.strip().startswith("$:"):  # _$:（ミュート）は除外
            continue
        result, skip = convert_statement(start, stmt, bars)
        if result:
            patterns.append(result)
        elif skip:
            skipped.append(skip)
    return {"file": path, "bpm": bpm, "beats_per_bar": 4, "patterns": patterns, "skipped": skipped}


# ---------------------------------------------------------------- 自己テスト

def selftest():
    def notes_of(pattern, leaf=note_leaf, cycles=1, **_):
        w = set()
        ast = MiniParser(pattern, lambda x: leaf(x, w), w).parse()
        out = []
        for c in range(cycles):
            out += [((c + float(s)) * 4, float(d) * 4, v) for s, d, v in sorted(ast.events(c))]
        return out

    # 基本シーケンス: 2音がサイクルを等分
    assert notes_of("c3 e3") == [(0.0, 2.0, 48), (2.0, 2.0, 52)]
    # 休符
    assert notes_of("c3 ~ e3 ~") == [(0.0, 1.0, 48), (2.0, 1.0, 52)]
    # サブシーケンス
    assert notes_of("c3 [e3 g3]") == [(0.0, 2.0, 48), (2.0, 1.0, 52), (3.0, 1.0, 55)]
    # コード（並列）
    assert notes_of("[c3,e3,g3]") == [(0.0, 4.0, 48), (0.0, 4.0, 52), (0.0, 4.0, 55)]
    # <> 交代
    assert notes_of("<c3 e3>", cycles=2) == [(0.0, 4.0, 48), (4.0, 4.0, 52)]
    # *N
    assert notes_of("c3*2") == [(0.0, 2.0, 48), (2.0, 2.0, 48)]
    # /N: 2サイクルに分散
    assert notes_of("[c3 e3]/2", cycles=2) == [(0.0, 4.0, 48), (4.0, 4.0, 52)]
    # @N 引き延ばし
    assert notes_of("c3@3 e3") == [(0.0, 3.0, 48), (3.0, 1.0, 52)]
    # !N 複製
    assert notes_of("c3!2 e3") == [(0.0, 4/3, 48), (4/3, 4/3, 48), (8/3, 4/3, 52)]
    # <>内の!N
    assert notes_of("<c3!2 e3>", cycles=3) == [(0.0, 4.0, 48), (4.0, 4.0, 48), (8.0, 4.0, 52)]
    # ドラム
    assert notes_of("bd ~ sd ~", leaf=drum_leaf) == [(0.0, 1.0, 36), (2.0, 1.0, 38)]
    # フラット/シャープ/オクターブ
    assert notes_of("eb4 f#2 c") == [(0.0, 4/3, 63), (4/3, 4/3, 42), (8/3, 4/3, 48)]
    # 中央C: c4 = 60
    assert notes_of("c4") == [(0.0, 4.0, 60)]
    print("selftest OK (13 cases)")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if "--selftest" in sys.argv:
        selftest()
        return 0
    bars = None
    if "--bars" in sys.argv:
        bars = int(sys.argv[sys.argv.index("--bars") + 1])
        args = [a for a in args if a != str(bars)]
    if not args:
        print(__doc__)
        return 1
    print(json.dumps(convert_file(args[0], bars), ensure_ascii=False, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
