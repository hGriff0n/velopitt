# Agent Guide for Velopitt

## Local Development

The project uses a custom environment generation script. To run the app locally:

1. Copy `src/environments/environment.example.env` to `src/environments/.env`.
2. Ask the user to populate the keys in `.env`.
3. Run `/serve`.

## Verification Strategy

### Logic & Data (TDD)
Use `npm test` for logic related to data processing, Turf.js calculations, and polyline decoding.

### UI & Map (Integration/Manual)
Since Mapbox is heavily used:
- Always use the `browser` tool for visual verification.
- Verify map layers and interactivity manually or via integration-style browser steps.
- Note that Mapbox requires a valid API key for most tiles to load correctly.
