# Contributing to VibeOrg

Thank you for your interest in contributing to VibeOrg.

## Development Setup

1. Clone the repo
2. Run `npm install` in the root (installs dashboard dependencies via workspaces)
3. Run `cd scheduler && npm install` for scheduler dependencies
4. Run `npm run dev` to start the dashboard in development mode

## Project Structure

- `CLAUDE.md` — Orchestrator instructions (the brain of the system)
- `onboarding/` — Onboarding flow definitions and guides
- `agents/` — Agent definitions and registry
- `memory/` — Memory system and protocols
- `dashboard/` — Next.js dashboard application
- `scheduler/` — Task scheduler
- `scripts/` — Utility scripts
- `deploy/` — Deployment configurations

## Guidelines

- **Keep agents self-contained.** All agent files live in `agents/[id]/`. No cross-references.
- **Keep dashboard pages self-contained.** Import from `@/components/common/` and `@/lib/` only.
- **Use CSS variables for theming.** Never hardcode colors in components.
- **Files are the database.** Don't introduce external databases for core functionality.
- **Test with the validator.** Run `npm run validate` before submitting.

## Validation

```bash
npm run validate  # Run schema and structure validation
```

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run validate`
5. Run `npm run build` (dashboard must build cleanly)
6. Submit a pull request with a clear description
