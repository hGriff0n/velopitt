---
phase: 1
plan: 2
wave: 2
gap_closure: true
---

# Plan 1.2: Fix MapStateService Coverage

## Objective
Bring `MapStateService` test coverage from 36% to >80% to satisfy Phase 1 requirements.

## Context
- `MapStateService` logic involves complex Mapbox interactions (`addSource`, `addLayer`, `setFeatureState`).
- Current tests mock `Map` but fail to exercise all branches of `addAllSegments` and `updateMapTheme`.
- Need to improve `MockMap` and add dedicated test cases for:
  - Theme updates.
  - Interaction callbacks (hover, click).
  - Highlighting logic.

## Tasks
<task type="auto">
  <name>Improve MapStateService Tests</name>
  <files>
    src/app/services/map-state.service.spec.ts
  </files>
  <action>
    1.  Mock `ThemeService` to return different colors to test `updateMapTheme`.
    2.  Simulate `map.on('load')` or direct method calls to verify `addAllSegments` branches.
    3.  Verify `addInteraction` callbacks are registered and trigger them to test `highlightSegment`.
    4.  Test `clearHighlights` logic.
  </action>
  <verify>npm test -- --include=src/app/services/map-state.service.spec.ts --code-coverage</verify>
  <done>Coverage > 80%.</done>
</task>
