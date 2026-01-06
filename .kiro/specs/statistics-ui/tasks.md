# Statistics UI Improvement - Tasks

## Parallel Execution Strategy

このタスクは4つの独立したブランチで並列実行可能です。
各タスクは独立して完了し、最後にメインブランチにマージします。

| Task | Branch | Dependencies |
|------|--------|--------------|
| A: Data Layer | `feature/statistics-data-layer` | None |
| B: Tab + Hero UI | `feature/statistics-tab-hero` | None (uses mock data) |
| C: Chart Components | `feature/statistics-charts` | None (uses mock data) |
| D: i18n | `feature/statistics-i18n` | None |

## Task A: Data Layer Extension

**Branch:** `feature/statistics-data-layer`
**Files:**
- `src/stores/useStatisticsStore.ts` (modify)
- `src/types/statistics.ts` (modify if needed)

### A-1: getDailyComparison() メソッド追加
```typescript
getDailyComparison: () => ({
  today: { total: number; byTimeOfDay: TimeOfDayBreakdown },
  yesterday: { total: number; byTimeOfDay: TimeOfDayBreakdown },
  changePercent: number
})
```
- 今日と昨日のdailyStatsを取得
- 変化率を計算（正=増加、負=減少）
- データがない場合は0を返す

### A-2: getWeeklyComparison() メソッド追加
```typescript
getWeeklyComparison: () => ({
  currentWeek: { total: number; dailyAvg: number; data: DayData[] },
  previousWeek: { total: number; dailyAvg: number; data: DayData[] },
  changePercent: number
})
```
- 今週と先週の日別データを取得
- 既存のgetWeeklyStats()を参考に実装
- DayData形式: `{ day: 'MON', value: 120 }`

### A-3: getBaselineDailyMinutes() メソッド追加
```typescript
getBaselineDailyMinutes: () => number | null
```
- useAppStoreからbaselineMonthlyMinutesを取得
- 30で割って日次に換算
- ベースラインがない場合はnullを返す

### A-4: getPreviousWeekData() メソッド追加
```typescript
getPreviousWeekData: () => DayData[]
```
- 7日前〜14日前のデータを取得
- DayData[]形式で返す

**完了条件:**
- [ ] `npx tsc --noEmit` エラー0
- [ ] 全メソッドが正しく型付けされている
- [ ] 既存のテストが通る

---

## Task B: Tab + Hero UI Components

**Branch:** `feature/statistics-tab-hero`
**Files:**
- `src/components/statistics/TabSelector.tsx` (create)
- `src/components/statistics/ComparisonHero.tsx` (create)
- `src/components/statistics/index.ts` (create)

### B-1: TabSelector.tsx 作成
```typescript
interface TabSelectorProps {
  selectedTab: 'day' | 'week';
  onTabChange: (tab: 'day' | 'week') => void;
}
```
- セグメントコントロール形式
- アニメーション付きタブ切り替え
- useTheme()でカラー取得
- i18nキー: statistics.day, statistics.week

### B-2: ComparisonHero.tsx 作成
```typescript
interface ComparisonHeroProps {
  mode: 'day' | 'week';
  currentMinutes: number;
  previousMinutes: number;
  changePercent: number;
  baselineReduction: number | null;
}
```
- 使用時間を大きく表示（formatTime関数で1h 45m形式）
- 変化率を色付きで表示（↓緑、↑赤）
- ベースライン削減率を表示

### B-3: index.ts 作成
```typescript
export { TabSelector } from './TabSelector';
export { ComparisonHero } from './ComparisonHero';
```

**完了条件:**
- [ ] `npx tsc --noEmit` エラー0
- [ ] ダーク/ライトテーマ両対応
- [ ] FadeInDownアニメーション適用

---

## Task C: Chart Components

**Branch:** `feature/statistics-charts`
**Files:**
- `src/components/statistics/DailyComparisonChart.tsx` (create)
- `src/components/statistics/WeeklyComparisonChart.tsx` (create)
- `src/components/statistics/TrendChart.tsx` (create)
- `src/components/statistics/index.ts` (update)

### C-1: DailyComparisonChart.tsx 作成
```typescript
interface TimeOfDayBreakdown {
  morning: number;
  daytime: number;
  evening: number;
  night: number;
}

interface DailyComparisonChartProps {
  today: TimeOfDayBreakdown;
  yesterday: TimeOfDayBreakdown;
  baselineDailyMinutes?: number;
}
```
- react-native-svgで描画
- 時間帯別並列棒グラフ（4組）
- 凡例: ■今日 ■昨日
- ベースライン破線（オプション）

### C-2: WeeklyComparisonChart.tsx 作成
```typescript
interface DayData {
  day: string;
  value: number;
}

interface WeeklyComparisonChartProps {
  currentWeek: DayData[];
  previousWeek: DayData[];
  baselineDailyMinutes?: number;
}
```
- react-native-svgで描画
- 日別並列棒グラフ（7組）
- 凡例: ■今週 ■先週
- ベースライン破線

### C-3: TrendChart.tsx 作成
```typescript
interface TrendChartProps {
  weeklyTotals: number[];
  labels?: string[];
}
```
- 4週間のミニ棒グラフ
- グラデーションで新しい週を強調

### C-4: index.ts 更新
全コンポーネントをexport

**完了条件:**
- [ ] `npx tsc --noEmit` エラー0
- [ ] 既存のWeeklyBarChart.tsxのパターンを参考に実装
- [ ] useMemoで計算をメモ化

---

## Task D: i18n Keys

**Branch:** `feature/statistics-i18n`
**Files:**
- `src/i18n/locales/ja.json` (modify)

### D-1: 翻訳キー追加
statisticsセクションに以下を追加:

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

**完了条件:**
- [ ] JSONが有効（パースエラーなし）
- [ ] 既存キーと重複なし

---

## Integration Task (After Merge)

全ブランチをマージ後、`app/(main)/statistics.tsx` を手動で統合:

1. タブ状態管理を追加
2. TabSelector配置
3. ComparisonHero配置（タブに応じてprops変更）
4. 日タブ: DailyComparisonChart表示
5. 週タブ: WeeklyComparisonChart + TrendChart表示
6. 既存コンポーネント（StatCard, バッジ）維持

```typescript
// statistics.tsx の変更イメージ
const [selectedTab, setSelectedTab] = useState<'day' | 'week'>('day');

const dailyComparison = useStatisticsStore(state => state.getDailyComparison());
const weeklyComparison = useStatisticsStore(state => state.getWeeklyComparison());
const baselineDailyMinutes = useStatisticsStore(state => state.getBaselineDailyMinutes());

return (
  <ScrollView>
    <TabSelector selectedTab={selectedTab} onTabChange={setSelectedTab} />

    {selectedTab === 'day' ? (
      <>
        <ComparisonHero
          mode="day"
          currentMinutes={dailyComparison.today.total}
          previousMinutes={dailyComparison.yesterday.total}
          changePercent={dailyComparison.changePercent}
          baselineReduction={...}
        />
        <DailyComparisonChart
          today={dailyComparison.today.byTimeOfDay}
          yesterday={dailyComparison.yesterday.byTimeOfDay}
        />
      </>
    ) : (
      <>
        <ComparisonHero
          mode="week"
          currentMinutes={weeklyComparison.currentWeek.total}
          previousMinutes={weeklyComparison.previousWeek.total}
          changePercent={weeklyComparison.changePercent}
          baselineReduction={...}
        />
        <WeeklyComparisonChart
          currentWeek={weeklyComparison.currentWeek.data}
          previousWeek={weeklyComparison.previousWeek.data}
        />
        <TrendChart weeklyTotals={...} />
      </>
    )}

    {/* 既存のStatCard, バッジグリッド */}
  </ScrollView>
);
```
