# Session ViewからArrangement Viewに録音

Session Viewで作成したシーン構成をArrangement Viewに録音して、1曲として通して再生できるようにする。

## 手順

1. `get_project_table` で現在のシーン構成を確認・表示
2. 各シーンの小節数を確認（ユーザーに確認、デフォルトは8小節）
3. 再生を停止して先頭に戻す:
   - `stop` で停止
   - `osc_send` `/live/song/set/current_song_time [0]`
4. レコードモードをONにする:
   - `osc_send` `/live/song/set/record_mode [1]`
5. `auto_play_scenes` で全シーンを順番に再生:
   - `start_scene`: 0
   - `end_scene`: 最後のシーン番号
   - `bars_per_scene`: 確認した小節数
6. 全シーン再生完了後、停止:
   - `stop`
7. レコードモードをOFFにする:
   - `osc_send` `/live/song/set/record_mode [0]`
8. 「Arrangement Viewに録音完了しました。Ableton LiveでArrangement Viewに切り替えて確認してください」と報告

## 注意点
- 録音中はAbleton Liveを操作しないこと
- ビルドアップなど8小節のクリップがあるシーンは `bars_per_scene` を8にする
- シーンごとに小節数が異なる場合は、最大の小節数に合わせるか、手動で個別にシーンを発火する
- 録音後、Arrangement View上で微調整が可能（Session Viewのクリップには影響しない）
