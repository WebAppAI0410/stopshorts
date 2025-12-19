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
- `docs/GEMINI_PROMPT.md` - Gemini向け実装プロンプト
