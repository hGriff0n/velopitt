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
- [x] **Test**: Create `src/app/services/segment-service.spec.ts`. Test data loading and processing. **Validate against current runtime behavior (e.g., ensure segment decoding produces expected coordinates).**
- [x] **Refactor**: Update `SegmentService` to `providedIn: 'root'` and use `inject()`.

### StravaService
- [x] **Test**: Create `src/app/services/strava-service.spec.ts`.
- [x] **Refactor**: Update `StravaService` to `providedIn: 'root'`.

## Phase 3: Component Modernization
*Goal: Convert to Standalone Components, Signals, and improve Modularity.*

### SegmentOverlayComponent
- [x] **Refactor**: Convert `SegmentOverlayComponent` to `standalone: true`.
- [x] **Refactor**: Replace `@Input` with `input()`. Use `OnPush` change detection.

### Map Component Extraction
- [x] **Plan**: Identify map-specific logic in `App` (layer management, event handling).
- [x] **Create**: Generate `MapComponent` (Standalone).
- [x] **Refactor**: Move logic from `App` to `MapComponent`.
- [x] **Integrate**: Update `App` to use `<app-map>`. interaction still works as expected.

### App Component & Bootstrapping
- [x] **Config**: Create `src/app/app.config.ts`. Define application providers (ClientHydration, Router, HttpClient, Mapbox).
- [x] **Refactor**: Convert `App` to `standalone: true`. Import `SegmentOverlayComponent` and Map Component directly.
- [x] **Refactor**: Convert `App` state to Signals (`isShow`, `regionShowing`, etc.).
- [x] **Bootstrap**: Update `src/main.ts` to use `bootstrapApplication(App, appConfig)`.
- [x] **Cleanup**: Delete `src/app/app-module.ts`.

### Further Component Extraction
- [x] **Explore**: Analyze `App` and other components for additional extraction opportunities (e.g., Sidebar, Toolbar, Controls).
- [x] **Extract**: Create new components and refactor `App` to use them.
- [x] **Test**: Ensure extracted components work correctly and `App` integration is seamless.

## Phase 4: UI Modernization (Post-Architecture)
- [x] **Research**: Research modern and regional (Pittsburgh) color themes.
- [x] **Palette**: Create `theme.css` with CSS variables.
- [x] **Implement**: Apply global styles and update Angular Material config.
- [x] **Refine**: Update component styles for separate `Header` and `Sidebar`.
- [x] **Themes**: Create `theme-river.css`, `theme-rust.css`, `theme-carbon.css`.
