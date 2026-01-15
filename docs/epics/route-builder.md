# Route Builder Implementation - Brownfield Enhancement

## Epic Goal
Enable users to interactively build, visualize statistics for, and export GPX routes by clicking on the map, facilitating custom route planning directly within the application.

## Epic Description

**Existing System Context:**
- **Current Functionality:** The application (`velopitt`) displays Strava segments and activities on a Mapbox GL JS map. It uses Angular 20 signals for state management and services (`SegmentService`, `LayerService`) to handle data and map interactions.
- **Technology Stack:** Angular 20, Mapbox GL JS, Chart.js, `@turf/turf`, TypeScript.
- **Integration Points:** The new functionality will integrate primarily with `AppMapComponent` (for interaction handling) and introduce a new `RouteBuilderService` to manage route state and API calls. It will leverage the existing `ConfigService` for Mapbox API access.

**Enhancement Details:**
- **What's being added:** A "Route Builder" mode.
    - Users can toggle this mode on/off.
    - **Interaction:** Left-click to add waypoints, right-click to undo.
    - **Routing:** Integration with Mapbox Directions API (or similar) to snap routes to roads between waypoints.
    - **Visualization:** Display the drafted route on the map and an elevation profile using Chart.js.
    - **Export:** Ability to download the created route as a GPX file.
- **Integration Approach:** A new `RouteBuilderService` (provided in root) will manage the state (waypoints, route geometry, stats). The `AppMapComponent` will subscribe to this service's state to render the route layer and delegate click events when the mode is active.
- **Success Criteria:**
    - User can create a multi-point route that snaps to roads.
    - User can undo the last segment.
    - User can see total distance and elevation gain.
    - User can download a valid GPX file of the route.
    - Existing segment viewing functionality is unaffected when builder mode is off.

## Stories

1.  **Story 1: Route Builder Mode & State Management**
    - **Description:** Implement the `RouteBuilderService` to manage state (active/inactive, list of waypoints) and update the `AppMapComponent` to handle "Builder Mode". Add a UI toggle to enable/disable the mode. When enabled, map clicks should add markers (waypoints) instead of selecting segments.
    - **Key Deliverables:** `RouteBuilderService`, UI Toggle, Map Click handling for waypoints.

2.  **Story 2: Routing API Integration & Visualization**
    - **Description:** Integrate the Mapbox Directions API within `RouteBuilderService`. When two or more waypoints exist, fetch the route geometry between them. Render this geometry as a line on the map. Implement "Undo" (right-click) to remove the last waypoint and recalculate/redraw.
    - **Key Deliverables:** API integration, Route Line rendering, Undo functionality.

3.  **Story 3: Route Statistics, Elevation Profile & Export**
    - **Description:** Calculate and display total distance and elevation gain for the current route. Render an elevation profile chart using `ng2-charts` (Chart.js). Implement a function to convert the route geometry/metadata into GPX format and trigger a file download.
    - **Key Deliverables:** Stats display, Elevation Chart, GPX Export button.

## Compatibility Requirements

- [x] Existing APIs remain unchanged (No backend changes required).
- [x] Database schema changes are backward compatible (N/A - Client-side only).
- [x] UI changes follow existing patterns (Angular Signals, Mapbox layers).
- [x] Performance impact is minimal (Route layers should be lightweight).

## Risk Mitigation

- **Primary Risk:** Conflict between Route Builder interactions and existing Segment interactions (e.g., clicking a segment while trying to build a route).
- **Mitigation:** Strict state management. When `isBuilderMode` is true, disable or suppress standard segment click/hover listeners in `AppMapComponent`.
- **Rollback Plan:** Revert `AppMapComponent` changes to remove the mode toggle and interaction logic; delete `RouteBuilderService`.

## Definition of Done

- [ ] All stories completed with acceptance criteria met.
- [ ] User can successfully build, view stats for, and export a route.
- [ ] Undo functionality works reliably.
- [ ] Existing segment exploration works normally when builder mode is disabled.
- [ ] Code is linted and passes build.
