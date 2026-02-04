# Research Phase 5: Community Calendar

## Objectives
- Determine the best Angular library for calendar visualization.
- Design a scalable event ingestion strategy for community groups.
- Define a data model that supports recurring group rides.

## Findings

### 1. Calendar Library
**Choice**: `@fullcalendar/angular`
**Reasoning**:
- Industry standard, very active maintenance.
- Robust Angular wrapper components.
- Supports "Month", "Week", "List" views out of the box.
- Documentation is excellent.
- Custom rendering hooks for event content.

**Alternatives Considered**:
- `angular-calendar`: Good, but less feature-rich out of the box for complex views.
- Custom Implementation: Too much effort for Phase 5.

### 2. Ingestion Strategy
**Choice**: "GitOps" / Config-based
**Reasoning**:
- Groups can be onboarded via Pull Request.
- No backend database required (keeps architecture Static/Client-side).
- `assets/data/groups/{group-id}.json` allows for granular loading or lazy loading if needed (though we will likely load all at startup for MVP).

### 3. Data Model
**Entities**:
- **CyclingGroup**: Metadata (Name, Logo, Socials).
- **RideDefinition**: The "Template" for a ride (Name, Start Location, Time, Recurrence Rule).
- **CalendarEvent**: The calculated instance (Date, Title, Link to Ride Def).

**Recurrence**:
- Keep it simple for MVP ("Weekly").
- Custom helper in `EventService` to generate instances for the current month view.

## Conclusions
Proceed with `FullCalendar` and the file-based ingestion strategy.
