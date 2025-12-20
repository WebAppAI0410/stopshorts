# Android対応 実装計画書

## 1. 概要

StopShortsアプリをAndroidプラットフォームに対応させるための実装計画書です。
iOSのScreen Time API（Family Controls）とは異なり、Androidでは**UsageStatsManager + オーバーレイ**方式を採用します。

### 1.1 基本方針

```
┌─────────────────────────────────────────────────────────────┐
│  StopShorts アーキテクチャ                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  共通層 (React Native + Expo) - 約90%               │   │
│  │  UI / ビジネスロジック / 状態管理 / アニメーション      │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│            ┌─────────────┴─────────────┐                   │
│            ▼                           ▼                    │
│  ┌─────────────────────┐   ┌─────────────────────┐        │
│  │  iOS Native Module  │   │ Android Native Module│        │
│  │  Family Controls    │   │ UsageStats + Overlay │        │
│  │  ManagedSettings    │   │ Foreground Service   │        │
│  └─────────────────────┘   └─────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. iOS vs Android 機能比較

| 機能 | iOS | Android | 備考 |
|------|-----|---------|------|
| **使用時間取得** | Screen Time API | UsageStatsManager | 両方ユーザー許可必須 |
| **アプリ完全ブロック** | ✅ ManagedSettingsStore | ❌ 不可能 | Androidは代替方式 |
| **操作妨害（実質ブロック）** | Shield UI | オーバーレイ | 両方実現可能 |
| **バックグラウンド監視** | DeviceActivity | Foreground Service | 実装方式が異なる |
| **事前申請** | Family Controls entitlement | 不要 | Androidはユーザー許可のみ |
| **審査リスク** | Apple審査 | Google Playポリシー | 両方注意必要 |

### 2.1 Androidで採用するパターン

**パターンA: 一般消費者向け（Google Play公開可能）**

| コンポーネント | 実装方式 | 必要権限 |
|----------------|----------|----------|
| 計測 | UsageStatsManager | PACKAGE_USAGE_STATS |
| 強制（実質ブロック） | オーバーレイ表示 | SYSTEM_ALERT_WINDOW |
| 監視 | Foreground Service | FOREGROUND_SERVICE |

**不採用のパターン**
- パターンB（Device Owner）: 企業管理端末専用、一般向けではない
- パターンC（AccessibilityService）: Google Playポリシー違反リスク高

---

## 3. Android実装アーキテクチャ

### 3.1 システム構成図

```
┌─────────────────────────────────────────────────────────────┐
│  React Native Layer                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  src/native/ScreenTimeModule.ts                      │   │
│  │  - 共通インターフェース                               │   │
│  │  - Platform.OS による分岐                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  modules/screen-time-android/                        │   │
│  │  Expo Native Module (Kotlin)                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Android Native Layer (Kotlin)                              │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ UsageStatsTracker│  │ OverlayController│                 │
│  │ - queryEvents() │  │ - showCheckin() │                  │
│  │ - getForeground │  │ - hideOverlay() │                  │
│  └────────┬────────┘  └────────┬────────┘                  │
│           │                    │                            │
│           ▼                    ▼                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  CheckinForegroundService                            │   │
│  │  - 対象アプリ監視                                     │   │
│  │  - 5分ごとにチェックイン発火                          │   │
│  │  - オーバーレイ表示トリガー                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 モジュール構成

```
modules/
├── screen-time/                    # 既存（iOS用）
│   ├── src/
│   │   └── ScreenTimeModule.swift
│   └── expo-module.config.json
│
└── screen-time-android/            # 新規作成
    ├── android/
    │   └── src/main/
    │       ├── java/com/stopshorts/screentime/
    │       │   ├── ScreenTimeAndroidModule.kt      # Expoモジュール
    │       │   ├── UsageStatsTracker.kt            # 使用時間取得
    │       │   ├── OverlayController.kt            # オーバーレイ制御
    │       │   ├── CheckinForegroundService.kt     # バックグラウンド監視
    │       │   └── PermissionHelper.kt             # 権限管理
    │       └── res/
    │           └── layout/
    │               └── overlay_checkin.xml         # チェックインUI
    ├── index.ts
    ├── expo-module.config.json
    └── package.json
```

---

## 4. 必要な権限とユーザー許可フロー

### 4.1 必要な権限

```xml
<!-- AndroidManifest.xml -->

<!-- 使用状況アクセス（ユーザー許可必須） -->
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS"
    tools:ignore="ProtectedPermissions" />

<!-- オーバーレイ表示（ユーザー許可必須） -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

<!-- フォアグラウンドサービス -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />

<!-- 通知 -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- バッテリー最適化除外（オプション） -->
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
```

### 4.2 ユーザー許可フロー

```
┌─────────────────────────────────────────────────────────────┐
│  オンボーディング: 権限許可フロー                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: 使用状況アクセス許可                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  「使用状況を確認するために、                         │   │
│  │    使用状況へのアクセスを許可してください」            │   │
│  │                                                     │   │
│  │  [設定を開く] → Settings.ACTION_USAGE_ACCESS_SETTINGS │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: オーバーレイ許可                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  「5分ごとの確認画面を表示するために、                │   │
│  │    他のアプリの上に表示を許可してください」            │   │
│  │                                                     │   │
│  │  [設定を開く] → Settings.ACTION_MANAGE_OVERLAY_PERMISSION│
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: 通知許可 (Android 13+)                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  「リマインダー通知を受け取るために、                 │   │
│  │    通知を許可してください」                           │   │
│  │                                                     │   │
│  │  [許可する] → requestPermission(POST_NOTIFICATIONS)  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: バッテリー最適化除外（オプション）                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  「バックグラウンドで確実に動作するために、            │   │
│  │    バッテリー最適化から除外してください」              │   │
│  │                                                     │   │
│  │  [設定を開く] → REQUEST_IGNORE_BATTERY_OPTIMIZATIONS  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 実装フェーズ

### Phase 1: 基本インフラ整備（2-3日）

#### 1.1 Expo Native Module 作成

```kotlin
// modules/screen-time-android/android/src/main/java/.../ScreenTimeAndroidModule.kt

package com.stopshorts.screentime

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ScreenTimeAndroidModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ScreenTimeAndroid")

        // 権限状態を取得
        AsyncFunction("getAuthorizationStatus") {
            return@AsyncFunction getPermissionStatus()
        }

        // 権限リクエスト（設定画面を開く）
        AsyncFunction("requestUsageStatsPermission") {
            openUsageAccessSettings()
        }

        AsyncFunction("requestOverlayPermission") {
            openOverlaySettings()
        }

        // 使用時間取得
        AsyncFunction("getUsageStats") { startTime: Long, endTime: Long ->
            return@AsyncFunction getUsageStatistics(startTime, endTime)
        }

        // 監視開始/停止
        AsyncFunction("startMonitoring") { targetPackages: List<String>, intervalMinutes: Int ->
            startForegroundService(targetPackages, intervalMinutes)
        }

        AsyncFunction("stopMonitoring") {
            stopForegroundService()
        }
    }
}
```

#### 1.2 app.json 更新

```json
{
  "expo": {
    "android": {
      "package": "com.stopshorts.app",
      "permissions": [
        "android.permission.PACKAGE_USAGE_STATS",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.POST_NOTIFICATIONS"
      ]
    }
  }
}
```

---

### Phase 2: 使用時間取得（2-3日）

#### 2.1 UsageStatsTracker 実装

```kotlin
// UsageStatsTracker.kt

class UsageStatsTracker(private val context: Context) {

    private val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE)
        as UsageStatsManager

    // 権限チェック
    fun hasUsageStatsPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            context.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    // 対象アプリの使用時間を取得
    fun getUsageTime(packageNames: List<String>, startTime: Long, endTime: Long): Map<String, Long> {
        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )

        return stats
            .filter { it.packageName in packageNames }
            .associate { it.packageName to it.totalTimeInForeground }
    }

    // 現在フォアグラウンドのアプリを取得
    fun getCurrentForegroundApp(): String? {
        val endTime = System.currentTimeMillis()
        val startTime = endTime - 10000 // 直近10秒

        val events = usageStatsManager.queryEvents(startTime, endTime)
        var lastForegroundPackage: String? = null

        val event = UsageEvents.Event()
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                lastForegroundPackage = event.packageName
            }
        }

        return lastForegroundPackage
    }
}
```

#### 2.2 対象アプリのパッケージ名

```kotlin
object TargetApps {
    val PACKAGES = listOf(
        "com.zhiliaoapp.musically",  // TikTok
        "com.ss.android.ugc.trill",  // TikTok (別バージョン)
        "com.google.android.youtube", // YouTube
        "com.instagram.android"       // Instagram
    )

    val DISPLAY_NAMES = mapOf(
        "com.zhiliaoapp.musically" to "TikTok",
        "com.ss.android.ugc.trill" to "TikTok",
        "com.google.android.youtube" to "YouTube",
        "com.instagram.android" to "Instagram"
    )
}
```

---

### Phase 3: オーバーレイ実装（2-3日）

#### 3.1 OverlayController 実装

```kotlin
// OverlayController.kt

class OverlayController(private val context: Context) {

    private var overlayView: View? = null
    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager

    // オーバーレイ許可チェック
    fun hasOverlayPermission(): Boolean {
        return Settings.canDrawOverlays(context)
    }

    // チェックイン画面を表示
    fun showCheckinOverlay(
        appName: String,
        usageMinutes: Int,
        onContinue: () -> Unit,
        onStop: () -> Unit
    ) {
        if (!hasOverlayPermission()) return

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        )

        overlayView = LayoutInflater.from(context)
            .inflate(R.layout.overlay_checkin, null)
            .apply {
                // UI設定
                findViewById<TextView>(R.id.appName).text = appName
                findViewById<TextView>(R.id.usageTime).text = "${usageMinutes}分使用中"

                findViewById<Button>(R.id.btnContinue).setOnClickListener {
                    hideOverlay()
                    onContinue()
                }

                findViewById<Button>(R.id.btnStop).setOnClickListener {
                    hideOverlay()
                    onStop()
                }

                // 衝動サーフィングボタン
                findViewById<Button>(R.id.btnUrgeSurfing).setOnClickListener {
                    hideOverlay()
                    launchUrgeSurfing()
                }
            }

        windowManager.addView(overlayView, params)
    }

    fun hideOverlay() {
        overlayView?.let {
            windowManager.removeView(it)
            overlayView = null
        }
    }

    private fun launchUrgeSurfing() {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
            putExtra("route", "/urge-surfing")
        }
        context.startActivity(intent)
    }
}
```

#### 3.2 オーバーレイUI（XML）

```xml
<!-- res/layout/overlay_checkin.xml -->
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#CC000000">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:orientation="vertical"
        android:padding="32dp"
        android:background="@drawable/rounded_card"
        android:layout_margin="24dp">

        <TextView
            android:id="@+id/title"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="⏸️ ちょっと待って"
            android:textSize="24sp"
            android:textColor="#FFFFFF"
            android:layout_gravity="center"/>

        <TextView
            android:id="@+id/appName"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:textSize="16sp"
            android:textColor="#AAAAAA"
            android:layout_gravity="center"/>

        <TextView
            android:id="@+id/usageTime"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="4dp"
            android:textSize="14sp"
            android:textColor="#888888"
            android:layout_gravity="center"/>

        <Button
            android:id="@+id/btnUrgeSurfing"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="24dp"
            android:text="🌊 波に乗る（30秒）"
            android:backgroundTint="#C65D3B"/>

        <Button
            android:id="@+id/btnStop"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:text="やめる"
            android:backgroundTint="#4A4A4A"/>

        <Button
            android:id="@+id/btnContinue"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:text="続ける"
            android:backgroundTint="@android:color/transparent"
            android:textColor="#888888"/>

    </LinearLayout>
</FrameLayout>
```

---

### Phase 4: バックグラウンド監視（2-3日）

#### 4.1 Foreground Service 実装

```kotlin
// CheckinForegroundService.kt

class CheckinForegroundService : Service() {

    private lateinit var usageTracker: UsageStatsTracker
    private lateinit var overlayController: OverlayController

    private var targetPackages: List<String> = emptyList()
    private var intervalMinutes: Int = 5
    private var continuousUsageMs: Long = 0
    private var lastCheckedApp: String? = null

    private val handler = Handler(Looper.getMainLooper())
    private val checkRunnable = object : Runnable {
        override fun run() {
            checkForegroundApp()
            handler.postDelayed(this, CHECK_INTERVAL_MS)
        }
    }

    override fun onCreate() {
        super.onCreate()
        usageTracker = UsageStatsTracker(this)
        overlayController = OverlayController(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        targetPackages = intent?.getStringArrayListExtra("targetPackages") ?: emptyList()
        intervalMinutes = intent?.getIntExtra("intervalMinutes", 5) ?: 5

        startForeground(NOTIFICATION_ID, createNotification())
        handler.post(checkRunnable)

        return START_STICKY
    }

    private fun checkForegroundApp() {
        val currentApp = usageTracker.getCurrentForegroundApp()

        if (currentApp in targetPackages) {
            if (currentApp == lastCheckedApp) {
                continuousUsageMs += CHECK_INTERVAL_MS
            } else {
                continuousUsageMs = 0
                lastCheckedApp = currentApp
            }

            val usageMinutes = (continuousUsageMs / 60000).toInt()
            if (usageMinutes > 0 && usageMinutes % intervalMinutes == 0) {
                val appName = TargetApps.DISPLAY_NAMES[currentApp] ?: currentApp
                showCheckinOverlay(appName, usageMinutes)
            }
        } else {
            continuousUsageMs = 0
            lastCheckedApp = null
        }
    }

    private fun showCheckinOverlay(appName: String, usageMinutes: Int) {
        overlayController.showCheckinOverlay(
            appName = appName,
            usageMinutes = usageMinutes,
            onContinue = { /* 続行 */ },
            onStop = { /* アプリを閉じる誘導 */ }
        )
    }

    private fun createNotification(): Notification {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "StopShorts 監視",
            NotificationManager.IMPORTANCE_LOW
        )
        getSystemService(NotificationManager::class.java)
            .createNotificationChannel(channel)

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("StopShorts")
            .setContentText("ショート動画の使用を監視中")
            .setSmallIcon(R.drawable.ic_notification)
            .build()
    }

    override fun onDestroy() {
        handler.removeCallbacks(checkRunnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val CHECK_INTERVAL_MS = 1000L // 1秒ごとにチェック
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID = "stopshorts_monitoring"
    }
}
```

---

### Phase 5: React Native インターフェース統一（1-2日）

#### 5.1 共通インターフェース

```typescript
// src/native/ScreenTimeModule.ts

import { Platform } from 'react-native';

export interface PermissionStatus {
  usageStats: boolean;      // 使用時間取得権限
  overlay: boolean;         // オーバーレイ権限（Android only）
  familyControls: boolean;  // Family Controls（iOS only）
  notifications: boolean;   // 通知権限
}

export interface UsageData {
  packageName: string;
  appName: string;
  totalTimeMs: number;
  lastUsed: number;
}

export interface ScreenTimeAPI {
  // 権限関連
  getPermissionStatus(): Promise<PermissionStatus>;
  requestPermissions(): Promise<PermissionStatus>;

  // 使用時間
  getUsageStats(startTime: number, endTime: number): Promise<UsageData[]>;
  getTodayUsage(): Promise<UsageData[]>;

  // 監視
  startMonitoring(targetApps: string[], intervalMinutes: number): Promise<void>;
  stopMonitoring(): Promise<void>;

  // プラットフォーム固有
  isAvailable(): boolean;
}

// プラットフォーム別実装を選択
export const ScreenTime: ScreenTimeAPI = Platform.select({
  ios: require('./ScreenTimeModule.ios').default,
  android: require('./ScreenTimeModule.android').default,
  default: require('./ScreenTimeModule.mock').default,
});
```

#### 5.2 Android実装

```typescript
// src/native/ScreenTimeModule.android.ts

import { NativeModules, Linking } from 'react-native';
import type { ScreenTimeAPI, PermissionStatus, UsageData } from './ScreenTimeModule';

const { ScreenTimeAndroid } = NativeModules;

const ScreenTimeModuleAndroid: ScreenTimeAPI = {
  async getPermissionStatus(): Promise<PermissionStatus> {
    const status = await ScreenTimeAndroid.getAuthorizationStatus();
    return {
      usageStats: status.usageStats,
      overlay: status.overlay,
      familyControls: false, // iOS only
      notifications: status.notifications,
    };
  },

  async requestPermissions(): Promise<PermissionStatus> {
    // 使用状況アクセス設定を開く
    await ScreenTimeAndroid.requestUsageStatsPermission();
    // オーバーレイ設定を開く
    await ScreenTimeAndroid.requestOverlayPermission();

    return this.getPermissionStatus();
  },

  async getUsageStats(startTime: number, endTime: number): Promise<UsageData[]> {
    return ScreenTimeAndroid.getUsageStats(startTime, endTime);
  },

  async getTodayUsage(): Promise<UsageData[]> {
    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    return this.getUsageStats(startOfDay, now);
  },

  async startMonitoring(targetApps: string[], intervalMinutes: number): Promise<void> {
    await ScreenTimeAndroid.startMonitoring(targetApps, intervalMinutes);
  },

  async stopMonitoring(): Promise<void> {
    await ScreenTimeAndroid.stopMonitoring();
  },

  isAvailable(): boolean {
    return true; // Android 5.1+ で利用可能
  },
};

export default ScreenTimeModuleAndroid;
```

---

### Phase 6: オンボーディング更新（1-2日）

#### 6.1 権限許可画面の更新

```typescript
// app/(onboarding)/screentime-permission.tsx

import { Platform } from 'react-native';
import { ScreenTime } from '../../src/native/ScreenTimeModule';

export default function ScreenTimePermissionScreen() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);

  const handleRequestPermission = async () => {
    if (Platform.OS === 'ios') {
      // iOS: Family Controls 認可リクエスト
      await ScreenTime.requestPermissions();
    } else if (Platform.OS === 'android') {
      // Android: 段階的に権限をリクエスト
      // Step 1: 使用状況アクセス
      await ScreenTime.requestUsageStatsPermission();
      // Step 2: オーバーレイ
      await ScreenTime.requestOverlayPermission();
    }

    const status = await ScreenTime.getPermissionStatus();
    setPermissionStatus(status);
  };

  // プラットフォーム別のUI表示
  const renderPermissionUI = () => {
    if (Platform.OS === 'ios') {
      return <IOSPermissionFlow />;
    } else {
      return <AndroidPermissionFlow status={permissionStatus} />;
    }
  };

  return (
    <SafeAreaView>
      {renderPermissionUI()}
    </SafeAreaView>
  );
}
```

---

## 6. Google Play審査対策

### 6.1 必要な対応

| 項目 | 対応内容 |
|------|----------|
| **Data Safety** | 使用状況データの収集・利用目的を明記 |
| **権限説明** | PACKAGE_USAGE_STATS, SYSTEM_ALERT_WINDOW の理由を明確に |
| **プライバシーポリシー** | 収集データと利用目的を記載 |
| **機能説明** | アプリの目的（デジタルウェルビーイング）を明確に |

### 6.2 NG事項（避けるべき実装）

- ❌ AccessibilityService の使用（審査リスク極めて高い）
- ❌ Device Admin の一般ユーザー向け使用
- ❌ バックグラウンドからのActivity強制起動
- ❌ 他アプリの強制終了

### 6.3 権限説明テンプレート

```
【使用状況アクセス権限について】
StopShortsは、TikTok・YouTube・Instagramなどのショート動画アプリの
使用時間を計測するために、使用状況へのアクセスを必要とします。
この情報はお客様のデバイス内でのみ処理され、外部に送信されることはありません。

【オーバーレイ表示権限について】
一定時間ごとに「続けますか？」という確認画面を表示するために、
他のアプリの上に表示する権限を必要とします。
これにより、ショート動画の視聴時間を意識し、
使いすぎを防ぐことができます。
```

---

## 7. 工数見積もり

| Phase | 内容 | 工数 |
|-------|------|------|
| Phase 1 | 基本インフラ整備 | 2-3日 |
| Phase 2 | 使用時間取得 | 2-3日 |
| Phase 3 | オーバーレイ実装 | 2-3日 |
| Phase 4 | バックグラウンド監視 | 2-3日 |
| Phase 5 | RNインターフェース統一 | 1-2日 |
| Phase 6 | オンボーディング更新 | 1-2日 |
| テスト・調整 | 実機テスト、バグ修正 | 2-3日 |
| **合計** | | **12-19日** |

---

## 8. リスクと制約

### 8.1 技術的制約

| 制約 | 影響 | 対策 |
|------|------|------|
| アプリ完全ブロック不可 | ユーザーがオーバーレイを閉じて継続可能 | 衝動サーフィングへの誘導を強化 |
| バッテリー最適化 | Serviceが停止される可能性 | 除外設定を案内 |
| OEM独自UI | Xiaomi/Huawei等で動作差異 | 主要機種でテスト |

### 8.2 ユーザー体験の差異

| 機能 | iOS | Android |
|------|-----|---------|
| ブロックの強制力 | 高（完全ブロック） | 中（閉じ可能） |
| 設定の手間 | 少（1回の認可） | 多（複数の設定画面） |
| バックグラウンド安定性 | 高 | 中（OEM依存） |

---

## 9. 推奨実装順序

```
MVP（最小実装）
├── Phase 1: 基本インフラ
├── Phase 2: 使用時間取得
└── Phase 6: オンボーディング（権限許可のみ）
    ↓
    リリース可能（使用時間確認機能のみ）
    ↓
Phase 3-4: オーバーレイ + 監視機能
    ↓
    フル機能リリース
```

---

## 10. 次のアクション

1. [ ] Expo Native Module のスケルトン作成
2. [ ] UsageStatsManager の基本実装
3. [ ] 権限リクエストフローの実装
4. [ ] オーバーレイUIのデザイン確定
5. [ ] Foreground Service の実装
6. [ ] 実機テスト（Pixel / Samsung / Xiaomi）
7. [ ] Google Play Console 設定（Data Safety等）

---

*作成日: 2024年12月*
*StopShorts Android対応プロジェクト*
