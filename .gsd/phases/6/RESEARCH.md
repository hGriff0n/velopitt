# Research: GPX IO & Viewer (Phase 6)

## 1. GPX Parsing Strategy
To parse GPX files in the browser, we need a lightweight method to convert XML/GPX to GeoJSON, which Mapbox consumes directly.

### Recommended Library: `@tmcw/togeojson`
- **Why**: Standard, dependency-free (except for DOMParser which is native), widely used with Mapbox.
- **Process**:
  1. Read file as text.
  2. Parse with `DOMParser` to XML Document.
  3. Convert to GeoJSON with `togeojson.gpx(doc)`.

### Alternative: `@we-gold/gpxjs`
- **Why**: More features (total distance, etc. pre-calculated).
- **Cons**: Less standard, possibly larger. We can calculate stats easily with Turf.js which is already a dependency.

**Decision**: Use `@tmcw/togeojson` + `@turf/turf`.

## 2. Elevation Data Extraction
GPX files typically store elevation in the `ele` tag, which `togeojson` preserves in the GeoJSON coordinates (`[lng, lat, ele]`).

**Algorithm**:
1. Iterate through `feature.geometry.coordinates`.
2. Extract index 2 (elevation).
3. Calculate cumulative distance between points using `@turf/distance`.
4. Result structure: `[{ distance: 0, elevation: 200 }, { distance: 0.1, elevation: 205 }, ...]`

## 3. Visualization
### Map
- **Source**: GeoJSON data from import.
- **Layer**: `line` type with `line-gradient` (optional, based on slope?) or simple color.

### Elevation Profile
- **Library**: `ng2-charts` (Chart.js wrapper) - *Already in package.json*.
- **Type**: Line chart.
- **Features**:
  - X-Axis: Distance (km/mi).
  - Y-Axis: Elevation (m/ft).
  - Plugin: `chartjs-plugin-crosshair` (already in package.json) to sync hover on chart with point on map.

## 4. Implementation Plan Structure
- **Task 1: Core Service**: `GpxService` implementation (Import, Parse, Export logic).
- **Task 2: Route Viewer UI**: UI to upload file, render on map, list track stats (Distance, Elev Gain).
- **Task 3: Elevation Chart**: Component to display the profile graph.
