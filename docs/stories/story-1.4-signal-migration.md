# Story 1.4: Full Signal Migration (Root State)

**Status**: Draft
**Role**: Developer

**As a** Developer,
**I want** to remove manual `detectChanges()` calls in `App` and use proper Signal updates,
**so that** the app uses modern Angular change detection effectively.

**Context**:
The `App` component currently injects `ChangeDetectorRef` and calls `detector.detectChanges()` manually in `onSegmentSelected` and `changeSegmentDisplay`. This is a "code smell" in a Signals-based app. We need to rely on the natural reactivity of Signals.

**Acceptance Criteria**:
1.  **Remove CDR**: Remove `ChangeDetectorRef` injection from `src/app/app.ts`.
2.  **Remove Manual Detect**: Delete all `this.detector.detectChanges()` calls.
3.  **Verify Signals**: Ensure `isShow`, `selectedSegment`, and layer toggles (`regionShowing`, etc.) are all proper Signals.
4.  **Template Update**: Verify `app.html` uses the signal call syntax (e.g., `isShow()`) correctly (it appears it already does).
5.  **Verify Reactivity**: Ensure clicking a segment or toggling a layer still updates the UI immediately.

**Technical Notes**:
-   If the UI stops updating after removing `detectChanges()`, it implies the change detection strategy is set to `OnPush` but the signal update isn't marking the view dirty (which shouldn't happen with Signals in Angular 17+).
-   Check if `AppMapComponent` or `SidebarComponent` inputs are properly wired.

**Files to Modify**:
-   `src/app/app.ts`
