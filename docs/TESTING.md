# Testing Guide

## テスト構成

- **Unit / Service tests**: Jest + jest-expo
- **E2E tests**: Maestro (Android / iOS)
- **CI**: GitHub Actions で lint/typecheck + E2E

## Unit / Service Tests (Jest)

### 対象
- `src/services/**` の純粋ロジック
- 依存の薄い関数 (mockデータ生成、バッジ計算、パーソナライズ)

### 追加済みテスト
- `src/services/__tests__/screenTime.test.ts`
- `src/services/__tests__/personalization.test.ts`
- `src/services/__tests__/badges.test.ts`

### 実行コマンド
```bash
npm test
npm run test:watch
```

## UI Tests (React Native Testing Library)

### 対象
- UIコンポーネントの表示/イベント
- Hook を含む軽量な画面ロジック（必要に応じて）

### 追加済みテスト
- `src/components/ui/__tests__/Button.test.tsx`
- `src/components/ui/__tests__/ProgressIndicator.test.tsx`
- `src/components/ui/__tests__/StatCard.test.tsx`

### 実行コマンド
```bash
npm test
```

### メモ
- `ThemeProvider` など Context が必要な場合は wrapper を使う
- Reanimated / Gesture Handler / AsyncStorage は Jest で mock 済み

## UI Review (Storybook)

### 目的
- React Native 実機/シミュレータで UI を忠実に確認
- 仕様レビューと実装の差分を最小化

### 使い方
```bash
npm run storybook:generate
EXPO_PUBLIC_STORYBOOK_ENABLED=true npx expo start
```

### メモ
- `/storybook` ルートで Storybook を開く
- 新しい `*.stories.tsx` を追加したら `storybook:generate` を再実行

## E2E Tests (Maestro)

### 対象
- `.maestro/flows/` 内のYAMLフローファイル
- Maestro Cloud でCI実行

### 実行コマンド
```bash
# ローカルで実行
maestro test .maestro/flows/

# Maestro Cloud経由（CI）
# .github/workflows/maestro-cloud.yml を参照
```

### 注意点
- Android / iOS の実機またはシミュレータが必要
- CI では Maestro Cloud を使用してテスト実行

## CI (GitHub Actions)

- `lint-typecheck`: ESLint + TypeScript
- `maestro-cloud.yml`: EAS build → Maestro Cloud でE2E実行

ファイル: `.github/workflows/ci.yml`

## テスト追加の指針

- **UIの振る舞い**はE2Eで担保
- **ロジック・計算系**はJestで最小単位に分離して検証
- 画面・Hookの複雑度が上がる場合は `@testing-library/react-native` の導入を検討
