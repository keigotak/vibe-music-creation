// Lo-Fi Chill - 雨の日のカフェ
// Key: C major (Cmaj7 → Am7 → Dm7 → G7), BPM: 75
// ジャズ的セブンスと温かいエレピ、雨音テクスチャ
// strudel.cc にペーストして Ctrl+Enter で再生

setcpm(75/4)

// --- Drums (808系、柔らかめ) ---

// Kick - ゆったり、レイドバック
$: sound("bd ~ ~ ~ ~ ~ bd ~")
  .bank("RolandTR808")
  .gain(".85 ~ ~ ~ ~ ~ .7 ~")
  .lpf(2500)
  .room(.05)

// Snare - 2,4拍目、微妙に遅らせてレイドバック
$: sound("~ ~ ~ ~ sd ~ ~ ~")
  .bank("RolandTR808")
  .gain(.75)
  .lpf(3500)
  .sometimesBy(.1, x => x.ply(2).gain(.3))
  .nudge(.015)

// HH - 16分、ベロシティでスウィング
$: sound("hh*16")
  .bank("RolandTR808")
  .gain(".4 .15 .3 .18 .42 .15 .35 .2 .38 .12 .3 .18 .4 .15 .32 .2")
  .lpf(sine.range(2000, 3500).slow(16))
  .sometimesBy(.08, x => x.speed("2").gain(.1))

// Ghost snare - ゴーストノート
$: sound("~ sd ~ sd ~ ~ sd ~")
  .bank("RolandTR808")
  .gain(perlin.range(.05, .15))
  .lpf(2000)
  .pan(rand)

// --- Bass (温かいサブベース) ---

$: note("<[c2 ~ ~ c2 ~ ~ ~ ~] [a1 ~ ~ a1 ~ ~ ~ ~] [d2 ~ ~ d2 ~ ~ ~ ~] [g1 ~ ~ g1 ~ ~ ~ a1]>")
  .sound("triangle")
  .lpf(350)
  .gain(.7)
  .adsr("0:.1:.7:.3")
  .room(.03)

// --- Chords (エレピ、セブンスボイシング) ---

// メインコード - ゆったり白玉
$: note("<[c4,e4,g4,b4] [a3,c4,e4,g4] [d4,f4,a4,c5] [g3,b3,d4,f4]>")
  .sound("sawtooth")
  .lpf(sine.range(600, 1400).slow(16))
  .gain(.28)
  .room(.2)
  .adsr(".01:.3:.4:.5")
  .pan(sine.range(.35, .65).slow(12))

// コードの残響 - 確率で出現、ディレイに溶ける
$: note("<[c4,e4,b4] [a3,c4,g4] [d4,f4,c5] [g3,b3,f4]>*4?0.15")
  .sound("sawtooth")
  .gain(.06)
  .lpf(800)
  .delay(.4).delayfeedback(.55)
  .room(.3)

// --- Melody (ピアノ、少ない音数) ---

// メロディ - マイナーペンタ的、スペース重視
$: n("<[~ 4 ~ ~ 7 ~ ~ ~] [~ ~ 2 ~ ~ ~ 4 ~] [~ 5 ~ 7 ~ ~ ~ ~] [~ ~ 4 ~ 2 ~ ~ ~]>")
  .scale("C4:major:pentatonic")
  .sound("piano")
  .gain(.4)
  .lpf(2500)
  .room(.25)
  .delay(.2).delayfeedback(.3)

// メロディの影 - オクターブ下でうっすら
$: n("<[~ 4 ~ ~ 7 ~ ~ ~] [~ ~ 2 ~ ~ ~ 4 ~] [~ 5 ~ 7 ~ ~ ~ ~] [~ ~ 4 ~ 2 ~ ~ ~]>")
  .scale("C3:major:pentatonic")
  .sound("piano")
  .gain(.12)
  .lpf(1200)
  .room(.35)

// --- Texture (雨の日の空気感) ---

// Vinyl crackle
$: sound("crackle")
  .gain(perlin.range(.02, .05))
  .lpf(1800)
  .hpf(300)
  .pan(rand)

// 雨音的テクスチャ - ハイハットを加工して雨に
$: sound("hh*32")
  .bank("RolandTR808")
  .gain(perlin.range(.01, .04))
  .lpf(1200).hpf(600)
  .crush(6)
  .pan(rand)
  .room(.4)
