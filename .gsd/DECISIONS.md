## Phase 1 Decisions

**Date:** 2026-01-24

### Architecture
- **Structure**: Moving all Mapbox logic (layers, markers, events) into `MapStateService`.
- **Rationale**: `AppMapComponent` should be a "dumb" view. Future phases (Route Editor, GPX Viewer) require map manipulation from other components (Sidebar, Toolbar) without direct parent-child relationships. "Option A" (Deep Refactor) selected to pay down this debt now.

### Constraints
- `MapStateService` must handle lifecycle (map load/destroy) carefully to avoid memory leaks.
