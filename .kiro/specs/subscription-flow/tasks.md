# Subscription Flow - Tasks

## Phase 1: RevenueCat統合（P0）

### Task 1.1: RevenueCat SDK セットアップ
- [ ] `react-native-purchases` インストール
- [ ] RevenueCat アカウント作成・設定
- [ ] App Store Connect 連携
- [ ] Google Play Console 連携
- [ ] 商品ID登録（monthly, quarterly, annual）
- [ ] Entitlement設定（premium）

> **実装ファイル**:
> - `package.json`
> - `app.json` (Expo plugin設定)
> - `src/services/revenuecat.ts` (新規)

### Task 1.2: 初期化処理
- [ ] アプリ起動時にRevenueCat初期化
- [ ] APIキー設定（環境変数）
- [ ] ユーザー識別子の設定

> **実装ファイル**:
> - `app/_layout.tsx`
> - `src/services/revenuecat.ts`
> - `.env` / `app.config.js`

---

## Phase 2: 購入フロー実装（P0）

### Task 2.1: 購入処理の実装
- [ ] `purchasePackage()` 実装
- [ ] トライアル開始処理
- [ ] 即時課金処理
- [ ] 購入成功時のコールバック
- [ ] 購入失敗時のエラーハンドリング

> **実装ファイル**:
> - `src/hooks/usePurchase.ts` (新規)
> - `src/services/revenuecat.ts`

### Task 2.2: pricing.tsx との統合
- [ ] 現行のモック処理を実際の購入処理に置換
- [ ] ローディング状態の表示
- [ ] エラーアラートの表示
- [ ] 購入成功後の画面遷移

> **実装ファイル**:
> - `app/(onboarding)/pricing.tsx`

### Task 2.3: 購入復元
- [ ] 「購入を復元」ボタン追加
- [ ] `restorePurchases()` 実装
- [ ] 復元結果のフィードバック

> **実装ファイル**:
> - `app/(onboarding)/pricing.tsx`
> - `app/(main)/settings.tsx`

---

## Phase 3: サブスクリプション状態管理（P0）

### Task 3.1: Entitlement確認
- [ ] アプリ起動時にEntitlement確認
- [ ] `CustomerInfo` の取得・キャッシュ
- [ ] `useSubscriptionAccess` フックの更新

> **実装ファイル**:
> - `src/hooks/useSubscriptionAccess.ts`
> - `src/services/revenuecat.ts`

### Task 3.2: トライアル期限切れ検知
- [ ] トライアル期限の追跡
- [ ] 期限切れ時のフラグ設定
- [ ] アプリ起動時の期限チェック

> **実装ファイル**:
> - `src/hooks/useSubscriptionAccess.ts`
> - `src/stores/useAppStore.ts`

---

## Phase 4: トライアル期限切れUI（P0-P1）

### Task 4.1: 期限切れ画面の作成
- [ ] `ExpiredTrialScreen.tsx` 作成
- [ ] 成果サマリー表示（介入回数、時間）
- [ ] プラン選択UI
- [ ] 「機能制限版で続ける」オプション

> **実装ファイル**:
> - `app/(main)/expired-trial.tsx` (新規)
> - `src/i18n/locales/ja.json`

### Task 4.2: 自動表示ロジック
- [ ] トライアル期限切れ時に自動遷移
- [ ] 機能制限版選択後の制限適用

> **実装ファイル**:
> - `app/(main)/_layout.tsx`
> - `src/hooks/useSubscriptionAccess.ts`

---

## Phase 5: 設定画面統合（P1）

### Task 5.1: サブスクリプション管理セクション
- [ ] 現在のプラン表示
- [ ] 有効期限表示
- [ ] 「購入を復元」ボタン
- [ ] アップグレード導線

> **実装ファイル**:
> - `app/(main)/settings.tsx`
> - `src/i18n/locales/ja.json`

---

## 品質チェック

```bash
npx tsc --noEmit  # エラー 0
npm test -- --passWithNoTests  # テストパス
```

---

## 依存関係

```
Task 1.1 → Task 1.2 → Task 2.1 → Task 2.2
                          ↓
                      Task 2.3
                          ↓
Task 3.1 → Task 3.2 → Task 4.1 → Task 4.2
                          ↓
                      Task 5.1
```
