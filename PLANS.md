# PLANS.md

## 現在のマイルストーン

（なし）

<!-- マイルストーンのテンプレート:
### M1: （マイルストーン名）
- **目標**: 何を達成するか
- **作業**: 具体的な手順
- **成果**: 存在するようになるもの
- **証拠**: 検証方法（テストコマンド、期待する出力など）
- **状態**: [ ] 未着手 / [~] 進行中 / [x] 完了

#### 進捗
- [ ] ステップ1
- [ ] ステップ2
-->

## 決定ログ

| 日付 | 決定 | 理由 | 代替案 |
|------|------|------|--------|
| 2026-02-11 | ドキュメントファーストで知識ベース構築 | 音楽理論・制作戦略を体系化し、毎セッションで参照可能にする | コード内コメントのみ |
| 2026-02-12 | MCP高レベルツールよりOSC直接送信を優先 | create_drum_track等がサイレント失敗する問題 | 高レベルツールのみ使用 |
| 2026-03-22 | Strudel対応を追加 | Ableton不要でブラウザだけで音楽制作・実験可能 | Ableton MCPのみ |
| 2026-03-22 | get_device_paramsをquery_rawベースに改修 | queryメソッドのタイムアウトで失敗するケースを解消 | 従来のquery方式のみ |
| 2026-03-22 | トラック作成にsleep追加 | fire-and-forgetのOSC送信後、Ableton側の反映を待つ必要がある | sleep なし(不安定) |

## 意外な発見

- auto_play_scenesのタイミングドリフト: 50ms早め発火では不十分、200msが必要だった
- Live 12でのデバイス名リネーム（Chorus → Chorus-Ensemble）
- drum-machinesはStrudelにデフォルト読み込み済み（外部ロード不要）

## 今後の予定

（なし）

## 完了済み

- 音楽理論リファレンス構築（docs/music-theory.md）
- Making Music 74戦略要約（docs/making-music.md）
- オートメーション機能実装・ドキュメント化
- J-core制作スキル
- EDM制作ワークフロー確立
- Strudel対応（スキル・リファレンス・サンプル楽曲）
- Lo-Fi Hip Hop制作スキル（/create-lofi）
- Strudelサンプル楽曲拡充（lofi-chill-rain, lofi-jazzy-night, ambient-drift, jcore-kawaii）
- ジャンル別プリセットドキュメント（docs/genre-presets.md）
- MCP Server改善（get_device_params バッチ取得、トラック作成のタイミング修正）
- 制作スキルにレビューエージェント自動呼び出しを統合
