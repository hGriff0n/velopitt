---
phase: 1
plan: 3
wave: 2
gap_closure: true
---

# Plan 1.3: Fix Function Coverage Gap

## Objective
Raise Global Function Coverage above 80% (Currently 72%).

## Context
- `MapComponent`: Interaction callbacks (hover/click) not tested.
- `SegmentOverlayComponent`: Chart callbacks (`chooseBackgroundColor`) not tested.
- `ThemeService`: DOM `onload` handlers for CSS links not tested.

## Tasks
<task type="auto">
  <name>Test MapComponent Callbacks</name>
  <files>
    src/app/components/map/map.component.spec.ts
  </files>
  <action>
    1. Spy on `mapStateService.addInteractions`.
    2. Capture the `callbacks` object passed to it.
    3. Manually invoke `onClick`, `onHover`, `onLeave` and verify expected side effects (signals emitted, highlight called).
  </action>
  <verify>npm test -- --include=src/app/components/map/map.component.spec.ts --code-coverage</verify>
  <done>MapComponent Function coverage > 90%.</done>
</task>

<task type="auto">
  <name>Test SegmentOverlay Chart Logic</name>
  <files>
    src/app/components/segment/segment-overlay.component.spec.ts
  </files>
  <action>
    1. Manually call `chooseBackgroundColor` with mocked context and segment data.
    2. Verify correct colors returned for different gradients.
    3. Remove unused `onChartHover` if unnecessary.
  </action>
  <verify>npm test -- --include=src/app/components/segment/segment-overlay.component.spec.ts --code-coverage</verify>
  <done>SegmentOverlayComponent Function coverage > 90%.</done>
</task>

<task type="auto">
  <name>Test ThemeService DOM Logic</name>
  <files>
    src/app/services/theme-service.spec.ts
  </files>
  <action>
    1. Mock `DOCUMENT` fully, including `createElement` and `getElementById`.
    2. Return a mocked `HTMLLinkElement` with a workable `onload` property.
    3. Trigger `onload()` and verify `themeChanged` signal updates.
  </action>
  <verify>npm test -- --include=src/app/services/theme-service.spec.ts --code-coverage</verify>
  <done>ThemeService Function coverage > 80%.</done>
</task>
