# Strudel パターン生成

Strudel（ブラウザ版TidalCycles）のライブコーディングパターンを生成する。
生成されたコードは https://strudel.cc/ のエディタにペーストして実行可能。

## 引数
- `$ARGUMENTS` にジャンル、キー、BPMを指定（すべて省略可）
  - 例: `lofi Am 80` → Lo-Fi Hip Hop, Aマイナー, 80 BPM
  - 例: `jcore Em 175` → J-core, Eマイナー, 175 BPM
  - 例: `ambient C 60` → アンビエント, Cメジャー, 60 BPM
  - 引数なし → ジャンル・キー・BPMを提案

## 対応ジャンル
- **lofi**: Lo-Fi Hip Hop（70-90 BPM）
- **jcore**: J-core / Hardcore（170-185 BPM）
- **edm**: EDM / House（125-130 BPM）
- **ambient**: アンビエント / チルアウト（60-80 BPM）
- **dnb**: Drum and Bass（170-180 BPM）
- **techno**: テクノ（125-135 BPM）
- **boombap**: ブーンバップ / 90s Hip Hop（85-98 BPM）
- 指定なしや上記以外 → ユーザーと相談して決定

## リファレンス
Strudel構文の詳細は `docs/strudel-reference.md` を参照。

## 生成手順

### Step 1: パラメータ確認
1. `$ARGUMENTS` からジャンル・キー・BPMを解析
2. 未指定の場合はユーザーに提案して確認
3. コード進行パターンを提案（CLAUDE.mdの音楽理論セクション参照）

### Step 2: コード生成
以下の構成要素を `$:` 並列パターンで生成する:

#### 2a. テンポ設定
```js
setcpm(BPM/4)  // 1サイクル = 4拍（1小節）として計算
```

#### 2b. ドラムパターン
- ジャンルに応じたパターンを生成
- `sound()` + `.bank()` でドラムマシン指定
- ベロシティ差は `.gain()` パターンで表現
- **lofi**: スウィング感、ゴーストノート → `"bd ~ sd ~, ~ hh [~ hh] hh"` 的な遅めのグルーヴ
- **jcore**: 8ビート、16分HH → `"bd bd sd bd, hh*8"` 的な高速パターン
- **edm**: 4つ打ち → `"bd*4, ~ cp ~ ~, hh*8"`
- **ambient**: 最小限 or なし
- **dnb**: ブレイクビーツ → `"[bd ~ ~ bd ~ ~ bd ~] [~ ~ sd ~ ~ ~ ~ ~], hh*16"` 的な2ステップ
- **techno**: 4つ打ち + ハイハットワーク → `"bd*4, [~ hh]*4, ~ cp ~ ~"`

#### 2c. ベースライン
- `note()` or `n().scale()` でコード進行のルート音を配置
- `.sound("sawtooth")` or `.sound("triangle")` + `.lpf()` でベース音色
- ジャンルに応じたリズムパターン
- **lofi**: ルート白玉 or シンプルなパターン
- **jcore**: 裏拍グルーヴ（ンベンベ）
- **edm**: シンプルなルート + オクターブ
- **dnb**: 16分のサブベース

#### 2d. コード/パッド
- `note()` でボイシングを直接指定（セブンス推奨）
- or `n().scale()` でスケール度数指定
- `.sound("sawtooth")` / `"square"` / `"triangle"` + エフェクトで音色作成
- **lofi**: `room` + `lpf` で温かみ、ジャズ的ボイシング
- **jcore**: SuperSaw感 → `sawtooth` + `.jux(rev)` でワイド
- **edm**: 白玉パッド or スタブ
- **ambient**: ロングリリース + 深いリバーブ

#### 2e. メロディ/リード（ジャンルに応じて）
- スケール内で順次進行と跳躍のバランス
- `.off()` でカノン/エコー効果
- `.jux(rev)` でステレオ広がり
- **lofi**: ピアノ的 or シンプルなフレーズ、`piano` サンプル活用
- **jcore**: かわいいスクエア波メロディ
- **ambient**: 長い音、少ない音

#### 2f. エフェクト/テクスチャ
- フィルタースイープ: `sine.range().slow()` でLFO的変化
- リバーブ/ディレイ: `.room()`, `.delay()`
- Lo-Fi感: `.coarse()`, `.crush()` を控えめに
- パンニング: `.pan(sine.slow())` で動き

### Step 3: 出力
1. 完成コードを**コードブロック**で出力
2. 各パターンにコメントで説明を付ける
3. **strudel-reviewer エージェントでセルフレビュー**を実行し、問題があれば修正
4. strudel.cc にペーストする手順を案内
5. カスタマイズのヒントを提案（ミュート方法 `_$:`、パラメータ変更箇所など）

## ジャンル別テンプレート

### Lo-Fi Hip Hop (参考)
```js
setcpm(80/4)

// Drums - スウィング感のあるビート
$: sound("bd ~ sd ~, [~ hh]*4")
  .bank("RolandTR808")
  .gain("1 .6 .9 .6")

// Bass - 温かいサブベース
$: note("<c2 a1 f1 g1>")
  .sound("triangle")
  .lpf(300)
  .gain(.8)
  .adsr("0:.1:.8:.3")

// Chords - ジャズ的セブンス
$: note("<[c4,e4,g4,b4] [a3,c4,e4,g4] [f3,a3,c4,e4] [g3,b3,d4,f4]>")
  .sound("sawtooth")
  .lpf(sine.range(400, 1200).slow(8))
  .gain(.35)
  .room(.4)
  .adsr(".01:.2:.4:.4")

// Melody - ピアノ風
$: n("0 2 4 ~ 7 4 2 ~".add("<0 0 5 0>"))
  .scale("C4:major")
  .sound("piano")
  .gain(.5)
  .room(.3)
  .delay(.25)
```

### J-core (参考)
```js
setcpm(175/4)

// Drums - 8ビート高速
$: sound("[bd bd sd bd, hh*8, ~ ~ ~ ~ ~ ~ ~ oh]")
  .bank("RolandTR909")
  .gain("[1 .9 1 .9, .7*8, .5]")

// Sub Bass - 裏拍ンベンベ
$: note("<[~ a1]*4 [~ f1]*4 [~ c2]*4 [~ g1]*4>")
  .sound("triangle")
  .lpf(250)
  .gain(.85)

// SuperSaw Chords
$: note("<[a3,c4,e4] [f3,a3,c4] [c3,e3,g3] [g3,b3,d4]>")
  .sound("sawtooth")
  .jux(rev)
  .lpf(2500)
  .gain(.45)
  .room(.2)
  .adsr(".01:.05:.7:.1")

// Lead - かわいいスクエア波
$: n("0 2 4 7 4 2 0 ~".add("<0 0 5 3>"))
  .scale("A4:minor")
  .sound("square")
  .lpf(3000)
  .gain(.5)
  .delay(.15)
  .off(1/16, x => x.add(12).gain(.3))
```

### EDM / House (参考)
```js
setcpm(128/4)

// Drums - 4つ打ち
$: sound("bd*4, ~ cp ~ ~, [~ hh]*8")
  .bank("RolandTR909")

// Bass
$: note("<c2 c2 ab1 bb1>")
  .sound("sawtooth")
  .lpf(sine.range(100, 500).slow(4))
  .gain(.8)
  .adsr("0:.05:.6:.1")

// Chords - サイドチェインスタブ風
$: note("<[c4,eb4,g4] [c4,eb4,g4] [ab3,c4,eb4] [bb3,d4,f4]>")
  .sound("sawtooth")
  .gain(".7 .3 .2 .3")
  .lpf(1800)
  .room(.3)
  .adsr(".01:.1:.3:.2")

// Lead
$: n("0 ~ 3 ~ 4 3 0 ~".add("<0 0 5 0>"))
  .scale("C4:minor")
  .sound("square")
  .gain(.45)
  .delay(.2)
  .lpf(2500)
```

### Ambient (参考)
```js
setcpm(65/4)

// Pad - 深いリバーブ
$: note("<[c3,e3,g3,b3] [a2,c3,e3,g3]>/2")
  .sound("sawtooth")
  .lpf(sine.range(300, 1500).slow(16))
  .gain(.3)
  .room(4)
  .roomsize(.9)
  .attack(2).release(4)

// Texture
$: n("0 ~ 4 ~ 7 ~ 4 ~".add("<0 2>"))
  .scale("C5:major")
  .sound("triangle")
  .gain(perlin.range(.1, .35))
  .delay(.5).delayfeedback(.6)
  .room(3)
  .pan(sine.slow(8))

// Sub drone
$: note("<c1 a0>/4")
  .sound("sine")
  .gain(.25)
  .attack(4).release(4)
  .lpf(200)
```

### Drum and Bass (参考)
```js
setcpm(174/4)

// Drums - ブレイクビーツ
$: sound("[bd ~ ~ bd ~ ~ bd ~, ~ ~ sd ~ ~ ~ ~ ~]")
  .bank("RolandTR909")
  .gain("[1 ~ ~ .9 ~ ~ .85 ~, ~ ~ 1 ~ ~ ~ ~ ~]")
$: sound("hh*16")
  .bank("RolandTR909")
  .gain(".5 .3 .7 .3 .5 .3 .7 .4")

// Reese Bass
$: note("<[c2 ~ c2 ~]*2 [f1 ~ f1 ~]*2>")
  .sound("sawtooth")
  .lpf(sine.range(150, 800).slow(4))
  .gain(.75)
  .adsr("0:.05:.7:.1")

// Pad
$: note("<[c4,eb4,g4] [f3,ab3,c4]>/2")
  .sound("sawtooth")
  .gain(.25)
  .lpf(1200)
  .room(2)
  .attack(1).release(2)
```

### Boom Bap / 90s Hip Hop (参考)
```js
setcpm(94/4)

// Drums - 硬いブーンバップビート
$: sound("[bd ~ ~ ~ bd ~ ~ ~, ~ ~ ~ ~ sd ~ ~ ~, [~ hh]*8]")
  .bank("RolandTR808")
  .gain("[1 ~ ~ ~ .85 ~ ~ ~, ~ ~ ~ ~ 1 ~ ~ ~, .45 .25 .5 .25 .45 .25 .55 .3]")
  .room(.05)

// Dusty open hat - ゴーストノート的
$: sound("~ ~ ~ oh ~ ~ oh ~")
  .bank("RolandTR808")
  .gain(".3 .2")
  .lpf(3000)
  .crush(10)

// Bass - ウッドベース風ファンク
$: note("<[d2 ~ d2 ~ ~ d2 ~ f2] [a1 ~ a1 ~ ~ a1 ~ c2] [bb1 ~ bb1 ~ ~ bb1 ~ a1] [a1 ~ ~ a1 g1 ~ a1 ~]>")
  .sound("triangle")
  .lpf(350)
  .gain(.8)
  .adsr("0:.08:.6:.15")
  .crush(12)

// Rhodes - ジャジーなコード、SP-1200的ダスト感
$: note("<[d4,f4,a4,c5] [a3,c4,e4,g4] [bb3,d4,f4,a4] [a3,c#4,e4,g4]>")
  .sound("sawtooth")
  .lpf(sine.range(600, 1400).slow(16))
  .gain(.28)
  .room(.15)
  .adsr(".01:.3:.3:.4")
  .crush(11)
  .pan(sine.range(.3, .7).slow(8))

// Horn stab - Premierっぽいチョップ
$: note("<~ ~ [d5,f5,a5] ~>")
  .sound("square")
  .gain(.2)
  .lpf(1800)
  .adsr(".005:.15:.1:.1")
  .delay(.15).delayfeedback(.3)
  .crush(10)

// Vinyl texture - ダスティなノイズ
$: sound("hh*16")
  .bank("RolandTR808")
  .gain(perlin.range(.02, .08))
  .lpf(1500).hpf(800)
  .crush(6).coarse(4)
  .pan(rand)
```

### Techno (参考)
```js
setcpm(130/4)

// Kick
$: sound("bd*4").bank("RolandTR909").gain(1)

// Percussion
$: sound("~ cp ~ ~, [~ hh]*8, ~ ~ ~ ~ ~ ~ ~ oh")
  .bank("RolandTR909")
  .gain(".8, .5 .3 .6 .3 .5 .3 .6 .4, .4")

// Bass - ミニマルなパターン
$: note("<c2 c2 c2 [c2 eb2]>")
  .sound("sawtooth")
  .lpf(sine.range(100, 600).slow(8))
  .gain(.7)
  .adsr("0:.05:.5:.1")

// Stab
$: note("<~ [c4,eb4,g4] ~ ~, ~ ~ ~ [f3,ab3,c4]>/2")
  .sound("square")
  .gain(.3)
  .lpf(1500)
  .delay(.3).delayfeedback(.4)
  .room(.2)
```

## 注意点
- Strudel はブラウザ上で動作するため、Ableton MCP ツールは使わない
- 生成コードは strudel.cc のエディタにペーストして `Ctrl+Enter` で実行
- `_$:` でパターンをミュート可能（デバッグ/調整時に便利）
- 同じエフェクトを2回書くと後者で上書きされる（スタックされない）
- テンポ計算: `setcpm(BPM / 4)` で1サイクル=1小節（4/4拍子）
- コード進行提案時はCLAUDE.mdの音楽理論セクションを参照
- ユーザーの好みに合わせて調整を提案する（特にフィルターやエフェクト量）
