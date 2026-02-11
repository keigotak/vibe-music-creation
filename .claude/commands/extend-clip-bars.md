# クリップを指定小節数に延長

指定したトラック・シーンのMIDIクリップを、MIDIノートを複製して指定小節数に延長する。
オートメーションがクリップループで途切れる問題の解決に使う。

## 引数
- `$ARGUMENTS` にトラック番号、シーン番号、目標小節数をスペース区切りで指定
  - 例: `1 1 8` → Track 1, Scene 1 を 8小節に延長

## 手順

1. 引数をパース（トラック番号、シーン番号、目標小節数）
2. `osc_send` で現在のノートを取得:
   - `/live/clip/get/notes [track, scene]`
3. 現在のloop_endを確認:
   - `/live/clip/get/loop_end [track, scene]`
4. 現在の小節数を計算（loop_end / 4）
5. 目標小節数になるまでノートを複製:
   - 各ノートのstart_timeにloop_end分のオフセットを加えたノートを追加
   - `/live/clip/add/notes` で追加（1回20-25ノート程度のバッチで送信）
   - 必要に応じて複数回の複製を繰り返す（例: 4小節→8小節なら1回、4小節→16小節なら2回）
6. loop_endを目標拍数に設定:
   - `/live/clip/set/loop_end [track, scene, 目標小節数*4]`
7. 結果を報告

## 注意点
- ノート数が多い場合（60以上）はバッチに分割して送信
- 複製後にオートメーションの再適用が必要な場合は、まず `clear_automation` してから `add_automation` で `duration_beats` を新しいloop_endに合わせて適用
