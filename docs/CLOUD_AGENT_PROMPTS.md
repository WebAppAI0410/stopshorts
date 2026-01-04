# Cloud Claude Code Agent Prompts

StopShortsリポジトリをクラウドClaude Codeでレビュー・修正するためのプロンプト集。

## クイックスタート

1. [claude.ai/code](https://claude.ai/code) にアクセス
2. GitHubリポジトリ `WebAppAI0410/stopshorts` を接続
3. 以下のプロンプトをコピーして使用

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
