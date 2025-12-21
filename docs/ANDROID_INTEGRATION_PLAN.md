# Android Screen Time Integration Implementation Plan

> **Document Purpose**: Android実装の現状分析と、統計画面・介入機能との統合計画
> **Created**: 2025-12-21
> **Status**: Review Required

---

## 1. Executive Summary

### 1.1 Current State
Android版では以下の機能が**既に実装済み**:
- ✅ UsageStatsManager による使用統計取得
- ✅ フォアグラウンドアプリ検知
- ✅ チェックインオーバーレイ（介入UI表示のみ）
- ✅ Foreground Service によるバックグラウンド監視
- ✅ インストール済みアプリ一覧取得
- ⚠️ カスタムアプリ: **監視のみ対応、統計取得は未対応**
  - `useMonitoringService` は `customApps` を監視対象に含む
  - `getTargetPackages()` は固定で `customApps` を含まない

### 1.2 Gap Analysis
**未実装・未統合の機能**:
- ❌ 統計画面でのリアルデータ表示
  - 現状: `index.tsx` は `useAppStore.stats` + `useStatisticsStore` を使用、データがない場合は固定値(streak=7等)にフォールバック
  - 現状: `statistics.tsx` は `useAppStore.stats` がない場合 `DEMO_WEEKLY_DATA` 配列にフォールバック
- ❌ オーバーレイから衝動サーフィング画面への遷移
- ❌ 介入記録の統計ストアへの保存（Native→RNイベント送信が未実装）
- ❌ 使用時間の時間帯別集計
- ❌ 週間・月間レポートへの実データ反映
- ❌ カスタムアプリの統計取得対応

---

## 2. Technical Analysis

### 2.1 Existing Android Native Module

**Location**: `/modules/screen-time-android/`

**Implemented APIs**:
```typescript
interface ScreenTimeAndroidModule {
  // Permission
  getPermissionStatus(): Promise<PermissionStatus>
  hasUsageStatsPermission(): Promise<boolean>
  hasOverlayPermission(): Promise<boolean>
  openUsageStatsSettings(): Promise<void>   // 設定画面を開く
  openOverlaySettings(): Promise<void>      // オーバーレイ設定を開く

  // Usage Stats
  getUsageStats(startTime: number, endTime: number, packageNames: string[]): Promise<UsageData[]>
  getTodayUsage(packageNames: string[]): Promise<UsageData[]>
  getCurrentForegroundApp(): Promise<string | null>

  // Installed Apps
  getInstalledApps(): Promise<InstalledAppInfo[]>
  getAppIcon(packageName: string): Promise<string | null>

  // Monitoring Service
  startMonitoring(packageNames: string[]): Promise<boolean>
  stopMonitoring(): Promise<boolean>
  isMonitoringActive(): Promise<boolean>
  updateTargetApps(packageNames: string[]): Promise<boolean>  // 監視対象を更新
}
```

**Data Types**:
- `UsageData`: `{ packageName, appName, totalTimeMs, lastUsed }`
- `PermissionStatus`: `{ usageStats: boolean, overlay: boolean, notifications: boolean }`

### 2.2 Current Monitoring Flow

```
┌──────────────────────────────────────────────────────────────┐
│                 CheckinForegroundService                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Every 1.5 seconds:                                          │
│    ↓                                                         │
│  [Check foreground app via UsageEvents]                      │
│    ↓                                                         │
│  [Is target app? (TikTok/YouTube/Instagram/customApps)]      │
│    ↓ Yes                                                     │
│  [Show check-in overlay]                                     │
│    ↓                                                         │
│  [User choice: Continue / Go Back]                           │
│    ↓                                                         │
│  [Cooldown: 5 minutes before next check-in]                  │
│    ↓                                                         │
│  ⚠️ [Native→RN イベント送信: 未実装]                          │
│     → 介入結果がReact Native側に通知されない                  │
│     → useStatisticsStore.recordIntervention() が呼ばれない    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.3 Current Statistics Store

**Location**: `/src/stores/useStatisticsStore.ts`

**Status**: Implemented but using mock data on Dashboard/Statistics screens

**Key Methods**:
- `recordUrgeSurfing()` - Works correctly
- `recordIntervention()` - Works correctly
- `getTodayStats()` - Returns data but screens use fallback mock
- `getWeeklyStats()` - Implemented

---

## 3. Implementation Tasks

### Phase 1: Statistics Integration (Priority: HIGH)

#### Task 1.1: Connect Real Usage Data to Dashboard
**Files to modify**:
- `app/(main)/index.tsx`
- `app/(main)/statistics.tsx`
- `src/hooks/useScreenTimeData.ts` (new)

**Implementation**:
```typescript
// src/hooks/useScreenTimeData.ts
import { getTargetPackages, getTodayUsage } from '@/native/ScreenTimeModule';
import { useAppStore } from '@/stores/useAppStore';

export function useScreenTimeData() {
  const [data, setData] = useState<UsageData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedApps, customApps } = useAppStore();

  useEffect(() => {
    if (Platform.OS === 'android') {
      loadRealData();
    }
  }, [selectedApps, customApps]);

  const loadRealData = async () => {
    // getTargetPackages() は固定アプリのみ返す（customApps含まず）
    const basePackages = getTargetPackages();
    // customApps のパッケージ名を追加
    const customPackages = customApps.map(app => app.packageName);
    const allPackages = [...basePackages, ...customPackages];

    const usage = await getTodayUsage(allPackages);
    setData(usage);
    setLoading(false);
  };

  return { data, loading, refresh: loadRealData };
}
```

**Acceptance Criteria**:
- [ ] Dashboard shows real usage time from Android
- [ ] Statistics screen shows real weekly data
- [ ] Loading state displayed while fetching
- [ ] Error handling for permission issues

#### Task 1.2: Time-of-Day Breakdown
**Files to modify**:
- `modules/screen-time-android/android/UsageStatsTracker.kt`
- `src/stores/useStatisticsStore.ts`

**Implementation**:
Add method to native module:
```kotlin
fun getUsageByTimeOfDay(packageNames: List<String>): Map<String, Long> {
    // Query usage events and categorize by hour
    // Return: { morning: ms, daytime: ms, evening: ms, night: ms }
}
```

#### Task 1.3: Custom Apps Statistics Support
**Problem**: 現在 `getTargetPackages()` はカスタムアプリを含まず、固定アプリ（TikTok/YouTube/Instagram）のみ返す

**Files to modify**:
- `src/native/ScreenTimeModule.ts`
- `src/hooks/useScreenTimeData.ts` (Task 1.1で新規作成)

**Current State**:
```typescript
// src/native/ScreenTimeModule.ts - 現状
export function getTargetPackages(): string[] {
  // 固定パッケージ名のみ、customApps は含まれない
  return ['com.zhiliaoapp.musically', 'com.google.android.youtube', 'com.instagram.android'];
}
```

**Implementation**:
```typescript
// 統計取得時に customApps を含める
// useScreenTimeData.ts (Task 1.1) で対応済み
// getTargetPackages() 自体は変更せず、呼び出し側で customApps を追加
```

**Acceptance Criteria**:
- [ ] カスタムアプリの使用時間がダッシュボードに表示される
- [ ] 統計画面でカスタムアプリのデータが集計される
- [ ] 監視と統計で同じアプリセットが使用される

### Phase 2: Intervention Integration (Priority: HIGH)

#### Task 2.1: Deep Link from Overlay to Urge Surfing
**Files to modify**:
- `modules/screen-time-android/android/OverlayController.kt`
- `app/(main)/urge-surfing.tsx`

**Implementation**:
- Add deep link handling: `stopshorts://urge-surfing?app=tiktok`
- Modify overlay "続ける" button to optionally launch urge surfing
- Pass blocked app name to urge surfing screen

**Flow**:
```
[Overlay shown]
    ↓
[User taps "戻る"]
    ↓
[Launch StopShorts with deep link]
    ↓
[Navigate to urge surfing screen]
    ↓
[Record intervention in statistics store]
```

#### Task 2.2: Record Interventions from Native Service
**Files to modify**:
- `modules/screen-time-android/android/CheckinForegroundService.kt`
- `src/hooks/useMonitoringService.ts`

**Implementation**:
- Emit events from native service when intervention occurs
- Listen for events in React Native and record to store
- Track: app name, timestamp, user choice (dismissed/proceeded)

```typescript
// Event listener in useMonitoringService
DeviceEventEmitter.addListener('intervention', (event) => {
  recordIntervention(event.proceeded);
  if (!event.proceeded) {
    // User dismissed - this counts as success
    incrementDismissCount();
  }
});
```

### Phase 3: Enhanced Statistics Display (Priority: MEDIUM)

#### Task 3.1: Real-time Usage Updates
**Files to modify**:
- `app/(main)/index.tsx`
- `src/hooks/useRealTimeUsage.ts` (new)

**Implementation**:
- Poll usage data every 30 seconds when app is in foreground
- Update dashboard stats in real-time
- Show "last updated" timestamp

#### Task 3.2: App-specific Breakdown
**Files to modify**:
- `app/(main)/statistics.tsx`
- `src/components/ui/AppUsageBreakdown.tsx` (new)

**Implementation**:
- Show usage time per app with icons
- Pie chart or bar chart visualization
- Compare with previous period

### Phase 4: Documentation Cleanup (Priority: MEDIUM)

#### Task 4.1: Consolidate Overlapping Docs
**Actions**:
1. Archive `specs/01_requirements.md` as legacy (outdated onboarding)
2. Merge `ANDROID_ONBOARDING_USAGE_REVIEW.md` findings into this plan
3. Update `README.md` with clear document hierarchy
4. Remove or archive unused docs:
   - `specs/03_internationalization.md` (too basic)
   - `specs/05_new_features_v2.md` (far future)
   - `GEMINI_PROMPT.md` (tool-specific)

#### Task 4.2: Update Implementation Status
**Files to update**:
- `docs/ROADMAP.md` - Mark Android integration as in-progress
- `docs/requirements_implementation_matrix.md` - Update Android column
- `docs/ANDROID_IMPLEMENTATION_PLAN.md` - Mark completed items

---

## 4. Data Flow Architecture (Target State)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Android Native Layer                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────┐    ┌───────────────────┐                │
│  │ UsageStatsManager │    │ CheckinForeground │                │
│  │    (Tracking)     │    │     Service       │                │
│  └─────────┬─────────┘    └────────┬──────────┘                │
│            │                       │                            │
│            │    Events             │   Interventions            │
│            ▼                       ▼                            │
│  ┌─────────────────────────────────────────────┐               │
│  │         ScreenTimeAndroidModule              │               │
│  │           (Expo Native Module)               │               │
│  └────────────────────┬────────────────────────┘               │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │ React Native Bridge
                        ▼
┌───────────────────────────────────────────────────────────────────┐
│                      React Native Layer                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐    ┌─────────────────────┐              │
│  │  useScreenTimeData  │    │ useMonitoringService│              │
│  │       (Hook)        │    │       (Hook)        │              │
│  └──────────┬──────────┘    └──────────┬──────────┘              │
│             │                          │                          │
│             ▼                          ▼                          │
│  ┌────────────────────────────────────────────────┐              │
│  │              useStatisticsStore                 │              │
│  │         (Zustand + AsyncStorage)                │              │
│  └────────────────────┬───────────────────────────┘              │
│                       │                                           │
│                       ▼                                           │
│  ┌──────────────────────────────────────────────────┐            │
│  │                    UI Components                  │            │
│  │  Dashboard │ Statistics │ Urge Surfing │ Profile  │            │
│  └──────────────────────────────────────────────────┘            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 5. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| UsageStats permission revoked by user | High | Medium | Check permission on app resume, prompt re-grant |
| Overlay permission revoked | High | Medium | Disable monitoring gracefully, notify user |
| Battery optimization kills service | Medium | High | Use START_STICKY, request battery exemption |
| Memory pressure kills service | Medium | Medium | Persist state to SharedPreferences |
| Data sync issues (native ↔ RN) | Low | Medium | Use atomic updates, validate data on read |

---

## 6. Testing Strategy

### 6.1 Unit Tests
- [ ] UsageStatsTracker date range queries
- [ ] Statistics store aggregation logic
- [ ] Badge condition checking

### 6.2 Integration Tests
- [ ] Native module ↔ React Native bridge
- [ ] Monitoring service lifecycle
- [ ] Deep link handling

### 6.3 Manual Tests
- [ ] Permission grant/revoke flows
- [ ] Overlay display on target app launch
- [ ] Statistics accuracy vs system settings
- [ ] Battery/memory pressure scenarios

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Statistics accuracy | ±5% vs Android settings | Compare daily totals |
| Intervention trigger rate | 100% when target app opens | Monitor service logs |
| Data sync reliability | 99%+ | Track failed saves |
| User engagement | 3+ urge surfing/day | Analytics |

---

## 8. Timeline Estimate

| Phase | Tasks | Duration | Dependencies |
|-------|-------|----------|--------------|
| Phase 1 | Statistics Integration | 2-3 days | None |
| Phase 2 | Intervention Integration | 2-3 days | Phase 1 |
| Phase 3 | Enhanced Display | 2 days | Phase 1 |
| Phase 4 | Doc Cleanup | 1 day | None |

**Total: 7-9 days**

---

## 9. Appendix: File Inventory

### Native Module Files
| File | Purpose |
|------|---------|
| `modules/screen-time-android/index.ts` | TypeScript type definitions |
| `modules/screen-time-android/android/ScreenTimeAndroidModule.kt` | Main Expo Module |
| `modules/screen-time-android/android/UsageStatsTracker.kt` | Usage stats logic |
| `modules/screen-time-android/android/CheckinForegroundService.kt` | Background monitoring |
| `modules/screen-time-android/android/OverlayController.kt` | Overlay UI |
| `modules/screen-time-android/android/InstalledAppsHelper.kt` | App enumeration |

### React Native Files
| File | Purpose |
|------|---------|
| `src/native/ScreenTimeModule.ts` | Cross-platform wrapper |
| `src/hooks/useMonitoringService.ts` | Service lifecycle hook |
| `src/stores/useStatisticsStore.ts` | Statistics state management |
| `src/stores/useAppStore.ts` | App-wide state (selected apps, etc.) |

### Screen Files
| File | Purpose |
|------|---------|
| `app/(main)/index.tsx` | Dashboard (needs real data) |
| `app/(main)/statistics.tsx` | Statistics (needs real data) |
| `app/(main)/urge-surfing.tsx` | Urge surfing screen |
| `app/(main)/shield.tsx` | Shield modal |

---

## 10. Review Checklist

Before implementation:
- [ ] Codex review of this plan
- [ ] Confirm native module API is sufficient
- [ ] Verify deep link handling approach
- [ ] Validate data structure compatibility

After implementation:
- [ ] Code review for each phase
- [ ] Manual testing on multiple Android devices
- [ ] Performance profiling (battery, memory)
- [ ] Documentation updates

---

*Document Version: 1.0*
*Last Updated: 2025-12-21*
