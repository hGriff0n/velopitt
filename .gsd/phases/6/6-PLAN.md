---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: GPX Viewer Implementation

## Objective
Implement the ability to import GPX files, visualize the route on the 3D map, and display an interactive elevation profile.

## Context
- .gsd/SPEC.md
- .gsd/phases/6/RESEARCH.md
- src/app/components/map/map.component.ts
- src/app/services/theme.service.ts

## Tasks

<task type="auto">
  <name>Scaffold GpxService</name>
  <files>
    src/app/services/gpx.service.ts
    src/app/services/gpx.service.spec.ts
  </files>
  <action>
    1. Install dependencies: npm install @tmcw/togeojson @types/geojson
    2. Create `GpxService` with:
       - `parse(xmlString: string): GeoJSON.FeatureCollection`
       - `extractElevationProfile(geojson: GeoJSON.FeatureCollection): { distance: number, elevation: number }[]`
         - Use `@turf/distance` to calculate cumulative distance.
         - Handle missing elevation data gracefully (return empty or interpolated).
    3. Create unit tests verifying parsing and distance calculation.
  </action>
  <verify>npm test -- --watch=false --include=src/app/services/gpx.service.spec.ts</verify>
  <done>Tests pass and service exports correct data structure.</done>
</task>

<task type="auto">
  <name>Implement Elevation Chart Component</name>
  <files>
    src/app/components/elevation-profile/elevation-profile.component.ts
    src/app/components/elevation-profile/elevation-profile.component.html
    src/app/components/elevation-profile/elevation-profile.component.css
  </files>
  <action>
    1. Create a standalone component `ElevationProfileComponent`.
    2. Input: `profileData: { distance: number, elevation: number }[]`.
    3. Use `ng2-charts` (Line Chart) to render the usage.
    4. Configure chart:
       - X-Axis: Distance (km).
       - Y-Axis: Elevation (meters).
       - Minimalist style (hide grid lines if possible, use theme colors).
       - Responsive height (fixed small height, e.g. 150px).
    5. Handle empty data state (hide or show message).
  </action>
  <verify>Manual verification in next step (integration)</verify>
  <done>Component compiles and accepts input.</done>
</task>

<task type="auto">
  <name>Integrate with Map & UI</name>
  <files>
    src/app/components/map/map.component.ts
    src/app/components/map/map.component.html
    src/app/components/map/map.component.css
  </files>
  <action>
    1. Add a "Load Route" button to the UI (e.g., top-right control or sidebar).
    2. Add hidden file input to handle file selection.
    3. On file select:
       - Read file text.
       - Call `GpxService.parse`.
       - Add source `route-preview` (GeoJSON) and layer (LineString) to Mapbox.
       - Calculate elevation profile and pass to `ElevationProfileComponent` (add to template).
       - Focus map: `map.fitBounds(turf.bbox(geojson))`
    4. Ensure chart is shown only when a route is loaded.
    5. Allow "Clear Route" to remove layer and chart.
  </action>
  <verify>
    1. Launch app.
    2. Upload valid GPX file.
    3. Verify line appears on map.
    4. Verify map zooms to route.
    5. Verify elevation chart appears at bottom.
  </verify>
  <done>Functionality verified in browser.</done>
</task>

<task type="auto">
  <name>Implement Synced Route Interaction</name>
  <files>
    src/app/components/map/map.component.ts
    src/app/components/elevation-profile/elevation-profile.component.ts
  </files>
  <action>
    1. **Hover Sync (Profile -> Map)**:
       - On `ElevationProfileComponent`, capture hover event (using `chartjs-plugin-crosshair` or native events).
       - Emit `hoverIndex` or `hoverDistance`.
       - In `MapComponent`, update a GeoJSON source (Point) to move a "Tracker Marker" to the coordinate at that index.
    2. **Hover Sync (Map -> Profile)**:
       - Add hover listener on the Route Line layer.
       - Find nearest point on line.
       - Highlight corresponding point on the chart (programmatically trigger tooltip).
    3. **Camera Follow Option**:
       - Add a toggle checkbox "Follow Tracker".
       - If enabled, when hovering/sliding on the chart, update map camera center to the tracker position.
  </action>
  <verify>
    1. Load GPX.
    2. Hover over chart -> Blue dot moves on map.
    3. Enable "Follow" -> Map pans as you slide over chart.
  </verify>
  <done>Bi-directional syncing and camera follow working.</done>
</task>

## Success Criteria
- [ ] Users can upload a valid GPX file from their local machine.
- [ ] The route is rendered on the 3D map with a distinct color.
- [ ] The camera automatically zooms to fit the imported route.
- [ ] An elevation profile chart appears showing the route's verticality.
- [ ] hovering the chart moves a tracker on the map (and vice-versa).
- [ ] Users can toggle "Camera Follow" to have the view track the position.
- [ ] Code is covered by unit tests (Service) and manual verification (UI).
