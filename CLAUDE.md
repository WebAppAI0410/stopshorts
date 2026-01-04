# CLAUDE.md - StopShorts プロジェクト設定

## 言語設定
- **日本語で応答してください**
- コード内のコメントは英語でも可

## プロジェクト概要
StopShortsは、ショート動画（TikTok、YouTube Shorts、Instagram Reels）の使用時間を制限し、ユーザーが時間を取り戻すことを支援するiOSアプリです。

## 技術スタック
- React Native + Expo SDK 54
- TypeScript
- expo-router (ファイルベースルーティング)
- NativeWind v4 (Tailwind CSS)
- Zustand (状態管理)
- react-native-reanimated (アニメーション)
- react-native-svg (SVGグラフィックス)

## デザインシステム
- **コンセプト**: Editorial Wellness Journal
- **カラーパレット**: Ink & Paper
- **アクセントカラー**: テラコッタ (#C65D3B)
- ライト/ダークモード対応

## ディレクトリ構造
```
app/                    # expo-router ページ
  (onboarding)/         # オンボーディングフロー
  (main)/               # メインアプリ画面
src/
  components/ui/        # 再利用可能なUIコンポーネント
  contexts/             # React Context (ThemeContext等)
  design/               # テーマ定義
  stores/               # Zustand ストア
  i18n/                 # 国際化 (日本語)
  types/                # TypeScript型定義
docs/                   # 実装仕様書
```

## コーディング規約
- 関数コンポーネントを使用
- TypeScriptの型を明示的に定義
- useTheme()フックでテーマカラーを取得
- インラインスタイルを優先（テーマ対応のため）
- React Hooksのルールを厳守（ループ内でフック呼び出し禁止）

## 実装ドキュメント
- `docs/IMPLEMENTATION_SPEC.md` - 詳細な実装仕様
- `.kiro/specs/` - 機能別仕様書（SDD）

## 仕様駆動開発 (SDD)

cc-sddを使用した仕様駆動開発ワークフロー。

### ワークフロー
```
Requirements → Design → Tasks → Implementation
```

### 主要コマンド
- `/kiro:spec-init <what>` - 新しい仕様を開始
- `/kiro:spec-requirements` - 要件定義
- `/kiro:spec-design` - 設計
- `/kiro:spec-tasks` - タスク分解
- `/kiro:spec-impl` - 実装
- `/kiro:steering` - プロジェクトコンテキスト更新

### ディレクトリ
- `.kiro/specs/` - 仕様書
- `.kiro/steering/` - プロジェクトコンテキスト

## 実装ループ

Zenn記事 (https://zenn.dev/mkj/articles/868e0723efa060) に基づく実装プロセス。

### コマンド
```bash
/impl-loop <feature-name> <task-numbers>
# 例: /impl-loop intervention-system 1.1,1.2
```

### フロー
```
実装 → 品質チェック → レビュー → 検証 → (問題あれば修正に戻る)
```

### Subagent連携
| Subagent | 用途 |
|----------|------|
| `rn-expert` | React Native/Expo専門の実装 |
| `pr-review-toolkit:code-reviewer` | コードレビュー |
| `ui-reviewer` | UIデザインシステムレビュー |

## 品質基準

### Warning/Error 0 ポリシー
AIは「一旦無視」「後で対応」が苦手。必ず 0 にする。

```bash
npx tsc --noEmit  # エラー 0 必須
npm test -- --passWithNoTests  # テスト全パス
```

### 禁止事項

| 禁止 | 代替 |
|------|------|
| `// @ts-ignore` | 適切な型定義 |
| `any` 型 | `unknown` + narrowing |
| ハードコード日本語 | `t('key')` を使用 |
| `console.log` 残存 | 削除 or `__DEV__` ガード |
| 未使用 import | 削除 |

### AI行動制限

**重要**: 以下の行動は明示的な指示なしに禁止

| 禁止行動 | 説明 |
|----------|------|
| モック実装の作成 | 仕様書にない機能のモック・スタブ実装は禁止 |
| 未実装の宣言 | できていないことを「完了」と報告禁止 |
| 仕様外の機能追加 | `.kiro/specs/`の仕様書にない機能の追加禁止 |
| プレースホルダー導入 | `// TODO`だけ残して中身がない実装の禁止 |

**許可される行動**:
- 仕様書に記載された機能の実装
- バグ修正
- リファクタリング（動作変更なし）
- 明示的に指示されたモック/スタブ実装

## i18n

- 全UI文字列は `src/i18n/locales/ja.json` に追加
- `t('namespace.key')` で文字列取得
- ハードコード禁止

## プラットフォーム対応

- **Android優先**: デバッグ容易なためAndroidで先に実装・検証
- **iOS後続**: Android検証後に実装
- `Platform.OS` 分岐は最小限に
