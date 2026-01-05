# Subscription Flow - Requirements

## Overview

RevenueCatを使用した課金フローの実装。既存の料金設計（`docs/specs/02_pricing_monetization.md`）とUI（`app/(onboarding)/pricing.tsx`）を活かし、実際の課金処理を統合する。

---

## 技術選定（確定）

| 項目 | 選定 | 理由 |
|------|------|------|
| 課金SDK | **RevenueCat** | iOS/Android統一API、無料枠十分、業界標準 |
| 支払い処理 | App Store / Google Play | RevenueCat経由で自動連携 |
| バックエンド | 不要 | RevenueCatがEntitlement管理 |

**ユーザー視点**: アプリ内でストアの決済画面が表示され、既存の支払い方法（Apple ID / Google Play登録済み）でワンタップ購入。

---

## Functional Requirements

### FR-1: RevenueCat統合

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-1.1 | RevenueCat SDKのインストールと初期化 | P0 |
| FR-1.2 | App Store Connect / Google Play Consoleとの連携設定 | P0 |
| FR-1.3 | 商品ID登録（monthly, quarterly, annual） | P0 |
| FR-1.4 | Entitlement設定（premium） | P0 |

### FR-2: 購入フロー

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-2.1 | オンボーディング pricing.tsx から購入処理を実行 | P0 |
| FR-2.2 | 1日トライアル開始処理 | P0 |
| FR-2.3 | トライアルスキップ時の即時課金処理 | P0 |
| FR-2.4 | 購入成功時のEntitlement付与 | P0 |
| FR-2.5 | 購入失敗時のエラーハンドリング | P0 |
| FR-2.6 | 購入復元（Restore Purchases） | P0 |

### FR-3: サブスクリプション状態管理

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-3.1 | 現在のサブスクリプション状態をアプリ起動時に確認 | P0 |
| FR-3.2 | トライアル期限切れ検知 | P0 |
| FR-3.3 | サブスクリプション有効期限の追跡 | P0 |
| FR-3.4 | 機能制限版へのダウングレード処理 | P1 |

### FR-4: トライアル期限切れUI

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-4.1 | トライアル期限切れ時に選択画面を表示 | P0 |
| FR-4.2 | 成果サマリー表示（介入回数、取り戻した時間） | P1 |
| FR-4.3 | プラン選択 → 購入フローへの遷移 | P0 |
| FR-4.4 | 「機能制限版で続ける」オプション | P0 |

### FR-5: 設定画面からのアクセス

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-5.1 | 設定画面にサブスクリプション管理セクション追加 | P1 |
| FR-5.2 | 現在のプラン表示 | P1 |
| FR-5.3 | アップグレード/ダウングレードへの導線 | P2 |
| FR-5.4 | 購入復元ボタン | P1 |

---

## Non-Functional Requirements

| ID | 要件 | 優先度 |
|----|------|--------|
| NFR-1 | オフライン時のEntitlementキャッシュ | P1 |
| NFR-2 | 購入処理中のローディング表示 | P0 |
| NFR-3 | エラー時のユーザーフレンドリーなメッセージ | P0 |
| NFR-4 | App Store審査対応（復元ボタン必須） | P0 |

---

## Out of Scope

- 複数プロファイル機能
- ファミリープラン
- 企業向けプラン
- プロモーションコード

---

## Dependencies

- RevenueCat アカウント作成
- App Store Connect 商品登録
- Google Play Console 商品登録

---

## Existing Assets

| 資料 | パス |
|------|------|
| 料金設計書 | `docs/specs/02_pricing_monetization.md` |
| 課金画面UI | `app/(onboarding)/pricing.tsx` |
| サブスクリプション型定義 | `src/types/index.ts` |
| サブスクリプションフック | `src/hooks/useSubscriptionAccess.ts` |
