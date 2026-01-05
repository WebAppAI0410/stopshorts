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
- [ ] 3日間トライアル開始処理
- [ ] 即時課金処理（トライアルスキップ）
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

### Task 3.2: サブスクリプション状態の追跡
- [ ] 状態列挙型の定義（trial, trialGrace, active, cancelled, expired, billingIssue）
- [ ] トライアル期限切れ検知
- [ ] 1日猶予期間の判定ロジック
- [ ] 解約予約中の検知
- [ ] 支払い失敗状態の検知

> **実装ファイル**:
> - `src/types/subscription.ts` (新規)
> - `src/hooks/useSubscriptionAccess.ts`
> - `src/stores/useAppStore.ts`

---

## Phase 4: アクセス制御（P0）

### Task 4.1: タブブロック機能
- [ ] 課金終了時にAI/Training/Profileタブをブロック
- [ ] ブロック状態の判定ロジック
- [ ] タブタップ時のブロック処理

> **実装ファイル**:
> - `app/(main)/_layout.tsx`
> - `src/hooks/useSubscriptionAccess.ts`

### Task 4.2: 購読モーダル
- [ ] `SubscriptionModal.tsx` 作成
- [ ] 成果サマリー表示（介入回数、取り戻した時間）
- [ ] プラン選択UI
- [ ] 購入フローへの遷移

> **実装ファイル**:
> - `src/components/subscription/SubscriptionModal.tsx` (新規)
> - `src/i18n/locales/ja.json`

### Task 4.3: 介入機能の無効化
- [ ] Shield画面の課金チェック
- [ ] 介入トリガーの課金チェック

> **実装ファイル**:
> - `app/(main)/shield.tsx`
> - `src/services/interventionService.ts`

---

## Phase 5: 購読促進UI（P0-P1）

### Task 5.1: 警告バナー（トライアル猶予期間）
- [ ] 「あと1日で使えなくなります」バナー
- [ ] ホーム画面上部に表示
- [ ] タップで購読画面へ遷移

> **実装ファイル**:
> - `src/components/subscription/TrialWarningBanner.tsx` (新規)
> - `app/(main)/index.tsx`

### Task 5.2: 再購読バナー（課金終了時）
- [ ] ホーム画面に再購読促進バナー
- [ ] タップで購読モーダル表示

> **実装ファイル**:
> - `src/components/subscription/ResubscribeBanner.tsx` (新規)
> - `app/(main)/index.tsx`

---

## Phase 6: 設定画面統合（P1）

### Task 6.1: サブスクリプション管理セクション
- [ ] 現在のプラン表示
- [ ] 有効期限表示（解約予約中は「○月○日まで有効」）
- [ ] 「購入を復元」ボタン
- [ ] App Store/Google Playサブスク管理リンク
- [ ] アップグレード導線

> **実装ファイル**:
> - `app/(main)/settings.tsx`
> - `src/i18n/locales/ja.json`

---

## Phase 7: i18n更新（P0）

### Task 7.1: 新規キー追加
- [ ] `subscription.trialWarning` - 「あと○日で使えなくなります」
- [ ] `subscription.expired` - 「プレミアム機能を使うには購読が必要です」
- [ ] `subscription.resubscribe` - 「プレミアムに戻る」
- [ ] `subscription.stats.interventions` - 「介入回数」
- [ ] `subscription.stats.timeSaved` - 「取り戻した時間」
- [ ] `subscription.validUntil` - 「○月○日まで有効」
- [ ] `subscription.restore` - 「購入を復元」

> **実装ファイル**:
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
Phase 1 (RevenueCat統合)
    ↓
Phase 2 (購入フロー)
    ↓
Phase 3 (状態管理)
    ↓
Phase 4 (アクセス制御) ← Phase 7 (i18n) 並行可能
    ↓
Phase 5 (購読促進UI)
    ↓
Phase 6 (設定画面)
```
