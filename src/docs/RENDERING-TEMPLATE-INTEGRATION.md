# Rendering & Visualization Template Integration

## Overview
Implemented a dedicated workflow for "Rendering & Visualization" projects, focusing on high-fidelity imagery, software attributions, and flexible gallery layouts.

## Components

### 1. Admin Editor (`RenderingEditor.tsx`)
- Located in `/components/admin/RenderingEditor.tsx`
- Features:
  - **Software Used**: Tagging system for software (Cinema 4D, Vectorworks, etc.)
  - **Flexible Galleries**: Support for multiple galleries with different layouts:
    - Full Width (1-col)
    - Grid (2-col, 3-col)
    - Masonry (Pinterest-style)
  - **Video Integration**: Flythroughs and animation embeds

### 2. Frontend Template (`RenderingTemplate.tsx`)
- Located in `/pages/portfolio/RenderingTemplate.tsx`
- Features:
  - **Full-width Imagery**: Emphasizes high-res renders
  - **Software Tags**: Displayed prominently near the header
  - **Dynamic Lightbox**: Full-screen image viewing with keyboard navigation
  - **Masonry Support**: CSS-column based masonry for stability

## Integration
- Updated `DynamicProject.tsx` to route "Rendering & Visualization" categories to the new template.
- Updated `PortfolioManager.tsx` to include the new editor fields.
- Data is stored in the `renderingGalleries` and `softwareUsed` fields in the project JSON.
