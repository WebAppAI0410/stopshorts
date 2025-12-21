# Android対応 実装計画書

## 1. 概要

StopShortsアプリをAndroidプラットフォームに対応させるための実装計画書です。
iOSのScreen Time API（Family Controls）とは異なり、Androidでは**UsageStatsManager + オーバーレイ**方式を採用します。

### 1.1 動作要件

| 項目 | 要件 |
|------|------|
| **対応Androidバージョン** | Android 8.0+ (API 26+) |
| **ビルド環境** | **Expo Dev Client / EAS Build 必須**（Expo Goでは動作不可） |
| **理由** | カスタムネイティブモジュールを使用するため |

> **注意**: Expo Goはカスタムネイティブモジュールをサポートしていません。
> 開発時は`npx expo run:android`または EAS Build でビルドしたDev Clientを使用してください。

### 1.2 基本方針

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
<!-- Note: foregroundServiceType は AndroidManifest の <service> タグで指定 -->

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

        // 権限設定画面を開く（runtime requestではなく設定画面遷移が必須）
        AsyncFunction("openUsageStatsSettings") {
            openUsageAccessSettings()
        }

        AsyncFunction("openOverlaySettings") {
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
    // Note: 端末によってイベント種別の挙動が異なるため、複数種別をチェック
    fun getCurrentForegroundApp(): String? {
        val endTime = System.currentTimeMillis()
        val startTime = endTime - 10000 // 直近10秒

        val events = usageStatsManager.queryEvents(startTime, endTime)
        var lastForegroundPackage: String? = null

        val event = UsageEvents.Event()
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            // MOVE_TO_FOREGROUND に加え、ACTIVITY_RESUMED も検知（端末差対策）
            when (event.eventType) {
                UsageEvents.Event.MOVE_TO_FOREGROUND,
                UsageEvents.Event.ACTIVITY_RESUMED -> {
                    lastForegroundPackage = event.packageName
                }
                UsageEvents.Event.MOVE_TO_BACKGROUND,
                UsageEvents.Event.ACTIVITY_PAUSED -> {
                    if (event.packageName == lastForegroundPackage) {
                        lastForegroundPackage = null
                    }
                }
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
    private var lastTriggeredMinute: Int = -1  // 多重発火防止用

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
                lastTriggeredMinute = -1  // アプリ切り替え時にリセット
            }

            val usageMinutes = (continuousUsageMs / 60000).toInt()
            // 多重発火防止: 同じ分では1回のみ発火
            if (usageMinutes > 0
                && usageMinutes % intervalMinutes == 0
                && usageMinutes != lastTriggeredMinute) {
                lastTriggeredMinute = usageMinutes
                val appName = TargetApps.DISPLAY_NAMES[currentApp] ?: currentApp
                showCheckinOverlay(appName, usageMinutes)
            }
        } else {
            continuousUsageMs = 0
            lastCheckedApp = null
            lastTriggeredMinute = -1
        }
    }

    private fun showCheckinOverlay(appName: String, usageMinutes: Int) {
        overlayController.showCheckinOverlay(
            appName = appName,
            usageMinutes = usageMinutes,
            onContinue = { /* 続行 */ },
            onStop = { /* 自アプリに戻す or ホーム画面誘導（他アプリ強制終了は不可） */ }
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

  // 設定画面を開く（Android用 - runtime requestではなく設定画面遷移が必須）
  openUsageStatsSettings(): Promise<void>;
  openOverlaySettings(): Promise<void>;

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

  async openUsageStatsSettings(): Promise<void> {
    // 使用状況アクセス設定画面を開く（ユーザーが手動で許可）
    await ScreenTimeAndroid.openUsageStatsSettings();
  },

  async openOverlaySettings(): Promise<void> {
    // オーバーレイ設定画面を開く（ユーザーが手動で許可）
    await ScreenTimeAndroid.openOverlaySettings();
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
    return true; // Android 8.0+ (API 26+) で全機能利用可能
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
      // iOS: Family Controls 認可リクエスト（OSダイアログ表示）
      // 別途iOS用のrequestAuthorization()を呼び出し
    } else if (Platform.OS === 'android') {
      // Android: 段階的に設定画面を開く（runtime requestは不可）
      // Step 1: 使用状況アクセス設定画面
      await ScreenTime.openUsageStatsSettings();
      // ユーザーが戻ってきたら権限確認
      // Step 2: オーバーレイ設定画面
      await ScreenTime.openOverlaySettings();
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

## 11. インストール済みアプリ選択機能（Android専用）

### 11.1 概要

iOSではFamily Controls Entitlementの申請・承認が必要なため時間がかかりますが、Androidでは**PackageManager**を使用してインストール済みアプリのリストを取得できます。これにより、ハードコードされた6つのアプリ以外にも、ユーザーが任意のアプリを制限対象に追加できるようになります。

### 11.2 iOS vs Android 比較

| 項目 | iOS | Android |
|------|-----|---------|
| **アプリ一覧取得** | FamilyActivityPicker（Entitlement必須） | PackageManager（権限不要） |
| **申請** | Family Controls Entitlement 必要 | 不要 |
| **実装可能時期** | 承認待ち | 今すぐ可能 |

### 11.3 必要な権限

```kotlin
// PackageManagerでインストール済みアプリを取得するのに追加権限は不要
// ただし、Android 11+ では QUERY_ALL_PACKAGES が必要な場合あり
```

```xml
<!-- AndroidManifest.xml（Android 11+対策） -->
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES"
    tools:ignore="QueryAllPackagesPermission" />

<!-- または queries タグで対象を限定 -->
<queries>
    <intent>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent>
</queries>
```

### 11.4 実装アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│  React Native Layer                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  app/(onboarding)/app-selection.tsx                  │   │
│  │  - プラットフォーム別UI表示                           │   │
│  │  - Android: カスタムアプリ選択モーダル                │   │
│  │  - iOS: 「Coming Soon」表示（Entitlement待ち）        │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  src/native/ScreenTimeModule.ts                      │   │
│  │  + getInstalledApps(): Promise<InstalledApp[]>       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Android Native Layer (Kotlin)                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  InstalledAppsHelper.kt                              │   │
│  │  - getInstalledLauncherApps()                        │   │
│  │  - getAppInfo(packageName)                           │   │
│  │  - getAppIcon(packageName): Base64                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 11.5 データ構造

```typescript
// src/types/index.ts に追加

export interface InstalledApp {
  packageName: string;       // com.instagram.android
  appName: string;           // Instagram
  icon: string | null;       // Base64エンコードされたアイコン画像（オプション）
  isSystemApp: boolean;      // システムアプリかどうか
  category?: string;         // アプリカテゴリ（SOCIAL, VIDEO, GAMEなど）
}
```

### 11.6 ネイティブモジュール実装

#### 11.6.1 InstalledAppsHelper.kt

```kotlin
// modules/screen-time-android/android/src/main/.../InstalledAppsHelper.kt

package com.stopshorts.screentime

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.Base64
import java.io.ByteArrayOutputStream

class InstalledAppsHelper(private val context: Context) {

    private val packageManager = context.packageManager

    /**
     * ランチャーに表示されるアプリ一覧を取得
     * システムアプリを除外し、ユーザーがインストールしたアプリのみ返す
     */
    fun getInstalledLauncherApps(): List<Map<String, Any?>> {
        val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }

        val resolveInfoList = packageManager.queryIntentActivities(mainIntent, 0)

        return resolveInfoList
            .filter { !isSystemApp(it.activityInfo.applicationInfo) }
            .distinctBy { it.activityInfo.packageName }
            .map { resolveInfo ->
                val appInfo = resolveInfo.activityInfo.applicationInfo
                mapOf(
                    "packageName" to appInfo.packageName,
                    "appName" to packageManager.getApplicationLabel(appInfo).toString(),
                    "isSystemApp" to isSystemApp(appInfo),
                    "category" to getCategoryName(appInfo.category)
                )
            }
            .sortedBy { it["appName"] as String }
    }

    /**
     * 特定アプリのアイコンをBase64で取得
     */
    fun getAppIcon(packageName: String): String? {
        return try {
            val drawable = packageManager.getApplicationIcon(packageName)
            drawableToBase64(drawable)
        } catch (e: PackageManager.NameNotFoundException) {
            null
        }
    }

    private fun isSystemApp(appInfo: ApplicationInfo): Boolean {
        return (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
    }

    private fun getCategoryName(category: Int): String {
        return when (category) {
            ApplicationInfo.CATEGORY_SOCIAL -> "SOCIAL"
            ApplicationInfo.CATEGORY_VIDEO -> "VIDEO"
            ApplicationInfo.CATEGORY_GAME -> "GAME"
            ApplicationInfo.CATEGORY_IMAGE -> "IMAGE"
            ApplicationInfo.CATEGORY_AUDIO -> "AUDIO"
            ApplicationInfo.CATEGORY_NEWS -> "NEWS"
            ApplicationInfo.CATEGORY_PRODUCTIVITY -> "PRODUCTIVITY"
            else -> "OTHER"
        }
    }

    private fun drawableToBase64(drawable: Drawable): String {
        val bitmap = if (drawable is BitmapDrawable) {
            drawable.bitmap
        } else {
            val bitmap = Bitmap.createBitmap(
                drawable.intrinsicWidth.coerceAtLeast(1),
                drawable.intrinsicHeight.coerceAtLeast(1),
                Bitmap.Config.ARGB_8888
            )
            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)
            bitmap
        }

        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
        val byteArray = stream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.NO_WRAP)
    }
}
```

#### 11.6.2 ScreenTimeAndroidModule.kt への追加

```kotlin
// ScreenTimeAndroidModule.kt に追加

class ScreenTimeAndroidModule : Module() {
    private lateinit var installedAppsHelper: InstalledAppsHelper

    override fun definition() = ModuleDefinition {
        Name("ScreenTimeAndroid")

        OnCreate {
            installedAppsHelper = InstalledAppsHelper(appContext.reactContext!!)
        }

        // 既存の関数...

        // インストール済みアプリ一覧を取得
        AsyncFunction("getInstalledApps") {
            return@AsyncFunction installedAppsHelper.getInstalledLauncherApps()
        }

        // アプリアイコンを取得（オプション）
        AsyncFunction("getAppIcon") { packageName: String ->
            return@AsyncFunction installedAppsHelper.getAppIcon(packageName)
        }
    }
}
```

### 11.7 TypeScript インターフェース

```typescript
// src/native/ScreenTimeModule.ts に追加

export interface InstalledApp {
  packageName: string;
  appName: string;
  isSystemApp: boolean;
  category?: string;
}

// ScreenTimeAPI に追加
export interface ScreenTimeAPI {
  // 既存のメソッド...

  // Android専用: インストール済みアプリ一覧を取得
  getInstalledApps(): Promise<InstalledApp[]>;

  // Android専用: アプリアイコンを取得
  getAppIcon(packageName: string): Promise<string | null>;
}
```

### 11.8 UI実装

#### 11.8.1 アプリ選択モーダル

```typescript
// src/components/AppSelectionModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { screenTimeService, InstalledApp } from '../services/screenTime';

interface AppSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (app: InstalledApp) => void;
  excludePackages?: string[]; // 既に選択済みのアプリを除外
}

export function AppSelectionModal({
  visible,
  onClose,
  onSelect,
  excludePackages = [],
}: AppSelectionModalProps) {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<InstalledApp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && Platform.OS === 'android') {
      loadApps();
    }
  }, [visible]);

  useEffect(() => {
    const filtered = apps.filter(
      app =>
        !excludePackages.includes(app.packageName) &&
        app.appName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredApps(filtered);
  }, [apps, searchQuery, excludePackages]);

  const loadApps = async () => {
    setLoading(true);
    try {
      const installedApps = await screenTimeService.getInstalledApps();
      setApps(installedApps);
    } catch (error) {
      console.error('Failed to load installed apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderApp = ({ item }: { item: InstalledApp }) => (
    <TouchableOpacity
      style={styles.appItem}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <View style={styles.appIcon}>
        {/* アイコンはオプション - 必要に応じて実装 */}
        <Text style={styles.appIconPlaceholder}>
          {item.appName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.appName}</Text>
        <Text style={styles.packageName}>{item.packageName}</Text>
      </View>
      {item.category && (
        <Text style={styles.category}>{item.category}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>アプリを選択</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>閉じる</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="アプリを検索..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading ? (
          <Text style={styles.loadingText}>読み込み中...</Text>
        ) : (
          <FlatList
            data={filteredApps}
            keyExtractor={item => item.packageName}
            renderItem={renderApp}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </Modal>
  );
}
```

#### 11.8.2 app-selection.tsx の更新

```typescript
// app/(onboarding)/app-selection.tsx の handleAddMore を更新

import { Platform } from 'react-native';
import { AppSelectionModal } from '../../src/components/AppSelectionModal';

// ... 既存のコード ...

const [showAppModal, setShowAppModal] = useState(false);
const [customApps, setCustomApps] = useState<CustomApp[]>([]);

const handleAddMore = () => {
  if (Platform.OS === 'android') {
    // Android: カスタムアプリ選択モーダルを表示
    setShowAppModal(true);
  } else {
    // iOS: Coming Soon（Family Controls Entitlement待ち）
    Alert.alert(
      t('settings.comingSoon.title'),
      t('settings.comingSoon.addMoreApps'),
      [{ text: 'OK' }]
    );
  }
};

const handleCustomAppSelect = (app: InstalledApp) => {
  const newCustomApp: CustomApp = {
    id: app.packageName as TargetAppId,
    packageName: app.packageName,
    label: app.appName,
    isCustom: true,
  };
  setCustomApps([...customApps, newCustomApp]);
  setLocalSelectedApps([...selectedApps, app.packageName as TargetAppId]);
};

// JSX内に追加
{Platform.OS === 'android' && (
  <AppSelectionModal
    visible={showAppModal}
    onClose={() => setShowAppModal(false)}
    onSelect={handleCustomAppSelect}
    excludePackages={[
      ...appOptions.map(o => o.id),
      ...customApps.map(c => c.packageName),
    ]}
  />
)}
```

### 11.9 データ永続化

```typescript
// src/stores/useAppStore.ts に追加

interface CustomApp {
  packageName: string;
  appName: string;
  addedAt: string; // ISO日時
}

interface AppState {
  // 既存のフィールド...
  customApps: CustomApp[];
  addCustomApp: (app: CustomApp) => void;
  removeCustomApp: (packageName: string) => void;
}

// Zustandストアに追加
customApps: [],
addCustomApp: (app) => set((state) => ({
  customApps: [...state.customApps, app],
})),
removeCustomApp: (packageName) => set((state) => ({
  customApps: state.customApps.filter(a => a.packageName !== packageName),
})),
```

### 11.10 工数見積もり

| タスク | 工数 |
|--------|------|
| InstalledAppsHelper.kt 実装 | 0.5日 |
| ScreenTimeAndroidModule 更新 | 0.5日 |
| TypeScript インターフェース更新 | 0.5日 |
| AppSelectionModal コンポーネント | 1日 |
| app-selection.tsx 更新 | 0.5日 |
| Zustandストア更新 | 0.5日 |
| テスト・調整 | 1日 |
| **合計** | **4.5日** |

### 11.11 注意事項

1. **Android 11+ (API 30+)**: `QUERY_ALL_PACKAGES` 権限が必要な場合あり
   - Google Playポリシーで制限される可能性があるため、`<queries>` タグでの限定的な宣言を推奨

2. **パフォーマンス**: アプリ一覧取得は重い処理
   - 初回のみ取得してキャッシュする
   - バックグラウンドスレッドで実行

3. **アイコン取得**: Base64エンコードはオプション
   - メモリ使用量を考慮し、必要に応じて実装

---

## 12. 次のアクション（更新）

### 既存タスク
1. [ ] Expo Native Module のスケルトン作成
2. [ ] UsageStatsManager の基本実装
3. [ ] 権限リクエストフローの実装
4. [ ] オーバーレイUIのデザイン確定
5. [ ] Foreground Service の実装
6. [ ] 実機テスト（Pixel / Samsung / Xiaomi）
7. [ ] Google Play Console 設定（Data Safety等）

### 新規タスク（インストール済みアプリ選択機能）
8. [ ] InstalledAppsHelper.kt 実装
9. [ ] ScreenTimeAndroidModule に getInstalledApps 追加
10. [ ] AppSelectionModal コンポーネント作成
11. [ ] app-selection.tsx のプラットフォーム分岐実装
12. [ ] Zustandストアにカスタムアプリ保存機能追加
13. [ ] 実機テスト（アプリ一覧表示、選択、保存）

---

*作成日: 2025年12月*
*最終更新: 2025年12月（インストール済みアプリ選択機能追加）*
*StopShorts Android対応プロジェクト*
