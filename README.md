# Vibe Music Creation

An MCP-based tool-using agent workflow for controlling Ableton Live through Claude Code.

This project explores how LLM agents can interact with external creative software via MCP tools. Claude Code communicates with a Python MCP server, which sends OSC commands to Ableton Live through AbletonOSC.

The goal is to study tool-use, external environment control, and interactive agent workflows in a concrete creative domain.

Claude Code から Ableton Live を操作して音楽制作を行うプロジェクト。
AbletonOSC + MCP Server 経由で、対話しながらトラックを組み上げていく。

## How It Works / 仕組み

```
Claude Code  ──stdio──>  MCP Server (Python)  ──UDP:11000──>  AbletonOSC (Ableton Live)
                                               <──UDP:11001──
```

- **MCP Server** — A Python server that exposes Ableton Live operations as tools / Ableton Live の操作をツールとして提供する Python サーバー
- **AbletonOSC** — A Remote Script running inside Ableton Live that receives and executes OSC commands / Ableton Live 内で動作する Remote Script。OSC でコマンドを受け取り実行する
- **Claude Code** — Uses MCP tools to create tracks, program MIDI, configure effects, mix, and more / MCP ツールを使ってトラック作成、MIDI打ち込み、エフェクト設定、ミキシングなどを行う

## Requirements / 必要なもの

- [Ableton Live 12 Suite](https://www.ableton.com/)
- [AbletonOSC](https://github.com/ideoforms/AbletonOSC) (Remote Script)
- [AbletonMCP](https://github.com/ktat/AbletonMCP) (MCP Server)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- Python 3.x (Windows)

## Setup / セットアップ

### 1. Install AbletonOSC / AbletonOSC のインストール

Place AbletonOSC in the MIDI Remote Scripts folder:
AbletonOSC を MIDI Remote Scripts フォルダに配置:

```
C:\ProgramData\Ableton\Live 12 Suite\Resources\MIDI Remote Scripts\AbletonOSC\
```

Launch Ableton Live and select `AbletonOSC` under Preferences > Link, Tempo & MIDI > Control Surface.
Ableton Live を起動し、Preferences > Link, Tempo & MIDI > Control Surface で `AbletonOSC` を選択。

### 2. MCP Server Configuration / MCP Server の設定

`.mcp.json` is pre-configured. The MCP Server starts automatically when Claude Code launches.
`.mcp.json` が設定済み。Claude Code 起動時に自動で MCP Server が立ち上がる。

### 3. Verify Connection / 接続確認

Run `ableton_connect` from Claude Code to confirm the connection to Ableton Live.
Claude Code から `ableton_connect` を実行し、Ableton Live に接続できることを確認する。

## Features / できること

### Genre-Based Production / ジャンル別の曲制作

| Slash Command | Description / 説明 |
|---|---|
| `/create-jcore` | Produce a J-core (Japanese Hardcore) track from scratch / J-core トラックをゼロから制作 |
| `/create-strudel` | Generate Strudel live coding patterns by genre / ジャンル別にStrudelパターンを生成 |

The `generate_arrangement` tool also supports:
`generate_arrangement` ツールで以下のジャンルにも対応:
EDM, House, Techno, DnB, Hip Hop, Trap, Lo-Fi, Ambient, Pop

### Production Workflow / 制作ワークフロー

- Track creation (drums, bass, chords, melody, arpeggio) / トラック作成
- MIDI pattern programming / MIDIパターンの打ち込み
- Effects and parameter tweaking / エフェクト追加とパラメータ調整
- Sidechain compression / サイドチェインコンプレッション
- Automation (filter sweeps, volume fades, etc.) / オートメーション
- Mixing (volume, EQ, compressor) / ミキシング
- Scene arrangement / シーン構成とアレンジメント

### Utility Commands / ユーティリティコマンド

| Slash Command | Description / 説明 |
|---|---|
| `/delete-empty-tracks` | Bulk-delete empty tracks with no clips / クリップのない空トラックを一括削除 |
| `/extend-clip-bars` | Extend a MIDI clip to a specified bar count / MIDIクリップを指定小節数に延長 |
| `/record-to-arrangement` | Record Session View scenes into Arrangement View / Session View のシーンを Arrangement View に録音 |

## Project Structure / プロジェクト構成

```
.
├── CLAUDE.md                        # Project config & music theory reference
│                                    # プロジェクト設定・音楽理論リファレンス
├── .mcp.json                        # MCP Server connection config
│                                    # MCP Server 接続設定
├── .claude/
│   ├── commands/                    # Slash command definitions / スラッシュコマンド定義
│   │   ├── create-jcore.md          # J-core production / J-core 制作
│   │   ├── create-strudel.md        # Strudel pattern generation / Strudelパターン生成
│   │   ├── delete-empty-tracks.md   # Delete empty tracks / 空トラック削除
│   │   ├── extend-clip-bars.md      # Extend clips / クリップ延長
│   │   └── record-to-arrangement.md # Record to arrangement / Arrangement録音
│   └── agents/                      # Sub-agent definitions / サブエージェント定義
│       ├── music-reviewer.md        # Music production reviewer / 音楽制作レビュー
│       └── strudel-reviewer.md      # Strudel pattern reviewer / Strudelパターンレビュー
├── strudel/                         # Strudel patterns / Strudelパターン
│   └── boombap-guru.js              # Boom bap - Gang Starr/Guru style
├── PLANS.md                         # Milestone plans / マイルストーン計画
└── docs/
    ├── architecture.md              # Architecture & troubleshooting / アーキテクチャ
    ├── music-theory.md              # Music theory reference / 音楽理論リファレンス
    ├── making-music.md              # Making Music 74 strategies / Making Music 74戦略 要約
    ├── strudel-reference.md         # Strudel syntax reference / Strudel構文リファレンス
    ├── automation.md                # Automation features / オートメーション機能
    ├── device-params.md             # Device & parameter map / デバイス/パラメータマップ
    └── gotchas.md                   # Known issues & pitfalls / 落とし穴・注意事項
```

## Troubleshooting / トラブルシューティング

### Cannot Connect / 接続できない

1. Check that Ableton Live is running / Ableton Live が起動しているか確認
2. Verify AbletonOSC is set as a Control Surface / Control Surface に AbletonOSC が設定されているか確認
3. Check for port conflicts / ポート競合をチェック:
   ```powershell
   netstat -ano | findstr 11001
   ```
   If stale Python processes remain, terminate them and restart Claude Code.
   古い Python プロセスが残っている場合は終了し、Claude Code を再起動する。

## Documentation / ドキュメント

- [Architecture / アーキテクチャ](docs/architecture.md) — System architecture & troubleshooting / システム構成・トラブルシューティング
- [Music Theory Reference / 音楽理論リファレンス](docs/music-theory.md) — Scales, chord progressions, voicings / スケール、コード進行、ボイシング
- [Making Music 74 Strategies / Making Music 74戦略](docs/making-music.md) — Production pattern catalog / 制作パターン集
- [Strudel Reference / Strudelリファレンス](docs/strudel-reference.md) — Strudel syntax, effects, advanced patterns / 構文・エフェクト・高度なテクニック
- [Automation Features / オートメーション機能](docs/automation.md) — Clip envelope automation / クリップエンベロープによるオートメーション
- [Device Parameter Map / デバイスパラメータマップ](docs/device-params.md) — Parameter reference for Lo-Fi projects / Lo-Fi プロジェクト用パラメータ一覧
- [Known Issues / 落とし穴](docs/gotchas.md) — Pitfalls and workarounds / 既知の問題と対処法
