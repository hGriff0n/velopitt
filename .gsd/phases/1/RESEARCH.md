# Phase 1: Performance & Abstraction Research

## 1. Rendering Performance Analysis

### Current Architecture
- **Mapbox GL JS**: Handles heavy lifting of map rendering (WebGL).
- **Angular Integration**: `MapStateService` manages the Mapbox instance.
- **Change Detection**: All components use `OnPush`. Signals drive updates.

### Bottlenecks
- **Markers**: DOM markers (`mapboxgl.Marker`) are expensive if many are added. We loop over all segments to create markers.
- **GeoJSON Source**: Updating huge GeoJSON sources can be CPU intensive.

### Recommendations
1. **Cluster Markers**: If segment count grows > 500, use `supercluster` or Mapbox's built-in clustering.
2. **Symbol Layers**: Prefer `symbol` layers over DOM markers for static icons.
3. **GeoJSON Updates**: Use `setData` diffing or tile sources for very large datasets.

## 2. Abstraction Patterns

### "MapEntity" Hierarchy
To support future features (Routes, GPX), we should abstract map items:
- `MapEntity` interface: `id`, `addTo(map)`, `removeFrom(map)`, `onSelect`.
- **Implementations**: `SegmentEntity`, `RouteEntity`, `POIMarker`.

### Logic Separation
- `MapStateService`: Manages the *Camera* and *Global Config*.
- `LayerRepository`: Manages collection of `MapEntity` sources.

## 3. Lazy Loading Strategies
- Defer loading of heavy layers (e.g. heatmap, detailed bike network) until requested.
- Use dynamic imports for heavy turf.js operations if used sparingly.

## 4. Conclusion
The current refactor to `MapStateService` is a good first step (Option A). Moving forward, we should introduce a `MapEntity` interface before building the Route Editor.
