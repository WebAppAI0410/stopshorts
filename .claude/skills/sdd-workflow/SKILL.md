---
name: sdd-workflow
description: This skill should be used when the user asks to "start new feature", "create specification", "plan implementation", "run sdd workflow", "use kiro commands", or works with the .kiro/ directory, spec-driven development, or needs guidance on the requirements→design→tasks→implementation workflow.
---

# Spec-Driven Development (SDD) Workflow

cc-sddを使用した仕様駆動開発のワークフローガイド。

## Overview

SDDは「仕様を先に書き、承認してから実装する」アプローチ。AIが仕様に沿って正確に実装できるようになる。

```
Requirements → Design → Tasks → Implementation
    ↓            ↓        ↓          ↓
  何を作る    どう作る   分解     コード実装
```

## Quick Start

### 1. 新機能の仕様を開始

```bash
/kiro:spec-init "介入タイミング設定機能"
```

これにより `.kiro/specs/<feature-name>/` に仕様フォルダが作成される。

### 2. ワークフローの流れ

```
/kiro:spec-init        → 仕様の初期化
/kiro:spec-requirements → 要件定義
/kiro:spec-design      → 設計
/kiro:spec-tasks       → タスク分解
/kiro:spec-impl        → 実装
```

## Available Commands

### Specification Commands

| Command | Purpose |
|---------|---------|
| `/kiro:spec-init <what>` | 新しい仕様を開始 |
| `/kiro:spec-requirements` | 要件定義フェーズ |
| `/kiro:spec-design` | 設計フェーズ |
| `/kiro:spec-tasks` | タスク分解フェーズ |
| `/kiro:spec-impl` | 実装フェーズ |
| `/kiro:spec-status` | 現在の仕様状態を確認 |

### Steering Commands

| Command | Purpose |
|---------|---------|
| `/kiro:steering` | プロジェクトコンテキストを更新 |
| `/kiro:steering-custom <topic>` | カスタムステアリング文書を作成 |

### Validation Commands

| Command | Purpose |
|---------|---------|
| `/kiro:validate-design` | 設計の妥当性を検証 |
| `/kiro:validate-impl` | 実装の仕様適合性を検証 |
| `/kiro:validate-gap` | 仕様と実装のギャップ分析 |

## Workflow Phases

### Phase 1: Requirements（何を作るか）

**目的**: ユーザーストーリー、受け入れ条件、スコープを定義

```bash
/kiro:spec-requirements
```

**出力**: `.kiro/specs/<feature>/requirements.md`

**内容**:
- ユーザーストーリー
- 受け入れ条件
- スコープ（対象/対象外）
- 依存関係

### Phase 2: Design（どう作るか）

**目的**: アーキテクチャ、データフロー、APIを設計

```bash
/kiro:spec-design
```

**出力**: `.kiro/specs/<feature>/design.md`

**内容**:
- システムアーキテクチャ
- コンポーネント設計
- データフロー
- API/インターフェース定義

### Phase 3: Tasks（分解）

**目的**: 実装タスクを並列実行可能な単位に分解

```bash
/kiro:spec-tasks
```

**出力**: `.kiro/specs/<feature>/tasks.md`

**内容**:
- タスクリスト（依存関係付き）
- 並列実行可能なタスクの識別
- 各タスクの受け入れ条件

### Phase 4: Implementation（実装）

**目的**: タスクに従ってコードを実装

```bash
/kiro:spec-impl
```

**プロセス**:
1. タスクリストからタスクを選択
2. タスクの要件を確認
3. コードを実装
4. テストを追加
5. タスクを完了としてマーク

## Steering Documents

プロジェクトコンテキストを保存する文書。AIがセッションを跨いで一貫した判断ができるようになる。

### Core Steering Files

| File | Purpose |
|------|---------|
| `.kiro/steering/product.md` | プロダクト概要、コア機能、価値提案 |
| `.kiro/steering/tech.md` | 技術スタック、アーキテクチャ、開発標準 |
| `.kiro/steering/structure.md` | ディレクトリ構造、命名規則 |

### Custom Steering

特定のドメインについてカスタムステアリングを作成:

```bash
/kiro:steering-custom "認証フロー"
/kiro:steering-custom "エラーハンドリング"
```

## Best Practices

### 1. 仕様を先に承認

実装前に必ずRequirements/Designの承認を取る。後から変更すると手戻りが発生。

### 2. タスクは小さく

1タスク = 1-2時間で完了できるサイズに分解。大きすぎるとレビューが困難。

### 3. 依存関係を明確に

並列実行可能なタスクを識別し、依存関係があるタスクは順序を明記。

### 4. Steeringを最新に保つ

技術的判断やアーキテクチャ変更があったらSteeringを更新。

### 5. Gap Analysisを定期実行

```bash
/kiro:validate-gap
```

仕様と実装の乖離を早期発見。

## Example Workflow

### 新機能「介入タイミング設定」を実装する場合

```bash
# 1. 仕様を開始
/kiro:spec-init "介入タイミング設定"

# 2. 要件を定義
/kiro:spec-requirements
# → ユーザーが「即時」or「5分後」を選択できる
# → 設定はAsyncStorageに保存
# → デフォルトは「即時」

# 3. 設計
/kiro:spec-design
# → UI: RadioButton コンポーネント
# → Store: interventionTiming を追加
# → 画面: settings/intervention-timing.tsx

# 4. タスク分解
/kiro:spec-tasks
# → Task 1: StoreにinterventionTimingを追加
# → Task 2: UIコンポーネントを作成
# → Task 3: 設定画面を作成
# → Task 4: 介入ロジックにタイミング判定を追加

# 5. 実装
/kiro:spec-impl
# → 各タスクを順番に実装
```

## Directory Structure

```
.kiro/
├── specs/                    # 仕様書
│   └── <feature-name>/
│       ├── requirements.md   # 要件定義
│       ├── design.md         # 設計
│       └── tasks.md          # タスクリスト
├── steering/                 # プロジェクトコンテキスト
│   ├── product.md           # プロダクト概要
│   ├── tech.md              # 技術スタック
│   └── structure.md         # ディレクトリ構造
└── settings/                 # 設定
    ├── rules/               # AI生成ルール
    └── templates/           # ドキュメントテンプレート
```

## When to Use SDD

### Use SDD When:
- 新機能の実装
- 複数ファイルにまたがる変更
- アーキテクチャに影響する変更
- チームでレビューが必要な変更

### Skip SDD When:
- バグ修正（単純なもの）
- タイポ修正
- ドキュメント更新
- スタイル調整

## Related Skills

- **`stopshorts-onboarding`** - オンボーディングフロー
- **`stopshorts-store`** - Zustand状態管理
- **`stopshorts-ui-consistency`** - UIデザインシステム
