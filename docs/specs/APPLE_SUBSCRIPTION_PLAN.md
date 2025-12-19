# Apple App Store サブスクリプション実装計画書

## 概要

StopShortsアプリにApple App Storeのサブスクリプション機能を統合するための実装計画。

## 技術スタック

- **react-native-iap** (In-App Purchase) または **expo-in-app-purchases**
- **App Store Connect** での製品設定
- **StoreKit 2** (iOS 15+)

## プラン構成

| プランID | 名称 | 価格 | 期間 | 特徴 |
|---------|------|------|------|------|
| `stopshorts.trial` | 無料トライアル | ¥0 | 3日間 | 自動更新なし |
| `stopshorts.monthly` | 月額プラン | ¥980 | 30日 | 自動更新 |
| `stopshorts.quarterly` | 90日プラン | ¥1,980 | 90日 | 33%お得 |
| `stopshorts.annual` | 年間プラン | ¥3,980 | 1年 | 66%お得 |

## 実装フェーズ

### Phase 1: App Store Connect 設定（1-2日）

1. **App Store Connect で製品作成**
   - サブスクリプショングループ作成: "StopShorts Premium"
   - 各プラン（月額/90日/年間）を自動更新サブスクリプションとして登録
   - 無料トライアル期間（3日）を設定
   - ローカライズ情報（日本語）を設定

2. **価格設定**
   ```
   月額: Tier 8 (¥980)
   90日: Tier 17 (¥1,980)
   年間: Tier 33 (¥3,980)
   ```

3. **Sandbox テスト環境設定**
   - テスト用Apple IDの作成
   - Sandbox環境でのテスト実行

### Phase 2: クライアント実装（3-5日）

1. **依存関係のインストール**
   ```bash
   # Expo を使用している場合
   npx expo install expo-in-app-purchases

   # または react-native-iap
   npm install react-native-iap
   ```

2. **サブスクリプションサービスの作成**
   ```typescript
   // src/services/subscription.ts

   import * as InAppPurchases from 'expo-in-app-purchases';

   export const PRODUCT_IDS = {
     MONTHLY: 'stopshorts.monthly',
     QUARTERLY: 'stopshorts.quarterly',
     ANNUAL: 'stopshorts.annual',
   };

   export class SubscriptionService {
     static async initialize(): Promise<void>;
     static async getProducts(): Promise<Product[]>;
     static async purchase(productId: string): Promise<PurchaseResult>;
     static async restorePurchases(): Promise<void>;
     static async checkSubscriptionStatus(): Promise<SubscriptionStatus>;
   }
   ```

3. **購入フローの実装**
   - 製品情報の取得
   - 購入処理
   - レシート検証
   - 購入復元

4. **ストア統合**
   ```typescript
   // useAppStore に追加
   interface SubscriptionState {
     products: Product[];
     isLoadingProducts: boolean;
     purchaseInProgress: boolean;

     loadProducts: () => Promise<void>;
     purchaseProduct: (productId: string) => Promise<void>;
     restorePurchases: () => Promise<void>;
   }
   ```

### Phase 3: バックエンド連携（オプション）

サーバーサイドレシート検証を行う場合:

1. **App Store Server API 統合**
   - サーバーサイドでのレシート検証
   - サブスクリプションステータスの同期
   - Webhook通知の処理

2. **必要なエンドポイント**
   ```
   POST /api/subscription/verify
   POST /api/subscription/webhook
   GET  /api/subscription/status
   ```

### Phase 4: UI/UX 調整（1-2日）

1. **pricing.tsx の更新**
   - 実際の製品価格をApp Storeから取得
   - 購入ボタンの状態管理
   - 購入中のローディング表示
   - エラーハンドリング

2. **設定画面の更新**
   - 現在のサブスクリプション状態表示
   - 購入復元ボタン
   - サブスクリプション管理へのリンク

### Phase 5: テストとリリース（2-3日）

1. **Sandbox テスト**
   - 全購入フローのテスト
   - 更新/キャンセルのテスト
   - 購入復元のテスト

2. **App Store 審査準備**
   - 審査ガイドライン確認
   - 必要なプライバシーポリシー更新
   - 利用規約の更新

## コード例

### 初期化と製品取得

```typescript
// src/services/subscription.ts
import * as InAppPurchases from 'expo-in-app-purchases';

const PRODUCT_IDS = [
  'stopshorts.monthly',
  'stopshorts.quarterly',
  'stopshorts.annual',
];

export async function initializeIAP() {
  try {
    await InAppPurchases.connectAsync();
    console.log('IAP initialized');
  } catch (error) {
    console.error('Failed to initialize IAP:', error);
  }
}

export async function getProducts() {
  try {
    const { results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
    return results;
  } catch (error) {
    console.error('Failed to get products:', error);
    return [];
  }
}
```

### 購入処理

```typescript
export async function purchaseProduct(productId: string) {
  try {
    await InAppPurchases.purchaseItemAsync(productId);
    // 購入成功後の処理はリスナーで行う
  } catch (error) {
    if (error.code === 'E_USER_CANCELLED') {
      // ユーザーがキャンセルした場合
      return { success: false, cancelled: true };
    }
    throw error;
  }
}

// 購入リスナーの設定
InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
  if (responseCode === InAppPurchases.IAPResponseCode.OK) {
    results?.forEach(purchase => {
      // レシート検証
      // サブスクリプション状態の更新
      // 購入完了処理
      InAppPurchases.finishTransactionAsync(purchase, true);
    });
  }
});
```

## 注意事項

1. **App Store ガイドライン遵守**
   - 購入復元機能の実装必須
   - 価格表示は必ずApp Storeから取得した値を使用
   - 自動更新の説明を明確に表示

2. **エラーハンドリング**
   - ネットワークエラー
   - 購入失敗
   - レシート検証失敗

3. **セキュリティ**
   - レシート検証はサーバーサイドで行うことを推奨
   - 機密情報のハードコーディング禁止

## タイムライン

| フェーズ | 期間 | 担当 |
|---------|------|------|
| Phase 1: App Store 設定 | 1-2日 | 開発者 + Apple Developer |
| Phase 2: クライアント実装 | 3-5日 | 開発者 |
| Phase 3: バックエンド (オプション) | 2-3日 | バックエンド開発者 |
| Phase 4: UI/UX 調整 | 1-2日 | 開発者 |
| Phase 5: テスト・リリース | 2-3日 | QA + 開発者 |

**合計: 約 9-15日**

## 関連ドキュメント

- [Apple In-App Purchase Guide](https://developer.apple.com/in-app-purchase/)
- [StoreKit 2 Documentation](https://developer.apple.com/documentation/storekit/)
- [expo-in-app-purchases](https://docs.expo.dev/versions/latest/sdk/in-app-purchases/)
