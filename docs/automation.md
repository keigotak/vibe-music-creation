# Automation Feature

## 概要
クリップエンベロープを使った永続的なオートメーション機能。AbletonOSC拡張 + MCPツールで実装。

## 変更ファイル
1. **AbletonOSC clip.py** - OSCハンドラ追加
   - `/live/clip/add_automation` (track, clip, device_idx, param_idx, time, value, duration)
   - `/live/clip/clear_automation` (track, clip, device_idx, param_idx)
   - `/live/clip/clear_all_automation` (track, clip)
   - `/live/clip/read_automation` (track, clip, device_idx, param_idx, time) → value
   - `/live/clip/debug_envelope` (track, clip, device_idx, param_idx) → UI表示 + 診断情報
   - クリップからトラックへの参照: `clip.canonical_parent.canonical_parent`

2. **ableton_osc.py** - 3つのヘルパーメソッド
   - `add_automation_step()`, `clear_automation()`, `clear_all_automation()`

3. **automation_generator.py** (新規) - カーブ生成
   - `generate_automation_points(shape, start_val, end_val, start_time, duration_beats, resolution)`
   - カーブ: linear, exponential, s_curve, sine, step

4. **mcp_server.py** - MCPツール
   - `add_automation` - 汎用オートメーション
   - `clear_automation` - クリア
   - `add_filter_sweep` - Auto Filter自動検出 + 周波数スイープ (up/down/updown)
   - `add_volume_fade` - Utility自動検出 + フェードイン/アウト
   - `get_project_table` - 構成表(シーン×トラック)をMarkdown生成
   - `apply_chords_automation` - Chords用プリセットオートメーション一括適用
   - `get_full_project_analysis` - 全デバイス/パラメータ一覧 + 構成表を同時出力

## 重要な技術的発見

### insert_step の引数順序
- **正しい順序**: `envelope.insert_step(time, duration, value)` ← duration が先!
- ドキュメントには引数名が記載されていないため、実験で発見
- value は 0.0-1.0 の正規化値（スケーリング不要）

### クリップ発火が必須（fire-before-write）
- **オートメーション書き込み前にクリップをfire()する必要がある**
- 停止中に書き込むと、データはPythonオブジェクトに存在するが再生エンジンに反映されない
- 手順: fire clip → clear → insert_step × N → (停止してOK)
- 一度書き込めば、停止→再発火しても永続する

### UIでの表示
- `clip.view.show_envelope()` でエンベロープ表示をONにする
- `clip.view.select_envelope_parameter(parameter)` で対象パラメータを選択
- これらを呼ばないとAbleton UIにエンベロープが表示されない

### 「アレンジメントに戻る」ボタン（三角ボタン）
- オートメーション書き込み後、トラックにオレンジの三角ボタンが表示される
- これは「単一トラックのアレンジメントに戻る」ボタン
- **絶対にクリックしない** → クリックするとオートメーションがクリアされる

### AutomationEnvelope のメソッド一覧
- `insert_step(time, duration, value)` - ステップ挿入
- `value_at_time(time)` - 値読み取り
- `events_in_range(start, end)` - イベント一覧取得
- `delete_events_in_range(start, end)` - イベント削除
- `canonical_parent` - 親オブジェクト

### Event のプロパティ
- `time`, `value`, `control_coefficients`

## auto_play_scenes のタイミング問題
- `time.sleep()` の蓄積方式だとドリフトが発生し、シーン切替が遅れる
- 1 Barクオンタイズ下では、バー境界を少しでも過ぎると次のバーまで待たされる（1小節遅れ）
- **修正**: 絶対時間ベース（`time.time()` で開始時刻を記録）+ 50ms早め発火
- `next_fire_time = start_time + (i + 1) * wait_time - 0.05`

## オートメーション戦略のベストプラクティス
1. `get_full_project_analysis` で全デバイス/パラメータを列挙
2. 構成表（シーン×トラック）を確認
3. 各パラメータの現在値を把握してから変化幅を設計
4. 変化幅は控えめに（特にAuto Filter Freq）
5. 構成に沿った設計:
   - **Intro**: 導入、控えめ or 浮遊感
   - **Verse**: 控えめ、落ち着いた変化
   - **Chorus**: 広がり、明るさ、パンチ
   - **Bridge**: テクスチャ最大、空間最深
   - **Outro**: 余韻を残して閉じる

## Session → Arrangement 録音ワークフロー
1. `/live/song/set/record_mode [1]` でレコードモードON
2. `auto_play_scenes` で全シーンを再生
3. 完了後 `/live/song/set/record_mode [0]` でOFF
4. Arrangement Viewにクリップ配置+オートメーションが記録される
5. Arrangement Viewで小節境界を調整可能（Session Viewには影響なし）
- オートメーションはSession Viewのクリップエンベロープに存在するため、Arrangement View側の編集で壊れない
- Arrangement Viewでの小節数調整後もSession Viewのオートメーション再調整は不要（クリップ内カーブは同一）

## その他の技術的ポイント
- AbletonOSCのRemote ScriptはAbleton Live再起動で反映
- デバイスパラメータ検索: `/live/track/get/devices/name` → `/live/device/get/parameters/name`
- パラメータ名の応答は最初の2要素がtrack/device indexなので`params[2:]`でスライス
- `add_filter_sweep`/`add_volume_fade`はデバイスが無ければ自動追加する
- オートメーション書き込み時は先にclear → 各ポイントをsleep(0.01)挟んで送信
- `get_device_params`ツールが失敗する場合、OSC直接送信で代替:
  - `/live/device/get/parameters/name [track, device]`
  - `/live/device/get/parameters/value [track, device]`
