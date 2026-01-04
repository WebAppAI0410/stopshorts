---
name: quality-check
description: This skill should be used when the user asks to "run quality check", "check code quality", "run tsc", "run tests", "validate code", or when implementing code that needs verification. Also triggered by /impl-loop command.
---

# Quality Check Skill

実装後の品質検証プロセス。warning/error 0 を達成するまで修正を繰り返す。

## Overview

品質チェックは以下の順序で実行する：

```
TypeScript型チェック → Lintチェック → テスト実行
        ↓                 ↓              ↓
     必須              オプション      該当時のみ
```

## Quality Check Commands

### 1. TypeScript型チェック（必須）

```bash
npx tsc --noEmit
```

**判定基準**:
- ✅ PASS: エラー 0
- ❌ FAIL: エラー 1件以上

**よくあるエラーと対処**:
| エラー | 原因 | 対処 |
|--------|------|------|
| `Type 'X' is not assignable to type 'Y'` | 型の不一致 | 適切な型定義に修正 |
| `Property 'X' does not exist on type 'Y'` | 存在しないプロパティ | 型定義を追加 |
| `Cannot find module 'X'` | モジュール未インストール | npm install または import パス修正 |
| `Object is possibly 'undefined'` | null安全性 | optional chaining または null チェック |

### 2. Lintチェック（オプション）

```bash
# ESLint設定がある場合のみ
npx eslint src/ --ext .ts,.tsx
```

**判定基準**:
- ✅ PASS: warning/error 0
- ⚠️ WARN: warning のみ（許容だが修正推奨）
- ❌ FAIL: error 1件以上

### 3. テスト実行（該当時のみ）

```bash
npm test -- --passWithNoTests
```

**判定基準**:
- ✅ PASS: 全テスト成功
- ❌ FAIL: テスト失敗

## Execution Flow

```
┌─────────────────────────────────────────────────┐
│                品質チェック開始                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. npx tsc --noEmit                           │
│     └─ エラー検出 → 修正 → 再実行               │
│                                                 │
│  2. npx eslint (設定がある場合)                  │
│     └─ エラー検出 → 修正 → 再実行               │
│                                                 │
│  3. npm test -- --passWithNoTests              │
│     └─ 失敗 → 修正 → 再実行                     │
│                                                 │
│  4. 全チェック PASS → 完了                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Warning 0 Policy

Zenn記事（https://zenn.dev/mkj/articles/868e0723efa060）に基づく厳格な品質基準：

> AIは「一旦無視」「後で対応」が苦手。warning/errorが0になるまで確実に直す。

### 禁止事項

| 禁止 | 理由 |
|------|------|
| `// @ts-ignore` | 型エラーの隠蔽 |
| `// eslint-disable` | Lintエラーの隠蔽 |
| `any` 型の乱用 | 型安全性の低下 |
| テストのスキップ | 品質低下 |

### 許容される例外

| 例外 | 条件 |
|------|------|
| `// @ts-expect-error` | テストコードでの意図的な型違反 |
| `eslint-disable-next-line` | 明確な理由とコメント付き |
| `unknown` 型 | 適切にnarrowingする場合 |

## Integration with impl-loop

`/impl-loop` コマンドから呼び出される場合：

1. 品質チェックは Step 3 で実行される
2. 全チェックPASSになるまで修正を繰り返す
3. PASS後に code-reviewer / ui-reviewer へ進む

## Quick Reference

```bash
# 基本的な品質チェック
npx tsc --noEmit && npm test -- --passWithNoTests

# Lint含む完全チェック
npx tsc --noEmit && npx eslint src/ --ext .ts,.tsx && npm test -- --passWithNoTests
```

## Output Format

品質チェック完了時の報告形式：

```markdown
## 品質チェック結果

| 項目 | 結果 | 詳細 |
|------|------|------|
| TypeScript | ✅ PASS | エラー 0 |
| Lint | ⏭️ SKIP | 設定なし |
| Tests | ✅ PASS | 全テスト成功 |

**総合判定**: PASS

次のステップ: コードレビューを実行してください。
```

## Related

- `/impl-loop` - 実装ループコマンド
- `rn-expert` - React Native実装Subagent
- `code-reviewer` - コードレビューエージェント
