# iOS Shortcuts Integration (Spec)

## Goal
Provide per-app iOS Shortcuts that open StopShorts and pass the selected target app.

## Core Requirements
- Shortcuts are **per app** (one app per shortcut).
- User can only select **one app** per shortcut.
- When executed, shortcut opens StopShorts and triggers urge-surfing entry.
- If a user wants an app not in the default list, provide a **custom shortcut** for that app.

## Shortcut Behavior
Each shortcut should:
1) (Optional) Ask/confirm the target app name (for custom shortcut only)
2) Open URL:
   `stopshorts://urge-surfing?source=shortcut&appName=<APP_NAME>`

## Default Shortcuts to Provide
- TikTok
- YouTube
- Instagram

## Custom Shortcut
- Prompts user to input app name (single app)
- Opens StopShorts with that name

## Distribution (File Share)
- .shortcut files are bundled in the app (assets)
- "ショートカットを追加" launches a share sheet to open the .shortcut file in Shortcuts app
- Users must manually add (iOS requirement)

### File Naming (proposed)
- `assets/shortcuts/stopshorts-tiktok.shortcut`
- `assets/shortcuts/stopshorts-youtube.shortcut`
- `assets/shortcuts/stopshorts-instagram.shortcut`
- `assets/shortcuts/stopshorts-custom.shortcut`

## Constraints
- .shortcut ファイルは Shortcuts アプリで作成・書き出しする前提。
- アプリ内コードから .shortcut を生成/インストールする公式APIは使わない。
- 追加はユーザー操作が必須（自動追加は不可）。

## App UX
- Intervention Settings (iOS):
  - Show "ショートカットを追加" section
  - List default shortcuts + "カスタムアプリ用"
  - If shortcut file missing, show "準備中" message
