# StopShorts 習慣化コーチング機能 設計書 v3.0

> **このドキュメントについて**
> ショート動画の視聴習慣を断ち切るための「習慣化コーチング機能」と「統計機能」の設計書です。
> 行動科学・心理学の研究に基づいた設計と、詳細な実装計画を記述します。

---

## 目次

1. [概要](#概要)
2. [心理学的基盤](#心理学的基盤)
3. [習慣形成の核心手法](#習慣形成の核心手法)
4. [コア機能設計](#コア機能設計)
5. [統計・分析機能](#統計分析機能)
6. [ゲーミフィケーション](#ゲーミフィケーション)
7. [技術的実装要件](#技術的実装要件)
8. [詳細実装計画](#詳細実装計画)
9. [課金モデル](#課金モデル)
10. [実装ロードマップ](#実装ロードマップ)

---

## 概要

### 目的
ショート動画アプリ（TikTok、YouTube Shorts、Instagram Reels）を**無意識に開く習慣**を断ち切り、**意識的な選択**に変える。

### 設計思想
1. **完全ブロックではなく「意識化」** - 使用を禁止するのではなく、使う前に立ち止まらせる
2. **科学的根拠に基づく設計** - 行動変容理論を活用
3. **能動的な習慣形成** - 受動的な介入だけでなく、自ら練習する仕組み
4. **可視化による自己効力感** - データで成長を実感

### 競合分析: one secアプリ

#### one secの優れている点

| 要素 | 説明 | 心理学的根拠 |
|------|------|-------------|
| **意図的な摩擦** | アプリ起動を遅延させる | 自動的な行動を中断し再考の機会を与える |
| **深呼吸ガイダンス** | 5-10秒の呼吸アニメーション | システム1→システム2への切り替え |
| **目的の問いかけ** | 「本当に必要？」と質問 | メタ認知を活性化 |
| **統計の可視化** | 阻止した回数、節約時間を表示 | 自己効力感の向上 |

#### one secの改善の余地とStopShortsの対策

| 課題 | StopShortsの対策 |
|------|-----------------|
| **慣れの問題** | 衝動サーフィング等のバリエーションで対応 |
| **受動的** | アプリ内訓練モードで能動的な練習を提供 |
| **単一アプローチ** | If-Thenプラン + 衝動サーフィングを統合 |

---

## 心理学的基盤

### 依存のメカニズム

ショート動画依存は以下の要因で形成される：

```
┌─────────────────────────────────────────────────────────────┐
│                    ドーパミン・ループ                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [退屈・不安・ストレス]  ←───────────────────────┐          │
│           ↓                                      │          │
│   [アプリを開く衝動]                             │          │
│           ↓                                      │          │
│   [無意識にアプリを開く]                         │          │
│           ↓                                      │          │
│   [即座の報酬（新しいコンテンツ）]                │          │
│           ↓                                      │          │
│   [ドーパミン放出]                               │          │
│           ↓                                      │          │
│   [一時的な満足]                                 │          │
│           ↓                                      │          │
│   [ドーパミン低下 → 退屈・不安の増大] ───────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 二重過程理論（Dual Process Theory）

| システム | 特徴 | 例 |
|----------|------|-----|
| **システム1** | 自動的、高速、無意識、衝動的 | 無意識にアプリを開く |
| **システム2** | 意識的、低速、論理的、制御的 | 「本当に必要か？」と考える |

**StopShortsの戦略**: システム1の自動行動を中断し、システム2を活性化させる

---

## 習慣形成の核心手法

StopShortsは2つの科学的に実証された手法を核心として採用：

### 1. Implementation Intentions（実行意図）- オンボーディングで設定済み

**提唱者**: Peter Gollwitzer（1999）

**概要**: 「Xが起きたら、Yをする」という形式で事前に計画を立てる

**研究効果**: 目標達成率が2-3倍に向上

**StopShortsでの実装**:
- オンボーディングで If-Then プランを設定（実装済み）
- 介入時に設定したプランを表示
- 毎日のリマインダーで復習

---

### 2. Urge Surfing（衝動サーフィング）- 核心手法

**提唱者**: Alan Marlatt（依存症治療・再発防止研究）

**概要**: 衝動を「波」として観察し、判断せずにやり過ごす

**なぜ効果的か**:
- 衝動は永続しない（通常15-30分でピークを過ぎる）
- 衝動と「戦う」のではなく「観察する」ことで、衝動に支配されなくなる
- マインドフルネスの原理を応用し、自動的な反応パターンを中断

**研究効果**: 依存行動の再発防止に効果的（薬物、アルコール、ギャンブル等で実証）

#### 衝動サーフィングのステップ

1. **認識する（Notice）** - 「今、アプリを開きたいという衝動がある」と気づく
2. **受け入れる（Accept）** - 衝動を否定せず、「あるがまま」に認める
3. **観察する（Observe）** - 衝動を第三者視点で観察する
4. **待つ（Wait）** - 衝動は波のように必ず過ぎ去ることを信じる

---

## コア機能設計

### 機能1: 起動時介入（Shield）

#### フロー

```
[ユーザーがTikTokをタップ]
        ↓
[DeviceActivity検知]
        ↓
[ManagedSettingsでブロック]
        ↓
[StopShortsをフォアグラウンドに起動]
        ↓
[衝動サーフィング or If-Then確認]
        ↓
[ユーザーの選択: 波に乗る / 開く]
```

#### 介入パターンのバリエーション

| パターン | 説明 | 頻度 |
|----------|------|------|
| **衝動サーフィング** | 波のアニメーション + 深呼吸 | 70% |
| **If-Then確認** | 設定したプランを表示 + 実行 | 30% |

---

### 機能2: アプリ内訓練モード

#### コンセプト

StopShorts内でTikTok風のUIを再現し、「スワイプ→止まる→衝動サーフィング」を練習させる。

#### 訓練モードの種類

| モード | 説明 | 難易度 |
|--------|------|--------|
| **基本訓練** | 5回スワイプ後に衝動サーフィング | ★☆☆ |
| **ランダム訓練** | ランダムなタイミングで介入 | ★★☆ |
| **衝動認識訓練** | 衝動を感じたら自分で止める | ★★★ |

---

### 機能3: 5分シールド

#### 概要
ショート動画アプリを一定時間使用すると、シールド画面を表示。

#### 介入パターン

| パターン | 1回目 | 2回目 | 3回目以降 |
|----------|-------|-------|----------|
| **やさしめ** | 閉じるのみ | 閉じる + StopShorts | StopShortsのみ |
| **標準** | 閉じる + StopShorts | StopShortsのみ | StopShortsのみ |
| **厳格** | StopShortsのみ | StopShortsのみ | StopShortsのみ |

---

## 統計・分析機能

### データ構造

```typescript
// src/types/statistics.ts

interface DailyStatistics {
  date: string;                           // ISO date (YYYY-MM-DD)
  totalUsageMinutes: number;              // 総使用時間（分）
  appBreakdown: {
    tiktok: number;
    youtubeShorts: number;
    instagramReels: number;
  };
  urgeSurfing: {
    completed: number;                    // 波に乗った回数
    skipped: number;                      // スキップした回数
    totalDurationSeconds: number;         // 合計サーフィング時間
    averageIntensityBefore: number;       // 平均開始時衝動強度 (1-10)
    averageIntensityAfter: number;        // 平均終了時衝動強度 (1-10)
  };
  interventions: {
    triggered: number;                    // 介入回数
    dismissed: number;                    // やめた回数
    proceeded: number;                    // 開いた回数
  };
  training: {
    sessionsCompleted: number;
    totalMinutes: number;
  };
  timeOfDayBreakdown: {
    morning: number;      // 6-9
    daytime: number;      // 9-17
    evening: number;      // 17-21
    night: number;        // 21-6
  };
}

interface WeeklyStatistics {
  weekStart: string;                      // ISO date
  weekEnd: string;
  dailyStats: DailyStatistics[];
  averageDailyUsage: number;
  totalUrgeSurfing: number;
  successRate: number;                    // completed / (completed + skipped)
  savedMinutes: number;                   // 推定節約時間
  comparedToPreviousWeek: {
    usageChange: number;                  // パーセント変化
    successRateChange: number;
  };
}

interface LifetimeStatistics {
  startDate: string;
  totalSavedHours: number;
  totalUrgeSurfingCompleted: number;
  totalInterventions: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string | null;
  condition: BadgeCondition;
}

type BadgeCondition =
  | { type: 'first_surf' }
  | { type: 'streak'; days: number }
  | { type: 'total_surfs'; count: number }
  | { type: 'saved_hours'; hours: number };
```

---

## ゲーミフィケーション

### ストリーク達成条件
- 1日の使用時間が目標以内
- または、衝動サーフィングを1回以上完了

### バッジシステム

| ID | バッジ | 条件 | 説明 |
|----|--------|------|------|
| `first_wave` | 🌊 初めての波 | 初めて衝動サーフィング完了 | 第一歩を踏み出しました |
| `streak_3` | 🔥 3日連続 | 3日連続達成 | 習慣の芽が出てきました |
| `streak_7` | 💪 1週間サーファー | 7日連続達成 | 波乗りが上手になってきました |
| `streak_14` | ⭐ 2週間マスター | 14日連続達成 | 衝動をコントロールできています |
| `streak_21` | 🏆 21日チャンピオン | 21日連続達成 | 新しい習慣が形成されました！ |
| `streak_66` | 👑 66日レジェンド | 66日連続達成 | 科学的に習慣が定着 |
| `surfs_100` | 🏄 100回サーファー | 100回衝動サーフィング完了 | 波乗りの達人 |
| `saved_10h` | ⏰ 10時間救済者 | 累計10時間節約 | 貴重な時間を取り戻しました |

---

## 技術的実装要件

### Screen Time API

| フレームワーク | 用途 |
|---------------|------|
| `FamilyControls` | 権限取得、対象アプリ選択 |
| `DeviceActivity` | アプリ起動・使用時間の検知 |
| `ManagedSettings` | アプリのブロック・解除 |

### 必要なエンタイトルメント

```
com.apple.developer.family-controls
```

> ⚠️ **注意**: Family Controls entitlementはAppleへの申請・承認が必要

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    StopShorts App                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   React Native  │  │  Native Modules │                  │
│  │   (UI Layer)    │◄─│  (Bridge)       │                  │
│  └────────┬────────┘  └────────┬────────┘                  │
│           │                    │                            │
│  ┌────────▼────────────────────▼────────┐                  │
│  │           Zustand Store              │                  │
│  │  (State Management + Persistence)    │                  │
│  └────────────────┬─────────────────────┘                  │
│                   │                                         │
│  ┌────────────────▼─────────────────────┐                  │
│  │         Statistics Service           │                  │
│  │  (Data Processing + Analytics)       │                  │
│  └──────────────────────────────────────┘                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    App Extensions                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ DeviceActivity  │  │ ShieldConfig    │                  │
│  │ Monitor         │  │ Extension       │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ ShieldAction    │  │ Activity        │                  │
│  │ Extension       │  │ Report          │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 詳細実装計画

### ディレクトリ構造

```
src/
├── components/
│   ├── ui/                          # 既存UIコンポーネント
│   ├── urge-surfing/                # 衝動サーフィング関連
│   │   ├── UrgeSurfingScreen.tsx    # メイン画面
│   │   ├── WaveAnimation.tsx        # 波アニメーション
│   │   ├── IntensitySlider.tsx      # 衝動強度スライダー
│   │   ├── BreathingGuide.tsx       # 深呼吸ガイド
│   │   ├── SurfingTimer.tsx         # タイマー表示
│   │   └── CompletionScreen.tsx     # 完了画面
│   ├── training/                    # 訓練モード関連
│   │   ├── TrainingScreen.tsx       # メイン訓練画面
│   │   ├── MockVideoFeed.tsx        # TikTok風モックフィード
│   │   ├── MockVideoCard.tsx        # 個別動画カード
│   │   ├── TrainingIntervention.tsx # 訓練中の介入画面
│   │   └── TrainingComplete.tsx     # 訓練完了画面
│   └── statistics/                  # 統計関連
│       ├── DashboardScreen.tsx      # ダッシュボード
│       ├── DetailedStatsScreen.tsx  # 詳細統計
│       ├── WeeklyChart.tsx          # 週間グラフ
│       ├── StreakDisplay.tsx        # ストリーク表示
│       └── BadgeGrid.tsx            # バッジ一覧
│
├── services/
│   ├── statistics.ts                # 統計計算ロジック
│   ├── badges.ts                    # バッジ判定ロジック
│   └── notifications.ts             # 通知管理
│
├── stores/
│   ├── useAppStore.ts               # 既存ストア（拡張）
│   └── useStatisticsStore.ts        # 統計専用ストア
│
├── types/
│   ├── index.ts                     # 既存型定義
│   └── statistics.ts                # 統計関連型定義
│
└── native/                          # ネイティブモジュール
    └── ScreenTimeModule.ts          # Screen Time API ブリッジ

app/
├── (main)/
│   ├── index.tsx                    # ホーム画面（拡張）
│   ├── training.tsx                 # 訓練モード
│   ├── statistics.tsx               # 統計画面（拡張）
│   └── urge-surfing.tsx             # 衝動サーフィング画面
│
ios/
├── StopShorts/
│   └── ScreenTimeModule.swift       # Screen Time ネイティブ実装
├── DeviceActivityMonitor/           # App Extension
│   └── DeviceActivityMonitorExtension.swift
├── ShieldConfiguration/             # App Extension
│   └── ShieldConfigurationExtension.swift
└── ShieldAction/                    # App Extension
    └── ShieldActionExtension.swift
```

---

### Phase 1: 衝動サーフィングUI（React Native）

#### 1.1 WaveAnimation コンポーネント

```typescript
// src/components/urge-surfing/WaveAnimation.tsx

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface WaveAnimationProps {
  /** 現在の進行度 (0-1) */
  progress: number;
  /** サーファーアイコンを表示するか */
  showSurfer?: boolean;
  /** 波の色 */
  waveColor?: string;
}

export function WaveAnimation({
  progress,
  showSurfer = true,
  waveColor = '#4A90D9',
}: WaveAnimationProps) {
  const { width } = Dimensions.get('window');
  const waveOffset = useSharedValue(0);

  React.useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // 波の位置（進行度に応じて下がる）
  const wavePosition = interpolate(progress, [0, 1], [0.3, 0.7]);

  // サーファーの位置（波の上を移動）
  const surferY = interpolate(progress, [0, 0.5, 1], [0.3, 0.15, 0.7]);

  const animatedWaveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: waveOffset.value * -width }],
  }));

  return (
    <View style={styles.container}>
      {/* 波のSVGアニメーション */}
      <Animated.View style={[styles.waveContainer, animatedWaveStyle]}>
        <Svg width={width * 2} height={200} viewBox={`0 0 ${width * 2} 200`}>
          <Path
            d={generateWavePath(width * 2, 200, wavePosition)}
            fill={waveColor}
            opacity={0.6}
          />
        </Svg>
      </Animated.View>

      {/* サーファーアイコン */}
      {showSurfer && (
        <View style={[styles.surfer, { top: `${surferY * 100}%` }]}>
          <Text style={styles.surferEmoji}>🏄</Text>
        </View>
      )}
    </View>
  );
}

function generateWavePath(width: number, height: number, yPosition: number): string {
  const y = height * yPosition;
  const amplitude = 20;
  let path = `M 0 ${y}`;

  for (let x = 0; x <= width; x += 10) {
    const waveY = y + Math.sin(x * 0.02) * amplitude;
    path += ` L ${x} ${waveY}`;
  }

  path += ` L ${width} ${height} L 0 ${height} Z`;
  return path;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
  },
  surfer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -20,
  },
  surferEmoji: {
    fontSize: 40,
  },
});
```

#### 1.2 IntensitySlider コンポーネント

```typescript
// src/components/urge-surfing/IntensitySlider.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface IntensitySliderProps {
  value: number;              // 1-10
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function IntensitySlider({
  value,
  onChange,
  disabled = false,
}: IntensitySliderProps) {
  const { colors, spacing } = useTheme();
  const sliderWidth = useSharedValue(0);
  const translateX = useSharedValue((value - 1) / 9);

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((event) => {
      const newValue = Math.max(0, Math.min(1, event.x / sliderWidth.value));
      translateX.value = newValue;
      const intensity = Math.round(newValue * 9) + 1;
      runOnJS(onChange)(intensity);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * sliderWidth.value - 15 }],
  }));

  const getIntensityLabel = (val: number): string => {
    if (val <= 3) return '弱い';
    if (val <= 6) return '中くらい';
    return '強い';
  };

  const getIntensityColor = (val: number): string => {
    if (val <= 3) return colors.success;
    if (val <= 6) return colors.warning;
    return colors.error;
  };

  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={[styles.label, { color: colors.textMuted }]}>弱い</Text>
        <Text style={[styles.label, { color: colors.textMuted }]}>強い</Text>
      </View>

      <GestureDetector gesture={panGesture}>
        <View
          style={[styles.track, { backgroundColor: colors.backgroundCard }]}
          onLayout={(e) => {
            sliderWidth.value = e.nativeEvent.layout.width;
          }}
        >
          {/* 進捗バー */}
          <Animated.View
            style={[
              styles.progress,
              {
                backgroundColor: getIntensityColor(value),
                width: `${((value - 1) / 9) * 100}%`,
              },
            ]}
          />

          {/* つまみ */}
          <Animated.View
            style={[
              styles.thumb,
              thumbStyle,
              { backgroundColor: getIntensityColor(value) },
            ]}
          />
        </View>
      </GestureDetector>

      <Text
        style={[
          styles.currentValue,
          { color: getIntensityColor(value) },
        ]}
      >
        {value} - {getIntensityLabel(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 16,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  thumb: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    top: -11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  currentValue: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});
```

#### 1.3 BreathingGuide コンポーネント

```typescript
// src/components/urge-surfing/BreathingGuide.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface BreathingGuideProps {
  /** 呼吸サイクル数 */
  cycles: number;
  /** 完了時コールバック */
  onComplete: () => void;
  /** 吸う時間（ms） */
  inhaleMs?: number;
  /** 止める時間（ms） */
  holdMs?: number;
  /** 吐く時間（ms） */
  exhaleMs?: number;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export function BreathingGuide({
  cycles,
  onComplete,
  inhaleMs = 4000,
  holdMs = 2000,
  exhaleMs = 4000,
}: BreathingGuideProps) {
  const { colors, typography } = useTheme();
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phase, setPhase] = useState<BreathPhase>('inhale');

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const cycleMs = inhaleMs + holdMs + exhaleMs + 500; // 500ms rest

  useEffect(() => {
    const runBreathCycle = () => {
      // 吸う
      setPhase('inhale');
      scale.value = withTiming(1.5, {
        duration: inhaleMs,
        easing: Easing.inOut(Easing.ease),
      });

      // 止める
      setTimeout(() => {
        setPhase('hold');
      }, inhaleMs);

      // 吐く
      setTimeout(() => {
        setPhase('exhale');
        scale.value = withTiming(1, {
          duration: exhaleMs,
          easing: Easing.inOut(Easing.ease),
        });
      }, inhaleMs + holdMs);

      // 次のサイクルへ
      setTimeout(() => {
        setPhase('rest');
        if (currentCycle < cycles) {
          setCurrentCycle((c) => c + 1);
        } else {
          onComplete();
        }
      }, cycleMs - 500);
    };

    runBreathCycle();
    const interval = setInterval(runBreathCycle, cycleMs);

    return () => clearInterval(interval);
  }, [currentCycle, cycles]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getPhaseText = (): string => {
    switch (phase) {
      case 'inhale':
        return '吸って...';
      case 'hold':
        return '止めて...';
      case 'exhale':
        return '吐いて...';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          animatedCircleStyle,
          { backgroundColor: colors.primary + '40' },
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            { backgroundColor: colors.primary },
          ]}
        />
      </Animated.View>

      <Text style={[typography.h2, { color: colors.textPrimary, marginTop: 32 }]}>
        {getPhaseText()}
      </Text>

      <View style={styles.cycleIndicator}>
        {Array.from({ length: cycles }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.cycleDot,
              {
                backgroundColor:
                  i < currentCycle ? colors.primary : colors.borderSubtle,
              },
            ]}
          />
        ))}
      </View>

      <Text style={[typography.caption, { color: colors.textMuted }]}>
        {currentCycle} / {cycles} 回目
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  cycleIndicator: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  cycleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
```

#### 1.4 UrgeSurfingScreen 画面

```typescript
// src/components/urge-surfing/UrgeSurfingScreen.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useStatisticsStore } from '../../stores/useStatisticsStore';
import { Button } from '../ui';
import { WaveAnimation } from './WaveAnimation';
import { IntensitySlider } from './IntensitySlider';
import { BreathingGuide } from './BreathingGuide';

type SurfingPhase = 'initial' | 'surfing' | 'complete';

interface UrgeSurfingScreenProps {
  /** ブロックされたアプリ名 */
  blockedAppName?: string;
  /** 開くボタン押下時 */
  onProceed: () => void;
  /** ホームに戻る時 */
  onDismiss: () => void;
}

export function UrgeSurfingScreen({
  blockedAppName = 'TikTok',
  onProceed,
  onDismiss,
}: UrgeSurfingScreenProps) {
  const { colors, typography, spacing } = useTheme();
  const [phase, setPhase] = useState<SurfingPhase>('initial');
  const [intensityBefore, setIntensityBefore] = useState(5);
  const [intensityAfter, setIntensityAfter] = useState(5);
  const [surfingProgress, setSurfingProgress] = useState(0);

  const { recordUrgeSurfing } = useStatisticsStore();

  const SURFING_DURATION_MS = 30000; // 30秒
  const BREATH_CYCLES = 3;

  const handleStartSurfing = useCallback(() => {
    setPhase('surfing');

    // 進捗を更新
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SURFING_DURATION_MS, 1);
      setSurfingProgress(progress);

      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 100);
  }, []);

  const handleBreathingComplete = useCallback(() => {
    setPhase('complete');

    // 統計を記録
    recordUrgeSurfing({
      intensityBefore,
      intensityAfter,
      durationSeconds: SURFING_DURATION_MS / 1000,
      completed: true,
    });
  }, [intensityBefore, intensityAfter, recordUrgeSurfing]);

  const handleSkip = useCallback(() => {
    recordUrgeSurfing({
      intensityBefore,
      intensityAfter: intensityBefore,
      durationSeconds: 0,
      completed: false,
    });
    onProceed();
  }, [intensityBefore, recordUrgeSurfing, onProceed]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {phase === 'initial' && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.content}
        >
          <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
            ⏸️ ちょっと待って
          </Text>

          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
            {blockedAppName}を開こうとしています
          </Text>

          <View style={[styles.section, { marginTop: spacing.xl }]}>
            <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>
              今の衝動を観察してみましょう
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
              衝動の強さは？
            </Text>

            <IntensitySlider
              value={intensityBefore}
              onChange={setIntensityBefore}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="🌊 波に乗る（30秒）"
              onPress={handleStartSurfing}
              size="lg"
            />

            <Button
              title="今すぐ開く"
              onPress={handleSkip}
              variant="outline"
              size="lg"
              style={{ marginTop: spacing.md }}
            />
          </View>
        </Animated.View>
      )}

      {phase === 'surfing' && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.content}
        >
          <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
            🌊 衝動サーフィング中
          </Text>

          <View style={styles.waveContainer}>
            <WaveAnimation
              progress={surfingProgress}
              showSurfer={true}
              waveColor={colors.primary}
            />
          </View>

          <BreathingGuide
            cycles={BREATH_CYCLES}
            onComplete={handleBreathingComplete}
          />

          <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: 16 }]}>
            💭 「この衝動は一時的なもの。波のように、必ず過ぎていく」
          </Text>
        </Animated.View>
      )}

      {phase === 'complete' && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.content}
        >
          <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center' }]}>
            ✨ 素晴らしい！
          </Text>

          <Text style={[typography.bodyLarge, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
            波を乗り越えました 🏄
          </Text>

          <View style={[styles.section, { marginTop: spacing.xl }]}>
            <Text style={[typography.body, { color: colors.textPrimary }]}>
              今の衝動の強さは？
            </Text>

            <IntensitySlider
              value={intensityAfter}
              onChange={setIntensityAfter}
            />
          </View>

          <View style={[styles.comparisonCard, { backgroundColor: colors.backgroundCard }]}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              衝動の強さの変化
            </Text>
            <View style={styles.comparisonRow}>
              <Text style={[typography.body, { color: colors.textPrimary }]}>
                開始時: {intensityBefore}
              </Text>
              <Text style={[typography.body, { color: colors.textPrimary }]}>
                →
              </Text>
              <Text style={[typography.body, { color: colors.success }]}>
                今: {intensityAfter}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="ホームに戻る"
              onPress={onDismiss}
              size="lg"
            />

            <Button
              title="やっぱり開く"
              onPress={onProceed}
              variant="outline"
              size="lg"
              style={{ marginTop: spacing.md }}
            />
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  section: {
    width: '100%',
  },
  waveContainer: {
    height: 200,
    marginVertical: 24,
  },
  buttonContainer: {
    marginTop: 32,
  },
  comparisonCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
});
```

---

### Phase 2: 統計ストア

```typescript
// src/stores/useStatisticsStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DailyStatistics,
  WeeklyStatistics,
  LifetimeStatistics,
  Badge,
} from '../types/statistics';
import { checkBadges, BADGE_DEFINITIONS } from '../services/badges';

interface UrgeSurfingRecord {
  intensityBefore: number;
  intensityAfter: number;
  durationSeconds: number;
  completed: boolean;
}

interface StatisticsState {
  // データ
  dailyStats: Record<string, DailyStatistics>;  // key: YYYY-MM-DD
  lifetime: LifetimeStatistics;

  // アクション
  recordUrgeSurfing: (record: UrgeSurfingRecord) => void;
  recordIntervention: (proceeded: boolean) => void;
  recordUsageTime: (appId: string, minutes: number) => void;
  recordTrainingSession: (minutes: number) => void;

  // ゲッター
  getTodayStats: () => DailyStatistics;
  getWeeklyStats: () => WeeklyStatistics;
  getStreak: () => number;
  getNewBadges: () => Badge[];

  // ユーティリティ
  resetDailyStats: () => void;
}

const getDateKey = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const createEmptyDailyStats = (date: string): DailyStatistics => ({
  date,
  totalUsageMinutes: 0,
  appBreakdown: {
    tiktok: 0,
    youtubeShorts: 0,
    instagramReels: 0,
  },
  urgeSurfing: {
    completed: 0,
    skipped: 0,
    totalDurationSeconds: 0,
    averageIntensityBefore: 0,
    averageIntensityAfter: 0,
  },
  interventions: {
    triggered: 0,
    dismissed: 0,
    proceeded: 0,
  },
  training: {
    sessionsCompleted: 0,
    totalMinutes: 0,
  },
  timeOfDayBreakdown: {
    morning: 0,
    daytime: 0,
    evening: 0,
    night: 0,
  },
});

const createEmptyLifetime = (): LifetimeStatistics => ({
  startDate: new Date().toISOString(),
  totalSavedHours: 0,
  totalUrgeSurfingCompleted: 0,
  totalInterventions: 0,
  currentStreak: 0,
  longestStreak: 0,
  badges: BADGE_DEFINITIONS.map((def) => ({
    ...def,
    earnedAt: null,
  })),
});

export const useStatisticsStore = create<StatisticsState>()(
  persist(
    (set, get) => ({
      dailyStats: {},
      lifetime: createEmptyLifetime(),

      recordUrgeSurfing: (record) => {
        const dateKey = getDateKey();
        const state = get();
        const todayStats = state.dailyStats[dateKey] || createEmptyDailyStats(dateKey);

        const newUrgeSurfing = { ...todayStats.urgeSurfing };

        if (record.completed) {
          newUrgeSurfing.completed += 1;
          newUrgeSurfing.totalDurationSeconds += record.durationSeconds;

          // 平均強度を再計算
          const totalCompleted = newUrgeSurfing.completed;
          newUrgeSurfing.averageIntensityBefore =
            (newUrgeSurfing.averageIntensityBefore * (totalCompleted - 1) +
              record.intensityBefore) /
            totalCompleted;
          newUrgeSurfing.averageIntensityAfter =
            (newUrgeSurfing.averageIntensityAfter * (totalCompleted - 1) +
              record.intensityAfter) /
            totalCompleted;
        } else {
          newUrgeSurfing.skipped += 1;
        }

        const newLifetime = { ...state.lifetime };
        if (record.completed) {
          newLifetime.totalUrgeSurfingCompleted += 1;
        }

        // バッジチェック
        const updatedBadges = checkBadges(newLifetime, {
          ...state.dailyStats,
          [dateKey]: { ...todayStats, urgeSurfing: newUrgeSurfing },
        });

        set({
          dailyStats: {
            ...state.dailyStats,
            [dateKey]: {
              ...todayStats,
              urgeSurfing: newUrgeSurfing,
            },
          },
          lifetime: {
            ...newLifetime,
            badges: updatedBadges,
          },
        });
      },

      recordIntervention: (proceeded) => {
        const dateKey = getDateKey();
        const state = get();
        const todayStats = state.dailyStats[dateKey] || createEmptyDailyStats(dateKey);

        const newInterventions = { ...todayStats.interventions };
        newInterventions.triggered += 1;

        if (proceeded) {
          newInterventions.proceeded += 1;
        } else {
          newInterventions.dismissed += 1;
        }

        set({
          dailyStats: {
            ...state.dailyStats,
            [dateKey]: {
              ...todayStats,
              interventions: newInterventions,
            },
          },
          lifetime: {
            ...state.lifetime,
            totalInterventions: state.lifetime.totalInterventions + 1,
          },
        });
      },

      recordUsageTime: (appId, minutes) => {
        const dateKey = getDateKey();
        const state = get();
        const todayStats = state.dailyStats[dateKey] || createEmptyDailyStats(dateKey);

        const newBreakdown = { ...todayStats.appBreakdown };
        const appKey = appId as keyof typeof newBreakdown;
        if (appKey in newBreakdown) {
          newBreakdown[appKey] += minutes;
        }

        // 時間帯を判定
        const hour = new Date().getHours();
        const newTimeBreakdown = { ...todayStats.timeOfDayBreakdown };
        if (hour >= 6 && hour < 9) {
          newTimeBreakdown.morning += minutes;
        } else if (hour >= 9 && hour < 17) {
          newTimeBreakdown.daytime += minutes;
        } else if (hour >= 17 && hour < 21) {
          newTimeBreakdown.evening += minutes;
        } else {
          newTimeBreakdown.night += minutes;
        }

        set({
          dailyStats: {
            ...state.dailyStats,
            [dateKey]: {
              ...todayStats,
              totalUsageMinutes: todayStats.totalUsageMinutes + minutes,
              appBreakdown: newBreakdown,
              timeOfDayBreakdown: newTimeBreakdown,
            },
          },
        });
      },

      recordTrainingSession: (minutes) => {
        const dateKey = getDateKey();
        const state = get();
        const todayStats = state.dailyStats[dateKey] || createEmptyDailyStats(dateKey);

        set({
          dailyStats: {
            ...state.dailyStats,
            [dateKey]: {
              ...todayStats,
              training: {
                sessionsCompleted: todayStats.training.sessionsCompleted + 1,
                totalMinutes: todayStats.training.totalMinutes + minutes,
              },
            },
          },
        });
      },

      getTodayStats: () => {
        const dateKey = getDateKey();
        return get().dailyStats[dateKey] || createEmptyDailyStats(dateKey);
      },

      getWeeklyStats: () => {
        const state = get();
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        const dailyStatsArray: DailyStatistics[] = [];

        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          const dateKey = getDateKey(date);
          dailyStatsArray.push(
            state.dailyStats[dateKey] || createEmptyDailyStats(dateKey)
          );
        }

        const totalUsage = dailyStatsArray.reduce(
          (sum, d) => sum + d.totalUsageMinutes,
          0
        );
        const totalSurfing = dailyStatsArray.reduce(
          (sum, d) => sum + d.urgeSurfing.completed,
          0
        );
        const totalSkipped = dailyStatsArray.reduce(
          (sum, d) => sum + d.urgeSurfing.skipped,
          0
        );

        return {
          weekStart: getDateKey(weekStart),
          weekEnd: getDateKey(today),
          dailyStats: dailyStatsArray,
          averageDailyUsage: totalUsage / 7,
          totalUrgeSurfing: totalSurfing,
          successRate:
            totalSurfing + totalSkipped > 0
              ? totalSurfing / (totalSurfing + totalSkipped)
              : 0,
          savedMinutes: totalSurfing * 5, // 1回のサーフィングで推定5分節約
          comparedToPreviousWeek: {
            usageChange: 0, // TODO: 前週との比較
            successRateChange: 0,
          },
        };
      },

      getStreak: () => {
        return get().lifetime.currentStreak;
      },

      getNewBadges: () => {
        const badges = get().lifetime.badges;
        // 直近24時間以内に獲得したバッジ
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        return badges.filter(
          (b) => b.earnedAt && b.earnedAt > oneDayAgo
        );
      },

      resetDailyStats: () => {
        set({ dailyStats: {} });
      },
    }),
    {
      name: 'statistics-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

### Phase 3: バッジシステム

```typescript
// src/services/badges.ts

import { Badge, BadgeCondition, LifetimeStatistics, DailyStatistics } from '../types/statistics';

export const BADGE_DEFINITIONS: Omit<Badge, 'earnedAt'>[] = [
  {
    id: 'first_wave',
    name: '初めての波',
    description: '第一歩を踏み出しました',
    icon: '🌊',
    condition: { type: 'first_surf' },
  },
  {
    id: 'streak_3',
    name: '3日連続',
    description: '習慣の芽が出てきました',
    icon: '🔥',
    condition: { type: 'streak', days: 3 },
  },
  {
    id: 'streak_7',
    name: '1週間サーファー',
    description: '波乗りが上手になってきました',
    icon: '💪',
    condition: { type: 'streak', days: 7 },
  },
  {
    id: 'streak_14',
    name: '2週間マスター',
    description: '衝動をコントロールできています',
    icon: '⭐',
    condition: { type: 'streak', days: 14 },
  },
  {
    id: 'streak_21',
    name: '21日チャンピオン',
    description: '新しい習慣が形成されました！',
    icon: '🏆',
    condition: { type: 'streak', days: 21 },
  },
  {
    id: 'streak_66',
    name: '66日レジェンド',
    description: '科学的に習慣が定着',
    icon: '👑',
    condition: { type: 'streak', days: 66 },
  },
  {
    id: 'surfs_100',
    name: '100回サーファー',
    description: '波乗りの達人',
    icon: '🏄',
    condition: { type: 'total_surfs', count: 100 },
  },
  {
    id: 'saved_10h',
    name: '10時間救済者',
    description: '貴重な時間を取り戻しました',
    icon: '⏰',
    condition: { type: 'saved_hours', hours: 10 },
  },
];

export function checkBadges(
  lifetime: LifetimeStatistics,
  dailyStats: Record<string, DailyStatistics>
): Badge[] {
  const now = new Date().toISOString();

  return lifetime.badges.map((badge) => {
    // 既に獲得済み
    if (badge.earnedAt) {
      return badge;
    }

    const earned = checkCondition(badge.condition, lifetime, dailyStats);

    if (earned) {
      return { ...badge, earnedAt: now };
    }

    return badge;
  });
}

function checkCondition(
  condition: BadgeCondition,
  lifetime: LifetimeStatistics,
  dailyStats: Record<string, DailyStatistics>
): boolean {
  switch (condition.type) {
    case 'first_surf':
      return lifetime.totalUrgeSurfingCompleted >= 1;

    case 'streak':
      return lifetime.currentStreak >= condition.days;

    case 'total_surfs':
      return lifetime.totalUrgeSurfingCompleted >= condition.count;

    case 'saved_hours':
      return lifetime.totalSavedHours >= condition.hours;

    default:
      return false;
  }
}

export function calculateStreak(dailyStats: Record<string, DailyStatistics>): number {
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const stats = dailyStats[dateKey];

    // その日にサーフィングを完了したか、使用時間が目標以内か
    const achieved =
      stats &&
      (stats.urgeSurfing.completed > 0 || stats.totalUsageMinutes <= 30);

    if (achieved) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
```

---

### Phase 4: Screen Time ネイティブモジュール

```swift
// ios/StopShorts/ScreenTimeModule.swift

import Foundation
import FamilyControls
import DeviceActivity
import ManagedSettings

@objc(ScreenTimeModule)
class ScreenTimeModule: NSObject {

  private let center = AuthorizationCenter.shared
  private let store = ManagedSettingsStore()

  @objc
  func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        try await center.requestAuthorization(for: .individual)
        resolve(true)
      } catch {
        reject("AUTH_ERROR", error.localizedDescription, error)
      }
    }
  }

  @objc
  func getAuthorizationStatus(_ resolve: @escaping RCTPromiseResolveBlock,
                              rejecter reject: @escaping RCTPromiseRejectBlock) {
    switch center.authorizationStatus {
    case .notDetermined:
      resolve("notDetermined")
    case .denied:
      resolve("denied")
    case .approved:
      resolve("approved")
    @unknown default:
      resolve("unknown")
    }
  }

  @objc
  func setShieldedApps(_ bundleIds: [String],
                       resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Family Controls APIでアプリをシールド
    // 実際の実装ではFamilyActivityPickerを使用
    resolve(true)
  }

  @objc
  func unshieldApps(_ resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    store.shield.applications = nil
    resolve(true)
  }

  @objc
  func getUsageData(_ startDate: String,
                    endDate: String,
                    resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    // DeviceActivity APIで使用データを取得
    // 実装は ActivityReport Extension で行う
    resolve([
      "totalMinutes": 45,
      "apps": [
        ["bundleId": "com.zhiliaoapp.musically", "minutes": 20],
        ["bundleId": "com.google.ios.youtube", "minutes": 15],
        ["bundleId": "com.burbn.instagram", "minutes": 10],
      ]
    ])
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
```

```typescript
// src/native/ScreenTimeModule.ts

import { NativeModules, Platform } from 'react-native';

const { ScreenTimeModule } = NativeModules;

export type AuthorizationStatus = 'notDetermined' | 'denied' | 'approved' | 'unknown';

export interface UsageData {
  totalMinutes: number;
  apps: Array<{
    bundleId: string;
    minutes: number;
  }>;
}

class ScreenTimeService {
  async requestAuthorization(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.warn('Screen Time API is only available on iOS');
      return false;
    }
    return ScreenTimeModule.requestAuthorization();
  }

  async getAuthorizationStatus(): Promise<AuthorizationStatus> {
    if (Platform.OS !== 'ios') {
      return 'notDetermined';
    }
    return ScreenTimeModule.getAuthorizationStatus();
  }

  async setShieldedApps(bundleIds: string[]): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }
    return ScreenTimeModule.setShieldedApps(bundleIds);
  }

  async unshieldApps(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }
    return ScreenTimeModule.unshieldApps();
  }

  async getUsageData(startDate: Date, endDate: Date): Promise<UsageData> {
    if (Platform.OS !== 'ios') {
      return { totalMinutes: 0, apps: [] };
    }
    return ScreenTimeModule.getUsageData(
      startDate.toISOString(),
      endDate.toISOString()
    );
  }
}

export const screenTimeService = new ScreenTimeService();
```

---

## 課金モデル

### プラン構成

| プラン | 価格 | 月額換算 | 割引率 |
|--------|------|----------|--------|
| **3日間無料トライアル** | 無料 | - | - |
| **30日チャレンジ** | ¥980 | ¥980 | - |
| **90日マスター** | ¥2,350 | ¥783 | 20%OFF |
| **年間プラン** | ¥5,880 | ¥490 | 50%OFF |

> **Note**: 有料プラン間で機能差はありません。すべて同じ全機能が利用可能です。

---

## 実装ロードマップ

### MVP (v1.0) - 2週間

| タスク | 優先度 | 工数 | 担当 |
|--------|--------|------|------|
| WaveAnimation コンポーネント | P0 | 2日 | - |
| IntensitySlider コンポーネント | P0 | 1日 | - |
| BreathingGuide コンポーネント | P0 | 1日 | - |
| UrgeSurfingScreen 画面 | P0 | 2日 | - |
| useStatisticsStore 実装 | P0 | 2日 | - |
| バッジシステム実装 | P1 | 1日 | - |
| ダッシュボード画面 | P1 | 2日 | - |
| Screen Time権限フロー | P0 | 1日 | - |
| テスト・バグ修正 | P0 | 2日 | - |

### v1.1 - 訓練モード（1週間）

| タスク | 優先度 | 工数 |
|--------|--------|------|
| MockVideoFeed コンポーネント | P0 | 2日 |
| TrainingScreen 画面 | P0 | 2日 |
| 訓練進捗トラッキング | P1 | 1日 |
| テスト・調整 | P0 | 2日 |

### v1.2 - 統計機能強化（1週間）

| タスク | 優先度 | 工数 |
|--------|--------|------|
| 詳細統計画面 | P0 | 2日 |
| 週間グラフ | P1 | 1日 |
| 週間レポート生成 | P1 | 1日 |
| プッシュ通知連携 | P2 | 1日 |
| テスト・調整 | P0 | 2日 |

### v1.3 - Screen Time API統合（2週間）

| タスク | 優先度 | 工数 |
|--------|--------|------|
| Family Controls entitlement申請 | P0 | - |
| DeviceActivityMonitor Extension | P0 | 3日 |
| ShieldConfiguration Extension | P0 | 2日 |
| ShieldAction Extension | P0 | 2日 |
| React Native ブリッジ | P0 | 2日 |
| 統合テスト | P0 | 3日 |

---

## 参考文献

1. Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. American Psychologist.
2. Marlatt, G. A. & Gordon, J. R. (1985). Relapse Prevention. Guilford Press.
3. Bowen, S., et al. (2009). Mindfulness-Based Relapse Prevention for Substance Use Disorders. Cognitive and Behavioral Practice.
4. Lally, P. et al. (2010). How are habits formed. European Journal of Social Psychology.
5. Kahneman, D. (2011). Thinking, Fast and Slow. Farrar, Straus and Giroux.

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2025-12-20 | 1.0 | 初版作成 |
| 2025-12-20 | 1.1 | ダッシュボード設定、課金モデル追加 |
| 2025-12-20 | 2.0 | 習慣形成ツールキット、統計機能、ゲーミフィケーション追加 |
| 2025-12-20 | 2.1 | 機能を絞り込み。核心手法として「衝動サーフィング」を採用 |
| 2025-12-20 | 3.0 | 詳細実装計画を追加。コンポーネント設計、TypeScript型定義、ネイティブモジュール仕様、工数見積もりを記載 |

