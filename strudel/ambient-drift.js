// Ambient Drift - 漂う意識
// Key: C major, BPM: 60
// Cmaj7 → Am7 の2コードで浮遊、長い周期の変化
// strudel.cc にペーストして Ctrl+Enter で再生

setcpm(60/4)

// --- Pad (深いリバーブ、長いアタック) ---

// メインパッド - 2小節で1コード
$: note("<[c3,e3,g3,b3] [a2,c3,e3,g3]>/2")
  .sound("sawtooth")
  .lpf(sine.range(300, 1200).slow(16))
  .gain(.25)
  .room(4)
  .roomsize(.9)
  .attack(3).release(5)
  .pan(sine.range(.3, .7).slow(20))

// パッドのハーモニクス - 高域でキラキラ
$: note("<[g4,b4,e5] [e4,g4,c5]>/2")
  .sound("triangle")
  .gain(perlin.range(.05, .15))
  .room(5)
  .roomsize(.95)
  .attack(2).release(4)
  .lpf(sine.range(600, 2000).slow(24))
  .delay(.5).delayfeedback(.6)

// --- Texture (グラニュラー的) ---

// ベルの粒 - ランダムに散りばめ
$: n("<0 ~ 4 ~ ~ 7 ~ ~ ~ 2 ~ ~ 5 ~ ~ ~>")
  .scale("C5:major:pentatonic")
  .sound("glockenspiel")
  .gain(perlin.range(.05, .2))
  .room(3)
  .delay(.45).delayfeedback(.55)
  .lpf(3000)
  .pan(rand)
  .degradeBy(sine.range(0, .5).slow(16))

// 高音のきらめき - 非常に稀に
$: n("0 4 7 11")
  .scale("C6:major")
  .sound("triangle")
  .gain(.08)
  .room(5)
  .delay(.6).delayfeedback(.65)
  .lpf(4000)
  .pan(rand)
  .degradeBy(.7)

// --- Sub Drone (深い低音の持続) ---

$: note("<c1 a0>/4")
  .sound("sine")
  .gain(sine.range(.1, .25).slow(16))
  .attack(4).release(6)
  .lpf(150)

// オクターブ上のドローン
$: note("<c2 a1>/4")
  .sound("sine")
  .gain(sine.range(.03, .1).slow(12))
  .attack(3).release(5)
  .lpf(300)
  .room(3)

// --- Melody (微かなフレーズ、大部分は沈黙) ---

$: n("<~ ~ ~ 4 ~ ~ ~ ~ ~ ~ 7 ~ ~ ~ ~ ~>")
  .scale("C4:major:pentatonic")
  .sound("piano")
  .gain(.2)
  .room(4)
  .delay(.5).delayfeedback(.5)
  .lpf(1800)
  .pan(sine.range(.3, .7).slow(6))
  .degradeBy(.3)
