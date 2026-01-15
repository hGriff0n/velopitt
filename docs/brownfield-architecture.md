# Velopitt Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the Velopitt codebase, a Pittsburgh cycling segment explorer. It reflects the actual implementation patterns, technical debt, and integration constraints found during the January 2026 analysis.

### Document Scope

Comprehensive documentation of the entire system as of the initial brownfield assessment.

### Change Log

| Date       | Version | Description                 | Author    |
| ---------- | ------- | --------------------------- | --------- |
| 2026-01-15 | 1.0     | Initial brownfield analysis | Architect |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/main.ts`
- **Root Component**: `src/app/app.ts`
- **Application Config**: `src/app/app.config.ts`
- **Map Implementation**: `src/app/components/map/map.component.ts`
- **Segment Logic**: `src/app/services/segment-service.ts`
- **Theme/Color Management**: `src/app/services/theme-service.ts`
- **Data Asset**: `src/app/services/assets/segment.json`

## High Level Architecture

### Technical Summary

The application is a standalone Angular 20+ frontend. It follows a Service-Oriented Architecture for data and state management, with presentational components handling UI and Mapbox interactions.

### Actual Tech Stack

| Category         | Technology     | Version | Notes                                        |
| ---------------- | -------------- | ------- | -------------------------------------------- |
| Framework        | Angular        | 20.1.x  | Using Standalone Components and Signals      |
| Map Engine       | Mapbox GL JS   | 3.14.0  | Wrapped in `AppMapComponent`                 |
| Map Integration  | ngx-mapbox-gl  | 13.0.0  | Provided in config, but components use native |
| UI Library       | Angular Material| 20.1.6  | Used for Sidenav and Layout                  |
| Charts           | Chart.js       | 4.3.0   | Used for elevation profiles via ng2-charts   |
| Geospatial Tools | Turf.js / Polyline | 7.2.0 / 1.2.1 | Used for line chunking and decoding     |
| CSS Framework    | Bootstrap      | 5.3.7   | Imported in package.json                     |

### Repository Structure Reality Check

- **Type**: Single Application Repo
- **Package Manager**: npm
- **Notable**: Uses a custom `build:env` script (`src/environments/build.js`) to generate environment files with API keys from `.env`.

## Source Tree and Module Organization

### Project Structure (Actual)

```text
velopitt/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── header/         # Top navigation
│   │   │   ├── map/            # Mapbox GL implementation
│   │   │   ├── segment/        # Overlay for segment details
│   │   │   └── sidebar/        # Layer toggles and nav
│   │   ├── services/
│   │   │   ├── segment-service.ts # Data loading and geospatial logic
│   │   │   ├── layer-service.ts   # Map layer management
│   │   │   ├── theme-service.ts   # Syncs CSS vars with JS
│   │   │   └── config-service.ts  # Application configuration
│   │   ├── app.ts              # Root component & state
│   │   └── app.html            # Main layout with MatSidenav
│   ├── environments/           # Build-time env generation
│   ├── assets/                 # JSON data and icons
│   └── main.ts                 # Bootstrap entry
├── public/                     # Static assets (favicons, themes)
└── angular.json                # Workspace configuration
```

## Data Models and APIs

### Data Models

- **Segment**: Defined in `src/app/services/segment-service.ts`. Includes metadata, geospatial data (geojson), and elevation arrays.
- **LayerConfig**: Defined in `src/app/services/layer-service.ts`.

### API Specifications

- The app currently relies on **static JSON assets** in `src/app/services/assets/segment.json`.
- Mapbox API is used for base maps, terrain elevation queries, and flyTo animations.

## Technical Debt and Known Issues

### Critical Technical Debt

1. **Manual Change Detection**: `App` component still uses `detector.detectChanges()` despite using Signals. This indicates a hybrid state where OnPush might not be fully working as expected or template bindings are missing signals.
2. **Marker Sync**: `MapComponent` uses standard HTML `Marker` objects which are managed separately from the GeoJSON source. This leads to performance overhead and difficulties in syncing visibility.
3. **Array-Index ID Mapping**: `SegmentService.getSegmentByDomId` uses `.at(id)`, assuming the segment ID is its index in the array. This will break if segments are filtered or reordered.
4. **Hardcoded Styles**: Some Mapbox layer definitions and interaction handlers are hardcoded in `MapComponent.ts` instead of being moved to `LayerService` or `MapStyleService`.

### Workarounds and Gotchas

- **Encoded Polylines**: The app decodes Google-encoded polylines into GeoJSON at runtime in the `SegmentService` constructor.
- **Map-Dependent Elevation**: Elevation data is queried from the Mapbox Terrain layer *after* the map loads, meaning the `Segment` objects are incomplete until the map is initialized.

## Integration Points and External Dependencies

### External Services

| Service | Purpose | Integration Type | Key Files |
| --- | --- | --- | --- |
| Mapbox | Map Tiles & Terrain | SDK | `src/app/components/map/` |
| Strava | Segment Data (Source) | Manual Export | `src/app/services/assets/` |

## Development and Deployment

### Local Development Setup

1. Copy `.env.example` to `.env` and add `MAPBOX_API_KEY`.
2. Run `npm run serve`. This executes `build:env` then `ng serve`.

### Build and Deployment Process

- **Build**: `npm run build`
- **Deploy**: `npm run deploy` (uses `angular-cli-ghpages`)

## Testing Reality

- **Unit Tests**: Exist as boilerplate in `*.spec.ts` files. Coverage is currently low and likely non-functional for complex map interactions.
- **Testing Framework**: Karma + Jasmine.

## Enhancement Impact Analysis (per Spec Sheet)

### Files That Will Need Modification

- `src/app/app.ts`: Remove `detectChanges()` and fully migrate to Signal-based state.
- `src/app/components/map/map.component.ts`: Replace `Marker`s with `SymbolLayer`.
- `src/app/services/segment-service.ts`: Fix ID resolution logic and possibly pre-calculate elevation if moving to API.

### New Patterns Needed

- **SymbolLayer Management**: For performance-optimized markers.
- **Pure Presentational Components**: Ensuring `MapComponent` doesn't hold too much business logic.
