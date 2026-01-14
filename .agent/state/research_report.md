# Velopitt Research & Modernization Report

## 1. Architectural Strategy: Angular 20 + Mapbox

### 1.1. Reactivity Model: Signals First
The research confirms that **Angular Signals** are the optimal choice for managing map state in 2026.
*   **Recommendation**: Use `ngx-mapbox-gl` (v12+) as the base library, as it supports Angular 19/20 and standalone components.
*   **State Management**: Create a `MapStateService` that exposes writable signals for:
    *   `center: Signal<[number, number]>`
    *   `zoom: Signal<number>`
    *   `selectedSegmentId: Signal<number | null>`
    *   `activeLayers: Signal<Set<LayerId>>`
*   **Why**: This avoids manual `ChangeDetectorRef` calls (a code smell in the current app) and enables "Zoneless" Angular performance, which is critical for high-frequency updates like map interactions.

### 1.2. Component Structure
*   **Smart Map Component**: Wraps `<mgl-map>`. Listens to `MapStateService` signals to drive view inputs (`[center]`, `[zoom]`).
*   **Dumb UI Components**:
    *   `LayerControl`: Pure UI. Inputs: `layers[]`. Outputs: `toggle(layerId)`.
    *   `SegmentOverlay`: Pure UI. Inputs: `segmentData`, `elevationProfile`.
    *   `MetricCard`: Reusable component for displaying stats (e.g., "7.5% Avg Grade").

## 2. Competitive UX Analysis & Feature Adoption

### 2.1. Strava (The Standard)
*   **Key Feature**: Global Heatmap & Segment Leaderboards.
*   **App Adoption**: Prioritize the **"Explore"** UX. Instead of just a map, offer a "Sidebar List" of visible segments sorted by proximity or difficulty, similar to Strava's Segment Explorer.

### 2.2. Komoot (The Planner)
*   **Key Feature**: Surface Analysis & Waypoints.
*   **App Adoption**: **Surface Visualization**.
    *   Add a `surface_type` property to Segments (e.g., "paved", "gravel", "cobble").
    *   *Visual*: Use dashed lines for unpaved surfaces on the map.
    *   *Overlay*: Show a small bar chart in the Segment Overlay: "90% Paved, 10% Gravel".

### 2.3. RideWithGPS (The Detail)
*   **Key Feature**: Interactive Elevation Profile.
*   **App Adoption**: **Hover Sync**.
    *   When hovering over the elevation chart (using `ng2-charts`/Chart.js), show a dot on the corresponding location on the map.
    *   *Tech*: Use Turf.js `along` function to find the coordinate at distance `X` from the start.

## 3. Visualization & Integrations

### 3.1. Elevation Profiles
*   **Library**: **Chart.js (`ng2-charts`)** is the best balance of weight and features.
*   **Design**: Use a filled area chart with a gradient (green -> red) corresponding to the grade (slope).
    *   *UX Tip*: Fix the Y-axis range to exaggerate the hills relative to flat ground.

### 3.2. Weather & Environment (New Feature)
*   **Integrations**: **OpenWeatherMap API**.
*   **Feature**: **Wind Overlay**.
    *   Fetch current wind speed/direction.
    *   *Implementation*: Use Mapbox's **Custom Layer** interface or a library like `mapbox-gl-wind` to render animated particles showing wind flow. This is a "Premium" feature that adds significant "Wow" factor.
    *   *Simpler Alternative*: A static arrow icon in the corner of the map showing wind direction relative to the map bearing.

## 4. Proposed Application State Model (Signals)

```typescript
interface AppState {
  // Map View State
  view: {
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
  };
  
  // Data State
  segments: {
    all: Segment[];
    visible: Segment[];
    selected: Segment | null;
    hovered: Segment | null;
  };
  
  // Customization
  layers: {
    [key: string]: boolean; // 'bike-lanes': true, 'weather': false
  };
  
  // Environment
  weather: {
    windSpeed: number;
    windBearing: number;
    temp: number;
  } | null;
}
```

## 5. Next Steps for Rewrite
1.  **Scaffold**: Create new Angular 20 project (Zoneless).
2.  **Core**: Implement `MapStateService` and basic `MapComponent` with `ngx-mapbox-gl`.
3.  **Data**: Migrate `SegmentService` to use Signals and computed derived state.
4.  **UI**: Build the responsive Drawer and Overlay using Angular Material 3.
5.  **Polish**: Add the "Wind" and "Surface" features.
