# User Display Name (Spec)

## Goal
Define consistent behavior when the user name is missing.

## Rules
- If `userName` is missing or empty, use the default label: **"ユーザー"**.
- In sentence contexts, append "さん" (e.g., "ユーザーさん").
- This default applies to all UI surfaces that display a user name.

## Examples
- Missing name: "ユーザーさんの『TikTokを見たい』という衝動"
- Provided name: "太郎さんの『TikTokを見たい』という衝動"
