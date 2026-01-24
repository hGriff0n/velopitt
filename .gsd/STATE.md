# STATE.md

## Current Position
- **Phase**: 1
- **Task**: Task 1.3/1.4 - Refactor MapComponent & MapStateService
- **Status**: Paused at 2026-01-24

## Last Session Summary
Executed Phase 1 initialization.
- Refactored `LayerService` (Tests > 97% coverage).
- Refactored `SegmentOverlayComponent` (Tests > 95% coverage).
- Extracted `MapStateService` from `MapComponent`.
- **Pivot**: Decided to move DEEP map logic (layers, markers) into the service (Option A) to support future Route Editor.

## In-Progress Work
- `MapComponent` is currently using `MapStateService` for basic flyTo/init, but needs to be stripped of layer/marker logic.
- `MapStateService` needs to be expanded to handle layers/markers.
- Tests for `MapComponent` are currently failing/incomplete due to this mid-refactor state.

## Blockers
- None. Just pausing for session break.

## Context Dump
We are in the middle of a "Deep Refactor" of the Map architecture.
Previously, `MapComponent` did everything.
We want `MapStateService` to own the Mapbox instance and all logic (addLayer, addMarker).
`MapComponent` should just be a dumb container that calls `service.setMap(map)`.

### Files of Interest
- `src/app/services/map-state.service.ts`: Needs to grow (add methods for toggling layers).
- `src/app/components/map/map.component.ts`: Needs to shrink (remove private methods, delegate to service).

## Next Steps
1. Resume `/execute 1`
2. Complete Task 1.3 (Move private methods to Service).
3. Complete Task 1.4 (Update tests).
