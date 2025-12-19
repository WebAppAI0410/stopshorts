# StopShorts - バックエンド・インフラ設計書 v1.0

## 1. アーキテクチャ概要

### 1.1 設計方針

**「サーバーレス・ファースト」**

- サーバー運用コスト: ¥0
- ユーザーデータはApple/RevenueCatのインフラを活用
- プライバシー重視（自社サーバーに個人情報を持たない）

### 1.2 システム構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                    StopShorts Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 React Native (Expo)                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │ UI Layer    │  │ State       │  │ Native Bridge   │  │   │
│  │  │             │  │ (Zustand)   │  │                 │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│  └───────────────────────┬─────────────────────────────────┘   │
│                          │                                       │
│         ┌────────────────┼────────────────┐                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │
│  │ RevenueCat  │  │ iCloud      │  │ Screen Time API     │     │
│  │             │  │ CloudKit    │  │ (iOS Native)        │     │
│  ├─────────────┤  ├─────────────┤  ├─────────────────────┤     │
│  │ - 課金管理   │  │ - 統計履歴  │  │ - アプリ使用監視    │     │
│  │ - サブスク   │  │ - 設定同期  │  │ - Shield表示       │     │
│  │ - 購入復元   │  │ - 日誌データ │  │ - 遮断機能        │     │
│  │ - ユーザー   │  │             │  │                    │     │
│  │   属性      │  │             │  │                    │     │
│  └─────────────┘  └─────────────┘  └─────────────────────┘     │
│        │                │                    │                  │
│        ▼                ▼                    ▼                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │
│  │ App Store   │  │ Apple ID    │  │ iOS System          │     │
│  │ Connect     │  │ (認証)      │  │                     │     │
│  └─────────────┘  └─────────────┘  └─────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. RevenueCat 設計

### 2.1 基本情報

| 項目 | 値 |
|------|-----|
| SDK | `react-native-purchases` |
| API Key | App Store用キー（後で発行） |
| 料金 | 月間収益$2,500以下: 無料 / 以降: 1% |

### 2.2 商品構成

```typescript
// RevenueCat Product IDs
const PRODUCTS = {
  // 3日間無料トライアル（デフォルト推奨）
  TRIAL_3_DAYS: 'com.stopshorts.trial_3days',

  // 買い切りプラン
  CHALLENGE_30: 'com.stopshorts.challenge30',    // ¥980
  MASTER_90: 'com.stopshorts.master90',          // ¥1,980

  // サブスクリプション
  YEARLY: 'com.stopshorts.yearly',               // ¥3,980/年
};

// Entitlements
const ENTITLEMENTS = {
  PREMIUM: 'premium',  // 有料機能へのアクセス権
};
```

### 2.3 ユーザー属性（Subscriber Attributes）

```typescript
// RevenueCatに保存する属性（最大50個、各500文字以下）
interface RevenueCatAttributes {
  // 基本設定
  purpose: UserPurpose;           // 'sleep' | 'study' | 'work' | ...
  bedtime: string;                // '23:00'
  wakeTime: string;               // '07:00'

  // パーソナライゼーション
  addictionLevel: AddictionLevel; // 'light' | 'moderate' | 'heavy' | 'severe'
  dailyUsageHours: string;        // '3.5'（オンボーディング時に取得）

  // 実装意図
  intentType: IntentType;         // 'breathe' | 'stretch' | ...
  intentCustomText: string;       // カスタムテキスト

  // 目標設定
  alternativeActivity: string;    // 空いた時間にやること
  dailyGoalMinutes: string;       // '60'

  // アプリ設定
  managedApps: string;            // 'tiktok,youtube,instagram'
  interventionMinutes: string;    // '5'
  themeMode: string;              // 'light' | 'dark' | 'system'

  // オンボーディング状態
  onboardingCompleted: string;    // 'true' | 'false'
  tutorialCompleted: string;      // 'true' | 'false'

  // 累計統計（軽量データのみ）
  totalInterventions: string;     // '142'
  totalSavedMinutes: string;      // '1250'
  longestStreak: string;          // '28'
}
```

### 2.4 実装例

```typescript
import Purchases from 'react-native-purchases';

// 初期化
export const initRevenueCat = async () => {
  await Purchases.configure({
    apiKey: 'appl_XXXXXXXXX', // App Store API Key
  });
};

// 属性の保存
export const saveUserAttributes = async (attrs: Partial<RevenueCatAttributes>) => {
  const stringAttrs: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) {
      stringAttrs[key] = String(value);
    }
  }
  await Purchases.setAttributes(stringAttrs);
};

// 課金状態の確認
export const checkPremiumStatus = async (): Promise<boolean> => {
  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active['premium'] !== undefined;
};

// 購入
export const purchasePackage = async (packageId: string) => {
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages.find(p => p.identifier === packageId);
  if (pkg) {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active['premium'] !== undefined;
  }
  return false;
};

// 購入の復元
export const restorePurchases = async (): Promise<boolean> => {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo.entitlements.active['premium'] !== undefined;
};
```

---

## 3. iCloud CloudKit 設計

### 3.1 基本情報

| 項目 | 値 |
|------|-----|
| ライブラリ | `react-native-cloud-store` |
| 容量制限 | ユーザーあたり1GB（十分すぎる） |
| 料金 | 無料（Appleが負担） |

### 3.2 データスキーマ

```typescript
// iCloud CloudKit に保存するデータ

// 日次統計（90日分保持）
interface DailyStatsRecord {
  date: string;                    // 'YYYY-MM-DD'
  interventionCount: number;       // その日の介入回数
  totalBlockedMinutes: number;     // 節約した時間
  successRate: number;             // 成功率（0-1）
  apps: {
    tiktok?: AppDailyStats;
    youtubeShorts?: AppDailyStats;
    instagramReels?: AppDailyStats;
  };
}

interface AppDailyStats {
  interventionCount: number;
  blockedMinutes: number;
}

// 日誌エントリー
interface JournalEntry {
  id: string;                      // UUID
  date: string;                    // 'YYYY-MM-DD'
  timestamp: string;               // ISO 8601

  // チェックイン
  didAlternativeActivity: boolean; // 代替活動を実行したか
  alternativeActivityNote?: string; // 短いメモ（100文字以内）

  // 振り返り
  mood?: 1 | 2 | 3 | 4 | 5;        // 気分（1=悪い, 5=良い）
  reflection?: string;             // 振り返りメモ（200文字以内）
}

// ストリーク記録
interface StreakRecord {
  currentStreak: number;           // 現在の連続日数
  longestStreak: number;           // 最長記録
  lastSuccessDate: string;         // 最後に成功した日
}

// CloudKit データ構造
interface CloudKitData {
  version: number;                 // スキーマバージョン
  lastSyncedAt: string;            // 最終同期日時
  dailyStats: DailyStatsRecord[];  // 最大90日分
  journalEntries: JournalEntry[];  // 最大365日分
  streakRecord: StreakRecord;
}
```

### 3.3 実装例

```typescript
import CloudStore from 'react-native-cloud-store';

const CLOUDKIT_KEY = 'stopshorts_data_v1';

// データの保存
export const saveToCloudKit = async (data: CloudKitData): Promise<void> => {
  const jsonString = JSON.stringify(data);
  await CloudStore.setItem(CLOUDKIT_KEY, jsonString);
};

// データの取得
export const loadFromCloudKit = async (): Promise<CloudKitData | null> => {
  try {
    const jsonString = await CloudStore.getItem(CLOUDKIT_KEY);
    if (jsonString) {
      return JSON.parse(jsonString) as CloudKitData;
    }
    return null;
  } catch (error) {
    console.error('CloudKit load error:', error);
    return null;
  }
};

// 日次統計の追加（90日以上は自動削除）
export const addDailyStat = async (stat: DailyStatsRecord): Promise<void> => {
  const data = await loadFromCloudKit() || createEmptyCloudKitData();

  // 既存の同日データを更新、なければ追加
  const existingIndex = data.dailyStats.findIndex(s => s.date === stat.date);
  if (existingIndex >= 0) {
    data.dailyStats[existingIndex] = stat;
  } else {
    data.dailyStats.push(stat);
  }

  // 90日より古いデータを削除
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  const cutoffString = cutoffDate.toISOString().split('T')[0];
  data.dailyStats = data.dailyStats.filter(s => s.date >= cutoffString);

  // ソート
  data.dailyStats.sort((a, b) => b.date.localeCompare(a.date));

  data.lastSyncedAt = new Date().toISOString();
  await saveToCloudKit(data);
};

// 初期データ作成
const createEmptyCloudKitData = (): CloudKitData => ({
  version: 1,
  lastSyncedAt: new Date().toISOString(),
  dailyStats: [],
  journalEntries: [],
  streakRecord: {
    currentStreak: 0,
    longestStreak: 0,
    lastSuccessDate: '',
  },
});
```

---

## 4. データ同期戦略

### 4.1 同期タイミング

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Sync Strategy                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  アプリ起動時                                                │
│  ├── RevenueCat: 課金状態確認                               │
│  └── iCloud: 統計データ読み込み                             │
│                                                             │
│  介入発生時                                                  │
│  ├── ローカル: 即座に更新                                    │
│  └── iCloud: バックグラウンドで同期                          │
│                                                             │
│  設定変更時                                                  │
│  ├── RevenueCat: 属性を即座に更新                           │
│  └── ローカル: Zustand + AsyncStorage                       │
│                                                             │
│  日誌記入時                                                  │
│  └── iCloud: 即座に保存                                     │
│                                                             │
│  アプリ終了時                                                │
│  └── iCloud: 最終同期                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 オフライン対応

```typescript
// ローカルファースト設計
// 1. 常にローカル（AsyncStorage）を優先
// 2. オンライン時にiCloudと同期
// 3. コンフリクト時は新しいデータを優先

interface SyncStatus {
  isOnline: boolean;
  lastSyncedAt: string | null;
  pendingChanges: number;
}

export const syncWithCloud = async (): Promise<void> => {
  const localData = await getLocalData();
  const cloudData = await loadFromCloudKit();

  if (!cloudData) {
    // クラウドにデータがない → ローカルをアップロード
    await saveToCloudKit(localData);
    return;
  }

  // マージ（新しい方を優先）
  const mergedData = mergeData(localData, cloudData);

  // 両方に保存
  await setLocalData(mergedData);
  await saveToCloudKit(mergedData);
};
```

---

## 5. セキュリティ・プライバシー

### 5.1 データ分類

| データ種別 | 保存場所 | 暗号化 | 個人情報 |
|-----------|---------|--------|---------|
| 課金情報 | RevenueCat | ✓ | Apple ID紐付け |
| 設定 | RevenueCat属性 | ✓ | 匿名化可能 |
| 統計履歴 | iCloud | ✓ | Apple ID紐付け |
| 日誌 | iCloud | ✓ | 個人的内容あり |
| キャッシュ | AsyncStorage | 端末暗号化 | - |

### 5.2 プライバシーポリシー対応

```
収集するデータ:
- アプリ使用統計（介入回数、節約時間）
- ユーザー設定（目的、就寝時間など）
- 日誌エントリー（オプション）

収集しないデータ:
- 氏名、メールアドレス
- 位置情報
- 他アプリの詳細な使用履歴（Screen Time APIの制限）
- 連絡先、写真

データの保存:
- Apple iCloud（ユーザーのアカウント）
- RevenueCat（課金処理のみ）
- 自社サーバーへの送信なし
```

---

## 6. コスト試算

### 6.1 月間コスト

| 項目 | ユーザー1,000人 | ユーザー10,000人 | ユーザー100,000人 |
|------|---------------|-----------------|-------------------|
| RevenueCat | ¥0 | ¥0〜¥5,000 | ¥50,000〜 |
| iCloud | ¥0 | ¥0 | ¥0 |
| Apple Developer | ¥12,980/年 | ¥12,980/年 | ¥12,980/年 |
| **合計（月額）** | **約¥1,100** | **約¥1,100〜¥6,100** | **約¥51,100〜** |

※ RevenueCatは月間収益$2,500超過分の1%

### 6.2 スケール時の移行戦略

```
Phase 1 (0-10,000 users)
├── 現構成のまま運用
└── コスト: ほぼゼロ

Phase 2 (10,000-100,000 users)
├── RevenueCat Enterprise検討
└── iCloudは問題なくスケール

Phase 3 (100,000+ users)
├── 必要に応じてSupabase追加検討
│   ├── ランキング機能
│   ├── ソーシャル機能
│   └── 詳細分析
└── RevenueCatボリュームディスカウント交渉
```

---

## 7. 実装チェックリスト

### 7.1 RevenueCat

- [ ] RevenueCatアカウント作成
- [ ] App Store Connect連携設定
- [ ] 商品（Products）登録
- [ ] Entitlements設定
- [ ] Offerings設定
- [ ] `react-native-purchases` インストール
- [ ] 初期化コード実装
- [ ] 購入フロー実装
- [ ] 復元機能実装
- [ ] Webhook設定（オプション）

### 7.2 iCloud CloudKit

- [ ] `react-native-cloud-store` インストール
- [ ] iCloud Capability追加（EAS Build設定）
- [ ] CloudKit Container設定
- [ ] データスキーマ実装
- [ ] 同期ロジック実装
- [ ] オフライン対応実装
- [ ] マイグレーション処理実装

### 7.3 テスト

- [ ] サンドボックス課金テスト
- [ ] 購入復元テスト
- [ ] iCloud同期テスト
- [ ] 機種変更シミュレーション
- [ ] オフライン動作テスト
