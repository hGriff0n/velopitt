# Story 1.3: Migrate Map Markers to SymbolLayer

**Status**: Draft
**Role**: Developer

**As a** User (implicitly),
**I want** map markers to be rendered via WebGL (SymbolLayer),
**so that** the map remains responsive and performant.

**Context**:
Currently, the app creates a DOM `Marker` for every segment in `map.component.ts`. This is heavy and causes performance issues with many segments. It also makes syncing visibility (toggling the layer) difficult, as we have to loop through an array of markers. Moving to a Mapbox `symbol` layer solves this.

**Acceptance Criteria**:
1.  **Remove Markers**: Delete the `segmentMarkers` array and the loop that creates `new Marker()` in `AppMapComponent`.
2.  **Add Source Data**: In `SegmentService`, ensure the GeoJSON for segments includes a Point feature for the `start_latlng` (or create a separate "points" source in the Map component).
3.  **Add Layer**: In `MapStyleService`, add a definition for a `symbol` layer (id: `segment-markers`).
    -   Use a circle-radius or an icon-image.
    -   Use the `--sys-marker` color from the theme.
4.  **Interactions**: Update `AppMapComponent` to handle clicks on the `segment-markers` layer (similar to the line layer click handler).
    -   Clicking a dot should trigger `segmentSelected`.
5.  **Hover State**: Implement cursor pointer on hover for the markers.

**Technical Notes**:
-   You might need to add a `points` property to the `SegmentService` data transformation to easily provide a FeatureCollection of points.
-   Ensure the `segment-markers` layer visibility is toggled by the existing `segmentShowing` input.

**Files to Modify**:
-   `src/app/components/map/map.component.ts`
-   `src/app/services/map-style.service.ts`
-   `src/app/services/segment-service.ts` (potentially)
