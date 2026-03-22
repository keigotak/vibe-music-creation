// J-core Kawaii - ネオン渋谷サイバーパンク
// Key: A minor (Am → F → C → G), BPM: 175
// エモいSuperSaw + かわいいスクエアリード + サイバー声ネタ
// strudel.cc にペーストして Ctrl+Enter で再生

setcpm(175/4)

// 声ネタ読み込み（Shabda/freesound経由、初回ロードあり）
samples('shabda/speech:neon,cyber,tokyo,future,digital,electric,light,night,shibuya,kawaii')

// --- Drums (909、高速8ビート) ---

// Kick - 8ビート基本、4サイクル目で刻む
$: sound("<[bd bd sd bd bd bd sd bd] [bd bd sd bd bd bd sd bd] [bd bd sd bd bd bd sd bd] [bd bd sd bd bd sd bd bd]>")
  .bank("RolandTR909")
  .gain("<[1 .85 1 .85 .9 .85 1 .85] [1 .85 1 .85 .9 .85 1 .85] [1 .85 1 .85 .9 .85 1 .85] [1 .85 1 .9 .85 1 .9 .85]>")

// HH - 16分刻み、にぎやかに
$: sound("hh*16")
  .bank("RolandTR909")
  .gain(".6 .25 .45 .3 .55 .25 .5 .3 .6 .25 .45 .3 .55 .25 .5 .35")
  .lpf(sine.range(4000, 7000).slow(8))
  .sometimesBy(.1, x => x.speed("1.5").gain(.2))

// OH - アクセント
$: sound("~ ~ ~ ~ ~ ~ ~ oh")
  .bank("RolandTR909")
  .gain(.5)
  .lpf(5000)

// Clap - フィル的に
$: sound("~ ~ ~ ~ ~ ~ ~ ~")
  .bank("RolandTR909")
  .lastOf(4, x => x.struct("~ ~ ~ ~ cp cp cp cp").gain(".6 .7 .8 .9"))

// --- Bass (裏拍ンベンベ、2レイヤー) ---

// Sub Bass - 裏拍ルート
$: note("<[~ a1 ~ a1 ~ a1 ~ a1] [~ f1 ~ f1 ~ f1 ~ f1] [~ c2 ~ c2 ~ c2 ~ c2] [~ g1 ~ g1 ~ g1 ~ g1]>")
  .sound("triangle")
  .lpf(200)
  .gain(.8)

// Donk Bass - 裏拍、オクターブ上
$: note("<[~ a2 ~ a2 ~ a2 ~ a2] [~ f2 ~ f2 ~ f2 ~ f2] [~ c3 ~ c3 ~ c3 ~ c3] [~ g2 ~ g2 ~ g2 ~ g2]>")
  .sound("sawtooth")
  .lpf(600)
  .gain(.45)
  .distort(".3:.3")
  .adsr("0:.05:.4:.05")

// --- SuperSaw Chords (2レイヤー) ---

// Core - 芯のある音
$: note("<[a3,c4,e4,g4] [f3,a3,c4,e4] [c3,e3,g3,b3] [g3,b3,d4,f4]>")
  .sound("sawtooth")
  .gain(.4)
  .lpf(2500)
  .adsr(".01:.05:.7:.1")
  .room(.15)

// Wide - ワイドで包む
$: note("<[a3,c4,e4,g4] [f3,a3,c4,e4] [c3,e3,g3,b3] [g3,b3,d4,f4]>")
  .sound("sawtooth")
  .gain(.25)
  .lpf(2000)
  .jux(rev)
  .room(.3)
  .adsr(".01:.1:.5:.2")

// 刻みコード - 8分で動きを出す（3サイクルに1回）
$: note("<[a3,c4,e4] [f3,a3,c4] [c3,e3,g3] [g3,b3,d4]>*8")
  .sound("square")
  .gain(.15)
  .lpf(1500)
  .adsr(".005:.03:.3:.05")
  .firstOf(3, x => x.gain(.25).lpf(2500))

// --- Lead (かわいいスクエア波) ---

// メインメロディ
$: n("<[0 2 4 ~ 7 ~ 4 2] [0 ~ 2 4 ~ 7 ~ 9] [7 ~ 4 2 0 ~ 2 ~] [4 2 0 ~ ~ 7 4 ~]>")
  .scale("A4:minor")
  .sound("square")
  .lpf(3000)
  .gain(.45)
  .delay(.12).delayfeedback(.2)
  .adsr(".01:.1:.5:.1")

// メロディ影 - オクターブ下で支え
$: n("<[0 2 4 ~ 7 ~ 4 2] [0 ~ 2 4 ~ 7 ~ 9] [7 ~ 4 2 0 ~ 2 ~] [4 2 0 ~ ~ 7 4 ~]>")
  .scale("A3:minor")
  .sound("sawtooth")
  .lpf(1500)
  .gain(.2)
  .adsr(".01:.1:.5:.1")

// ハモリ - 3度上、確率で出現
$: n("<[0 2 4 ~ 7 ~ 4 2] [0 ~ 2 4 ~ 7 ~ 9] [7 ~ 4 2 0 ~ 2 ~] [4 2 0 ~ ~ 7 4 ~]>".add(2))
  .scale("A5:minor")
  .sound("square")
  .lpf(4000)
  .gain(.15)
  .delay(.15)
  .degradeBy(.5)

// --- Voice Samples (サイバーパンク渋谷) ---

// メイン声ネタ - 8サイクルに1回、刻んでグリッチ
$: s("<~ ~ ~ ~ ~ ~ ~ neon>")
  .chop(16)
  .speed("<1 1.2 -1 0.8 1.5 -0.7 1.3 0.9>")
  .gain(.3)
  .lpf(2500)
  .hpf(300)
  .crush(8)
  .delay(.15).delayfeedback(.3)
  .pan(rand)

// 短い声ネタ - サイバー/ネオン/デジタルをランダムドロップ
$: s("<~ cyber ~ ~ ~ digital ~ ~>")
  .begin(.1).end(.5)
  .gain(.22)
  .lpf(3000)
  .crush(9)
  .speed("<1 1.1 -1 0.9>")
  .room(.15)
  .delay(.1).delayfeedback(.2)

// kawaii声ネタ - 稀に出現、ピッチ上げてかわいく
$: s("<~ ~ ~ ~ kawaii ~ ~ ~>")
  .begin(.05).end(.4)
  .gain(.18)
  .speed("1.3")
  .lpf(4000)
  .delay(.2).delayfeedback(.35)
  .crush(10)
  .pan(sine.range(.3, .7).slow(4))

// グリッチボイス - 声ネタを極端に刻んでテクスチャ化
$: s("<~ ~ ~ ~ ~ ~ electric ~>")
  .chop(32)
  .speed("<2 -1.5 1.8 -2 1.2 -1.8 2.2 -1>")
  .gain(.12)
  .lpf(2000)
  .crush(6)
  .pan(rand)
  .delay(.2).delayfeedback(.4)
  .firstOf(4, x => x.gain(.2).speed("<3 -2 2.5 -3>"))

// "SHIBUYA" 的なライザー声 - 16サイクルに1回、ビルドアップ前に
$: s("<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ future>")
  .chop(8)
  .speed(saw.range(0.5, 2.5))
  .gain(.25)
  .lpf(saw.range(500, 5000))
  .crush(7)
  .room(.2)
  .pan(sine)
