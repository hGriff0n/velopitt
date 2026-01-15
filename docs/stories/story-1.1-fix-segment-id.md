# Story 1.1: Fix Segment ID Resolution & Data Robustness

**Status**: Draft
**Role**: Developer

**As a** Developer,
**I want** to refactor `SegmentService` to index segments by their real ID rather than array position,
**so that** future filtering or sorting doesn't break segment selection logic.

**Context**:
Currently, `getSegmentByDomId(id)` uses `.at(id)`, which assumes the ID passed from the UI corresponds exactly to the array index. This is fragile. If we filter the list or if IDs are not sequential (0, 1, 2...), this will break. We need to find the segment where `segment.id === id`.

**Acceptance Criteria**:
1.  **Rename Method**: Rename `getSegmentByDomId(id)` to `getSegmentById(id)` to reflect it's using the real ID.
2.  **Implementation**: Update the method to use `.find(s => s.id === id)` instead of `.at(id)`.
3.  **Return Type**: Ensure it returns `Segment | undefined` safely.
4.  **Refactor Callsites**: Update `src/app/app.ts` and `src/app/components/map/map.component.ts` (and any others) to use the new method name and handle the `undefined` case gracefully.
5.  **Tests**: Verify unit tests in `segment-service.spec.ts` cover this lookup.

**Technical Notes**:
-   The current `segment.json` likely has sequential IDs, which is why it works now. We want to be robust against future data changes.
-   Check `AppMapComponent.handleSegmentClickEvent` where it casts the return value `as Segment`. This should be safer.

**Files to Modify**:
-   `src/app/services/segment-service.ts`
-   `src/app/app.ts`
-   `src/app/components/map/map.component.ts`
-   `src/app/components/segment/segment-overlay.component.ts` (if it uses the lookup)
