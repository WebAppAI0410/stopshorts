# StopShorts 要件・実装 対応表（現行実装準拠）

最終更新: 2025-12-19

このドキュメントは **現行実装が正** という前提で、`docs/specs/01_requirements.md` との対応を整理したものです。  
また、**Screen Time / Family Controls 関連は Apple の entitlement 未取得のためモック実装**であることを前提にしています。

---

## 1. 価値/ビジョン/コアバリュー

| 要件 | 実装 | 状態 | 補足 |
|---|---|---|---|
| プロダクトビジョン「5分で止める」 | `app/(onboarding)/welcome.tsx`, `app/(onboarding)/how-it-works.tsx`, `app/(main)/shield.tsx` | 反映済 | UI/コピーで表現 |
| 強制介入（Screen Time APIで遮断） | `modules/screen-time/*` | モック/準備中 | entitlement未取得 |
| コミットメントデバイス | `app/(onboarding)/start.tsx`, `useAppStore.completeOnboarding()` | 反映済 | 課金連携は未実装 |
| 行動科学/自己効力感 | `src/services/personalization.ts`, `app/(onboarding)/*` | 反映済 | 文言/フローで表現 |

---

## 2. FR-001 オンボーディング

| 要件 | 実装 | 状態 | 補足 |
|---|---|---|---|
| FR-001-1 価値提案（3画面以内） | `welcome.tsx`, `the-problem.tsx`, `goal.tsx`, `motivation.tsx` 他 | 実装優先 | 現行は v3 の 10 ステップ構成 |
| FR-001-2 目的設定（Why） | `goal.tsx`, `motivation.tsx` | 反映済 | 目的モデルは新仕様へ更新 |
| FR-001-3 Screen Time権限取得 | `screentime-permission.tsx`, `src/services/screenTime.ts` | 反映済 | entitlement未取得のためモック |
| FR-001-4 対象アプリ選択（FamilyControls picker） | `app-selection.tsx` | 反映済（UI） | pickerは entitlement 前提で未接続 |
| FR-001-5 実装意図設定 | `alternative.tsx`, `if-then.tsx` | 反映済 | If-Then 形式へ更新 |

---

## 3. FR-002 遮断機能（コア）

| 要件 | 実装 | 状態 | 補足 |
|---|---|---|---|
| FR-002-1 5分到達で遮断 | `modules/screen-time/src/ScreenTimeModule.swift` | モック/準備中 | 実動線は entitlement 後 |
| FR-002-2 Shield画面表示 | `app/(main)/shield.tsx` | UI実装済 | 発火はモック想定 |
| FR-002-3 パーソナライズ文言 | `src/services/personalization.ts` | 反映済 | purpose/sleepProfile 依存 |
| FR-002-4 閉じるでアプリ終了 | `shield.tsx`（UI） | 未接続 | iOS制約/実装方針待ち |

---

## 4. FR-003 統計・可視化

| 要件 | 実装 | 状態 | 補足 |
|---|---|---|---|
| FR-003-1 今日の介入回数 | `useStatisticsStore.dailyStats`, `recordIntervention()` | 実装済 | 統計ストア統合済 |
| FR-003-2 週間サマリー | `app/(main)/statistics.tsx` | 実装済 | データ無し時はダミー値 |
| FR-003-3 節約時間計算 | `DailyStats.totalBlockedMinutes` | 実装済 | 実測連動は未接続 |
| FR-003-4 ストリーク表示 | `StreakIndicator` | UI実装済 | 計算は仮値 |

---

## 5. 非機能要件

| 要件 | 実装 | 状態 | 補足 |
|---|---|---|---|
| ローカル保存（MVPはサーバ不要） | `useAppStore` + `AsyncStorage` | 反映済 |  |
| パフォーマンス（遮断応答1秒以内） | 監視実装が未接続 | 検証不可 | entitlement待ち |
| アクセシビリティ（VoiceOver/Dynamic Type/コントラスト） | UI設計で配慮 | 未検証 | 明示検証が必要 |

---

## 6. 技術制約・リスク

| 要件 | 実装 | 状態 | 補足 |
|---|---|---|---|
| Screen Time APIマネタイズ禁止 | 課金連携未実装 | 整合 |  |
| Family Controls entitlement 必須 | モック実装 | 整合 | 取得後に実装接続 |

---

## 7. 仕様差分（要件側が旧仕様）

- オンボーディングは **v3 の 10 ステップ構成**に更新済み  
- 目的モデルは **UserPurpose → Goal/Motivation** へ移行  
- 実装意図は **ImplementationIntent → IfThenPlan** へ移行  
- Screen Time は **実APIではなくモック前提**

