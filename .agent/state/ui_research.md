# UI Modernization Research & Theme Proposal

## Research Findings

### 1. Pittsburgh Regional Colors
-   **Core Colors**: Black (`#000000`), Gold (`#FEBD2D` - Official, `#FFB612` - Steelers), Blue (`#00337C` - Civic).
-   **Landmark Colors**: "Aztec Gold" (Steel Bridges).
-   **Vibe**: Industrial, bold, high contrast.

### 2. Modern 2025 UI Trends
-   **Dark Mode Evolution**: Shift from pure black to deep grays/charcoals (`#121212`, `#181A1B`) for reduced eye strain.
-   **Glassmorphism**: Subtle translucency (frosted glass) for depth.
-   **Neon/Pop Accents**: High-visibility accent colors against dark backgrounds.
-   **Typography**: Clean, geometric sans-serifs.

## Proposed Theme: "Neon Steel"

A modernization of the classic Black & Gold, inspired by Pittsburgh's industrial roots but adapted for a premium digital experience.

### Color Palette

| Role | Color Name | Hex | Description |
| :--- | :--- | :--- | :--- |
| **Background** | **Gunmetal** | `#121212` | Deep, neutral dark gray. Base surface. |
| **Surface** | **Steel Gray** | `#1E1E1E` | Card backgrounds, sidebars. Slightly lighter than base. |
| **Primary** | **Electric Gold** | `#FFD54F` | High-visibility gold. Used for primary actions, active states. |
| **Secondary** | **River Blue** | `#4FC3F7` | Vibrant blue. Used for secondary actions, links, water features. |
| **Text** | **Off-White** | `#E0E0E0` | Primary text. High legibility without harsh white. |
| **Success** | **Signal Green** | `#69F0AE` | Success states, open segments. |
| **Error** | **Stop Red** | `#FF5252` | Error states, closures. |

### Design Elements
-   **Glassmorphism**: Sidebar and Header will use a semi-transparent black background with a blur backdrop filter to let the map peek through.
-   **Neumorphism (Subtle)**: Soft inner shadows for input fields or pressed states (optional).
-   **Borders**: Thin, 1px borders in dark gray to define structure without heavy shadows.

## Implementation Strategy
1.  **CSS Variables**: Define the palette in `theme.css` (e.g., `--color-primary`, `--color-bg-surface`).
2.  **Angular Material**: Create a custom Material theme using these palette values.
3.  **Components**: Update `Header` and `Sidebar` to use the glassmorphism effect and new colors.
