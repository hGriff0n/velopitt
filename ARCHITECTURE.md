# Velopitt Architecture Documentation

Velopitt is an Angular-based web application designed to visualize and interact with cycling segments, routes, and infrastructure in the Pittsburgh area. It leverages Mapbox GL JS for rich geospatial visualization.

## Component Overview

### Core Framework
- **Angular**: The application framework (v20+ target, currently using standard modules and some signals).
- **Mapbox GL JS**: Primary visualization engine for 2D/3D map data.

### Key Components
- **App Component (`src/app/app.ts`)**: The central hub that initializes the map, manages main application state (visibility of layers, selected segments), and wires up map interactions.
- **SegmentOverlayComponent (`src/app/components/segment/segment-overlay.component.ts`)**: (Inferred) Likely displays detailed information about a selected segment.

### Services
- **`ConfigService`**: Centralized configuration management. Handles environment variable retrieval and Base64 decoding for API keys (Mapbox, Strava).
- **`SegmentService`**:
    - Manages segment data loaded from `src/app/services/assets/segment.json`.
    - Handles polyline decoding and GeoJSON conversion.
    - Performs geospatial calculations using `@turf/turf`.
    - Updates elevation data using Mapbox's terrain query APIs.
- **`OverlayService`**:
    - Manages non-segment map layers (e.g., regions from `mapgeo.json`, bike network from `bikeplus.json`).
    - Handles layer registration and visibility toggling.
    - Implements region hover effects.
- **`StravaService`**:
    - Interface for fetching data from the Strava API.
    - Currently used for refreshing/updating the local `segment.json` assets.

## Data Flow and Interactions

### Map Initialization
1. `App` component bootstraps and waits for the Mapbox `onLoad` event.
2. `OverlayService.registerWithMap` is called to add region and bike network layers.
3. `App.addAllSegments` is called to add the GeoJSON source for segments and set up interaction handlers.

### Segment Interaction
1. **Hover**: `App` listens for `mouseenter`/`mouseleave` on the `segments-layer`, triggering `highlightSegment` which updates the Mapbox feature state.
2. **Click**: Triggered via `segments-clicks` interaction.
    - Zooms/Flys to the segment.
    - Shows a Mapbox Popup with the segment name.
    - Dispatches to `SegmentOverlayComponent` (via state change) to show detailed statistics/elevation profiles.

### Layer Management
The application supports toggling several overlays:
- **Regions**: Displays metropolitan zonal breakdowns.
- **Segments**: Displays popular cycling segments.
- **Bike Network**: Standard Pittsburgh bike infrastructure (lanes, sharrows, trails).
- **Bike Plus**: Supplementary bike-related data.

## Implementation Details for Agents

### Environment Setup
Sensitive keys are stored in `src/environments/.env` (copied from `.example.env`) and are Base64 encoded. Use `ConfigService` to access them.

### Data Assets
Gepspatial data is stored as JSON assets within the services directory:
- `src/app/services/assets/segment.json`
- `src/app/services/assets/mapgeo.json`
- `src/app/services/assets/bikeplus.json`

### Performance & Mapbox
- Mapbox interactions are registered using a custom `addInteraction` method (part of the mapping library used or internal wrapper).
- Elevation data is derived from Mapbox terrain layers; ensure terrain is enabled if adding new elevation-dependent features.
