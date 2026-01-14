# Velopitt Community & Content Research Report

## 1. Goal
To define the content and structure for the "Group Rides", "Community Resources", and "Etiquette" sections of the Velopitt website, ensuring it serves as a comprehensive hub for local cyclists and tourists.

## 2. Content Sections

### 2.1. Group Rides, Events & Racing
**UI Strategy**: A "Community Calendar" view or a list of "Regular Weekly Rides" separate from special events.
*   **Racing**:
    *   **Allegheny Cycling Association (ACA)**: The core of PGH racing. Tuesday/Wednesday night crits at the Oval (Bud Harris Cycling Park).
    *   **Dirty Dozen**: The iconic hill climb event (October/November).
*   **Group Rides (Weekly)**:
    *   **Major Taylor (PMTCC)**: Urban recreational rides.
    *   **Western PA Wheelmen (WPW)**: Long distance/randonneuring.
    *   **Team Decaf**: Tuesday night road rides (No-drop options).
    *   **Coffee Outside**: Casual Sunday AM rides.
    *   **SweetWater/The Bike Lab**: Gravel/MTB specific rides.
*   **Big Events**:
    *   **PedalPGH**: Large community fundraiser ride (Summer).

### 2.2. Community Resources (Tourist & Local)
**UI Strategy**: A "Resources" map layer or specific "Guide" pages.
*   **Bike Rentals**:
    *   **Golden Triangle Bike Rentals**: Downtown/GAP trail focus.
    *   **Bikes on the move (POGOH)**: Bikeshare system for city transit.
*   **Cyclist-Friendly Spots**:
    *   **OTB Bicycle Cafe** (South Side & North Park).
    *   **Cadence Clubhouse** (North Park basecamp).
    *   **Redbeard's / Local cafes**: Often used as ride starts/stops.
*   **Shops**: Identify shops adjacent to key trails/routes (e.g., Bear Dog Bicycles on the GAP, Pro Bike+Run).

### 2.3. Etiquette & Safety
**UI Strategy**: A robust "Safety Card" or "Modal" accessible from the main menu, perhaps with iconography.
*   **Group Ride Etiquette**:
    *   **Communication**: Hand signals for holes, "Car Back", "Stopping".
    *   **Formation**: 2-abreast maximum, single file on narrow roads.
    *   **Predictability**: No sudden braking.
*   **Trail Etiquette**:
    *   **Yielding**: Cyclists yield to pedestrians/horses. Uphill traffic has right of way.
    *   **Bell/Voice**: "On your left" alerts.
*   **Pittsburgh Specifics**:
    *   **Hills**: Warning about steep grades/descents (brake checks).
    *   **Bridges**: Metal grates can be slippery; awareness of "sharrows" vs protected lanes.

## 3. Integration Strategy
*   **Data Structure**: Store events/groups in a static JSON configuration (similar to segments) for easy community contributions via PRs.
    ```typescript
    interface CommunityEvent {
      name: string;
      organizer: string;
      type: 'race' | 'social' | 'gravel';
      frequency: 'weekly' | 'annual';
      day?: string;
      url: string;
      startLocation?: [number, number]; // Plot on map!
    }
    ```
*   **Map Integration**:
    *   Toggleable **"Points of Interest"** layer for Shops, Cafes, and Event Start Locations.
    *   **"Tourist Mode"**: A pre-set filter that turns on Rentals, Easy Trails, and Scenic Spots while dimming aggressive road segments.

## 4. Recommendations for Rewrite
*   **New Menu Item**: "Community Hub" sidebar page.
*   **New Map Layer**: "Services" (Rentals, Mechanics, Coffee).
*   **Safety Feature**: "Segment Warnings" – If a user clicks a particularly dangerous segment (high traffic or technical descent), show a specific safety tip in the overlay.
