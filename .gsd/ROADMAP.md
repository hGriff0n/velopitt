# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v2.0-Refactor

## Must-Haves (from SPEC)
- [ ] Strict TypeScript Configuration
- [ ] Angular Signal Migration
- [ ] Standalone Component Migration
- [ ] 80% Test Coverage

## Phases

### Phase 1: GSD Setup & Baseline
**Status**: ⬜ Not Started
**Objective**: Establish the "Get Shit Done" methodology and lock in the current architectural understanding.
**Deliverables**: GSD file structure, initial code map updates.

### Phase 2: Foundation & Hygiene
**Status**: ⬜ Not Started
**Objective**: Clean up the "hackish" parts. Enforce strict typing, fix lint errors, and standardizing project structure.
**Deliverables**: `strict: true` in tsconfig, passing lint checks, removal of dead code/files.

### Phase 3: Modernization (Signals & Standalone)
**Status**: ⬜ Not Started
**Objective**: The "Rewrite". Convert components to Standalone and State to Signals.
**Deliverables**: No `NgModule`s, all `input()`/`output()` usage, `OnPush` change detection everywhere.

### Phase 4: Testing & Verification
**Status**: ⬜ Not Started
**Objective**: Ensure the new system is bulletproof.
**Deliverables**: Unit tests for all services/components, E2E smoke tests.
