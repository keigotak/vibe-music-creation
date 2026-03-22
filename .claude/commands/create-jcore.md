# エモい J-core を制作

エモーショナルなJ-core（Japanese Hardcore）トラックをゼロから制作する。
高速BPM、8ビートドラム、レイヤーされたベースとSuperSaw、かわいいリードメロディが特徴。

## 引数
- `$ARGUMENTS` にキーとBPMを指定（省略可）
  - 例: `Am 175` → Aマイナー、175 BPM
  - デフォルト: Am, 175 BPM

## J-core の特徴
- **BPM**: 170-185（デフォルト175）
- **ドラム**: 8ビート基本、パンチのあるキック、シェイカーでにぎやかに
- **ベース**: 裏拍グルーヴ（ンベンベ）、サブ+Donkレイヤー、コードトーン追従
- **コード**: SuperSawレイヤー（芯+ワイド）、べたっとしないよう刻みも
- **メロディ**: スクエア波でかわいく、スパソで補強、オクターブ下で支え
- **つなぎ**: RiserとDownlifterで各パートを接続
- **構成**: Intro → Buildup → Drop → Breakdown → Buildup2 → Drop2 → Outro

## エモ J-core コード進行パターン（Amキー基準）
以下から選んで提案する:
- `Am → F → C → G` (vi-IV-I-V: 王道エモ)
- `Am → Em → F → C → G` (vi-iii-IV-I-V: 切ない展開)
- `Am → F → G → Em` (vi-IV-V-iii: J-core定番)
- `Fmaj7 → G → Am → Em` (IV7-V-vi-iii: エモい上昇感)
- `Am → Am/G → Fmaj7 → E7` (vi-vi/7-IV7-III7: クリシェ下降)

## 制作手順

### Phase 1: セットアップ
1. `ableton_connect` で接続確認
2. `set_tempo` でBPM設定（デフォルト175）
3. ユーザーにキーとコード進行パターンを提案・確認

### Phase 2: トラック作成（OSC直接、8トラック構成）
信頼性のためOSC直接でトラック作成する:

1. **Drums** (Track 0):
   - `osc_send` `/live/song/create_midi_track [0]`
   - `/live/track/set/name [0, "Drums"]`
   - `/live/track/load/device [0, "Drums/909 Core Kit.adg"]`

2. **Sub Bass** (Track 1):
   - `osc_send` `/live/song/create_midi_track [1]`
   - `/live/track/set/name [1, "Sub Bass"]`
   - `/live/track/load/device [1, "Sounds/Bass/Basic Sub Sine.adg"]`

3. **Donk Bass** (Track 2) — Donk/パンチのあるベース:
   - `osc_send` `/live/song/create_midi_track [2]`
   - `/live/track/set/name [2, "Donk Bass"]`
   - `/live/track/load/device [2, "Sounds/Bass/808.adg"]` など歪み系
   - `add_effect` で `overdrive` を追加（Donk感を出す）

4. **Chords Core** (Track 3) — 芯のあるSuperSaw:
   - `osc_send` `/live/song/create_midi_track [3]`
   - `/live/track/set/name [3, "Chords Core"]`
   - `/live/track/load/device [3, "Sounds/Synth Lead/Mega Saw.adg"]`

5. **Chords Wide** (Track 4) — ワイドなSuperSaw:
   - `osc_send` `/live/song/create_midi_track [4]`
   - `/live/track/set/name [4, "Chords Wide"]`
   - `/live/track/load/device [4, "Sounds/Pad/Celestial Strings.adg"]` などワイド系
   - `add_effect` で `reverb` を深めに

6. **Lead** (Track 5) — スクエア波メイン:
   - `osc_send` `/live/song/create_midi_track [5]`
   - `/live/track/set/name [5, "Lead"]`
   - `/live/track/load/device [5, "Sounds/Synth Misc/Square Lead.adg"]` などスクエア系

7. **Lead Sub** (Track 6) — オクターブ下の太い音:
   - `osc_send` `/live/song/create_midi_track [6]`
   - `/live/track/set/name [6, "Lead Sub"]`
   - `/live/track/load/device [6, "Sounds/Synth Lead/Superstring Lead.adg"]`

8. **FX** (Track 7) — Riser / Downlifter:
   - `osc_send` `/live/song/create_midi_track [7]`
   - `/live/track/set/name [7, "FX"]`
   - `/live/track/load/device [7, "Sounds/Effects/Hyper Riser.adg"]`

`get_project_table` でトラック作成を確認。

**音源が見つからない場合**: `search_samples` で代替を検索する。

### Phase 3: Dropシーン作成（Scene 0 = メインDrop）
最もエネルギーの高いセクションから作る（Making Music戦略: 広さ→深さ）。

#### 3a. ドラムパターン（8ビート基本）
909 Core Kit MIDIマッピング: Kick=36(C1), Clap=39(D#1), CHH=42(F#1), OHH=46(A#1)

**J-core 8ビートドラムの特徴**:
- **8ビート基本に忠実**: キックは4つ打ちor 8ビートパターン
- **キックはパンチのある音**: シンセに埋もれないよう存在感を出す
- **シェイカー/HH**: にぎやかな雰囲気を作る（16分刻み）
- **展開に合わせてキックを刻む**: Dropでは裏拍にもキック追加

2小節パターンを `osc_send` `/live/clip/add/notes` で打ち込む:
```
拍位置(beats): 0   0.5  1   1.5  2   2.5  3   3.5
Kick(36):      X              X    X              X
Clap(39):                X                   X
CHH(42):       x    x    x    x    x    x    x    x     ← 8分刻み
OHH(46):            x              x                     ← 裏拍アクセント
```
- Kickベロシティ: 110-120（パンチ重視、埋もれないように）
- HHベロシティ: オンビート80, オフビート60（シェイカー的にぎやかさ）
- Clapベロシティ: 100

**Dropでのキック刻み変形**:
```
Kick(36):      X    X    X    X    X    X    X    X     ← 8分全刻み
```

#### 3b. ベースパターン（裏拍ンベンベ）
**コードトーンを追従し、裏拍でグルーヴを出す**:
- メインリズム: 裏拍（0.5, 1.5, 2.5, 3.5）にノートを配置 = ンベンベ感
- Sub Bass: 低域（C2-C3）で裏拍ルート音
- Donk Bass: 同じタイミングで中低域（C3-C4）、ベロシティやや強め
- 2トラックを重ねることで厚みを出す
```
拍位置(beats): 0   0.5  1   1.5  2   2.5  3   3.5
Sub Bass:           X         X         X         X     ← 裏拍ルート
Donk Bass:          X         X         X         X     ← 同タイミング
```
- コードが変わるタイミングでベース音も変更

#### 3c. コードパターン（SuperSawレイヤー）
**2トラックでSuperSawをレイヤーして空間を埋める**:
- **Chords Core**: 芯のある音。各コード1小節、白玉 or 付点で鳴らす
- **Chords Wide**: ワイドな音。同じボイシングを重ねる（少しベロシティ控えめ）
- **べたっとしないよう刻みも検討**: 場合によっては8分刻みにして動きを出す
- セブンスボイシング推奨（トライアドだと薄い）

#### 3d. リードメロディ（かわいく + 支え）
**3層のリード構成**:
- **Lead（スクエア波）**: メインメロディ。かわいい音色で打ち込む
  - 繰り返しモチーフを入れる
  - アクセントの位置を意識して音を上下させる
  - 16分音符パッセージも部分的に
- **Lead Sub（太い音）**: メインメロディの**オクターブ下**を同じリズムで打ち込み、太さで支える
  - ベロシティはメインより控えめ（70-80）

**メロディの指針**:
- 順次進行と跳躍のバランス
- 繰り返しフレーズで覚えやすく
- アクセント（高い音/強い音）の配置を意識
- 最高音は1回だけ使ってクライマックス感

#### 3e. アルペジオ（必要に応じて）
- 手数が足りないと感じた場合のみ、`create_arpeggio` で補強
- **過剰に音を増やしすぎないよう注意**
- 16分音符のアルペジオが定番

### Phase 4: シーン展開（duplicate_clip活用）
Drop(Scene 0)をベースに他シーンを作成:

1. **Scene 0: Drop** — 既に作成済み（フルエネルギー、キック刻み）
2. **Scene 1: Intro** (8小節)
   - ドラムは軽め（HHのみ or キック控えめ）
   - コードだけ or リードだけ（エモいイントロ）
3. **Scene 2: Buildup** (8小節)
   - Dropからドラムを複製、スネアロール追加
   - **Riser**（FXトラック）を追加して盛り上げ
   - フィルタースイープ（up）
4. **Scene 3: Breakdown** (4-8小節)
   - ドラム抜き、コードとメロディだけ
   - エモさ最大化
   - **Downlifter**をFXトラックに追加してDropへの橋渡し
5. **Scene 4: Buildup2** (8小節)
   - Scene 2と同様 + 微妙な変化
   - Riser追加
6. **Scene 5: Drop2** (変形Drop)
   - メロディに変化を加える
   - キック刻みパターン変更
7. **Scene 6: Outro** (8小節)
   - 要素を徐々に減らす
   - Downlifterでフェードアウト感

**RiserとDownlifterで各パートをつなぐ**のがJ-coreの鍵。
シーン作成: `create_scene` で各シーン作成 → `duplicate_clip` でコピー → 不要部分を `delete_clip`

### Phase 5: ミキシング（EQで帯域を分ける）
J-core用のミックスバランス:

| トラック | Volume | サイドチェイン | エフェクト |
|---------|--------|-------------|-----------|
| Drums       | 0.9  | -    | EQ Three, Glue Compressor |
| Sub Bass    | 0.8  | 0.6  | Compressor, EQ（低域集中） |
| Donk Bass   | 0.7  | 0.6  | Overdrive, EQ（中低域） |
| Chords Core | 0.65 | 0.5  | EQ（300-500Hzカット） |
| Chords Wide | 0.55 | 0.5  | Reverb, EQ（300-500Hzカット） |
| Lead        | 0.7  | -    | EQ（800Hz付近カット）, Delay |
| Lead Sub    | 0.55 | -    | EQ（低中域に集中） |
| FX          | 0.5  | -    | - |

**EQのポイント**:
- **300-500Hz**: 渋滞しがちな帯域 → Chords, Bassで積極的にカット
- **800Hz付近**: リードが耳に刺さる場合 → Leadでカット
- **音がぶつからないように帯域を分ける**のが最重要
- 目立ちすぎている帯域、耳に刺さる帯域を音色・バランスに応じて臨機応変に抑える

- `set_track_volume` で各トラック設定
- `add_effect` でエフェクト追加
- `add_sidechain` でサイドチェイン設定（Bass系とChords系にKickから）
- EQ設定は `add_effect` で `eq_three` を追加後、`set_device_parameter` でFreq/Gain調整

### Phase 6: オートメーション（控えめに）
- **Buildup**: フィルタースイープ（`add_filter_sweep` direction=up）
- **Intro/Outro**: フィルターで暗く（`add_filter_sweep` direction=down）
- **Breakdown→Buildup2**: ボリュームフェード（`add_volume_fade` fade_type=in）

### Phase 7: 確認 & レビュー
1. `get_project_table` で構成表を表示
2. `fire_scene` で各シーンを試聴提案
3. **music-reviewer エージェントでセルフレビュー**を実行し、問題があれば修正
4. 調整の要望を聞く

## 注意点
- MCP高レベルツール (`create_drum_track` 等) はサイレント失敗するので、トラック作成はOSC直接
- クリップ8小節延長が必要な場合は `/extend-clip-bars` スキルを使う
- ドラムノート追加は1回20-25ノートのバッチで送信
- オートメーションは控えめに（ユーザー好み）
- 全シーン完成後、`/record-to-arrangement` で録音可能
- アルペジオは手数不足の時だけ追加（過剰注意）
