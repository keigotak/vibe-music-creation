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
| 2026-07-05 | レビューエージェントを数値基準+出力フォーマット付きに強化、music-reviewerにMCP読み取りツールを付与 | 従来は抽象的な指摘に留まり品質向上に繋がりにくかった。自力でプロジェクト状態を取得できず | 薄いプロンプトのまま運用 |
| 2026-07-05 | 制作スキルに「打ち込み前の設計工程」を追加（ボイスリーディング表・モチーフ設計・ハーモニー整合表・ゲイン設計） | 生成後の修正より生成前の設計の方が音楽の質に効く | レビューでの事後修正のみ |
| 2026-07-08 | Strudel構文チェックを機械化（scripts/lint_strudel.py）し、strudel-reviewerのStep 0に組み込み | 括弧対応・エフェクト重複等は目視だと見逃しが出る。機械検出できる項目はlintに寄せ、レビューは音楽性に集中 | 目視レビューのみ継続 |

## 意外な発見

- auto_play_scenesのタイミングドリフト: 50ms早め発火では不十分、200msが必要だった
- Live 12でのデバイス名リネーム（Chorus → Chorus-Ensemble）
- drum-machinesはStrudelにデフォルト読み込み済み（外部ロード不要）

## 今後の予定

- [ ] Strudel → Ableton ブリッジ: `note()` パターンをパースしてMIDIノート化し、OSC (`/live/clip/add/notes`) でクリップに流し込む（AbletonMCP側に実装）
- [ ] `/review-strudel` スラッシュコマンド: 既存パターン単体のレビュー入口（引数=ファイルパス、省略時は最新）
- [ ] `/update-device-map` スキル: `get_full_project_analysis` から docs/device-params.md を自動再生成
- [ ] ジャンル拡充: genre-presets.md と create-strudel の対応ジャンル同期 + City Pop / Jazz-hop 等の追加

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
- 制作スキルにレビューエージェント自動呼び出しを統合（※create-lofi は2026-07-05に追加。当初は未統合だった）
- レビュー体制強化: music-reviewer/strudel-reviewer を数値基準チェックリスト+3段階出力（🔴🟡🟢）に刷新、.codex側も同期（2026-07-05）
- strudel-reference.md に実作品で使用済みの未記載関数を追記（nudge/velocity/struct/crackle/swingBy/late/early、ゲイン設計目安）（2026-07-05）
- Strudelパターンのカタログ作成（strudel/README.md）+ README.md の陳腐化修正（/create-lofi、genre-presets.md リンク等）（2026-07-08）
- Strudel静的チェックスクリプト（scripts/lint_strudel.py）+ strudel-reviewer/create-strudel への組み込み、.codex側も同期（2026-07-08）
