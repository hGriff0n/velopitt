# Story 1.2: Extract Map Style Logic to Service

**Status**: Draft
**Role**: Developer

**As a** Developer,
**I want** to move layer definitions and style constants from `AppMapComponent` to a new `MapStyleService`,
**so that** the map component is cleaner and style logic is reusable/testable.

**Context**:
Currently, `AppMapComponent` contains hardcoded style definitions (line colors, widths, opacities) inside its `addAllSegments` method. This violates the "Smart Service, Dumb Component" principle. We need to extract this into a dedicated service that returns layer definitions based on the current theme.

**Acceptance Criteria**:
1.  **Create Service**: Create `src/app/services/map-style.service.ts` using `providedIn: 'root'`.
2.  **Move Constants**: Move the hardcoded style objects (paint, layout) from `map.component.ts` to this service.
3.  **Methods**: Create methods like `getSegmentLayerDef(selectedColor: string, unselectedColor: string)` that return the Mapbox layer specification.
4.  **Inject**: Inject `MapStyleService` into `AppMapComponent`.
5.  **Refactor Map**: Update `AppMapComponent` to call the service methods instead of defining objects inline.
6.  **Verify**: Ensure the map still renders identically.

**Technical Notes**:
-   Keep the `ThemeService` integration. The `MapStyleService` might need to accept colors as arguments or inject `ThemeService` itself (arguments preferred for purity).
-   Look for the `line-width` interpolation expression in `map.component.ts` and ensure it's preserved exactly.

**Files to Modify**:
-   `src/app/services/map-style.service.ts` (New)
-   `src/app/components/map/map.component.ts`
