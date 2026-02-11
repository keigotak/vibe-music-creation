# Lo-Fi Project デバイス/パラメータマップ

## Track 0: Drums
| Device | Index | オートメーション対象パラメータ |
|---|---|---|
| Lo-Fi Tech Kit | D0 | P7: Room Rev (0-127スケール) |
| EQ Eight | D1 | — |
| Compressor | D2 | — |
| Saturator | D3 | P1: Drive |
| Redux | D4 | P9: Dry/Wet |

## Track 1: Bass
| Device | Index | オートメーション対象パラメータ |
|---|---|---|
| Shy LoFi Keys | D0 | P1: Filter Freq, P4: Space |
| EQ Eight | D1 | — |
| Saturator | D2 | P1: Drive |
| Compressor | D3 | — |

## Track 2: Chords
| Device | Index | オートメーション対象パラメータ |
|---|---|---|
| E-Piano Wurli | D0 | P4: Room (0-127スケール) |
| Auto Filter | D1 | P1: Frequency |
| Chorus-Ensemble | D2 | P18: Dry/Wet (※確認済み) |
| Reverb | D3 | P32: Dry/Wet |
| Vinyl Distortion | D4 | P13: Crackle Volume |

## Track 3: Melody
| Device | Index | オートメーション対象パラメータ |
|---|---|---|
| Basic Waves Lead | D0 | — |
| Auto Filter | D1 | P1: Frequency |
| Delay | D2 | P22: Dry/Wet, P21: Feedback |
| Reverb | D3 | P32: Dry/Wet |
| Erosion | D4 | P3: Amount |

## 注意事項
- E-Piano Wurli, Lo-Fi Tech Kit の一部パラメータは0-127スケール（他は0.0-1.0）
- EQ Eight, Compressor は通常オートメーション対象外（ミキシング段階で固定）
- Reverb の Dry/Wet は常に P32（パラメータ数が多いため後方）
