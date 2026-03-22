// Chill Float - 浮遊系チル
// Key: C major (Fmaj9→Em7→Dm9→Cmaj9 / IV-iii-ii-I)
// BPM: 75
setcpm(75/4)

// Drums - ゆるいビート、スウィング感
$: sound("bd ~ sd ~, [~ hh]*4")
  .bank("RolandTR808")
  .gain(".85 .4 .75 .4, .4 .25 .45 .25 .4 .25 .5 .3")
  .room(.08)
  .lpf(4000)

// Ghost hat - 空気感
$: sound("~ oh ~ ~")
  .bank("RolandTR808")
  .gain(".15")
  .lpf(2500)
  .room(.2)
  .delay(.3).delayfeedback(.4)

// Bass - 温かいトライアングル波
$: note("<f2 e2 d2 c2>")
  .sound("triangle")
  .lpf(280)
  .gain(.7)
  .adsr("0:.15:.7:.3")
  .room(.05)

// Chords - ジャジーなセブンス/ナインス、オープンボイシング
$: note("<[f3,a3,c4,e4,g4] [e3,g3,b3,d4] [d3,f3,a3,c4,e4] [c3,e3,g3,b3,d4]>")
  .sound("sawtooth")
  .lpf(sine.range(500, 1400).slow(16))
  .gain(.28)
  .room(.4).roomsize(.7)
  .adsr(".01:.3:.35:.5")
  .pan(sine.range(.35, .65).slow(12))

// Melody - ペンタトニック、スペース多め
$: n("<[4 ~ 7 ~ ~ 4 2 ~] [~ 2 4 ~ 7 ~ ~ ~] [0 ~ 4 2 ~ ~ 0 ~] [~ 7 ~ 4 2 ~ ~ ~]>")
  .scale("C4:major:pentatonic")
  .sound("piano")
  .gain(.4)
  .room(.35)
  .delay(.3).delaytime("1/3").delayfeedback(.45)
  .lpf(2200)

// Texture - パーリンノイズでゆらぐパッド
$: note("<[c4,g4] [b3,e4]>/2")
  .sound("sine")
  .gain(perlin.range(.08, .2))
  .room(3).roomsize(.85)
  .attack(2).release(3)
  .lpf(sine.range(400, 1000).slow(20))
  .pan(sine.slow(10))
