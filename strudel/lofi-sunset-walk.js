// Lo-Fi Sunset Walk - 夕暮れの帰り道
// Key: Am (Cメジャー平行調), BPM: 76
// 進行(4小節): | Fmaj9 | E7 | Am9 | Gm7 C7 |
//   → IV-III7-vi (Just the Two of Us系) + Gm7-C7 (Fへ戻るii-V借用) でノスタルジー循環
// 展開: 16サイクルで一巡（キック4小節周期 / スネアフィル8小節 / メロディ間引き4小節 / 16小節ごとのユニークイベント）
// strudel.cc にペーストして Ctrl+Enter

setcpm(76/4)

// --- Drums (808、レイドバック) ---

// Kick - 1拍目+3拍目周辺、4小節で変化
$: sound("<[bd ~ ~ ~ ~ ~ bd ~] [bd ~ ~ ~ ~ bd ~ ~] [bd ~ ~ bd ~ ~ bd ~] [bd ~ ~ ~ ~ ~ bd ~]>")
  .bank("RolandTR808")
  .gain(.75)
  .lpf(2500)

// Snare - 2,4拍、少し遅らせてレイドバック、8小節目にフィル
$: sound("~ ~ sd ~ ~ ~ sd ~")
  .bank("RolandTR808")
  .gain(.6)
  .lpf(3000)
  .nudge(.015)
  .lastOf(8, x => x.struct("~ ~ x ~ ~ x ~ x").gain(".6 .3 .45"))

// Ghost snare - 極小音量の合いの手（50%で消える）
$: sound("~ ~ ~ sd ~ ~ ~ ~")
  .bank("RolandTR808")
  .gain(.12)
  .lpf(2000)
  .degradeBy(.5)

// Hat - 8分、強弱 + 16サイクル周期で密度が波打つ
$: sound("hh*8")
  .bank("RolandTR808")
  .gain(".3 .14 .24 .16 .28 .13 .25 .18")
  .lpf(perlin.range(3000, 4500))
  .degradeBy(sine.slow(16).range(0, .35))
  .pan(sine.range(.45, .6).slow(8))

// Open hat - 4拍目裏にたまに
$: sound("~ ~ ~ ~ ~ ~ oh ~")
  .bank("RolandTR808")
  .gain(.2)
  .lpf(3200)
  .degradeBy(.5)

// --- Bass (ルート中心 + 半音/全音アプローチで次のコードへ) ---
//  F | E | A | G→C

$: note("<[f2 ~ ~ c3 ~ ~ a2 ~] [e2 ~ ~ e2 ~ b2 ~ g#2] [a1 ~ ~ e2 ~ ~ a2 ~] [g2 ~ bb2 ~ c3 ~ ~ e2]>")
  .sound("triangle")
  .lpf(380)
  .gain(.6)
  .adsr("0:.08:.6:.2")
  .crush(13)

// --- Chords (エレピ風、共通音保持の最小移動ボイシング) ---
// Fmaj9 → E7 → Am9 → Gm7/C7（ルートはベースに任せて3rd/7th/テンション中心）

$: note("<[a3,c4,e4,g4] [g#3,b3,d4,e4] [g3,b3,c4,e4] [[f3,bb3,d4] [e3,bb3,d4]]>")
  .sound("sawtooth")
  .lpf(sine.range(750, 1400).slow(16))
  .gain(.26)
  .room(.2)
  .adsr(".02:.25:.4:.45")
  .pan(sine.range(.35, .65).slow(12))
  .crush(12)

// コードのきらめき - 高域の断片がディレイで漂う（各コード2回、25%間引き）
$: note("<[c5,e5,g5] [b4,d5,e5] [b4,c5,e5] [[bb4,d5,f5] [bb4,c5,e5]]>")
  .ply(2).degradeBy(.25)
  .sound("sawtooth")
  .gain(.07)
  .lpf(1100)
  .delay(.35).delaytime(.375).delayfeedback(.4)
  .room(.25)
  .crush(11)

// --- Melody (ピアノ、モチーフ「上行→折り返し」の反復変形) ---
// 最高音A5は3小節目に1回だけ（クライマックス）

$: note("<[~ a4 c5 ~ e5 ~ d5 c5] [b4 ~ d5 ~ ~ g#4 ~ b4] [c5 e5 g5 ~ a5 ~ g5 e5] [d5 ~ bb4 ~ g4 ~ e4 ~]>")
  .sound("piano")
  .gain(.42)
  .velocity(".7 .55 .8 .6 .9 .6 .65 .5")
  .room(.3)
  .delay(.22).delaytime(.375).delayfeedback(.35)
  .lpf(2400)
  .firstOf(4, x => x.degradeBy(.25))
  .lastOf(16, x => x.add(12).gain(.25))

// --- Counter melody (低めの合いの手、2・4小節目だけ) ---

$: note("<~ [~ ~ ~ ~ ~ e4 ~ d4] ~ [~ ~ ~ ~ ~ ~ g4 ~]>")
  .sound("piano")
  .gain(.16)
  .lpf(1600)
  .room(.3)
  .pan(.3)
  .firstOf(8, x => x.gain(.24))

// --- Texture ---

// Vinyl crackle
$: sound("crackle")
  .gain(perlin.range(.02, .05))
  .lpf(1500).hpf(400)
  .pan(rand)

// 空気感 - 8小節に1回のE6（Fmaj9のmaj7）、16小節に1回だけ強く
$: note("<e6 ~ ~ ~ ~ ~ ~ ~>")
  .sound("sine")
  .gain(.035)
  .room(.7).roomsize(.85)
  .delay(.4).delaytime(.75).delayfeedback(.45)
  .pan(sine.range(.25, .75).slow(16))
  .firstOf(16, x => x.gain(.06))
