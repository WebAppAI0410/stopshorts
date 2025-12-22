# Testing Guide

## テスト構成

- **Unit / Service tests**: Jest + jest-expo
- **E2E tests**: Detox (Android emulator / iOS simulator)
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

## E2E Tests (Detox)

### 対象
- `e2e/firstTest.e2e.js`（起動・基本フロー）
- Detox config: `.detoxrc.js` / `e2e/jest.config.js`

### 実行コマンド
```bash
npm run e2e:build:android
npm run e2e:test:android

npm run e2e:build:ios
npm run e2e:test:ios
```

### 注意点
- Android は emulator、iOS は simulator が必要
- CI では EAS Build を使ってアーティファクトを取得

## CI (GitHub Actions)

- `lint-typecheck`: ESLint + TypeScript
- `e2e-android`: EAS build → APK取得 → emulatorでDetox
- `e2e-ios`: EAS build → .app取得 → simulatorでDetox

ファイル: `.github/workflows/ci.yml`

## テスト追加の指針

- **UIの振る舞い**はE2Eで担保
- **ロジック・計算系**はJestで最小単位に分離して検証
- 画面・Hookの複雑度が上がる場合は `@testing-library/react-native` の導入を検討
