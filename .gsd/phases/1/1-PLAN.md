---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Modernize Codebase & Tech Debt

## Objective
Update the codebase to meet strict quality standards (80%+ test coverage), modernize Angular patterns (Signals, Control Flow), and refactor the core Map component for better maintainability.

## Context
- Current Coverage: ~58% Statements.
- Key Debt Areas: `MapComponent` (24%), `SegmentOverlayComponent` (53%), `LayerService` (63%).
- Goal: "Complete" coverage (aiming for 85-90% to be safe, enforcing 80%) and modular architecture.

## Tasks

<task type="auto">
  <name>Scaffold Tests for LayerService</name>
  <files>
    src/app/services/layer-service.spec.ts
    src/app/services/layer-service.ts
  </files>
  <action>
    1. Analyze `LayerService` coverage gaps (lines 98, 104, 120-122).
    2. Add unit tests for `toggleBikeNetwork` and layer visibility logic.
    3. Ensure all branches in `getRequiredSources` are covered.
  </action>
  <verify>npm test -- --include=src/app/services/layer-service.spec.ts --code-coverage</verify>
  <done>LayerService coverage > 90%.</done>
</task>

<task type="auto">
  <name>Refactor & Test SegmentOverlay</name>
  <files>
    src/app/components/segment/segment-overlay.component.spec.ts
    src/app/components/segment/segment-overlay.component.ts
  </files>
  <action>
    1. Convert `SegmentOverlayComponent` to use Angular Signals for inputs/outputs if not already.
    2. Add tests for `closeOverlay` and interaction logic.
    3. Mock `LayerService` and `SegmentService` accurately in tests.
  </action>
  <verify>npm test -- --include=src/app/components/segment/segment-overlay.component.spec.ts --code-coverage</verify>
  <done>SegmentOverlayComponent coverage > 90%.</done>
</task>

<task type="auto">
  <name>Refactor MapComponent (Part 1: Extraction)</name>
  <files>
    src/app/components/map/map.component.ts
    src/app/services/map-state.service.ts
  </files>
  <action>
    1. Update `MapStateService` to manage `Map` instance, markers, and layers.
    2. Move private helper methods (`highlightSegment`, `toggleSegmentLayer`, `updateMapTheme`, `addAllSegments`) from `MapComponent` to `MapStateService`.
    3. Expose effect-friendly Signals/Methods in Service for controlling map features.
    4. `MapComponent` should only be responsible for:
       - Creating the Map (UI concern)
       - Registering it with Service
       - Listening for View-only events if necessary.
  </action>
  <verify>npm build</verify>
  <done>Logic moved, app compiles.</done>
</task>

<task type="auto">
  <name>Test MapComponent & MapStateService</name>
  <files>
    src/app/components/map/map.component.spec.ts
    src/app/services/map-state.service.spec.ts
    src/app/services/map-state.service.ts
  </files>
  <action>
    1. Create/Update `MapStateService` tests to cover the moved logic (layer management, interaction handlers).
    2. Simplify `MapComponent` tests to verify it delegates correctly to `MapStateService`.
  </action>
  <verify>npm test -- --include=src/app/services/map-state.service.spec.ts --code-coverage && npm test -- --include=src/app/components/map/map.component.spec.ts --code-coverage</verify>
  <done>Combined coverage (Map + Service) > 85%.</done>
</task>

<task type="auto">
  <name>Global Modernization Scan</name>
  <files>
    src/app/**/*.ts
  </files>
  <action>
    1. Scan all components for Standalone: true (verify).
    2. Replace any `*ngIf` / `*ngFor` with `@if` / `@for`.
    3. Ensure `ChangeDetectionStrategy.OnPush` is used everywhere.
  </action>
  <verify>npm build && npm test</verify>
  <done>Codebase uses modern Angular control flow and change detection.</done>
</task>

<task type="manual">
  <name>Performance & Abstraction Research</name>
  <files>
    .gsd/phases/1/RESEARCH.md
  </files>
  <action>
    1. Investigate rendering performance (Mapbox layers, heavy DOM elements) and identify bottlenecks.
    2. Analyze the roadmap (Interactive Atlas, GPX Viewer, Route Editor) to find common abstraction patterns (e.g., specific "MapEntity" service hierarchy).
    3. Document recommendations for:
       - optimized change detection (beyond OnPush).
       - lazy loading strategies for heavy map features.
       - shared architectures for current and future map-heavy features.
  </action>
  <verify>Research document exists and contains actionable insights.</verify>
  <done>Findings documented in RESEARCH.md.</done>
</task>

## Success Criteria
- [ ] Global Test Coverage > 80% (Statements, Branches, Functions, Lines).
- [ ] `MapComponent` refactored to delegate state to `MapStateService`.
- [ ] All components use `@if` / `@for` syntax.
- [ ] CI/CD pipeline (local test run) passes without coverage errors.
