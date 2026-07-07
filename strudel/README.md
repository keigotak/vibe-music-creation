# Strudel パターンカタログ

生成済みStrudelパターンの一覧。strudel.cc にペーストして `Ctrl+Enter` で再生。

| ファイル | タイトル | ジャンル | キー | BPM | コード進行 | 特徴 |
|---|---|---|---|---|---|---|
| [lofi-sunset-walk.js](lofi-sunset-walk.js) | 夕暮れの帰り道 | Lo-Fi Hip Hop | Am | 76 | Fmaj9 → E7 → Am9 → Gm7 C7 (IV-III7-vi + 借用ii-V) | Just the Two of Us系ノスタルジー循環、16小節展開 |
| [luv-sic-inspired.js](luv-sic-inspired.js) | Luv Sic インスパイア | Lo-Fi Hip Hop | F / Dm | 88 | Fmaj9 ×2 → Em7b5 → A7 → Dm9 ×2 → Gm7 → C7 (8小節) | Nujabes風ダブル解決 (ii-V-i + ii-V-I)、16小節展開 |
| [lofi-jazzy-night.js](lofi-jazzy-night.js) | 深夜のジャズバー | Lo-Fi Hip Hop | Dm | 82 | Dm9 → G13 → Cmaj9 → Am7 (ii-V-I-vi) | ジャズ循環、16小節展開 |
| [lofi-chill-rain.js](lofi-chill-rain.js) | 雨の日のカフェ | Lo-Fi Hip Hop | C | 75 | Cmaj7 → Am7 → Dm7 → G7 (I-vi-ii-V) | 温かいエレピ + 雨音テクスチャ |
| [chill-float.js](chill-float.js) | 浮遊系チル | Chill / Lo-Fi | C | 75 | Fmaj9 → Em7 → Dm9 → Cmaj9 (IV-iii-ii-I) | 9th中心の下降進行で浮遊感 |
| [boombap-guru.js](boombap-guru.js) | Gang Starr / Guru風 | Boom Bap | Dm | 88 | Dm9 → Am7 → Bbmaj7 → A7 (i-v-bVI-V7) | 渋めローファイ、16小節展開 |
| [ambient-drift.js](ambient-drift.js) | 漂う意識 | Ambient | C | 60 | Cmaj7 → Am7 (I-vi 2コード) | 長周期変化、深いリバーブ |
| [jcore-kawaii.js](jcore-kawaii.js) | ネオン渋谷サイバーパンク | J-core | Am | 175 | Am → F → C → G (vi-IV-I-V) | SuperSaw + スクエアリード + 声ネタ (Shabda) |

## 新規パターン作成

`/create-strudel <ジャンル> <キー> <BPM>` で生成（例: `/create-strudel lofi Am 80`）。
生成手順・設計規約は [.claude/commands/create-strudel.md](../.claude/commands/create-strudel.md)、構文リファレンスは [docs/strudel-reference.md](../docs/strudel-reference.md) を参照。

## 規約

- ファイル冒頭コメントに タイトル / キー / BPM / コード進行 / 展開周期 を記載する
- 新規パターン追加時はこの表にも1行追加する
