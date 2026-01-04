# Intervention Timing (Spec)

## Goal
Unify intervention timing so that delayed interventions are based on **daily cumulative usage** per target app.

## Rules
- **Target is per app**: cumulative usage is tracked per selected app.
- **Trigger frequency**: intervene **each time** cumulative usage crosses the threshold (e.g., 10, 20, 30 minutes).
- **Immediate mode stays**: immediate intervention remains available.
- **Daily reset**: cumulative usage resets when the local date changes.

## iOS Handling
- iOS uses **Shortcuts** for immediate intervention instead of native Screen Time APIs.
- The app provides a shortcut for users to install.

## Urge Surfing Duration
- Urge surfing remains **fixed to 30/60 seconds**.
- A **settings item** allows users to choose 30 or 60 seconds.
- The in-flow selection UI is removed to avoid conflicts.
