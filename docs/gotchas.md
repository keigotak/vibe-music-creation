# 落とし穴・注意事項

## MCP ツールの信頼性
- `create_drum_track` / `create_bassline` / `create_chords` / `create_melody` はトラック作成が**サイレントに失敗**することがある
  - **改善済み**: 各ツールにトラック/クリップ作成後のsleep追加（0.3s/0.2s）で安定化
  - `create_drum_track` は作成後にトラック名を検証し、失敗時に警告を返す
  - それでも不安定な場合は OSC直接送信を推奨
- **確実なトラック作成**: `/live/song/create_midi_track [index]` をOSC直接送信 → `/live/track/set/name` → `/live/track/load/device`
- `load_device` 使用時にSaturator + Auto Filterが自動付与される（MCP server側の処理）
- `generate_arrangement` は空トラックが大量に生成されることがある → 結果確認必須
- `get_device_params` は一部デバイスでパラメータ取得失敗することがあった
  - **改善済み**: `query_raw` でパラメータ名と値を一括取得する方式に変更（タイムアウト1.0s）
  - フォールバック: 従来の1パラメータずつ取得する方式も残してある

## ポート競合
- MCP再起動時に古いPythonプロセスがポート11001を掴んだまま残ることがある
- `netstat -ano | findstr 11001` で確認、`Stop-Process` で解放後、Claude Code再起動
- MCPサーバーはWindows Python (`python.exe`) で動作。WSLのlocalhostとWindows localhostは同じ

## Remote Script 変更時
- Ableton Liveの**再起動が必須**（clip.py等の変更を反映するため）

## クリップ & オートメーション
- クリップの `loop_end` とオートメーションは連動: 4小節クリップに8小節分のオートメーションを書いても、4小節でリセットされる
- **解決策**: `/extend-clip-bars` でクリップ自体を延長してからオートメーション適用
- 大量ノート追加: 1回のOSC callで20-25ノート程度をバッチ送信、それ以上は分割

## auto_play_scenes
- 絶対時間ベース+200ms早め発火で修正済み（50msでは不十分だった）

## デバイス名の差異
- Live 12では `Chorus` → `Chorus-Ensemble` にリネームされている

## ブラウザAPI（/live/browser/get/items, /live/track/load/device）
- `get/items` の引数は階層ごとに分割: `["sounds", "Bass"]`（`["sounds/Bass"]` は unknown_category）
- トップカテゴリは小文字（`drums`, `sounds`...）だが、`load/device` のパスは**大文字始まり + `/` 区切り**: `"Drums/Lo-Fi Tech Kit.adg"`, `"Sounds/Bass/Sub Mellow.adg"`
- 新規MIDIトラックはユーザーテンプレートのデフォルト音源（E-Piano等）付きで作られることがある → 差し替えは `/live/track/delete/device [track, 0]` してからロード

## ポート競合の掃除
- ポート11001を複数のPythonが掴んでいる場合、**現セッションのMCPサーバーもその中にいる**（開始時刻では見分けられない）
- 安全な手順: 11001を掴むPythonを**全部**終了 → `/mcp` で ableton-agent を reconnect（Claude Code全体の再起動は不要）

## Strudel
- drum-machinesはデフォルト読み込み済み。`samples('github:...')` は不要、`.bank("EmuSP12")` で直接使える
- 同じエフェクトを2回書くと後者で上書きされる（スタックされない）
- Shabda（freesound経由）は初回再生時にロードが入る
