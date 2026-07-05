// Luv Sic Pt.2 (Nujabes × Shing02) インスパイア
// Key: F major / Dm (関係調), BPM: 88
// 進行(8小節): | Fmaj9 | Fmaj9 | Em7b5 | A7 | Dm9 | Dm9 | Gm7 | C7 |
//   → ii-V-i (Em7b5 A7 → Dm) と ii-V-I (Gm7 C7 → Fmaj) のダブル解決
// 展開: 16サイクルで一巡
// strudel.cc にペーストして Ctrl+Enter

setcpm(88/4)

// --- Drums (laid-back boom bap) ---

// Kick - 1, 3.5拍中心、セクションで変化
$: sound("<[bd ~ ~ ~ ~ ~ bd ~] [bd ~ ~ ~ ~ bd ~ ~] [bd ~ ~ bd ~ ~ bd ~] [bd ~ ~ ~ ~ ~ bd bd]>")
  .bank("RolandTR909")
  .gain(.82)
  .lpf(2800)
  .room(.05)

// Snare - 2, 4拍、ちょっと遅らせてレイドバック
$: sound("~ ~ sd ~ ~ ~ sd ~")
  .bank("RolandTR909")
  .gain(.7)
  .lpf(3200)
  .nudge(.018)
  .lastOf(8, x => x.struct("~ ~ sd ~ ~ sd ~ sd").gain(".7 .4 .5"))

// Hat - 16分、アクセント付き
$: sound("hh*8")
  .bank("RolandTR909")
  .gain(".32 .15 .25 .15 .28 .15 .25 .12")
  .lpf(sine.range(2800, 4200).slow(16))
  .pan(sine.range(.42, .58).slow(8))

// Open hat - たまに抜け感
$: sound("~ ~ ~ oh ~ ~ ~ ~")
  .bank("RolandTR909")
  .gain(.25)
  .lpf(3500)
  .sometimesBy(.6, x => x.gain(0))

// --- Bass (8小節通しのルート+アプローチ) ---
//  F | F | E | A | D | D | G | C

$: note(`<
  [f2 ~ ~ c3 ~ a2 f2 ~]
  [f2 ~ a2 ~ c3 ~ e3 ~]
  [e2 ~ g2 ~ bb2 ~ d3 ~]
  [a2 ~ c#3 ~ e3 ~ g3 ~]
  [d2 ~ ~ a2 ~ f2 d2 ~]
  [d2 ~ f2 ~ a2 ~ c3 ~]
  [g2 ~ bb2 ~ d3 ~ f3 ~]
  [c3 ~ e3 ~ g3 ~ bb3 ~]
>`)
  .sound("sawtooth")
  .lpf(420)
  .lpq(3)
  .gain(.62)
  .adsr(".005:.12:.55:.15")
  .crush(13)

// --- Rhodes chords (8小節) ---

// メインコード (ルート+テンション、ワイドボイシング)
$: note(`<
  [f3,a3,c4,e4,g4]
  [f3,a3,c4,e4,g4]
  [e3,g3,bb3,d4]
  [a3,c#4,e4,g4]
  [d3,f3,a3,c4,e4]
  [d3,f3,a3,c4,e4]
  [g3,bb3,d4,f4,a4]
  [c3,e3,g3,bb3,d4]
>`)
  .sound("sawtooth")
  .lpf(sine.range(900, 1600).slow(16))
  .gain(.24)
  .room(.22)
  .adsr(".02:.3:.4:.5")
  .pan(sine.range(.35, .65).slow(10))
  .crush(12)

// コードのエコー (高域で広がり)
$: note(`<
  [a4,c5,e5]
  [c5,e5,g5]
  [bb4,d5,g5]
  [c#5,e5,g5]
  [f4,a4,c5,e5]
  [a4,c5,e5]
  [bb4,d5,f5]
  [e5,g5,bb5]
>*2?0.3`)
  .sound("sawtooth")
  .gain(.08)
  .lpf(1200)
  .delay(.4).delaytime(.375).delayfeedback(.45)
  .room(.3)
  .crush(11)

// --- Melodic Lead (各コードトーンに着地する切ないメロ) ---
// F3:major の scale degree: 0=F3, 1=G3, 2=A3, 3=Bb3, 4=C4, 5=D4, 6=E4, 7=F4, 8=G4, 9=A4, 10=Bb4, 11=C5

// メインメロディ (note で直接書いて各コードに対応)
$: note(`<
  [c5 e5 f5 a5 ~ g5 e5 c5]
  [e5 f5 ~ a5 g5 e5 ~ ~]
  [bb4 d5 bb4 g4 ~ f4 e4 ~]
  [c#5 e5 g5 e5 ~ c#5 ~ ~]
  [a4 c5 d5 ~ f5 e5 d5 a4]
  [c5 ~ a4 d5 ~ ~ f5 ~]
  [bb4 d5 f5 d5 ~ c5 bb4 ~]
  [bb4 ~ g4 ~ e4 ~ c4 ~]
>`)
  .sound("piano")
  .gain(.45)
  .room(.35)
  .delay(.28).delaytime(.375).delayfeedback(.4)
  .lpf(2600)
  .pan(sine.range(.45, .55).slow(8))
  .velocity(".85 .6 .7 .9 ~ .65 .75 .55")

// メロディのゴースト (1オクターブ下、シンプルに重ねる)
$: note(`<
  [c4 e4 f4 a4 ~ g4 e4 c4]
  [e4 f4 ~ a4 g4 e4 ~ ~]
  [bb3 d4 bb3 g3 ~ f3 e3 ~]
  [c#4 e4 g4 e4 ~ c#4 ~ ~]
  [a3 c4 d4 ~ f4 e4 d4 a3]
  [c4 ~ a3 d4 ~ ~ f4 ~]
  [bb3 d4 f4 d4 ~ c4 bb3 ~]
  [bb3 ~ g3 ~ e3 ~ c3 ~]
>`)
  .sound("piano")
  .gain(.14)
  .room(.4)
  .delay(.3).delayfeedback(.35)
  .lpf(1400)
  .firstOf(2, x => x.gain(0))
  .pan(.7)

// --- Counter melody (低めのエレピ、合いの手) ---

$: note("<[~ ~ ~ c4] [~ e4 ~ ~] [~ ~ d4 ~] [~ ~ ~ f4]>")
  .sound("piano")
  .gain(.22)
  .room(.3)
  .delay(.2).delayfeedback(.3)
  .lpf(1800)
  .pan(.3)
  .firstOf(8, x => x.gain(.32))

// --- Texture ---

// Vinyl crackle
$: sound("crackle")
  .gain(perlin.range(.025, .06))
  .lpf(1600)
  .hpf(500)
  .pan(rand)

// テープの揺らぎ (低域のうねり)
$: note("f1")
  .sound("sine")
  .gain(sine.range(.0, .05).slow(12))
  .lpf(70)

// 遠くのリバーブ(サイン波の空気)
$: note("<c6 ~ ~ ~ ~ ~ ~ ~>")
  .sound("sine")
  .gain(.04)
  .room(.8).roomsize(.9)
  .delay(.5).delaytime(.75).delayfeedback(.5)
  .pan(sine.range(.2, .8).slow(16))
  .firstOf(4, x => x.gain(.07))
