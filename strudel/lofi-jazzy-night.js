// Lo-Fi Jazzy Night - 深夜のジャズバー
// Key: Dm (ii-V-I-vi), BPM: 82
// Dm9 → G13 → Cmaj9 → Am7 のジャズ循環
// 展開: 16サイクルで一巡
// strudel.cc にペーストして Ctrl+Enter で再生

setcpm(82/4)

// --- Drums (909、ジャジーなブラシ風) ---

// Kick - ジャズ的に軽め
$: sound("<[bd ~ ~ ~ ~ ~ bd ~] [bd ~ ~ ~ bd ~ ~ ~] [bd ~ ~ ~ ~ ~ bd ~] [bd ~ ~ bd ~ ~ ~ ~]>")
  .bank("RolandTR909")
  .gain("<[.8 ~ ~ ~ ~ ~ .65 ~] [.8 ~ ~ ~ .6 ~ ~ ~] [.8 ~ ~ ~ ~ ~ .65 ~] [.8 ~ ~ .55 ~ ~ ~ ~]>")
  .lpf(3000)
  .room(.04)

// Snare - ブラシ的に軽く
$: sound("~ ~ ~ ~ sd ~ ~ ~")
  .bank("RolandTR909")
  .gain(.7)
  .lpf(3500)
  .nudge(.012)
  .lastOf(8, x => x.struct("~ ~ ~ ~ sd ~ sd sd").gain(".7 ~ .35 .7"))

// Ride - ジャズの空気、スウィング
$: sound("hh(9,16)")
  .bank("RolandTR909")
  .gain(".3 .12 .25 .15 .28 .12 .3 .15 .25")
  .lpf(sine.range(3000, 5000).slow(16))
  .pan(sine.range(.55, .75).slow(8))

// Ghost HH - ランダムにそよぐ
$: sound("oh(2,8,<0 1 2 3>)")
  .bank("RolandTR909")
  .gain(perlin.range(.06, .15))
  .lpf(2500)
  .pan(rand)

// --- Bass (ウォーキングベース風) ---

$: note("<[d2 ~ f2 ~ a2 ~ d2 ~] [g1 ~ b1 ~ d2 ~ g1 ~] [c2 ~ e2 ~ g2 ~ c2 ~] [a1 ~ c2 ~ e2 ~ a1 ~]>")
  .sound("triangle")
  .lpf(400)
  .gain(.65)
  .adsr("0:.08:.6:.2")
  .crush(13)

// --- Rhodes (ジャジーなボイシング) ---

// メインコード - Dm9 → G13 → Cmaj9 → Am7
$: note("<[d4,f4,a4,c5,e5] [g3,b3,d4,f4,e4] [c4,e4,g4,b4,d5] [a3,c4,e4,g4,b4]>")
  .sound("sawtooth")
  .lpf(sine.range(700, 1600).slow(16))
  .gain(.25)
  .room(.15)
  .adsr(".01:.25:.35:.4")
  .pan(sine.range(.3, .7).slow(12))
  .crush(12)

// コードのゴースト - ディレイで広がる
$: note("<[d4,a4,e5] [g3,d4,e4] [c4,g4,d5] [a3,e4,b4]>*4?0.18")
  .sound("sawtooth")
  .gain(.07)
  .lpf(900)
  .delay(.35).delayfeedback(.5)
  .crush(11)
  .room(.2)

// --- Vibes (ビブラフォン的アクセント) ---

$: n("<0 ~ 4 ~ ~ 6 ~ ~>".add("<0 0 2 0>"))
  .scale("D4:dorian")
  .sound("glockenspiel")
  .gain(.18)
  .room(.3)
  .lpf(2200)
  .delay(.25).delayfeedback(.35)
  .pan(sine.range(.25, .75).slow(6))

// --- Lead (スモーキーなフレーズ、たまに) ---

$: n("<[~ ~ 3 ~ 5 ~ ~ ~] [~ 2 ~ ~ ~ ~ 4 ~] [~ ~ ~ 6 ~ 4 ~ ~] [~ 3 ~ ~ 2 ~ ~ ~]>")
  .scale("D4:dorian")
  .sound("square")
  .gain(.2)
  .lpf(1500)
  .adsr(".01:.2:.3:.4")
  .delay(.3).delayfeedback(.4)
  .room(.2)
  .firstOf(4, x => x.gain(0))
  .pan(sine.range(.35, .65).slow(10))

// --- Texture ---

// Vinyl crackle - レコードノイズ
$: sound("crackle")
  .gain(perlin.range(.02, .06))
  .lpf(1500)
  .hpf(400)
  .pan(rand)

// 低音のうねり - テープ劣化感
$: note("d1")
  .sound("sine")
  .gain(sine.range(.0, .06).slow(8))
  .lpf(80)
