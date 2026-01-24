# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Transform the existing Velopitt codebase from a legacy/hackish state into a robust, high-performance Angular v20+ application. The focus is on adopting modern best practices (Signals, Standalone Components, Strict Typing) to ensure maintainability, performance, and correctness, even for non-expert frontend engineers.

## Goals
1.  **Modernize Architecture**: Fully adopt Angular Signals for state management and Standalone components to reduce boilerplate and complexity.
2.  **Elevate Code Quality**: Enforce strict TypeScript typing, rigorous linting, and best-practice abstractions to eliminate "hackish" patterns.
3.  **Ensure Reliability**: Establish a comprehensive testing strategy with >80% coverage to prevent regressions and ensure stability.

## Non-Goals (Out of Scope)
- Adding major new user-facing features (focus is purely on refactoring/modernization first).
- changing the underlying map provider (Mapbox GL JS stays).

## Users
- **Main User**: Cycling enthusiasts in Pittsburgh viewing segment data.
- **Developer User**: The "User" (you), needing a clean, understandable, and safe codebase to work in.

## Constraints
- **Tech Stack**: Angular 20+, TypeScript 5+, Mapbox GL JS.
- **Performance**: Map interactions must remain 60fps; initial load time should decrease.

## Success Criteria
- [ ] All components converted to Standalone API.
- [ ] Application state fully managed via Signals (no `Zone.js` reliance where possible).
- [ ] `npm test` coverage report shows >80% coverage.
- [ ] Application passes `ng build` with `strict: true` and no linting errors.
