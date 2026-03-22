// Boom Bap - Gang Starr / Guru風 (渋めローファイ・展開あり)
// Key: Dm, BPM: 88
// Dm9 → Am7 → Bbmaj7 → A7
// 16サイクル（16小節）で一巡する展開構造
// strudel.cc にペーストして Ctrl+Enter で再生

setcpm(88/4)

// --- Drums (SP-1200 = Premierの音、デフォルトで読み込み済み) ---

// Kick - 4サイクルごとにパターン変化
$: sound("<[bd ~ ~ ~ bd ~ ~ ~] [bd ~ ~ bd ~ ~ bd ~] [bd ~ ~ ~ bd ~ ~ ~] [bd ~ bd ~ ~ ~ bd ~]>")
  .bank("EmuSP12")
  .gain("<[.9 ~ ~ ~ .75 ~ ~ ~] [.9 ~ ~ .6 ~ ~ .8 ~] [.9 ~ ~ ~ .75 ~ ~ ~] [.85 ~ .6 ~ ~ ~ .8 ~]>")
  .lpf(3500)
  .room(.03)

// Snare - SP-1200のザラついたスネア、4サイクル目にフィル
$: sound("~ ~ ~ ~ sd ~ ~ ~")
  .bank("EmuSP12")
  .gain(.85)
  .sometimesBy(.15, x => x.ply(2).gain(.4))
  .lastOf(4, x => x.struct("~ ~ ~ ~ sd ~ sd sd").gain(".85 ~ .4 .85"))
  .lpf(4000)

// HH - ユークリッドリズムで有機的に
$: sound("hh(11,16)")
  .bank("EmuSP12")
  .gain(".35 .18 .4 .18 .35 .18 .42 .2")
  .sometimesBy(.2, x => x.speed("1.5").gain(.15))
  .lpf(sine.range(2500, 4500).slow(16))

// Ghost OH - ランダムに出現、左右に散る
$: sound("oh(3,8,<0 1 2 3>)")
  .bank("EmuSP12")
  .gain(perlin.range(.08, .2))
  .lpf(2500)
  .pan(rand)

// --- Bass (JVベース = 90s定番) ---

// ファンキーなベースライン、コード追従
$: note("<[d2 ~ ~ d2 ~ ~ d2 ~] [a1 ~ ~ a1 ~ ~ ~ c2] [bb1 ~ ~ ~ bb1 ~ a1 ~] [a1 ~ ~ ~ ~ ~ a1 ~]>")
  .s("jvbass:6")
  .gain(.65)
  .lpf(500)
  .crush(12)
  .firstOf(4, x => x.ply(2).gain(.45).lpf(350))

// --- Keys ---

// エレピ - fmpianoでウーリッツァー的な温かみ
$: note("<[d4,f4,a4,c5] [a3,c4,e4,g4] [bb3,d4,f4,a4] [a3,c#4,e4,g4]>")
  .s("fmpiano")
  .gain(.3)
  .lpf(sine.range(800, 1800).slow(16))
  .room(.12)
  .pan(sine.range(.35, .65).slow(12))
  .chunk(4, x => x.gain(.38).lpf(2500))

// エレピ ゴースト - 残像が確率で出現してディレイに溶ける
$: note("<[d4,f4,a4] [a3,c4,e4] [bb3,d4,f4] [a3,c#4,e4]>*4?0.2")
  .s("fmpiano")
  .gain(.08)
  .lpf(900)
  .delay(.35).delayfeedback(.5)
  .crush(10)

// ビブラフォン - ジャズの空気感、ときどき鳴る
$: n("<0 ~ 2 ~ ~ 4 ~ ~>")
  .s("vibraphone_soft")
  .gain(.15)
  .room(.25)
  .lpf(2000)
  .delay(.2).delayfeedback(.3)
  .pan(sine.range(.3, .7).slow(6))

// --- Stab (実サンプル) ---

// スタブサンプル - pick で4種のパターンをローテーション
$: s("<0 1 2 3>".pick([
    "~ ~ ~ ~ ~ ~ ~ ~",
    "~ ~ stab:5 ~ ~ ~ ~ ~",
    "~ ~ ~ ~ ~ stab:8 ~ ~",
    "~ ~ stab:5 ~ ~ ~ stab:12 ~"
  ]))
  .gain(.2)
  .lpf(2200)
  .delay(.15).delayfeedback(.35)
  .room(.15)
  .crush(10)

// --- Vocal Chops ---

// スピーチサンプル読み込み
samples('shabda/speech:represent,check_it_out,word_up,peace')

// 声ネタ - 8サイクルに1回、刻んでダスティに
$: s("<~ ~ ~ ~ ~ ~ ~ represent>")
  .chop(8)
  .speed("<1 0.8 -1 1.2>")
  .gain(.25)
  .lpf(1500)
  .crush(7)
  .delay(.2).delayfeedback(.3)
  .pan(rand)

// 短い声ネタ - たまにドロップ
$: s("<~ check_it_out ~ ~ ~ ~ word_up ~>")
  .begin(.1).end(.6)
  .gain(.15)
  .lpf(2000)
  .crush(8)
  .room(.15)
  .speed("<1 0.9 1.1 -1>")

// --- Texture ---

// Vinyl crackle - crackleシンセでリアルなレコードノイズ
$: s("crackle")
  .gain(perlin.range(.02, .06))
  .lpf(1500)
  .hpf(400)
  .pan(rand)

// Tape wobble - 超低音のうねり、8サイクル周期
$: note("d1")
  .sound("sine")
  .gain(sine.range(.0, .08).slow(8))
  .lpf(80)
