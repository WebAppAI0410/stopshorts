# Android Screen Time Integration - 実装レビュー文書

## 概要

このドキュメントは、Android Screen Time統合の実装内容をまとめたものです。
Codexによるコードレビュー用に作成されました。

### 実装目的

1. **Dashboard/Statistics画面に実データを表示** - Android UsageStatsManagerから取得した実際の使用時間データを表示
2. **介入イベントの記録** - オーバーレイでのユーザー選択をReact Native側で受信・記録
3. **Urge Surfing Deep Link連携** - オーバーレイから衝動サーフィング画面へのディープリンク

---

## 変更ファイル一覧

### 新規作成ファイル

| ファイル | 説明 |
|----------|------|
| `src/hooks/useScreenTimeData.ts` | Android使用データ取得フック |

### 変更ファイル（TypeScript/React Native）

| ファイル | 変更内容 |
|----------|----------|
| `src/hooks/useMonitoringService.ts` | 介入イベントリスナー追加 |
| `modules/screen-time-android/index.ts` | イベントエミッター対応 |
| `app/(main)/index.tsx` | Dashboard実データ表示 |
| `app/(main)/statistics.tsx` | Statistics実データ表示 |
| `app/(main)/urge-surfing.tsx` | Deep Linkパラメータ処理 |

### 変更ファイル（Kotlin/Native）

| ファイル | 変更内容 |
|----------|----------|
| `ScreenTimeAndroidModule.kt` | 介入イベントブロードキャスト受信・RNへ送信 |
| `CheckinForegroundService.kt` | イベント送信、Deep Link起動 |
| `OverlayController.kt` | 衝動サーフィングボタン追加 |

---

## 実装詳細

### 1. useScreenTimeData フック

**ファイル:** `src/hooks/useScreenTimeData.ts`

Android UsageStatsManagerから実際の使用時間データを取得するReactフック。

```typescript
export function useScreenTimeData(): UseScreenTimeDataReturn {
  const [state, setState] = useState<ScreenTimeDataState>({
    todayData: null,
    weeklyData: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const customApps = useAppStore((s) => s.customApps);

  // Memoize custom app package names to prevent infinite loops
  const customPackages = useMemo(
    () => customApps.map((app) => app.packageName),
    [customApps]
  );

  const refreshToday = useCallback(async () => {
    if (Platform.OS !== 'android') {
      // iOS: Use mock data for now
      const mockData = await screenTimeService.getTodayUsage();
      setState((prev) => ({ ...prev, todayData: mockData, lastUpdated: new Date() }));
      return;
    }

    try {
      const data = await screenTimeService.getTodayUsage(customPackages);
      setState((prev) => ({ ...prev, todayData: data, error: null, lastUpdated: new Date() }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: 'Failed to fetch today usage data' }));
    }
  }, [customPackages]);

  // ... refreshWeekly, refresh similar implementation
}
```

**設計ポイント:**
- `customPackages`を`useMemo`でメモ化し、無限ループを防止
- プラットフォーム判定（Android/iOS）を行い、iOSではモックデータを返す
- `useRealTimeUsage`フックでは`useRef`を使用してstale closure問題を回避

---

### 2. Native→React Native イベント送信

**アーキテクチャ:**

```
[CheckinForegroundService]
    ↓ (ユーザーがオーバーレイで選択)
    ↓ sendInterventionEvent()
    ↓
[BroadcastReceiver in ScreenTimeAndroidModule]
    ↓ onReceive()
    ↓ sendEvent("onIntervention", ...)
    ↓
[NativeEventEmitter in React Native]
    ↓ addListener("onIntervention")
    ↓
[useMonitoringService]
    ↓ recordIntervention()
    ↓
[useStatisticsStore]
```

**Kotlin側 (CheckinForegroundService.kt):**

```kotlin
private var currentDetectedApp: String? = null

private fun sendInterventionEvent(proceeded: Boolean, appPackage: String) {
    val intent = Intent(ScreenTimeAndroidModule.ACTION_INTERVENTION_EVENT).apply {
        putExtra(ScreenTimeAndroidModule.EXTRA_PROCEEDED, proceeded)
        putExtra(ScreenTimeAndroidModule.EXTRA_APP_PACKAGE, appPackage)
        putExtra(ScreenTimeAndroidModule.EXTRA_TIMESTAMP, System.currentTimeMillis())
        setPackage(applicationContext.packageName)
    }
    applicationContext.sendBroadcast(intent)
}

private fun setupOverlayCallback() {
    overlayController.setCallback(object : OverlayController.OverlayCallback {
        override fun onContinueAnyway() {
            sendInterventionEvent(proceeded = true, appPackage = currentDetectedApp ?: "")
        }

        override fun onGoBack() {
            val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            applicationContext.startActivity(homeIntent)
            sendInterventionEvent(proceeded = false, appPackage = currentDetectedApp ?: "")
        }

        override fun onUrgeSurfing() {
            val appPackage = currentDetectedApp ?: ""
            val deepLinkUri = android.net.Uri.parse("stopshorts://urge-surfing?app=$appPackage")
            val deepLinkIntent = Intent(Intent.ACTION_VIEW, deepLinkUri).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                setPackage(applicationContext.packageName)
            }
            applicationContext.startActivity(deepLinkIntent)
            sendInterventionEvent(proceeded = false, appPackage = appPackage)
        }
    })
}
```

**Kotlin側 (ScreenTimeAndroidModule.kt):**

```kotlin
companion object {
    const val ACTION_INTERVENTION_EVENT = "com.stopshorts.screentime.INTERVENTION_EVENT"
    const val EXTRA_PROCEEDED = "proceeded"
    const val EXTRA_APP_PACKAGE = "app_package"
    const val EXTRA_TIMESTAMP = "timestamp"
}

private var interventionReceiver: BroadcastReceiver? = null

private fun registerInterventionReceiver() {
    interventionReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context?, intent: Intent?) {
            if (intent?.action == ACTION_INTERVENTION_EVENT) {
                val proceeded = intent.getBooleanExtra(EXTRA_PROCEEDED, false)
                val appPackage = intent.getStringExtra(EXTRA_APP_PACKAGE) ?: ""
                val timestamp = intent.getLongExtra(EXTRA_TIMESTAMP, System.currentTimeMillis())

                sendEvent("onIntervention", mapOf(
                    "proceeded" to proceeded,
                    "appPackage" to appPackage,
                    "timestamp" to timestamp
                ))
            }
        }
    }

    val filter = IntentFilter(ACTION_INTERVENTION_EVENT)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        appContext.registerReceiver(interventionReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
        appContext.registerReceiver(interventionReceiver, filter)
    }
}
```

**TypeScript側 (modules/screen-time-android/index.ts):**

```typescript
import { NativeEventEmitter, NativeModules, EmitterSubscription } from 'react-native';

export interface InterventionEvent {
  proceeded: boolean;
  appPackage: string;
  timestamp: number;
}

let emitter: NativeEventEmitter | null = null;

function getEmitter(): NativeEventEmitter {
  if (!emitter) {
    emitter = new NativeEventEmitter(NativeModules.ScreenTimeAndroid || ScreenTimeAndroidModule as any);
  }
  return emitter;
}

export function addInterventionListener(listener: (event: InterventionEvent) => void): EmitterSubscription {
  return getEmitter().addListener('onIntervention', listener);
}
```

**TypeScript側 (useMonitoringService.ts):**

```typescript
const isMountedRef = useRef(true);

// Track mounted state for async operations
useEffect(() => {
  isMountedRef.current = true;
  return () => {
    isMountedRef.current = false;
  };
}, []);

// Listen for intervention events from native module
useEffect(() => {
  if (Platform.OS !== 'android') return;

  const setupInterventionListener = async () => {
    try {
      const module = await import('@stopshorts/screen-time-android');
      const { addInterventionListener } = module;

      // Check if still mounted before setting up listener
      if (!isMountedRef.current) return;

      if (interventionListenerRef.current) {
        interventionListenerRef.current.remove();
      }

      interventionListenerRef.current = addInterventionListener((event) => {
        // Validate event structure before using
        if (event && typeof event.proceeded === 'boolean') {
          recordIntervention(event.proceeded);
        }
      });
    } catch (error) {
      console.warn('[MonitoringService] Failed to set up intervention listener:', error);
    }
  };

  setupInterventionListener();

  return () => {
    if (interventionListenerRef.current) {
      interventionListenerRef.current.remove();
      interventionListenerRef.current = null;
    }
  };
}, [recordIntervention]);
```

---

### 3. Deep Link対応（Urge Surfing）

**ファイル:** `app/(main)/urge-surfing.tsx`

オーバーレイからのディープリンク（`stopshorts://urge-surfing?app=<packageName>`）を処理。

```typescript
const PACKAGE_TO_APP_NAME: Record<string, string> = {
  'com.zhiliaoapp.musically': 'TikTok',
  'com.ss.android.ugc.trill': 'TikTok',
  'com.google.android.youtube': 'YouTube',
  'com.instagram.android': 'Instagram',
  'com.twitter.android': 'Twitter',
  'com.facebook.katana': 'Facebook',
  'com.snapchat.android': 'Snapchat',
};

const params = useLocalSearchParams<{
  app?: string;
  appName?: string;
  source?: string;
}>();

const getAppDisplayName = (): string => {
  if (params.appName) return params.appName;
  if (params.app && PACKAGE_TO_APP_NAME[params.app]) {
    return PACKAGE_TO_APP_NAME[params.app];
  }
  return 'TikTok';
};

// Validate source parameter - only accept known values
const getValidSource = (): 'shield' | 'training' | 'manual' => {
  const validSources = ['shield', 'training', 'manual'] as const;
  if (params.source && validSources.includes(params.source as typeof validSources[number])) {
    return params.source as 'shield' | 'training' | 'manual';
  }
  return params.app ? 'shield' : 'manual';
};
```

---

### 4. Dashboard/Statistics 実データ表示

**Dashboard (app/(main)/index.tsx):**

```typescript
const { todayData, loading: screenTimeLoading } = useScreenTimeData();

// Use real data on Android, fall back to stats on iOS
const hasRealScreenTimeData = Platform.OS === 'android' && todayData && todayData.totalMinutes > 0;
const todayUsageMinutes = hasRealScreenTimeData
  ? todayData.totalMinutes
  : (stats.find(s => s.date === new Date().toISOString().split('T')[0])?.totalBlockedMinutes || 0);
```

**Statistics (app/(main)/statistics.tsx):**

```typescript
const { weeklyData: nativeWeeklyData, loading: screenTimeLoading } = useScreenTimeData();

const hasRealScreenTimeData = Platform.OS === 'android' && nativeWeeklyData && nativeWeeklyData.weeklyTotal > 0;

// Use real data if available, otherwise use stats from store
const weeklyData = hasRealScreenTimeData
  ? nativeWeeklyData.dailyBreakdown.map(d => ({ date: d.date, minutes: d.minutes }))
  : weekDates.map(date => ({
      date,
      minutes: stats.find(s => s.date === date)?.totalBlockedMinutes || 0,
    }));
```

---

### 5. オーバーレイUI更新

**ファイル:** `modules/screen-time-android/android/.../OverlayController.kt`

衝動サーフィングボタンを追加。

```kotlin
interface OverlayCallback {
    fun onContinueAnyway()
    fun onGoBack()
    fun onUrgeSurfing()  // 新規追加
}

// Urge Surfing button (primary action - helps user manage urge)
val urgeSurfingButton = Button(context).apply {
    text = "🌊 衝動サーフィングを試す"
    textSize = 16f
    setTextColor(Color.WHITE)
    setBackgroundColor(Color.parseColor("#1E3A5F")) // Primary color
    typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
    isAllCaps = false
    layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        dpToPx(48)
    ).apply {
        bottomMargin = dpToPx(12)
    }

    setOnClickListener {
        callback?.onUrgeSurfing()
        hideOverlay()
    }
}
```

---

## コードレビューで修正した問題

### 1. 無限ループ防止（Critical）

**問題:** `customPackages`配列が毎レンダーで新規作成され、`useCallback`の依存関係が変化し続けて無限ループが発生する可能性があった。

**修正:**
```typescript
// Before (問題あり)
const customPackages = customApps.map((app) => app.packageName);

// After (修正済み)
const customPackages = useMemo(
  () => customApps.map((app) => app.packageName),
  [customApps]
);
```

**該当ファイル:**
- `src/hooks/useScreenTimeData.ts`
- `src/hooks/useMonitoringService.ts`

### 2. レース条件防止（Important）

**問題:** 非同期の`setupInterventionListener`関数内でコンポーネントがアンマウントされた後にリスナーを設定しようとする可能性があった。

**修正:**
```typescript
const isMountedRef = useRef(true);

useEffect(() => {
  isMountedRef.current = true;
  return () => {
    isMountedRef.current = false;
  };
}, []);

// 非同期関数内でチェック
if (!isMountedRef.current) return;
```

### 3. イベント検証（Important）

**問題:** ネイティブモジュールから受信したイベントの構造を検証せずに使用していた。

**修正:**
```typescript
interventionListenerRef.current = addInterventionListener((event) => {
  // Validate event structure before using
  if (event && typeof event.proceeded === 'boolean') {
    recordIntervention(event.proceeded);
  } else {
    console.warn('[MonitoringService] Invalid intervention event:', event);
  }
});
```

### 4. Deep Linkパラメータ検証（Important）

**問題:** `source`パラメータを検証なしでキャストしていた。

**修正:**
```typescript
const getValidSource = (): 'shield' | 'training' | 'manual' => {
  const validSources = ['shield', 'training', 'manual'] as const;
  if (params.source && validSources.includes(params.source as typeof validSources[number])) {
    return params.source as 'shield' | 'training' | 'manual';
  }
  return params.app ? 'shield' : 'manual';
};
```

### 5. Stale Closure防止（Medium）

**問題:** `useRealTimeUsage`フックで`refresh`関数がstale closureになる可能性があった。

**修正:**
```typescript
const refreshRef = useRef(refresh);
refreshRef.current = refresh;

useEffect(() => {
  const interval = setInterval(() => {
    refreshRef.current();  // refを使用してstale closure回避
  }, intervalMs);

  return () => clearInterval(interval);
}, [intervalMs]);  // refreshを依存関係から削除
```

---

## レビュー観点

以下の観点でのレビューをお願いします：

1. **エラーハンドリング** - try-catchブロックの適切な使用、エラーメッセージの明確さ
2. **メモリリーク** - イベントリスナーのクリーンアップ、useEffectのクリーンアップ関数
3. **型安全性** - TypeScript型定義の正確さ、any型の使用
4. **React Hooksルール** - 依存関係配列の正確さ、無限ループの可能性
5. **プラットフォーム分岐** - Android/iOSの適切な分岐処理
6. **セキュリティ** - ブロードキャストのパッケージ制限、入力検証
7. **パフォーマンス** - 不要な再レンダリング、メモ化の適切な使用

---

## テスト手順

### 1. 基本動作確認

```bash
# TypeScript型チェック
npx tsc --noEmit

# Android開発ビルド
eas build --platform android --profile development
```

### 2. 実機テスト項目

1. **Dashboard表示**
   - Androidで実際の使用時間が表示されることを確認
   - iOSでモックデータが表示されることを確認

2. **Statistics表示**
   - 週間データが正しく表示されることを確認
   - 日別の内訳が表示されることを確認

3. **オーバーレイ動作**
   - ターゲットアプリ起動時にオーバーレイが表示されることを確認
   - 「衝動サーフィングを試す」ボタンでアプリに遷移することを確認
   - 「戻る」ボタンでホーム画面に戻ることを確認
   - 「そのまま続ける」ボタンでオーバーレイが閉じることを確認

4. **介入イベント記録**
   - オーバーレイ操作後にStatistics画面で介入回数が更新されることを確認

---

## 関連ドキュメント

- `docs/ANDROID_INTEGRATION_PLAN.md` - 実装計画書
- `docs/HABIT_COACHING_FEATURE.md` - 機能仕様書
- `docs/README.md` - ドキュメント一覧

---

## レビュー指摘（事実ベース）

### High
1) **オンボーディングでの「選択アプリ」反映が未達**
   - `useScreenTimeData` は **customAppsのみ**渡しており、既定ターゲット（TikTok/YouTube/Instagram）＋customAppsが常に計測対象になる
   - ユーザーがオンボーディングで外したアプリも取得に含まれる
   - 参照: `src/hooks/useScreenTimeData.ts`, `src/native/ScreenTimeModule.ts#L226-L233`

2) **customAppsが同数で入れ替わると再取得されない**
   - `useScreenTimeData` の refresh は `customPackages.length` のみを監視
   - 数が同じで入れ替わった場合、データが更新されない
   - 参照: `src/hooks/useScreenTimeData.ts`

### Medium
3) **介入イベント記録が「proceeded」だけ**
   - 文書では appPackage / timestamp を送る前提だが、
     `recordIntervention` は proceededのみ記録
   - アプリ別/時間帯別の統計に使えない
   - 参照: `src/hooks/useMonitoringService.ts`, `src/stores/useStatisticsStore.ts#L166-L193`

4) **“リアルデータ表示”の定義が曖昧**
   - Androidでも `todayData.totalMinutes == 0` だとデモモード扱い
   - 権限未許可/取得失敗と区別されず誤解されやすい
   - 参照: `app/(main)/index.tsx`, `app/(main)/statistics.tsx`

### Low
5) **iOSのモック表示が実データに見える可能性**
   - iOSは `screenTimeService.getTodayUsage()` のモック
   - UI上の明示がないため誤認の余地あり
   - 参照: `src/hooks/useScreenTimeData.ts`
