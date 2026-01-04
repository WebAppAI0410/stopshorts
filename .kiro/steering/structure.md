# プロジェクト構造

## 組織方針

- 画面（expo-router）とUIコンポーネントを分離
- 画面は `app/`、ロジックとUIは `src/`
- 進行中プロジェクトのため既存構造を優先し、大規模移動は避ける

## ディレクトリパターン

### 画面
**場所**: `/app/`  
**用途**: ルーティングと画面構成（expo-router）  
**例**: `app/(onboarding)/welcome.tsx`

### UIコンポーネント
**場所**: `/src/components/`  
**用途**: 再利用UI・画面部品  
**例**: `src/components/ui/Button.tsx`

### ドメイン機能
**場所**: `/src/services/`, `/src/hooks/`, `/src/stores/`  
**用途**: ロジック・状態管理  
**例**: `src/services/screenTime.ts`

### モック/レビュー
**場所**: `/docs/mockups/`  
**用途**: HTMLモックアップ  
**例**: `docs/mockups/onboarding-flow.html`

### Storybook
**場所**: `/.rnstorybook/` + `src/**/*.stories.tsx`  
**用途**: UI差分比較・実機レビュー  
**例**: `src/components/ui/Button.stories.tsx`

## 命名規則

- **ファイル**: kebab-case（画面/ルート） or PascalCase（components）
- **コンポーネント**: PascalCase
- **関数**: camelCase

## import ルール

- `app/` から `src/` を参照
- `src/` 内は相対 import を基本

## コード整理原則

- 画面は薄く、ロジックは hooks/services/stores へ
- UI差分比較は Storybook の stories に閉じる
- 仕様変更は docs に先に反映
