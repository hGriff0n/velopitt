# Velopitt Website Specification Sheet

## 1. Project Overview
**Velopitt** is a web-based resource for cyclists in Pittsburgh, focusing on "sporty" riding, training, and cycling tourism. The core functionality revolves around an interactive map that displays cycling segments, local regions, and bike infrastructure, specifically highlighting hills and routes used for training or competitive cycling.

**Goal**: Rewrite the existing codebase to utilize **Angular 20+** best practices (Signals, Standalone Components, Strict Mode) while maintaining and enhancing the current feature set.

## 2. Tech Stack & Requirements

| Category | Requirement | Notes |
| :--- | :--- | :--- |
| **Framework** | Angular 20+ | Must use Standalone Components, Signals for state management, and modern Control Flow (`@if`, `@for`). |
| **Map Engine** | Mapbox GL JS | Via `ngx-mapbox-gl` or direct wrapper. |
| **UI Library** | Angular Material | For layout (Sidenav/Drawer), Cards, and Lists. |
| **Visualizations** | Chart.js / ng2-charts | For elevation profiles. |
| **Data Format** | GeoJSON + JSON | Static data assets for logic; potentially expandable to API. |
| **Mathematics** | Turf.js / Mapbox Polyline | For geospatial calculation (distance, elevation queries). |

## 3. Core Features

### 3.1. Interactive Map
The central experience is a full-screen interactive map.
-   **Base Map**: Custom Mapbox style (Dark/High Contrast).
-   **Interactions**:
    -   **Pan/Zoom**: Standard intuitive controls.
    -   **Click**: Selects features (Segments).
    -   **Hover**: Highlights accessible regions or segments.
    -   **FlyTo**: Smooth animations when a segment is selected from the UI.
    
### 3.2. Data Layers & Toggles
The user must be able to toggle visibility of different data layers via a Sidebar/Drawer menu.
-   **Segments Layer**: Highlighted routes (polylines) representing specific climbs or segments.
    -   *State*: Unselected (Dim), Selected (Bright/High Contrast), Focused (Zoomed).
-   **Regions Layer**: Polygons representing neighborhoods or riding areas.
    -   *Behavior*: Hover usage opacity changes.
-   **Bike Network Layers**: Detailed infrastructure types.
    -   Sub-layers: Sharrows, Bike Lanes, Protected Lanes, Trails, Sidewalks.
-   **Bike Plus Layer**: Additional/Special routes (e.g., proposed or event routes).

### 3.3. Segment Explorer (Overlay)
When a segment is selected (clicked on map or marker), detailed information is displayed.
-   **UI**: Floating overlay or sidebar panel.
-   **Data Displayed**:
    -   **Header**: Segment Name.
    -   **Stats**: Distance (km), Elevation Gain (m), Average Grade (%), Max Grade (%).
    -   **Description**: Summary text.
    -   **Pacing Notes**: Specific advice for riding the segment.
    -   **Interactive Elevation Profile**:
        -   Line chart showing elevation vs. distance.
        -   Hovering the chart correlates to a position on the map (Advanced feature).
    -   **Related Segments**: List of connected or nearby segments for route building.

### 3.4. Navigation & Layout
-   **Collapsible Sidebar** (MatDrawer):
    -   Contains layer toggles.
    -   Navigation links to other pages (Group Rides, Community, Route Builder, Safety, Racing).
-   **Responsive Design**: Usable on Desktop and Mobile.

## 4. Data Architecture

### 4.1. Models

#### `Segment`
The core data entity.
```typescript
interface Segment {
  id: number;
  name: string;
  summary: string;
  pacing_notes: string;
  activity_type: 'Ride' | 'Run'; // etc.
  
  // Stats
  distance: number;
  total_elevation_gain: number;
  average_grade: number;
  maximum_grade: number;
  climb_category: number; // 0=UC, 1=Cat 4, etc.
  
  // Geospatial
  start_latlng: [number, number];
  end_latlng: [number, number];
  map: {
    polyline: string; // Encoded polyline
    geojson: GeoJSON.LineString; // Decoded
    elevation_data: number[]; // Array of elevations corresponding to points
  };
  
  // Meta
  related_segments: { name: string; id: number }[];
  // Strava integration (optional/future)
  xoms?: { kom: string; qom: string }; 
}
```

#### `LayerConfig`
Configuration for map layers.
```typescript
interface LayerConfig {
  id: string; // e.g., 'bike-network-lane'
  label: string; // UI Label
  color: string;
  isVisible: Signal<boolean>;
}
```

## 5. Implementation Guidelines for Agent

### 5.1. Refactoring Goals
-   **State Management**: Use `Signal` for all toggle states (`segmentShowing`, `regionShowing`).
    -   *Code smell in current app*: `detector.detectChanges()` called manually. This should be eliminated by using Signals.
-   **Component Structure**:
    -   `MapComponent`: Purely handles Mapbox initialization and layer rendering. Inputs: `layers`, `segments`. Outputs: `segmentSelected`.
    -   `SegmentOverlayComponent`: Purely presentational. Input: `selectedSegment`.
    -   `LayerControlComponent`: Sidebar logic.
-   **Services**:
    -   `SegmentService`: Responsible for fetching JSON, decoding polylines (memoized), and computing derived stats if not present.
    -   `MapStyleService`: Manage layer styles and definitions centrally, rather than hardcoding in the component.

### 5.2. Known Issues to Fix
-   **Markers**: In current code, markers are managed separately from layers and have click/visibility sync issues. *Recommendation*: Use a Mapbox `SymbolLayer` with an icon image instead of HTML Markers for better performance and easier state sync.
-   **Popup Positioning**: Current logic manually pans the map (`panBy`). *Recommendation*: Use Mapbox `padding` option in `flyTo` to account for the sidebar/overlay offset natively.

## 6. Future Roadmap (Out of Scope for Initial Rewrite)
-   **Strava API Integration**: Real-time leaderboards.
-   **Route Builder**: Drag-and-drop route creation using the existing graph.
