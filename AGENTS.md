# AI-DLC and Spec-Driven Development

Kiro-style Spec Driven Development implementation on AI-DLC (AI Development Life Cycle)

## Project Memory
Project memory keeps persistent guidance (steering, specs notes, component docs) so Codex honors your standards each run. Treat it as the long-lived source of truth for patterns, conventions, and decisions.

- Use `.kiro/steering/` for project-wide policies: architecture principles, naming schemes, security constraints, tech stack decisions, api standards, etc.
- Use local `AGENTS.md` files for feature or library context (e.g. `src/lib/payments/AGENTS.md`): describe domain assumptions, API contracts, or testing conventions specific to that folder. Codex auto-loads these when working in the matching path.
- Specs notes stay with each spec (under `.kiro/specs/`) to guide specification-level workflows.

## Project Context

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines
- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## Minimal Workflow
- Phase 0 (optional): `/kiro:steering`, `/kiro:steering-custom`
- Phase 1 (Specification):
  - `/kiro:spec-init "description"`
  - `/kiro:spec-requirements {feature}`
  - `/kiro:validate-gap {feature}` (optional: for existing codebase)
  - `/kiro:spec-design {feature} [-y]`
  - `/kiro:validate-design {feature}` (optional: design review)
  - `/kiro:spec-tasks {feature} [-y]`
- Phase 2 (Implementation): `/kiro:spec-impl {feature} [tasks]`
  - `/kiro:validate-impl {feature}` (optional: after implementation)
- Progress check: `/kiro:spec-status {feature}` (use anytime)

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro:spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration
- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro:steering-custom`)

---

## Cloud Claude Code Configuration

This repository is configured for cloud Claude Code (claude.ai/code) usage.

### Environment Detection
```bash
# Check if running in cloud
if [ "$CLAUDE_CODE_REMOTE" = "true" ]; then
  echo "Running in cloud environment"
fi
```

### SessionStart Hook
Dependencies are automatically installed when sessions start in cloud via `.claude/settings.json`.

### Parallel Agent Tasks

Cloud Claude Code can run parallel review and implementation tasks. Use these prompts:

#### Code Review Agent
```
Review the codebase for:
1. TypeScript type errors (`npx tsc --noEmit`)
2. Unused imports and dead code
3. React Hooks violations
4. i18n key usage (hardcoded Japanese text)
5. Theme compliance (hardcoded colors)

Report format:
- File: path/to/file.tsx
- Line: XX
- Issue: description
- Severity: error|warning|info
- Fix: suggested fix
```

#### UI Consistency Agent
```
Review UI components against StopShorts design system:
1. Check color usage matches ThemeContext colors
2. Verify typography uses theme.typography
3. Confirm spacing uses theme.spacing
4. Validate borderRadius uses theme.borderRadius
5. Check icon consistency (Ionicons with -outline suffix)

Reference: src/design/theme.ts
```

#### Architecture Review Agent
```
Review codebase architecture:
1. Verify expo-router file structure
2. Check Zustand store patterns
3. Validate component composition
4. Review state management boundaries
5. Check for circular dependencies

Reference: .kiro/steering/structure.md
```

#### Security Review Agent
```
Scan for security issues:
1. No hardcoded secrets or API keys
2. No sensitive data in logs (console.log)
3. Proper input validation
4. Safe navigation patterns
5. No vulnerable dependencies

Run: npm audit
```

#### Test Coverage Agent
```
Analyze test coverage:
1. Run existing tests: npm test
2. Identify untested critical paths
3. Check E2E test coverage: .maestro/flows/
4. Report coverage gaps

Focus areas: stores/, components/interventions/, services/
```

### Recommended Parallel Workflows

**Pre-PR Review (run in parallel):**
1. Code Review Agent - type errors, lint issues
2. UI Consistency Agent - design system compliance
3. Security Review Agent - vulnerability scan

**Post-Implementation Review:**
1. Architecture Review Agent - structural issues
2. Test Coverage Agent - testing gaps

**Continuous Improvement:**
1. `npx tsc --noEmit` - TypeScript check
2. `npm test` - Unit tests
3. `maestro test .maestro/flows/` - E2E tests (requires device)
