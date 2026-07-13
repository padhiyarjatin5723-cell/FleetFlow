---
name: FleetFlow Digital Standard
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#434655'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#3e3fcc'
  on-tertiary: '#ffffff'
  tertiary-container: '#585be6'
  on-tertiary-container: '#f1eeff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system is engineered for high-velocity logistics management, prioritizing clarity, precision, and a premium "Pro" feel. The brand personality is authoritative yet approachable, evoking the reliability of global infrastructure paired with the agility of modern software. 

The aesthetic draws heavily from **Minimalism** and **Corporate Modern** movements, utilizing expansive whitespace, a restrained color palette, and high-quality functional typography. Subtle **Glassmorphism** is applied to navigation and overlay elements to provide a sense of depth and modern layering without sacrificing performance or legibility.

## Colors
The palette is rooted in a professional "Enterprise Blue" to signal trust and stability. The background uses a cool-toned light gray to reduce eye strain during long-term operational use, while pure white surfaces are reserved for interactive cards and data modules. 

Success, warning, and error colors are calibrated for high visibility against the neutral backdrop, ensuring critical logistics alerts are immediately actionable. Use the secondary Emerald color primarily for growth metrics, "on-time" statuses, and positive completion states.

## Typography
This design system utilizes **Inter** exclusively to maintain a systematic, utilitarian aesthetic. 
- **Headings:** Bold weights with slight negative letter-spacing ensure a "tight," premium editorial feel suitable for dashboards.
- **Labels:** Medium weights (500) are used for all UI metadata, table headers, and form labels to provide a clear visual hierarchy against standard body text.
- **Numbers:** Tabular lining should be enabled for all data tables and shipment IDs to ensure vertical alignment of digits.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a maximum content width of 1440px. 
- **Desktop:** 12-column grid with 24px gutters.
- **Tablet:** 8-column grid with 24px gutters.
- **Mobile:** 4-column grid with 16px gutters.

Spacing follows a strict 4px/8px baseline rhythm. For complex data views (like shipment manifests), use 'Compact' spacing (8px-12px padding), while 'Marketing' or 'Overview' views should utilize 'Spacious' padding (24px-32px) to allow for better information absorption.

## Elevation & Depth
The system uses a combination of **Tonal Layering** and **Ambient Shadows** to define hierarchy:
- **Level 0 (Background):** #F8FAFC.
- **Level 1 (Cards/Content):** #FFFFFF with a subtle 1px border (#E5E7EB) and a very soft, diffused shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.05)`.
- **Level 2 (Dropdowns/Modals):** High-diffusion shadow with a 1px border and a Backdrop Blur (12px) where the surface is slightly translucent (95% opacity).
- **Focus States:** 3px soft outer glow using the Primary Blue at 20% opacity.

## Shapes
The design system employs a **Rounded** shape language to soften the industrial nature of logistics data. 
- **Standard UI (Buttons, Inputs, Small Cards):** 0.5rem (8px).
- **Large Container Cards:** 1rem (16px).
- **Status Pills/Chips:** Full radius (Pill-shaped) for maximum distinction from square data cells.

## Components
- **Buttons:** Primary buttons use a solid #2563EB background with white text. Secondary buttons use a subtle gray-scale ghost style or a thin border. All buttons feature a 150ms transition on hover.
- **Input Fields:** Utilize "Floating Labels" that shrink and move to the top-left border on focus. Include consistent 20px icons (Left-aligned) for common logistics search terms (e.g., Tracking ID, Vehicle ID).
- **Cards:** White background, 16px corner radius, and a 1px border. No heavy shadows—only a light ambient lift.
- **Chips:** Used for "In Transit," "Delivered," or "Delayed." Use a low-saturation background of the status color with high-saturation text (e.g., Success Green background at 10% opacity with 100% opacity text).
- **Illustrations:** Minimalist, flat-style vector illustrations using the Primary Blue and Secondary Emerald. Use thick, clean lines and geometric shapes for trucks and warehouses. Represent "routes" with dashed indigo lines and soft-glow nodes. Avoid gradients; use solid color blocks with varying opacities to create depth.