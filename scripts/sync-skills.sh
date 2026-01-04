#!/usr/bin/env bash
set -euo pipefail

PROJECT_SKILLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.claude/skills"
GLOBAL_SKILLS_DIR="$HOME/.codex/skills"

if [ ! -d "$PROJECT_SKILLS_DIR" ]; then
  echo "Project skills dir not found: $PROJECT_SKILLS_DIR" >&2
  exit 1
fi

mkdir -p "$GLOBAL_SKILLS_DIR"

# Sync project-specific skills into global Codex skills without overwriting.
rsync -a --ignore-existing "$PROJECT_SKILLS_DIR/" "$GLOBAL_SKILLS_DIR/"

# Sync global Claude skills into global Codex skills without overwriting.
if [ -d "$HOME/.claude/skills" ]; then
  rsync -a --ignore-existing "$HOME/.claude/skills/" "$GLOBAL_SKILLS_DIR/"
fi

# Sync superpowers skills (if present).
if [ -d "$HOME/.claude/skills/superpowers/skills" ]; then
  rsync -a --ignore-existing "$HOME/.claude/skills/superpowers/skills/" "$GLOBAL_SKILLS_DIR/"
fi

echo "Skills sync complete: $GLOBAL_SKILLS_DIR"
