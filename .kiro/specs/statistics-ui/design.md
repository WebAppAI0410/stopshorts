# Statistics UI Improvement - Design

## UI Layout

### Overall Structure
```
┌─────────────────────────────────┐
│ Header: StopShorts              │
├─────────────────────────────────┤
│ [Demo Mode Banner] (conditional)│
├─────────────────────────────────┤
│ TabSelector: [ 日 ] [ 週 ]      │
├─────────────────────────────────┤
│ ComparisonHero                  │
│   - 使用時間 (大きく)            │
│   - 変化率 (↓18% / ↑12%)        │
│   - ベースライン削減率           │
├─────────────────────────────────┤
│ Comparison Chart                │
│   - 日タブ: 時間帯別比較         │
│   - 週タブ: 日別比較             │
├─────────────────────────────────┤
│ TrendChart (週タブのみ)         │
│   - 過去4週間のトレンド          │
├─────────────────────────────────┤
│ StatCard Row                    │
│   [連続日数] [サーフィング成功率] │
├─────────────────────────────────┤
│ Badge Grid                      │
└─────────────────────────────────┘
```

## Component Design

### 1. TabSelector
```typescript
// src/components/statistics/TabSelector.tsx

interface TabSelectorProps {
  selectedTab: 'day' | 'week';
  onTabChange: (tab: 'day' | 'week') => void;
}

// Visual Design
// - セグメントコントロール形式
// - 選択中のタブ: アクセントカラー背景
// - 非選択のタブ: 透明背景
// - アニメーション: withSpring for smooth transition
```

### 2. ComparisonHero
```typescript
// src/components/statistics/ComparisonHero.tsx

interface ComparisonHeroProps {
  mode: 'day' | 'week';
  currentMinutes: number;      // 今日/今週の使用時間（分）
  previousMinutes: number;     // 昨日/先週の使用時間（分）
  changePercent: number;       // 変化率（正=増加、負=減少）
  baselineReduction: number | null; // ベースラインからの削減率
}

// Visual Design
// - 使用時間: 48px bold, colors.text
// - 変化率: 24px, colors.success (↓) or colors.error (↑)
// - ベースライン削減率: 16px, colors.textSecondary
```

### 3. DailyComparisonChart
```typescript
// src/components/statistics/DailyComparisonChart.tsx

interface TimeOfDayBreakdown {
  morning: number;   // 6-9時
  daytime: number;   // 9-17時
  evening: number;   // 17-21時
  night: number;     // 21-6時
}

interface DailyComparisonChartProps {
  today: TimeOfDayBreakdown;
  yesterday: TimeOfDayBreakdown;
  baselineDailyMinutes?: number;
}

// Visual Design
// - 並列棒グラフ（2本/時間帯）
// - 今日: colors.accent (#10B981)
// - 昨日: colors.textSecondary (薄いグレー)
// - ベースライン: 破線の水平線
// - X軸ラベル: 朝, 昼, 夕, 夜
// - 凡例: ■今日 ■昨日
```

### 4. WeeklyComparisonChart
```typescript
// src/components/statistics/WeeklyComparisonChart.tsx

interface DayData {
  day: string;  // 'MON', 'TUE', etc.
  value: number; // minutes
}

interface WeeklyComparisonChartProps {
  currentWeek: DayData[];
  previousWeek: DayData[];
  baselineDailyMinutes?: number;
}

// Visual Design
// - 並列棒グラフ（2本/日）
// - 今週: colors.accent (#10B981)
// - 先週: colors.textSecondary
// - ベースライン: 破線の水平線
// - X軸ラベル: 月, 火, 水, 木, 金, 土, 日
// - 凡例: ■今週 ■先週
```

### 5. TrendChart
```typescript
// src/components/statistics/TrendChart.tsx

interface TrendChartProps {
  weeklyTotals: number[];  // 過去4週分 [week1, week2, week3, week4]
  labels?: string[];       // ['4週前', '3週前', '2週前', '今週']
}

// Visual Design
// - シンプルな4本の棒グラフ
// - グラデーション: 古い週 → 新しい週で色が濃くなる
// - 高さで削減傾向を視覚化
```

## Data Layer Design

### useStatisticsStore Extensions
```typescript
// src/stores/useStatisticsStore.ts に追加

// 日次比較
getDailyComparison: () => {
  today: { total: number; byTimeOfDay: TimeOfDayBreakdown };
  yesterday: { total: number; byTimeOfDay: TimeOfDayBreakdown };
  changePercent: number;
};

// 週次比較
getWeeklyComparison: () => {
  currentWeek: { total: number; dailyAvg: number; data: DayData[] };
  previousWeek: { total: number; dailyAvg: number; data: DayData[] };
  changePercent: number;
};

// ベースライン日次換算
getBaselineDailyMinutes: () => number | null;

// 前週データ取得
getPreviousWeekData: () => DayData[];
```

### Calculation Logic

**変化率の計算:**
```typescript
const changePercent = previousMinutes > 0
  ? ((currentMinutes - previousMinutes) / previousMinutes) * 100
  : 0;
// 正=増加（悪化）、負=減少（改善）
```

**ベースライン削減率の計算:**
```typescript
const baselineDailyMinutes = baselineMonthlyMinutes / 30;
const currentDailyAvg = weeklyTotal / 7;
const reductionPercent = baselineDailyMinutes > 0
  ? ((baselineDailyMinutes - currentDailyAvg) / baselineDailyMinutes) * 100
  : null;
```

## Color Scheme

| 用途 | ライト | ダーク |
|------|--------|--------|
| 今日/今週の棒 | #059669 | #10B981 |
| 昨日/先週の棒 | #A8A29E | #57534E |
| 改善表示 (↓) | #059669 | #10B981 |
| 悪化表示 (↑) | #DC2626 | #EF4444 |
| ベースライン線 | #F59E0B | #FBBF24 |

## Animation

- **TabSelector切り替え**: `withSpring({ damping: 20, stiffness: 200 })`
- **ヒーロー数値変化**: `withSpring` でスムーズに変化
- **グラフ表示**: `FadeInDown.delay(index * 100)` で段階的に表示
- **棒グラフの伸び**: `withTiming({ duration: 500 })` で0から目標値へ

## i18n Keys

```json
{
  "statistics": {
    "day": "日",
    "week": "週",
    "today": "今日",
    "yesterday": "昨日",
    "thisWeek": "今週",
    "lastWeek": "先週",
    "todayUsage": "今日の使用時間",
    "weeklyUsage": "今週の使用時間",
    "vsYesterday": "昨日比",
    "vsLastWeek": "先週比",
    "fromBaseline": "開始時から",
    "reduction": "{{percent}}%削減達成",
    "increase": "{{percent}}%増加",
    "noChange": "変化なし",
    "morning": "朝",
    "daytime": "昼",
    "evening": "夕",
    "night": "夜",
    "legendToday": "今日",
    "legendYesterday": "昨日",
    "legendThisWeek": "今週",
    "legendLastWeek": "先週",
    "trendTitle": "過去4週間",
    "weeksAgo": "{{count}}週前"
  }
}
```
