# Strudel → Ableton インポート

Strudelパターンを解析してMIDIノート化し、AbletonのSession Viewクリップに流し込む。
「Strudelでスケッチ → Abletonで仕上げ」のブリッジ。

## 引数
- `$ARGUMENTS` にStrudelファイルと対象を指定（省略時は `strudel/` の最新ファイル）
  - 例: `strudel/lofi-sunset-walk.js` → 全パターンをインポート
  - 例: `strudel/lofi-sunset-walk.js 8小節` → 8小節分書き出し
  - 例: `strudel/lofi-sunset-walk.js ベースだけ` → 対象パターンを絞る

## 実行手順

### Step 1: 変換
```bash
python3 scripts/strudel_to_notes.py <ファイル> [--bars N]
```
出力JSONの構造:
- `bpm` — setcpm から逆算したBPM
- `patterns[]` — 変換されたパターン（`line`=元ファイル行番号, `kind`=note/drum, `instrument`, `bars`, `warnings`, `notes`）
- `notes` の各要素は `[pitch, start(ビート), duration(ビート), velocity, mute]`
- `skipped[]` — 変換できなかった文と理由

### Step 2: 変換結果の確認（インポート前に必ず提示）
1. パターン一覧（行番号・種類・音色ヒント・小節数・ノート数）を表で提示
2. **warnings を必ず報告する**: `firstOf`/`degradeBy`/`off` 等の展開系は変換されない。
   Ableton側ではバリエーションクリップやオートメーションで再現する方針を添える
3. どのパターンをどのトラックに入れるかのマッピング案を提示（instrument ヒント参照:
   triangle/sine低音=Bass, sawtooth和音=Chords, piano=Melody, drum=Drums）

### Step 3: Abletonへ書き込み
1. `ableton_connect` で接続確認、`set_tempo` でJSONの `bpm` を設定
2. トラックが無ければOSC直接で作成（gotchas参照: 高レベルツールはサイレント失敗あり）:
   - `/live/song/create_midi_track [index]` → `/live/track/set/name`
3. クリップ作成: `/live/clip_slot/create_clip [track, scene, bars*4]`（長さはビート単位）
4. ノート追加: `/live/clip/add/notes [track, clip, pitch, start, dur, vel, mute, ...]`
   - **1回のOSC callは20-25ノートまで**。超える場合は分割送信
5. クリップ名を設定（例: 元ファイル名 + パート名）

### Step 4: 事後処理の提案
- ドラムはGM準拠マッピング（bd=36, sd=38, hh=42, oh=46, cp=39）で書き込まれる。
  ロード済みDrum Rackの配置が違う場合はノートを移調する
- warnings にあった展開系（firstOf/lastOf/degradeBy）は、クリップを複製して
  バリエーションを作る（Mutation of Clones）ことで再現する
- ベロシティは gain×velocity から換算済みだが、Ableton側の音源によって調整が必要

## 制限事項（scripts/strudel_to_notes.py の対応範囲）
- 対応: シーケンス, `~`, `[..]`, `<..>`, `,`(コード/並列), `*N`, `/N`, `!N`, `@N`, 音名/MIDI番号/ドラム名, `.gain()`/`.velocity()`(数値・パターン), `.fast()`/`.slow()`
- 非対応（warnings/skippedに出る）: `n().scale()`, `.add()`, `.off()`, `.ply()`, `.struct()`, ユークリッド `(n,k)`, 確率 `?`, ランダム `|`
- `sound("crackle")` 等のテクスチャ、`_$:`（ミュート済み）は対象外
