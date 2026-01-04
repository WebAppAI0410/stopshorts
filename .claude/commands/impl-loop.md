---
description: 実装→レビュー→修正の強制ループを実行
allowed-tools: Task, Read, Glob, Grep, Bash, Edit, Write
argument-hint: <feature-name> [task-numbers]
---

# 実装↔レビュー強制ループ

## 概要

指定されたタスクに対して、以下の順序で実装とレビューを繰り返します：
1. 実装（rn-expert subagent）
2. 品質チェック（quality-check skill参照）
3. レビュー（code-reviewer / ui-reviewer）
4. 検証（/kiro:validate-impl）

**すべてのレビューをクリアするまで、1-3を繰り返します。**

---

## 実行フロー

```
┌─────────────────────────────────────────────────────────┐
│                    実装ループ開始                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 仕様読み込み                                         │
│     └─ .kiro/specs/<feature>/tasks.md から対象タスク取得 │
│                                                         │
│  2. 実装フェーズ (rn-expert subagent)                    │
│     ├─ React Native / Expo / TypeScript専門             │
│     ├─ デザインシステム準拠                              │
│     └─ i18n対応                                         │
│                                                         │
│  3. 品質チェック (quality-check skill)                  │
│     ├─ TypeScript型チェック: npx tsc --noEmit           │
│     ├─ Lintチェック: 必要に応じて                        │
│     └─ テスト実行: npm test (該当があれば)               │
│                                                         │
│  4. コードレビュー                                       │
│     ├─ Task(code-reviewer): 一般的な品質                 │
│     └─ Task(ui-reviewer): UI/デザインシステム準拠        │
│                                                         │
│  5. 問題があれば → 2に戻る                               │
│     問題がなければ → 6へ                                 │
│                                                         │
│  6. 実装検証                                             │
│     └─ /kiro:validate-impl <feature> <tasks>            │
│                                                         │
│  7. 完了報告                                             │
│     └─ tasks.md のチェックボックスを更新                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 使用方法

```bash
# Phase 1 の Task 1.1 を実装
/impl-loop intervention-system 1.1

# Phase 1 の複数タスクを実装
/impl-loop intervention-system 1.1,1.2,1.3

# 引数なしで対話的に選択
/impl-loop
```

---

## 実行手順

### Step 1: 仕様読み込み

1. `.kiro/specs/$1/tasks.md` を読み込む
2. 指定されたタスク番号（$2）の内容を抽出
3. 関連する `requirements.md` と `design.md` を参照

### Step 2: 実装

Task tool で `rn-expert` subagent を起動：

```
実装対象:
- Feature: $1
- Tasks: $2

参照仕様:
- .kiro/specs/$1/requirements.md
- .kiro/specs/$1/design.md
- .kiro/specs/$1/tasks.md

制約:
- TypeScript厳密型
- i18n対応（ハードコード日本語禁止）
- デザインシステム準拠（useTheme使用）
- Platform.OS分岐は最小限
```

### Step 3: 品質チェック

以下のコマンドを順次実行：

```bash
# TypeScript型チェック
npx tsc --noEmit

# テスト実行（該当があれば）
npm test -- --passWithNoTests
```

**warning/errorが0になるまで修正を繰り返す。**

### Step 4: コードレビュー

Task tool で以下のエージェントを順次起動：

1. `pr-review-toolkit:code-reviewer` - 一般的なコード品質
2. `ui-reviewer` (プロジェクト定義) - デザインシステム準拠

### Step 5: 問題対応

レビューで問題が検出された場合：
1. 問題を修正
2. Step 3 に戻る

### Step 6: 実装検証

```bash
/kiro:validate-impl $1 $2
```

GO判定が出るまで修正を繰り返す。

### Step 7: 完了

1. `tasks.md` の該当タスクを `[x]` に更新
2. 実装サマリーを出力

---

## 品質基準

### 必須クリア項目

| 項目 | 基準 |
|------|------|
| TypeScript | `tsc --noEmit` エラー0 |
| コードレビュー | 重大な問題なし |
| UIレビュー | デザインシステム準拠 |
| 要件充足 | validate-impl で GO |

### 推奨項目

| 項目 | 基準 |
|------|------|
| テストカバレッジ | 新規コードに対するテスト |
| i18n | 全文字列が locale ファイル参照 |

---

## Subagent連携

このコマンドは以下のSubagentを使用します：

| Subagent | 用途 |
|----------|------|
| `rn-expert` | React Native/Expo専門の実装 |
| `pr-review-toolkit:code-reviewer` | 一般的なコードレビュー |
| `ui-reviewer` | UI/デザインシステムレビュー |

Subagentが認識すべき情報：
- このコマンドから呼び出されている場合、ループの一部として動作
- 問題発見時は具体的な修正提案を含める
- 曖昧な指摘ではなく、コード例を含める

---

## 出力形式

```markdown
# 実装ループ完了レポート

## 概要
- Feature: intervention-system
- Tasks: 1.1, 1.2
- ループ回数: 2回
- 最終結果: GO

## 実装内容
- [x] Task 1.1: 累積待機時間の実装
- [x] Task 1.2: 意図入力UIの実装

## 品質チェック結果
- TypeScript: PASS
- Lint: PASS
- Tests: N/A

## レビュー結果
- Code Review: PASS
- UI Review: PASS

## 次のステップ
- Task 1.3 の実装を推奨
```
