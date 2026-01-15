# Velopitt Brownfield Enhancement PRD

## Intro Project Analysis and Context

### Existing Project Overview

#### Analysis Source
- **Document-project output available at**: `docs/brownfield-architecture.md`
- **IDE-based fresh analysis**: Performed Jan 15, 2026

#### Current Project State
Velopitt is a cycling resource web application for Pittsburgh. It features a full-screen interactive Mapbox map displaying cycling segments, regions, and infrastructure. The current implementation is built with Angular 20.1.x but uses legacy patterns (manual change detection, array-index ID mapping) and inefficient rendering methods (HTML markers instead of Symbol layers).

### Documentation Analysis

#### Available Documentation
- [x] Tech Stack Documentation (in `brownfield-architecture.md` & `package.json`)
- [x] Source Tree/Architecture (in `brownfield-architecture.md`)
- [x] API Documentation (Static JSON assets documented)
- [x] UX/UI Guidelines (Implied via `ThemeService` and CSS vars)
- [x] Technical Debt Documentation (Detailed in `brownfield-architecture.md`)

### Enhancement Scope Definition

#### Enhancement Type
- [x] Major Feature Modification (Map architecture overhaul)
- [x] Performance/Scalability Improvements (SymbolLayer migration)
- [x] Technology Stack Upgrade (Full Signal migration)
- [x] Code Quality/Refactoring (Service extraction, pure components)

#### Enhancement Description
Modernize the existing Velopitt Angular application to fully leverage Angular 20+ features (Signals, Standalone Components) and optimize Mapbox performance. Key changes include migrating state management to Signals to remove manual change detection, replacing heavy HTML Markers with a performant Mapbox SymbolLayer, and refactoring map style logic into a dedicated service.

#### Impact Assessment
- [x] **Significant Impact**: Substantial changes to core components (`App`, `AppMapComponent`) and services (`SegmentService`), though the external behavior remains largely the same.

### Goals and Background Context

#### Goals
- Fully migrate application state to Angular Signals, eliminating manual `changeDetectorRef.detectChanges()`.
- Replace HTML-based Mapbox markers with a WebGL-accelerated `SymbolLayer` for better performance and style syncing.
- Refactor `AppMapComponent` to be purely presentational, moving style logic to a new `MapStyleService`.
- Improve code robustness by fixing the fragile Array-Index ID mapping in `SegmentService`.
- Ensure seamless theme switching (Dark/Light) across UI, Map, and Charts without page reloads.

#### Background Context
Velopitt serves the local cycling community but suffers from technical debt that hinders maintainability and performance. The current mix of modern Angular versions with legacy "manual" change detection practices creates a fragile codebase. Furthermore, using DOM elements for map markers is a known performance bottleneck in Mapbox GL JS when scaling up data points. This modernization effort targets these specific architectural weaknesses to create a solid foundation for future features like Strava integration.

### Change Log

| Change | Date       | Version | Description                   | Author |
| ------ | ---------- | ------- | ----------------------------- | ------ |
| New    | 2026-01-15 | 1.0     | Initial PRD for modernization | PM     |

---

## Requirements

### Functional Requirements (FR)

- **FR1**: The application MUST manage all UI state (Layer Toggles, Selected Segment, Sidebar Visibility) using Angular Signals (`signal`, `computed`, `effect`).
- **FR2**: The Map MUST render segment start points using a Mapbox `SymbolLayer` with custom icons, replacing the current HTML `Marker` implementation.
- **FR3**: Clicking a segment icon on the map MUST select the segment, fly to its location, and open the details overlay, identical to current behavior.
- **FR4**: Toggling the "Dark/Light" theme MUST update the Mapbox style (if applicable) and Chart.js colors dynamically without a hard refresh.
- **FR5**: The Segment Details Overlay MUST display the interactive elevation chart with colors matching the active theme.

### Non-Functional Requirements (NFR)

- **NFR1**: **Performance**: Map interactions (pan/zoom) must remain smooth (60fps) even with all layers enabled.
- **NFR2**: **Maintainability**: `AppMapComponent` file size should decrease as logic is moved to services.
- **NFR3**: **Reliability**: Segment ID resolution must be robust and not depend on array index position.

### Compatibility Requirements (CR)

- **CR1**: **API Compatibility**: Must continue to work with the existing `segment.json` data structure.
- **CR2**: **UI Consistency**: The visual design (colors, sidebar layout, overlay behavior) must remain identical to the current production version.

---

## User Interface Enhancement Goals

### Integration with Existing UI
The visual interface will remain unchanged. The "enhancement" is purely internal/structural. All refactored components must output the exact same DOM structure and CSS classes to ensure existing styles apply correctly.

### UI Consistency Requirements
- Map markers must use the same color palette defined in CSS variables.
- Active/Inactive states for segments must visually match the current high-contrast/dimmed style.

---

## Technical Constraints and Integration Requirements

### Existing Technology Stack
- **Framework**: Angular 20.1.x
- **Map Engine**: Mapbox GL JS 3.14.0 (via `ngx-mapbox-gl` provider, native implementation in components)
- **State Management**: Moving to Signals
- **Data Source**: Static JSON

### Integration Approach
- **Frontend Integration Strategy**: Refactor components in place. We will create the `MapStyleService` first, then incrementally strip logic from `AppMapComponent`.
- **Testing Integration Strategy**: Verify manually against the "golden master" (current prod behavior).

### Code Organization and Standards
- **File Structure Approach**: 
    - Create `src/app/services/map-style.service.ts`.
    - Keep components in `src/app/components/`.
- **Coding Standards**: Strict Mode, Standalone Components, dependency injection via `inject()`.

---

## Epic and Story Structure

**Epic Structure Decision**: Single Epic. The tasks are tightly coupled (moving state to signals affects how the map receives inputs; changing markers affects how the map handles clicks). Splitting this would introduce unnecessary integration overhead.

### Epic 1: Velopitt Angular 20+ Modernization & Performance Optimization

**Epic Goal**: Refactor the Velopitt application to remove legacy Angular patterns and optimize map rendering performance.

**Integration Requirements**: The application must remain buildable and runnable after every story.

#### Story 1.1: Fix Segment ID Resolution & Data Robustness
**As a** Developer,
**I want** to refactor `SegmentService` to index segments by their real ID rather than array position,
**so that** future filtering or sorting doesn't break segment selection logic.

**Acceptance Criteria**:
1. `getSegmentByDomId(id)` is renamed to `getSegmentById(id)`.
2. It returns the correct segment even if the source array is shuffled.
3. All callsites in `App` and `AppMapComponent` are updated.
4. `SegmentService` tests pass.

**Integration Verification**:
- IV1: Click the last segment in the list; verify the correct overlay opens.

#### Story 1.2: Extract Map Style Logic to Service
**As a** Developer,
**I want** to move layer definitions and style constants from `AppMapComponent` to a new `MapStyleService`,
**so that** the map component is cleaner and style logic is reusable/testable.

**Acceptance Criteria**:
1. New `MapStyleService` created.
2. Methods added for `getSegmentLayerDef()`, `getSymbolLayerDef()`, etc.
3. `AppMapComponent` injects this service to add layers.
4. No visual changes in the map.

**Integration Verification**:
- IV1: Map loads with all layers visible as before.

#### Story 1.3: Migrate Map Markers to SymbolLayer
**As a** User (implicitly),
**I want** map markers to be rendered via WebGL (SymbolLayer),
**so that** the map remains responsive and performant.

**Acceptance Criteria**:
1. Remove HTML `Marker` creation loop in `AppMapComponent`.
2. Add a GeoJSON source for segment start points.
3. Add a `symbol` layer using a circle or custom icon image.
4. Click interactions on the symbol layer trigger the same `segmentSelected` event.

**Integration Verification**:
- IV1: Markers appear on the map at correct locations.
- IV2: Clicking a marker selects the segment.

#### Story 1.4: Full Signal Migration (Root State)
**As a** Developer,
**I want** to remove manual `detectChanges()` calls in `App` and use proper Signal updates,
**so that** the app uses modern Angular change detection effectively.

**Acceptance Criteria**:
1. Identify all `detector.detectChanges()` calls in `app.ts`.
2. Ensure all state changes (layer toggles, selection) update Signals.
3. Verify `OnPush` change detection works without manual intervention.

**Integration Verification**:
- IV1: Toggle "Bike Network" in sidebar; map updates immediately.
- IV2: Select a segment; overlay appears immediately.
