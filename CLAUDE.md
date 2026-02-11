# Vibe Music Creation - Ableton MCP Project

## Overview
Claude CodeからAbleton Liveを操作して音楽制作を行うプロジェクト。
AbletonOSC (OSC通信) + MCP Server 経由でAbleton Liveを制御する。

## Architecture

### MCP Server
- ソース: `/mnt/c/Users/roomt/Documents/Projects/AbletonMCP/src/mcp_server.py`
- 実行: Windows版Python (`.venv/Scripts/python.exe`)
- プロトコル: stdio経由のMCP

### AbletonOSC (Remote Script)
- 場所: `C:\ProgramData\Ableton\Live 12 Suite\Resources\MIDI Remote Scripts\AbletonOSC\`
- ポート設定 (`abletonosc/constants.py`):
  - `OSC_LISTEN_PORT = 11000` (Ableton側の受信ポート)
  - `OSC_RESPONSE_PORT = 11001` (Python側の受信ポート)
- ログ: `AbletonOSC/logs/abletonosc.log` で動作確認可能

### OSC通信フロー
```
MCP Server (Python) --[UDP:11000]--> AbletonOSC (Ableton内)
MCP Server (Python) <--[UDP:11001]-- AbletonOSC (Ableton内)
```

## Troubleshooting

### 接続できない場合のチェックリスト
1. Ableton Liveが起動しているか
2. Preferences > Link, Tempo & MIDI > Control Surface に AbletonOSC が設定されているか
3. **ポート競合チェック** (最も多い原因):
   ```powershell
   netstat -ano | findstr 11001
   ```
   複数プロセスが11001を使っている場合、古いPythonプロセスを終了する:
   ```powershell
   Get-Process -Id <PID> | Select-Object ProcessName,Id
   Stop-Process -Id <PID> -Force
   ```
4. 古いプロセスを終了した場合、Claude Codeの再起動が必要（MCPサーバーも再起動される）

### 接続確認
- `ableton_connect` でモックモードでなく接続されればOK
- AbletonOSCログ末尾で最新のOSC通信を確認可能

## Music Theory Reference

コード進行提案やメロディ作成時に参照する音楽理論の基礎知識。
詳細は [docs/music-theory.md](docs/music-theory.md) を参照。
制作戦略は [docs/making-music.md](docs/making-music.md) を参照（Dennis DeSantis「Making Music」74パターン）。

### ダイアトニックコード（Cメジャー基準）
| 度数 | セブンス | 機能 |
|------|---------|------|
| I | Cmaj7 | トニック (T) |
| ii | Dm7 | サブドミナント (SD) |
| iii | Em7 | トニック代理 (T) |
| IV | Fmaj7 | サブドミナント (SD) |
| V | G7 | ドミナント (D) |
| vi | Am7 | トニック代理 (T) |
| vii° | Bm7(b5) | ドミナント代理 (D) |

### コード機能の流れ
```
T → SD → D → T （基本の順行）
D → SD は避ける（逆行）
```

### Lo-Fi Hip Hop コード進行の原則
- **セブンス(7th)/ナインス(9th)** を基本にする（トライアドは使わない）
- **借用和音** (bVI, IVm, bVII) でノスタルジー感を演出
- **ii-V-I** (ツーファイブワン) はジャズ/Lo-Fiの最重要進行
- 4〜8小節のループ、テンポ70-90 BPM
- オープンボイシング、5th省略可、ルートは左手に

### よく使うコード進行パターン
- `Dm9 → G13 → Cmaj9` (ii-V-I)
- `Cmaj7 → Am7 → Dm7 → G7` (I-vi-ii-V)
- `Fmaj7 → Em7 → Am7 → Dm7` (IV-iii-vi-ii)
- `Fmaj7 → E7 → Am7` (IV-III7-vi: Just the Two of Us風)
- `Cmaj7 → Fm7 → Cmaj7 → G7` (I-IVm-I-V: SDm活用)

### ノンダイアトニックの手法
- **セカンダリードミナント**: 各コードの仮V7（例: E7→Am）
- **サブドミナントマイナー**: IVm, bVI, bVII（同主調マイナーから借用）
- **モーダルインターチェンジ**: 他のモードからコード借用

### 制作戦略クイックリファレンス (Making Music より)
- **始め方**: 土台(ドラム/ベース)から or 聴こえているものから → Simple Soundsで音色は後回し
- **制約を使う**: テンポ/キー/音色数を先に固定 → 選択肢を減らして集中
- **広さ→深さ**: まず全パートをラフスケッチ → 後から1パートずつ仕上げ
- **バリエーション**: 元アイデアをコピー → 各コピーに1つだけ変更(Mutation of Clones)
- **前景/中景/背景**: 各要素の「奥行き」を意識して配置
- **境界をあいまいに**: セクション切替で全トラック同時に変えない → ずらして自然に
- **アレンジは引き算**: 全部載せてから削る方が、ゼロから足すより楽
- **ヒューマナイズ**: ドラムのタイミング/ベロシティに微妙な揺れ + ゴーストノート
- **終わらせ方**: 収穫逓減を感じたら完成。完璧より完成を優先
- **メロディ**: 順次進行と跳躍のバランス、最高音は1回、モチーフの反復と変形

## Conventions
- 日本語でコミュニケーション
- Lo-Fi Hip Hop系の制作が多い
- コード進行提案時は度数表記（ローマ数字）と具体的なコード名の両方を記載する
- テンションコードの構成音も併記すると理解しやすい
