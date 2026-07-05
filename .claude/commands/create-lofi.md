# Lo-Fi Hip Hop を制作

温かみのあるLo-Fi Hip Hopトラックをゼロから制作する。
ジャズ的セブンスコード、ゆったりドラム、テープ感のあるサウンドが特徴。

## 引数
- `$ARGUMENTS` にキーとBPMを指定（省略可）
  - 例: `Dm 78` → Dマイナー、78 BPM
  - デフォルト: Dm, 78 BPM

## Lo-Fi Hip Hop の特徴
- **BPM**: 70-90（デフォルト78）
- **ドラム**: スウィング感、ゴーストノート、レイドバックしたスネア
- **ベース**: シンプルなルート中心、ウッドベース風 or サブベース
- **コード**: エレピ/ピアノでセブンス/ナインス、オープンボイシング
- **メロディ**: 少ない音数、マイナーペンタ/ブルーススケール、スペース重視
- **テクスチャ**: ビニールクラックル、テープヒス、ローパスフィルター
- **構成**: Intro → Main A → Main B → Bridge → Main A' → Outro（穏やかな波）

## Lo-Fi コード進行パターン（CLAUDE.md音楽理論より）
以下から選んで提案する:
- `Dm9 → G13 → Cmaj9` (ii-V-I: ジャズ基本)
- `Cmaj7 → Am7 → Dm7 → G7` (I-vi-ii-V: スタンダード)
- `Fmaj7 → Em7 → Am7 → Dm7` (IV-iii-vi-ii: 下降系)
- `Fmaj7 → E7 → Am7` (IV-III7-vi: Just the Two of Us風)
- `Cmaj7 → Fm7 → Cmaj7 → G7` (I-IVm-I-V: SDm活用)
- `Am7 → Dm7 → Gmaj7 → Cmaj7` (vi-ii-V-I: マイナー始まり)

## 制作手順

### Phase 1: セットアップ
1. `ableton_connect` で接続確認
2. `set_tempo` でBPM設定（デフォルト78）
3. ユーザーにキーとコード進行パターンを提案・確認

### Phase 2: トラック作成（OSC直接、5トラック構成）
信頼性のためOSC直接でトラック作成する:

1. **Drums** (Track 0):
   - `osc_send` `/live/song/create_midi_track [0]`
   - `/live/track/set/name [0, "Drums"]`
   - `/live/track/load/device [0, "Drums/Kit-Lo-Fi Tech.adg"]`
   - ※見つからない場合: `search_samples` で "lo-fi" "kit" を検索

2. **Bass** (Track 1):
   - `osc_send` `/live/song/create_midi_track [1]`
   - `/live/track/set/name [1, "Bass"]`
   - `/live/track/load/device [1, "Sounds/Keys/Shy LoFi Keys.adg"]`
   - ※ウッドベース風のサウンドが見つかればそちらも可

3. **Chords** (Track 2):
   - `osc_send` `/live/song/create_midi_track [2]`
   - `/live/track/set/name [2, "Chords"]`
   - `/live/track/load/device [2, "Sounds/Keys/E-Piano Wurli.adg"]`
   - エレピ系のサウンド（Lo-Fiの主役）

4. **Melody** (Track 3):
   - `osc_send` `/live/song/create_midi_track [3]`
   - `/live/track/set/name [3, "Melody"]`
   - `/live/track/load/device [3, "Sounds/Keys/Piano Grandeur.adg"]`
   - ※ピアノ系 or ベル系、シンプルな音色

5. **Texture** (Track 4):
   - `osc_send` `/live/song/create_midi_track [4]`
   - `/live/track/set/name [4, "Texture"]`
   - テクスチャ用（Vinyl Distortion等をエフェクトで追加）

`get_project_table` でトラック作成を確認。

**音源が見つからない場合**: `search_samples` で代替を検索する。

### Phase 3: Main Aシーン作成（Scene 0 = メインループ）
Making Music戦略: まずメインのループを完成させる。

#### 3a. ドラムパターン（スウィング感重視）
Lo-Fi Tech Kit MIDIマッピング: Kick=36(C1), Clap/Snare=38-39, CHH=42(F#1), OHH=46(A#1)

**Lo-Fi ドラムの特徴**:
- **テンポ感**: ゆったり、急がない
- **キック**: 1拍目と3拍目の裏（レイドバック）
- **スネア/クラップ**: 2拍目と4拍目（少し遅らせる = レイドバック）
- **ハイハット**: 8分or16分、ベロシティに強弱をつけてスウィング
- **ゴーストノート**: スネアの極小ベロシティノートを随所に
- **オープンHH**: 裏拍にアクセント的に

2小節パターンを `osc_send` `/live/clip/add/notes` で打ち込む:
```
拍位置(beats): 0   0.5  1   1.5  2   2.5  3   3.5
Kick(36):      X                       X
Snare(38):                 X                       X
CHH(42):       x    x    x    x    x    x    x    x   ← 8分
OHH(46):            x                       x         ← 裏拍
```
- Kickベロシティ: 90-100
- Snareベロシティ: 80-90（レイドバック: start_timeを+0.05）
- CHHベロシティ: オンビート70, オフビート45-55（ランダム感）
- OHHベロシティ: 50-60
- **ゴーストスネア**: ベロシティ20-30で裏拍にランダム配置

#### 3b. ベースライン（シンプル、ルート中心）
- コードのルート音を中心に、シンプルなパターン
- 音数少なめ（1小節に2-4音）
- たまにオクターブや5度を使って動きを出す
- レンジ: C2-C3（低すぎず高すぎず）
```
拍位置(beats): 0   0.5  1   1.5  2   2.5  3   3.5
Bass:          X               X              X
```

#### 3c. コードパターン（エレピ、セブンス必須）
**Lo-Fiコードの鉄則**:
- **セブンス(7th)/ナインス(9th)が基本**（トライアドは使わない）
- **オープンボイシング**: 音を広げて配置（密集しない）
- **5th省略可**: 3rdと7thがコードの個性を決める
- **リズム**: 白玉（全音符/2分音符）or ゆったりした刻み
- **ベロシティ**: 60-80（強すぎない）
- **Wurliエレピの温かさ**を活かす

**打ち込む前にボイスリーディングを設計する**:
進行の全コードのボイシングを書き出し、隣接コード間で共通音の保持・最小移動（各声部の移動は2度以内が理想）を確認してから打ち込む。
例（Dm9 → G13 → Cmaj9）:
```
Dm9:   D2 | F3 A3 C4 E4
G13:   G2 | F3 B3 C4 E4   ← F,C,E保持、A→Bのみ移動
Cmaj9: C2 | E3 B3 D4 G4   ← Bを保持、他は最小移動
```
- G2以下では3度音程を重ねない（濁りの原因）

#### 3d. メロディ（少ない音数、スペース重視）
**先にモチーフを決める**: 2-4音の短いモチーフを1つ設計し、それを「反復 → 移調（コードに合わせて） → リズム変形」で展開する。毎小節バラバラのフレーズは作らない。

**Lo-Fiメロディの原則**:
- **音数は少なく**: 1小節に3-5音程度
- **休符を恐れない**: スペースが「Lo-Fi感」を作る
- **マイナーペンタ/ブルーススケール**ベース
- **コードトーン着地**: フレーズの終わりは7thや9thに
- **最高音は1回だけ**: ループ内のクライマックスとして強拍に置く
- **跳躍（4度以上）の後は反対方向に順次進行**
- **レンジ**: C4-C5（高すぎない）

#### 3e. テクスチャ（Lo-Fi感の演出）
- `add_effect` でTrack 4に `vinyl_distortion` を追加
- Crackle Volumeを控えめに設定
- 必要なら `auto_filter` でローパス

### Phase 4: シーン展開（穏やかな波）
Main A(Scene 0)をベースに他シーンを作成:

1. **Scene 0: Main A** — 既に作成済み（メインループ）
2. **Scene 1: Intro** (4-8小節)
   - コードのみ or コード+テクスチャ
   - フィルターで暗めに
   - 要素を絞って「始まり」感
3. **Scene 2: Main B** (変形メイン)
   - Main Aからドラムパターンを微変形
   - メロディに変化（Mutation of Clones）
   - ベースにオクターブ変化を追加
4. **Scene 3: Bridge** (4-8小節)
   - ドラム抜き or キックのみ
   - コードボイシングを変える（転回形）
   - 空間エフェクト増量
5. **Scene 4: Main A'** (メイン回帰)
   - Main Aに微妙な変化を加えた回帰
   - 安心感のあるループ回帰
6. **Scene 5: Outro** (4-8小節)
   - 要素を徐々に抜いていく
   - フィルターダウン
   - フェードアウト感

シーン作成: `create_scene` → `duplicate_clip` でコピー → 変形 → 不要部分を `delete_clip`

### Phase 5: エフェクトチェーン & ミキシング

| トラック | Volume | エフェクト |
|---------|--------|-----------|
| Drums   | 0.85   | EQ Eight, Compressor, Saturator(控えめ), Redux(控えめ) |
| Bass    | 0.75   | EQ Eight(低域集中), Saturator, Compressor |
| Chords  | 0.65   | Auto Filter(LP), Chorus-Ensemble, Reverb, Vinyl Distortion |
| Melody  | 0.55   | Auto Filter(LP), Delay, Reverb, Erosion(控えめ) |
| Texture | 0.3    | Vinyl Distortion(Crackle中心) |

**Lo-Fiミキシングのポイント**:
- **全体的にローパス気味**: ハイが出すぎるとLo-Fi感が消える
- **サイドチェインは控えめ or なし**: EDMほど強くかけない
- **Saturator**: テープ感の再現、控えめに
- **Reverb**: 部屋鳴り感、Dry/Wet 20-35%
- **Chorus-Ensemble**: エレピの厚み（Dry/Wet控えめ）

### Phase 6: オートメーション（控えめに）
- **Intro→Main A**: Auto Filter Freq を徐々に開く（`add_filter_sweep` direction=up）
- **Bridge**: Reverb Dry/Wetを深めに（`add_automation`）
- **Outro**: Auto Filter Freq を徐々に閉じる（`add_filter_sweep` direction=down）
- **全体**: Chordsの Auto Filter に緩やかなLFO的変化

**変化幅は控えめに**（ユーザー好み）

### Phase 7: 確認 & セルフレビュー
1. `get_project_table` で構成表を表示
2. **music-reviewer エージェントでセルフレビュー**:
   - プロンプトに「意図したコード進行（度数+コード名）」「各トラックの役割」「`get_full_project_analysis` の出力」を含めて起動
   - 🔴 Critical は必ず修正し、修正後に再レビュー（🔴が無くなるまで）
   - 🟡 Improvement は費用対効果を判断して適用
3. `fire_scene` で各シーンを試聴提案
4. 調整の要望を聞く

## 注意点
- MCP高レベルツール (`create_drum_track` 等) はサイレント失敗するので、トラック作成はOSC直接
- クリップ延長が必要な場合は `/extend-clip-bars` スキルを使う
- ドラムノート追加は1回20-25ノートのバッチで送信
- **オートメーションは控えめに**（ユーザー好み: フィルタかかりすぎ注意）
- 全シーン完成後、`/record-to-arrangement` で録音可能
- docs/device-params.md のパラメータマップを参照
- Lo-Fiは「引き算の美学」: 迷ったら足さずに引く
