# Angular Modernization Todo

This document tracks the discrete steps required to modernize the Velopitt application. Each step is designed to be a single, reviewable unit of work.

> [!IMPORTANT]
> **Instructions for Agents**:
> 1.  **Commit per Step**: Each checklist item below must result in a single, comprehensive GitHub commit.
> 2.  **Mark Complete**: After completing a step (and verifying it), you must immediately mark it as `[x]` in this file.

## Phase 1: Infrastructure & Testing Foundation
- [x] **Configure Linting**: Update ESLint and Prettier to enforce strict Angular standards (verifying no `standalone: false` allowed in new components).
- [x] **Verify Test Runner**: Run `npm test` to ensure the current test suite (if any) runs or at least starts the Karma launcher without error.

## Phase 2: Core Services Refactoring (TDD)
*Goal: Remove dependency on NgModule for services and adopt Signals where appropriate.*

### ConfigService
- [x] **Test**: Create `src/app/services/config-service.spec.ts`. Verify it can be injected and mocked. **Validate against current runtime behavior (e.g., ensure keys are correctly decoded).**
- [x] **Refactor**: Update `ConfigService` to be `providedIn: 'root'`.

### OverlayService
- [x] **Test**: Create `src/app/services/overlay-service.spec.ts`. Test interaction with map layers (mock Mapbox). **Validate against current runtime behavior (e.g., verify layer registration logic matches existing app behavior).**
- [x] **Refactor**: Update `OverlayService` to use `inject()` and `providedIn: 'root'`.
- [x] **Refactor**: Convert internal state to Signals (if applicable).

### SegmentService
- [ ] **Test**: Create `src/app/services/segment-service.spec.ts`. Test data loading and processing. **Validate against current runtime behavior (e.g., ensure segment decoding produces expected coordinates).**
- [ ] **Refactor**: Update `SegmentService` to `providedIn: 'root'` and use `inject()`.

### StravaService
- [ ] **Test**: Create `src/app/services/strava-service.spec.ts`.
- [ ] **Refactor**: Update `StravaService` to `providedIn: 'root'`.

## Phase 3: Component Modernization
*Goal: Convert to Standalone Components, Signals, and improve Modularity.*

### SegmentOverlayComponent
- [ ] **Refactor**: Convert `SegmentOverlayComponent` to `standalone: true`.
- [ ] **Refactor**: Replace `@Input` with `input()`. Use `OnPush` change detection.

### Map Component Extraction
- [ ] **Plan**: Identify map-specific logic in `App` (layer management, event handling).
- [ ] **Refactor**: Create `src/app/components/map/map.component.ts` (Standalone). Move Mapbox initialization and layer logic here. 
- [ ] **Test**: Ensure map interaction still works as expected.

### App Component & Bootstrapping
- [ ] **Config**: Create `src/app/app.config.ts`. Define application providers (ClientHydration, Router, HttpClient, Mapbox).
- [ ] **Refactor**: Convert `App` to `standalone: true`. Import `SegmentOverlayComponent` and Map Component directly.
- [ ] **Refactor**: Convert `App` state to Signals (`isShow`, `regionShowing`, etc.).
- [ ] **Bootstrap**: Update `src/main.ts` to use `bootstrapApplication(App, appConfig)`.
- [ ] **Cleanup**: Delete `src/app/app-module.ts`.

### Further Component Extraction
- [ ] **Explore**: Analyze `App` and other components for additional extraction opportunities (e.g., Sidebar, Toolbar, Controls).
- [ ] **Refactor**: Extract identified components to improve modularity and separation of concerns.

## Phase 4: UI Modernization (Post-Architecture)
- [ ] **Plan**: Define new visual language and color palette.
- [ ] **Experiment**: Create color scheme options.
