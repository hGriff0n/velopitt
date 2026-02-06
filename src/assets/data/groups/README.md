# Groups Data

This directory contains the configuration files for cycling groups.
Each file should be a JSON file named after the group (e.g., `ac-cycling.json`).

## Structure

The JSON should contain:
- `group`: Metadata about the group.
- `rides`: An array of ride definitions.

Example:
```json
{
  "group": {
    "id": "ac-cycling",
    "name": "AC Cycling",
    "socials": []
  },
  "rides": [
    {
      "id": "tuesday-night",
      "groupId": "ac-cycling",
      "name": "Tuesday Night Worlds",
      "startTime": "18:00",
      "recurrence": "Weekly",
      "dayOfWeek": 2
      ...
    }
  ]
}
```
