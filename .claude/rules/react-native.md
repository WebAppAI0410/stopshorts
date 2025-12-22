---
paths: app/**/*.tsx, src/components/**/*.tsx
---

# React Native & Expo Rules

## Component Structure
- Use function components only (no class components)
- Export default for screen components
- Named exports for reusable UI components

## Styling
- Use `useTheme()` hook to access theme colors
- Prefer inline styles with StyleSheet.create() for static styles
- Theme-dependent styles should use inline objects with theme values
- Never hardcode colors - always use `colors.xxx` from theme

## Hooks
- Follow React Hooks rules strictly
- Never call hooks inside loops, conditions, or nested functions
- Custom hooks should start with `use` prefix

## Navigation
- Use expo-router for all navigation
- Type routes with `Href` type from expo-router
- Screen files go in `app/` directory following file-based routing

## Animations
- Use react-native-reanimated for animations
- Prefer `entering`/`exiting` props for mount animations
- Use `FadeInUp`, `FadeInDown` from reanimated for consistency

## Icons
- Use `@expo/vector-icons` (Ionicons preferred)
- Icon names should end with `-outline` for consistency
