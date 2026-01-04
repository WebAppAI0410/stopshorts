# Cloud Claude Code Agent Prompts

StopShortsリポジトリをクラウドClaude Codeでレビュー・修正するためのプロンプト集。

## クイックスタート

1. [claude.ai/code](https://claude.ai/code) にアクセス
2. GitHubリポジトリ `WebAppAI0410/stopshorts` を接続
3. 以下のプロンプトをコピーして使用

---

## SDD（仕様駆動開発）ワークフロー

### 開発工程の概要

```
Requirements → Design → Tasks → Implementation → Review
   (要件)      (設計)   (タスク)    (実装)       (検証)
```

### 重要ファイル

| ファイル | 説明 |
|----------|------|
| `.kiro/specs/intervention-system/requirements.md` | 機能要件 (REQ-1〜REQ-6) |
| `.kiro/specs/intervention-system/design.md` | 技術設計書 |
| `.kiro/specs/intervention-system/tasks.md` | タスク一覧と進捗 |
| `.kiro/steering/product.md` | プロダクト概要 |
| `.kiro/steering/tech.md` | 技術スタック |
| `.kiro/steering/structure.md` | プロジェクト構造 |
| `CLAUDE.md` | 開発規約 |
| `AGENTS.md` | AIエージェント向け指示 |

### 現在の開発状態 (2026-01)

| Phase | 内容 | 状態 |
|-------|------|------|
| Phase 1 | フリクション/ナッジ介入 | ✅ 完了 |
| Phase 2 | ミラー介入 | ✅ 完了 |
| Phase 3 | 介入選択 + オンボーディング | ⚠️ 部分完了 |
| Phase 4 | 心理トレーニング | ✅ 基本完了 |
| Phase 5 | AIチャットボット | ⚠️ スケルトンのみ (Mock LLM) |
| Phase 6 | 非機能要件 | 🔄 進行中 |

### Phase 3 残タスク
- Task 3.2: if-then.tsx の無効化・ルーティング更新
- Task 3.4: AI・トレーニングのモックアップ改善、課金フロー連携
- Task 3.5: 各介入画面でのアクセス制御適用（InterventionGate使用）

### Phase 5 残タスク
- Task 5.2: ExecuTorch/Gemma統合（ネイティブモジュール必要）
- Task 5.4.2: 会話圧縮
- Task 5.4.4: 長期記憶管理
- Task 5.8: AIタブ（ボトムナビ）
- Task 5.10〜5.15: 各種機能

### Phase 6 残タスク
- Task 6.1〜6.4: 非機能要件
- Task 6.5: E2Eテスト

---

## 0. SDD開発を続けるためのプロンプト

### 現在の進捗確認
```
StopShortsの開発進捗を確認してください。

手順:
1. .kiro/specs/intervention-system/tasks.md を読み込み
2. 各Phaseのタスク完了状態をチェック
3. 未完了タスクをリストアップ
4. 優先度順に整理

出力:
- 完了済みPhase/タスク
- 進行中のタスク
- 未着手の重要タスク
- 推奨する次のアクション
```

### 特定タスクの実装
```
StopShortsの「{タスク番号: 例 Task 3.2}」を実装してください。

参照ファイル:
- .kiro/specs/intervention-system/tasks.md（タスク詳細）
- .kiro/specs/intervention-system/design.md（設計仕様）
- .kiro/specs/intervention-system/requirements.md（要件）

手順:
1. タスクの要件を確認
2. 設計仕様を確認
3. 既存コードのパターンを分析
4. 実装
5. TypeScriptチェック (npx tsc --noEmit)
6. 完了したらtasks.mdのチェックボックスを更新

規約:
- CLAUDE.md の禁止事項を遵守
- ハードコード禁止（i18n使用）
- any型禁止
```

### 新機能の仕様作成
```
新機能「{機能名}」の仕様を作成してください。

SDDワークフロー:
1. requirements.md形式で要件を定義
2. design.md形式で技術設計を作成
3. tasks.md形式でタスク分解

参照:
- .kiro/specs/intervention-system/ の既存仕様
- .kiro/steering/ のプロジェクト方針

出力先: .kiro/specs/{feature-name}/
```

### 実装ループ（品質保証サイクル）
```
StopShortsの実装ループを実行してください。

ループ手順:
1. 実装
   - tasks.mdから次のタスクを選択
   - design.mdの仕様に従って実装
   - CLAUDE.mdの規約を遵守

2. 品質チェック
   - npx tsc --noEmit（エラー0必須）
   - 未使用import削除
   - any型がないか確認

3. コードレビュー
   - ハードコードされた文字列 → t()に変更
   - ハードコードされた色 → colors.xxxに変更
   - React Hooksルール違反がないか

4. 進捗更新
   - tasks.mdのチェックボックスを更新
   - 必要に応じてdesign.mdを更新

5. 問題があれば1に戻る

完了条件:
- TypeScriptエラー: 0
- 実装がdesign.mdと一致
- tasks.mdが最新状態
```

### Phase別の実装ガイド
```
StopShortsの「Phase {番号}」を完了させてください。

手順:
1. .kiro/specs/intervention-system/tasks.md から該当Phaseを読み込み
2. 未完了タスク（[ ]）をリストアップ
3. 依存関係を確認（他タスクへの依存がないか）
4. 順番に実装
5. 各タスク完了後にTypeScriptチェック
6. 全タスク完了後にtasks.mdを更新

注意:
- Phase 5のTask 5.2（ExecuTorch統合）はネイティブモジュールが必要なためスキップ可
- ネイティブ機能はMockで代替実装可
- クラウド環境ではE2Eテスト不可（Maestro未対応）
```

---

## 1. 総合コードレビュー

```
StopShortsリポジトリの総合レビューを実施してください。

実行タスク:
1. `npx tsc --noEmit` でTypeScriptエラーをチェック
2. 未使用のimportや変数を検出
3. React Hooksのルール違反を検出
4. ハードコードされた日本語テキストを検出（t()関数未使用）
5. ハードコードされた色を検出（colors.xxx未使用）

レポート形式:
- ファイル: path/to/file.tsx
- 行番号: XX
- 問題: 説明
- 重要度: error|warning|info
- 修正案: 具体的な修正方法

発見した問題は自動で修正してください。
```

---

## 2. UI一貫性レビュー

```
StopShortsのUIコンポーネントがデザインシステムに準拠しているか確認してください。

チェック項目:
1. 色の使用 - useTheme()のcolors.xxxを使用しているか
2. タイポグラフィ - typography.h1, typography.body等を使用しているか
3. スペーシング - spacing.sm, spacing.md等を使用しているか
4. 角丸 - borderRadius.sm, borderRadius.md等を使用しているか
5. アイコン - Ioniconsで-outlineサフィックスを使用しているか

参照ファイル:
- src/design/theme.ts
- src/contexts/ThemeContext.tsx

違反があれば修正してください。
```

---

## 3. i18n完全性チェック

```
StopShortsのi18n実装を確認してください。

タスク:
1. src/i18n/locales/ja.json を読み込み
2. 全TSX/TSファイルでt()関数の使用をスキャン
3. ハードコードされた日本語テキストを検出
4. 未使用のi18nキーを検出
5. t()で参照されているが存在しないキーを検出

発見した問題は修正してください:
- ハードコード → t('appropriate.key')に変更
- 存在しないキー → ja.jsonに追加
- 未使用キー → リストアップのみ（削除は後で判断）
```

---

## 4. 仕様書ギャップ分析

```
実装と仕様書の差分を分析してください。

仕様書:
- .kiro/specs/intervention-system/requirements.md
- .kiro/specs/intervention-system/design.md
- .kiro/specs/intervention-system/tasks.md

タスク:
1. 仕様書の各要件(REQ-X)を読み込み
2. 対応する実装ファイルを確認
3. 未実装・不完全な機能を特定
4. 仕様と実装の乖離をリストアップ

レポート形式:
| 要件ID | 仕様 | 実装状態 | ギャップ |
|--------|------|----------|----------|
| REQ-1  | xxx  | ✅/⚠️/❌  | 詳細     |
```

---

## 5. セキュリティスキャン

```
StopShortsのセキュリティ問題を検出してください。

チェック項目:
1. ハードコードされた秘密情報（APIキー、トークン等）
2. console.logでの機密情報出力
3. 入力値のバリデーション不足
4. 安全でないナビゲーションパターン
5. 脆弱な依存関係

実行コマンド:
- npm audit

発見した問題は重要度順にリストアップし、可能なものは修正してください。
```

---

## 6. アーキテクチャレビュー

```
StopShortsのアーキテクチャを分析してください。

チェック項目:
1. expo-routerのファイル構造が適切か
2. Zustandストアのパターンが一貫しているか
3. コンポーネント構成が適切か
4. 状態管理の境界が明確か
5. 循環依存がないか

参照:
- .kiro/steering/structure.md
- CLAUDE.md

問題があれば修正提案を出してください。
```

---

## 7. テスト実行とカバレッジ

```
StopShortsのテストを実行し、カバレッジを分析してください。

実行タスク:
1. npm test -- --passWithNoTests を実行
2. E2Eテストフローを確認: .maestro/flows/
3. 未テストのクリティカルパスを特定
4. カバレッジギャップをレポート

重点領域:
- src/stores/ - 状態管理
- src/components/interventions/ - 介入システム
- src/services/ - ビジネスロジック
```

---

## 8. 実装ループ（問題修正サイクル）

```
StopShortsの品質チェック・修正サイクルを実行してください。

ループ:
1. TypeScriptチェック: npx tsc --noEmit
2. エラーがあれば修正
3. 再度TypeScriptチェック
4. エラー0になるまで繰り返し

完了条件:
- TypeScriptエラー: 0
- 警告: 最小限

修正内容をコミットメッセージ形式でサマリーしてください。
```

---

## 9. 新機能実装準備

```
新機能「{機能名}」の実装準備をしてください。

タスク:
1. 既存のコードベースパターンを分析
2. 類似機能の実装を参照
3. 必要なファイル構成を提案
4. 型定義のスケルトンを作成
5. i18nキーのプレースホルダーを追加

参照:
- CLAUDE.md の実装規約
- .kiro/steering/ のプロジェクト方針
```

---

## 並行実行の例

3つのエージェントを並行で実行する場合:

**エージェント1: コードレビュー**
```
TypeScriptエラーと未使用コードを検出・修正してください。
npx tsc --noEmit を実行し、エラーをすべて解消してください。
```

**エージェント2: UIレビュー**
```
app/(main)/ と app/(onboarding)/ のすべてのスクリーンで
ハードコードされた色とテキストを検出し、
テーマとi18nを使用するよう修正してください。
```

**エージェント3: ドキュメント更新**
```
最近の実装変更に基づいて、以下を更新してください:
- docs/requirements_implementation_matrix.md
- .kiro/specs/intervention-system/tasks.md の完了状態
```

---

## 注意事項

- クラウド環境では自動的に `npm install` が実行されます
- E2Eテスト（Maestro）はエミュレータが必要なためクラウドでは実行不可
- コミット前に必ず `npx tsc --noEmit` でエラー0を確認
- 大きな変更は小さなコミットに分割
