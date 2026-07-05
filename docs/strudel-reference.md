# Strudel リファレンス

Strudel = TidalCycles の JavaScript 移植。ブラウザ上でライブコーディング音楽制作。
公式: https://strudel.cc/

## 基本概念
- すべては **パターン**。1サイクル = デフォルト2秒
- **ミニノーテーション**（文字列内）でリズム/シーケンス
- **メソッドチェーン**（文字列外）でエフェクト/変換
- `$:` で複数パターンを並列実行

## ミニノーテーション

| 記法 | 意味 | 例 |
|------|------|-----|
| スペース | 1サイクル内にシーケンス | `"bd sd hh oh"` |
| `:N` | サンプルバリエーション | `"hh:0 hh:1"` |
| `~` | 休符 | `"bd ~ sd ~"` |
| `<a b>` | サイクルごとに交代 | `"<bd hh rim>"` |
| `[a b]` | サブシーケンス（1スロット内） | `"bd [hh hh] sd oh"` |
| `*N` | N倍速（リピート） | `"hh*4"` |
| `/N` | N倍遅く（Nサイクルに分散） | `"[c a f e]/2"` |
| `,` | 並列再生（スタック） | `"bd*2, hh*4"` |
| `@N` | N スロット分に引き延ばす | `"c@3 e"` (cが3/4) |
| `!N` | N回複製（速くならない） | `"c!3 e"` |

## サウンド

```js
sound("casio")              // サンプル再生
sound("casio:1")            // バリエーション選択
sound("bd hh sd oh")        // シーケンス
  .bank("RolandTR909")      // ドラムマシン指定
n("0 1 4 2").sound("jazz")  // サンプル番号選択
```

### 主要バンク
- `RolandTR909`, `RolandTR808`, `RolandTR707`
- `RolandCR78`, `AkaiLinn`

### ノイズ/テクスチャ
```js
sound("crackle")   // ビニールクラックル（Lo-Fiテクスチャ定番）
```

## ノート/ピッチ

```js
note("c e g b")              // 音名
note("c2 e3 g4")             // オクターブ指定
note("db eb")                // フラット
note("c# d#")                // シャープ
note("48 52 55 59")          // MIDI番号
freq("220 440")              // 周波数(Hz)
```

### スケール
```js
n("0 2 4 6").scale("C:minor")
n("0 1 2 3 4 5 6 7").scale("A2:minor:pentatonic")
```
- `C:major`, `A:minor`, `D:dorian`, `G:mixolydian`
- `C:minor:pentatonic`, `F:major:pentatonic`
- `C:chromatic`, `C:whole`, `C:lydian`, `C:phrygian`

## シンセ音源

```js
note("c3 eb3 g3").sound("sawtooth")  // ノコギリ波
note("c3").sound("square")            // 矩形波
note("c3").sound("triangle")          // 三角波
note("c3").sound("sine")              // サイン波
```

## エフェクト

### フィルター
```js
.lpf(800)         // ローパス（カットオフHz）
.hpf(200)         // ハイパス
.bpf(1000)        // バンドパス
.lpq(5)           // レゾナンス
.vowel("<a e i o>") // フォルマント
```

### アンプ/エンベロープ
```js
.gain(.8)                              // ボリューム
.velocity(.7)                          // ベロシティ
.attack(.01).decay(.1).sustain(.5).release(.2)  // ADSR
.adsr(".01:.1:.5:.2")                  // ADSR短縮形
```

### 空間系
```js
.delay(.5)              // ディレイ量 (0-1)
.delaytime("1/3")       // ディレイタイム
.delayfeedback(.6)      // フィードバック
.room(2)                // リバーブ量
.roomsize(.8)           // リバーブサイズ
.pan("0 0.3 .6 1")     // パン (0=左, 1=右)
```

### 歪み/Lo-Fi
```js
.coarse(8)         // サンプルレート低下
.crush(8)          // ビットクラッシュ
.distort("8:.4")   // ディストーション
```

### 再生速度
```js
.speed("<1 2 -1 -2>")  // 負=逆再生
```

## シグナル変調（LFO的）

```js
sine    // サイン波
saw     // ノコギリ波
square  // 矩形波
tri     // 三角波
rand    // ランダム
perlin  // パーリンノイズ（滑らか）
```

使い方:
```js
.lpf(sine.range(100, 2000).slow(4))   // フィルタースイープ
.gain(perlin.range(.5, 1))             // ランダムなボリューム変化
.pan(sine.slow(2))                      // オートパン
```

## パターン変換

```js
.fast(2)           // 2倍速
.slow(2)           // 半速
.rev()             // 逆順
.jux(rev)          // L=原型, R=変換版（ステレオ分割）
.ply(2)            // 各イベントを倍速
.add("<0 1 2 1>")  // 値を加算（転調等）
.off(1/16, x => x.add(4))  // コピー+時間シフト+変換（カノン/ハーモニー）
.struct("x ~ x ~")          // リズム構造を上書き（truthyな値で発音）
```

## グルーヴ / ヒューマナイズ

```js
.nudge(.015)          // イベントを微小にずらす（スネアのレイドバックに。0.01-0.02目安）
.late(.01)            // パターン全体を遅らせる（サイクル単位）
.early(.01)           // パターン全体を早める
.swingBy(1/6, 4)      // 4分割ごとにスウィング（1/6 = 軽め、1/3 = 強め）
.velocity(".8 .5 .7 .4")  // ベロシティパターン（gainと乗算）
.gain(perlin.range(.4, .6))  // 揺らぎのある音量
```

**ゲイン設計の目安**（同時発音の実効gain合計 ≦ 1.5）:
ドラム合計 0.7-1.0 / ベース 0.5-0.7 / コード 0.2-0.35 / メロディ 0.3-0.5 / テクスチャ 0.1以下

## 条件付きパターン変換

```js
// nサイクルに1回変化
.firstOf(4, x => x.rev())       // 4サイクルに1回反転
.lastOf(4, x => x.rev())        // 4サイクルの最後に反転

// 確率で変化
.sometimesBy(.3, x => x.speed("0.5"))  // 30%で適用
.sometimes(fn)     // 50%
.often(fn)         // 75%
.rarely(fn)        // 25%

// バイナリパターンで条件分岐
.when("<0 0 0 1>", x => x.add(7))

// パターンを分割して順に変換
.chunk(4, x => x.add(7))   // 4分割、毎サイクル別セクションを変換
```

## ユークリッドリズム

```js
sound("bd(3,8)")         // 3拍を8分割に均等配置
sound("bd(5,8)")         // 5拍を8分割
sound("bd(3,8,2)")       // 回転オフセット付き
note("c3").euclid(3,8)   // メソッド版
```

## 確率・ランダム

```js
// ミニノーテーション
"hh*8?"         // 各ノート50%で消える
"hh*8?0.2"      // 20%で消える
"a | b | c"     // サイクルごとにランダム選択

// メソッド
.degradeBy(0.3)                  // 30%のイベントを削除
.degradeBy(sine.slow(16))        // 徐々に消えて戻る
choose("a","b","c")              // 毎イベントランダム
chooseCycles("bd","hh","sd")     // 毎サイクルランダム
```

## pick（パターン切替）

```js
// インデックスで選択
"<0 1 2 3>".pick(["bd sd", "bd bd sd", "bd ~ sd sd", "bd*4"])

// 名前で選択
"<a!8 b!4 c!4>".pick({
  a: "bd(3,8)",
  b: "bd(5,8)",
  c: "bd(7,8)"
})
```

## レイヤリング・カノン

```js
// 時間差コピー（カノン、ハーモニー）
.off(1/8, x => x.add(7))

// 重ね掛け
.superimpose(x => x.add(7))     // 原型 + 変形を重ねる

// エコー的な累積
.echo(3, 1/6, .8)               // 3回, 1/6サイクル間隔, 減衰0.8
.echoWith(4, 1/8, (p,n) => p.add(n*2))  // 変形付きエコー

// ステレオ分割
.jux(rev)                        // L=原型, R=反転
.juxBy(.5, rev)                  // 幅を狭める
```

## 展開テクニック（長い周期の構造）

```js
// <> を異なるレートでネスト → 位相差で長周期
note("<c e g>").gain("<.5 .8>")  // 6サイクルで一巡

// 素数で firstOf を重ねる → 15サイクルで一巡
.firstOf(3, x => x.rev())
.firstOf(5, x => x.add(7))

// slow な when で稀な変化
.when("<0 0 0 1>/4", x => x.fast(2))  // 16サイクルに1回

// degradeBy + signal で密度が波のように変化
.degradeBy(sine.slow(16).range(0, 0.7))

// pick でセクション切替（AABA形式等）
"<a!8 b!4 a!4 b!2 c!2>".pick({...})  // 20サイクルの構成
```

## テンポ

```js
setcpm(90/4)   // CPM設定（BPM÷4 = CPM、1サイクル=4拍の場合）
// BPM 120 → setcpm(30)
// BPM 80 → setcpm(20)
```

## 構成テンプレート

### 並列パターン
```js
$: sound("bd [~ bd] sd [hh hh]").bank("RolandTR909")

$: note("<[c2 c3]*4 [bb1 bb2]*4>")
  .sound("sawtooth")
  .lpf(sine.range(200, 2000).slow(8))
  .adsr(".01:.1:.5:.2")
  .room(.3).delay(.25)

$: n("0 2 4 6 ~ 7 9 5".add("<0 1 2 1>"))
  .scale("C:minor")
  .sound("piano")
  .jux(rev)
  .gain(.7)
```

### スタック
```js
stack(
  sound("bd [~ bd] sd [hh hh]").bank("RolandTR909"),
  note("c2 [~ c2] eb2 [~ g1]").sound("sawtooth").lpf(400),
  n("0 2 4 6").scale("C:minor").sound("piano").gain(.6)
)
```

### ミュート
```js
_$: note("c e g")  // _$ でミュート
```

## Orbit（エフェクトバス）
```js
.orbit(2)  // 別のエフェクトバスに送る（デフォルト=1）
```

## ダッキング/サイドチェイン
```js
.duckorbit(1)     // orbit 1の音でダッキング
.duckattack(.01)
.duckdepth(.5)
```
