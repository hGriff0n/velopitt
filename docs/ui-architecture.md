# Velopitt Frontend Architecture Document

## Introduction

This document defines the technical architecture, implementation patterns, and standards for the Velopitt frontend modernization. It builds upon the existing codebase but introduces modern Angular 20+ patterns to improve performance, maintainability, and developer experience.

### Document Scope

Focuses on the transition to Signal-based state management, WebGL-optimized map rendering (SymbolLayer), and centralized style management.

### Change Log

| Date       | Version | Description                          | Author    |
| ---------- | ------- | ------------------------------------ | --------- |
| 2026-01-15 | 1.0     | Initial Frontend Architecture Design | Architect |

## Frontend Tech Stack

| Category | Technology | Version | Purpose | Rationale |
| --- | --- | --- | --- | --- |
| Framework | Angular | 20.1.x | Core Application Framework | Industry standard for robust SPAs, provides Signals and Standalone components. |
| State Management | Angular Signals | Native | Local and Shared State | Reactive without the overhead of Zone.js manual checks. Improved performance. |
| Map Engine | Mapbox GL JS | 3.14.0 | Interactive Map Rendering | Leading high-performance mapping library with native WebGL support. |
| UI Library | Angular Material | 20.1.6 | Layout and Standard UI | High-quality, accessible components that follow Material Design. |
| Visualizations | Chart.js | 4.3.0 | Elevation Profiles | Light and fast charting library with excellent canvas rendering. |
| Utilities | Turf.js / Polyline | 7.x / 1.x | Geospatial Math | Essential for chunking lines and decoding Strava-style polylines. |
| Build Tool | Angular Build (Vite) | 20.1.x | Bundling and Dev Server | Modern, fast build pipeline integrated with Angular CLI. |

## Project Structure

```text
src/
├── app/
│   ├── components/
│   │   ├── map/                # Map rendering (Presentational)
│   │   ├── segment/            # Overlay and Profile (Presentational)
│   │   ├── sidebar/            # Layer Toggles
│   │   └── header/             # Branding
│   ├── services/
│   │   ├── segment.service.ts  # Data provider (Segments)
│   │   ├── map-style.service.ts # NEW: Mapbox layer definitions
│   │   ├── layer.service.ts    # Layer visibility logic
│   │   ├── theme.service.ts    # UI color coordination
│   │   └── config.service.ts   # Env and API config
│   ├── app.ts                  # Root Component (Orchestrator)
│   ├── app.config.ts           # Global Providers
│   └── app.html                # Layout Shell
├── environments/               # Build-time env generation
└── styles.css                  # Global variables and resets
```

## Component Standards

### Component Template (Angular 20 Standalone)

```typescript
import { Component, ChangeDetectionStrategy, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>{{ derivedValue() }}</div>
    <button (click)="onAction()">Click Me</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {
  // Inputs as Signals
  data = input.required<string[]>();
  
  // Outputs as EventEmitter-like functions
  actionPerformed = output<string>();

  // Derived state
  derivedValue = computed(() => this.data().join(', '));

  onAction() {
    this.actionPerformed.emit('done');
  }
}
```

### Naming Conventions
- **Components**: `[name].component.ts`, Selector: `app-[name]`
- **Services**: `[name].service.ts`
- **Signals**: Variable name should represent the value (e.g., `selectedId`, `isVisible`). Avoid prefixing with `s` or `sig`.
- **Booleans**: Use positive naming (e.g., `isVisible` rather than `notHidden`).

## State Management

### Store Structure (Signal-based)
The application uses a **Distributed Signal Pattern**. 
- **Root State**: `App` component holds high-level UI signals (sidebar open, selected segment ID).
- **Domain State**: `SegmentService` holds the data list as a signal.
- **Derived State**: Components use `computed()` to transform domain data into presentational data based on root signals.

### State Template (Service with Signal)

```typescript
@Injectable({ providedIn: 'root' })
export class SegmentService {
  private _segments = signal<Segment[]>([]);
  
  // Public read-only view
  readonly segments = this._segments.asReadonly();

  // Robust ID lookup
  getSegmentById(id: number) {
    return computed(() => this._segments().find(s => s.id === id));
  }

  updateSegments(data: Segment[]) {
    this._segments.set(data);
  }
}
```

## API Integration

### Service Template
```typescript
@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);

  fetchData<T>(url: string) {
    // Convert Observable to Signal or use directly in components with toSignal
    return this.http.get<T>(url);
  }
}
```

## Styling Guidelines

### Global Theme Variables
Located in `src/styles.css` and dynamically accessed via `ThemeService`.

```css
:root {
  /* System Colors */
  --sys-primary: #d0bcff;
  --sys-on-surface: #e6e1e5;
  --sys-surface-variant: #49454f;

  /* Map Specific */
  --sys-segment-unselected: #555555;
  --sys-segment-selected: #00ffd0;
  --sys-marker: #ffffff;

  /* Elevation Chart Gradients */
  --sys-gradient-flat: #808080;
  --sys-gradient-uphill: #ffcc00;
  --sys-gradient-steep: #ff6600;
}
```

## Testing Requirements
- **Unit Tests**: Focus on `SegmentService` (geospatial math) and `MapStyleService` (expression generation).
- **Integration Tests**: Verify that changing a signal in `App` correctly propagates to the `AppMapComponent` inputs.

## Frontend Developer Standards

### Critical Coding Rules
1. **NO MANUAL DETECT CHANGES**: Never inject `ChangeDetectorRef` to call `detectChanges()`. Use Signals correctly so Angular handles it automatically.
2. **STANDALONE ONLY**: No `NgModule` should be created or modified.
3. **SIGNAL INPUTS**: Use `input()`, `input.required()`, and `output()` instead of `@Input` and `@Output` decorators.
4. **PURE MAP COMPONENTS**: `AppMapComponent` should not calculate business logic. It should receive GeoJSON data and visibility flags and pass them directly to Mapbox.
5. **THEME SYNC**: Always use `ThemeService` to fetch color values for Canvas (Charts) or WebGL (Map) instead of hardcoding hex strings.

### Quick Reference
- **Run Dev**: `npm run serve`
- **Lint**: `npm run lint`
- **Test**: `npm run test`
