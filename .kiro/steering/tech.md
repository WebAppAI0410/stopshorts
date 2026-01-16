# 技術スタック

## アーキテクチャ

- React Native + Expo Router（SDK 54）
- ローカル中心のデータ処理（端末内でスクリーンタイム集計）
- Android: UsageStatsManager + Overlay
- iOS: Screen Time / Family Controls（未着手 or モックあり）

## コア技術

- **言語**: TypeScript
- **フレームワーク**: React Native (Expo)
- **ランタイム**: Node.js 18+（ローカル開発）

## 主要ライブラリ

- **Routing**: expo-router
- **State**: zustand + AsyncStorage
- **UI/Styling**: NativeWind + global.css
- **Animation**: react-native-reanimated
- **Gestures**: react-native-gesture-handler
- **Testing**: Jest + React Native Testing Library
- **E2E**: Maestro
- **UI Review**: Storybook (dev only)

## 開発標準

### 型安全
- TypeScript strict（anyは避ける）

### 品質
- ESLint
- 重要ロジックはユニットテスト追加

### テスト
- Jestでロジック/コンポーネント
- MaestroでE2E（CI/EASに依存）

## 開発環境

### 必須ツール
- Node.js 18+
- Expo CLI / EAS CLI
- Android Studio（Android確認）

### 主要コマンド
```bash
# Dev
npx expo start

# Storybook
npm run storybook:generate
EXPO_PUBLIC_STORYBOOK_ENABLED=true npx expo start

# Typecheck
npx tsc --noEmit

# Test
npm test
```

## 重要な技術判断

- **Storybookはデバイスでの忠実確認に使う**（Webは差分が出やすい）
- **UI差分比較（A/B）はStorybookで行う**
- **iOS Screen Timeは未着手**（Family Controls entitlement未取得）

---
※進行中のため、既存のルーティング/状態管理を優先し、再設計は最小化する。
