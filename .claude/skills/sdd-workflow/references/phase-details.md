# SDD Phase Details

各フェーズの詳細ガイド。

## Requirements Phase

### EARS Format

要件はEARS（Easy Approach to Requirements Syntax）形式で記述:

```
[WHERE <condition>] [WHEN <trigger>] THE <system> SHALL <action>
```

**Examples**:
- `THE system SHALL save intervention timing to AsyncStorage`
- `WHEN user taps save button THE system SHALL persist settings`
- `WHERE device is Android WHEN app detects target app THE system SHALL show overlay`

### Good Requirements Checklist

- [ ] 測定可能な受け入れ条件がある
- [ ] スコープが明確（対象/対象外）
- [ ] ユーザーストーリーが具体的
- [ ] 依存関係が識別されている
- [ ] エッジケースが考慮されている

## Design Phase

### Design Discovery

設計前に以下を調査:

1. **既存パターン**: 類似機能がどう実装されているか
2. **技術制約**: プラットフォーム固有の制限
3. **依存関係**: 影響を受けるコンポーネント

### Design Document Structure

```markdown
## Overview
機能の概要と目的

## Architecture
システムレベルの設計

## Components
新規/変更コンポーネント一覧

## Data Flow
データの流れ

## API/Interfaces
公開API・インターフェース定義

## Error Handling
エラーケースと対処

## Testing Strategy
テストアプローチ
```

## Tasks Phase

### Task Decomposition

タスクは以下の基準で分解:

1. **サイズ**: 1-2時間で完了可能
2. **独立性**: 他タスクへの依存が最小
3. **テスト可能**: 完了を検証できる

### Parallel Execution

依存関係を分析し、並列実行可能なタスクを識別:

```
Task 1: Store変更     ─┬─► Task 3: 設定画面
Task 2: UIコンポーネント ─┘

Task 4: ロジック統合 ← (Task 1, 2, 3 完了後)
```

### Task Format

```markdown
## Task: [ID] [Name]

### Description
何をするか

### Acceptance Criteria
- [ ] 条件1
- [ ] 条件2

### Dependencies
- Task X (must complete first)

### Files to Modify
- `path/to/file.tsx`
```

## Implementation Phase

### Implementation Order

1. 依存されるタスクから開始
2. 基盤→UI→統合の順
3. 各タスク完了後にテスト

### Code Quality Checks

実装中は以下を確認:

- TypeScript型エラーなし (`npx tsc --noEmit`)
- 既存テストがパス (`npm test`)
- UIがテーマに準拠（`useTheme()` 使用）

### Task Completion Criteria

タスクは以下を満たしたら完了:

1. コードが実装されている
2. 受け入れ条件を満たす
3. 型チェックがパス
4. 関連テストがパス（あれば）

## Validation

### Design Validation

設計が要件を満たすか検証:

```bash
/kiro:validate-design
```

**チェック項目**:
- すべての要件がカバーされているか
- 技術的に実現可能か
- 既存アーキテクチャと整合するか

### Implementation Validation

実装が設計に沿っているか検証:

```bash
/kiro:validate-impl
```

**チェック項目**:
- 設計通りに実装されているか
- すべてのタスクが完了しているか
- テストが追加されているか

### Gap Analysis

仕様と実装の差分を分析:

```bash
/kiro:validate-gap
```

**チェック項目**:
- 仕様変更があったか
- 実装漏れがないか
- 追加実装が必要か
