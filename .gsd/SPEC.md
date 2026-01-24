# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
A comprehensive atlas that enables new and visiting avid cyclists to explore and navigate Pittsburgh, showcasing it as one of the premier cycling regions in the US.

## Goals
1. **Interactive Atlas**: specific 3D map interface with toggleable infrastructure and segment layers to visualize the cycling network.
2. **Deep Segment Analysis**: Focusable Strava segments that provide rich context—gradient profiles, pacing data, and related segment connectivity.
3. **Community Integration**: A unified event and group ride calendar integrated with map markers to connect cyclists with local culture.
4. **Curated Discovery**: Filterable and focusable segment collections to guide users to the region's best riding experiences.

## Non-Goals (Out of Scope)
- **User Accounts**: No personalized login, saved routes, or social features requiring authentication.
- **Native Mobile Apps**: Focus strictly on a high-quality responsive web experience.
- **Route Building**: The tool is for discovery and analysis, not turn-by-turn route planning.

## Users
- **Primary**: Avid, sporting cyclists (both locals and visitors) looking for high-quality rides and climbs.
- **Secondary**: Commuters and new cyclists seeking safe infrastructure and an introduction to the sport side of cycling.

## Constraints
- **Platform**: Web (Angular v20+).
- **Architecture**: Client-side heavy with Mapbox GL JS.
- **Data**: Strava API for segment data; manual/community sources for events.

## Success Criteria
- [ ] **Map Experience**: Users can seamlessly toggle layers (Roads, Bike Lanes, Trails) on a performant 3D map.
- [ ] **Segment Detail**: Selecting a segment instantly focuses the camera and opens a detailed overlay with gradient visualization and stats.
- [ ] **Collections**: Users can filter visible segments by categories (e.g., "Steepest Climbs", "Scenic Routes").
- [ ] **Events**: A functional calendar view exists that plots upcoming rides on the map.
