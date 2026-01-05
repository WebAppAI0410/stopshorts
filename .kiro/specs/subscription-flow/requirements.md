# Subscription Flow - Requirements

## Overview

RevenueCatを使用した課金フローの実装。既存の料金設計（`docs/specs/02_pricing_monetization.md`）とUI（`app/(onboarding)/pricing.tsx`）を活かし、実際の課金処理を統合する。

**課金モデル**: 課金必須（機能制限版なし）

---

## 技術選定（確定）

| 項目 | 選定 | 理由 |
|------|------|------|
| 課金SDK | **RevenueCat** | iOS/Android統一API、無料枠十分、業界標準 |
| 支払い処理 | App Store / Google Play | RevenueCat経由で自動連携 |
| バックエンド | 不要 | RevenueCatがEntitlement管理 |

**ユーザー視点**: アプリ内でストアの決済画面が表示され、既存の支払い方法（Apple ID / Google Play登録済み）でワンタップ購入。

---

## サブスクリプション状態一覧

| 状態 | アクセス範囲 | 備考 |
|------|-------------|------|
| トライアル中（3日間） | 全機能 | - |
| トライアル終了猶予（1日） | 全機能 + 警告バナー | 「あと1日で使えなくなります」 |
| 課金中 | 全機能 | - |
| 解約予約中 | 全機能 | 期限まで使用可、設定で「○月○日まで有効」表示 |
| 課金終了 | ホーム + 統計の閲覧のみ | 他タブはブロック、介入機能無効 |
| 支払い失敗中 | 全機能 | RevenueCat猶予期間（約16日） |

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
| FR-2.2 | 3日間トライアル開始処理 | P0 |
| FR-2.3 | トライアルスキップ時の即時課金処理（オプション） | P0 |
| FR-2.4 | 購入成功時のEntitlement付与 | P0 |
| FR-2.5 | 購入失敗時のエラーハンドリング | P0 |
| FR-2.6 | 購入復元（Restore Purchases） | P0 |

### FR-3: サブスクリプション状態管理

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-3.1 | 現在のサブスクリプション状態をアプリ起動時に確認 | P0 |
| FR-3.2 | トライアル期限切れ検知（1日猶予期間含む） | P0 |
| FR-3.3 | サブスクリプション有効期限の追跡 | P0 |
| FR-3.4 | 解約予約中の期限表示 | P0 |
| FR-3.5 | 支払い失敗時の猶予期間対応（RevenueCatデフォルト） | P1 |

### FR-4: 課金終了後のアクセス制御

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-4.1 | ホーム画面・統計画面の閲覧を許可 | P0 |
| FR-4.2 | AI/Training/Profile等のタブをブロック | P0 |
| FR-4.3 | ブロックタブタップ時に購読モーダル表示 | P0 |
| FR-4.4 | 介入機能（Shield等）を無効化 | P0 |
| FR-4.5 | 過去データは永久保持（再購読時に復活） | P0 |

### FR-5: 購読促進UI

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-5.1 | トライアル終了猶予期間に警告バナー表示 | P0 |
| FR-5.2 | 課金終了時にブロック画面（成果サマリー付き）表示 | P0 |
| FR-5.3 | ホーム画面に再購読バナー表示（課金終了時） | P0 |
| FR-5.4 | 設定画面に「プレミアムにアップグレード」ボタン | P1 |

### FR-6: 設定画面のサブスク管理

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-6.1 | 現在のプラン表示 | P1 |
| FR-6.2 | 有効期限表示（解約予約中は「○月○日まで有効」） | P1 |
| FR-6.3 | 購入復元ボタン | P0 |
| FR-6.4 | App Store/Google Playのサブスク管理へのリンク | P1 |

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

- 機能制限版（無料プラン）
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
