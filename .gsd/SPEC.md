# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Transform the existing Velopitt codebase from a legacy/hackish state into a robust, high-performance Angular v20+ application. The focus is on adopting modern best practices (Signals, Standalone Components, Strict Typing) to ensure maintainability, performance, and correctness, even for non-expert frontend engineers.

## Goals
1.  **Modernize Architecture**: Fully adopt Angular Signals for state management and Standalone components.
2.  **Elevate Code Quality**: Enforce strict TypeScript typing and best-practice abstractions.
3.  **Preserve Functionality**: Maintain 100% of existing feature set during refactor.

## Functional Requirements (The Product)
- **Interactive Map**: 3D terrain map of Pittsburgh area.
- **Segments of Interest**: Curated cycling segments (not routes) selectable for detailed data.
- **Data Visualization**: Gradient coloring, elevation charts, and bearing metadata for selected segments.
- **Layer Overlays**:
    - "Cycling Zones": Custom geographical groupings based on riding style (e.g., river trails vs. hills).
    - "Infrastructure": Official bike lanes/trails (BikePGH data).
    - "Bike+ Plan": Sketch overlay of future network plans.

## Non-Goals (Out of Scope)
- Adding major new user-facing features (focus is on refactoring/modernization).
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
