---
name: Kinetic Campus Delivery
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#5b4137'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8f7065'
  outline-variant: '#e4beb1'
  surface-tint: '#a73a00'
  primary: '#a73a00'
  on-primary: '#ffffff'
  primary-container: '#ff5c00'
  on-primary-container: '#521800'
  inverse-primary: '#ffb59a'
  secondary: '#515f78'
  on-secondary: '#ffffff'
  secondary-container: '#d2e0fe'
  on-secondary-container: '#55637d'
  tertiary: '#005bc1'
  on-tertiary: '#ffffff'
  tertiary-container: '#4f90ff'
  on-tertiary-container: '#00295f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#802a00'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#b9c7e4'
  on-secondary-fixed: '#0d1c32'
  on-secondary-fixed-variant: '#39475f'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a41'
  on-tertiary-fixed-variant: '#004493'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
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
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style
The design system is built for a fast-paced campus environment where efficiency and reliability are paramount. The brand personality is **Rapid, Reliable, and Youthful**, capturing the energy of students on the move.

The visual style is **Modern Professional**, leaning into high-contrast functionalism with a "tech-forward" spirit. It utilizes a refined flat design approach—prioritizing clarity through generous whitespace and purposeful color application—while using subtle depth to guide the user's eye toward critical actions. The interface should feel like a high-performance tool: responsive, precise, and energetic.

## Colors
The palette is anchored by **Energetic Orange**, a high-visibility hue that signals speed and momentum. This is balanced by **Deep Navy**, which provides the grounding necessary to convey reliability and institutional trust.

- **Primary (Energetic Orange):** Used for primary call-to-action buttons, active states, and key brand moments.
- **Secondary (Deep Navy):** Used for headers, primary navigation, and high-level typography to ensure authority.
- **Status Indicators:** Vibrant, semantic colors are used for order tracking (e.g., "Arrived", "In Transit", "Issue").
- **Backgrounds:** A hierarchy of clean whites (#FFFFFF) and soft grays (#F8F9FA) creates a layered, modern app feel without visual clutter.

## Typography
The system uses a pairing of **Montserrat** for headlines and **Inter** for functional text. 

Montserrat's geometric, bold character provides the "athletic" and energetic feel required for a delivery service. Inter is utilized for all body copy, inputs, and labels to ensure maximum legibility at small sizes during high-stress usage (e.g., a courier checking an address while walking). 

Headlines should use tighter letter-spacing to appear more impactful. Labels for status and metadata should utilize Inter's medium or semi-bold weights to remain distinct from body descriptions.

## Layout & Spacing
This design system employs an **8px linear scale** to maintain rhythmic consistency. The layout is primarily **fluid-first**, designed for mobile-native interactions.

- **Mobile:** A single-column layout with 20px side margins. Elements are stacked vertically to prioritize thumb-reach zones.
- **Desktop/Web:** A 12-column grid with a max-width of 1200px. Dashboards for dispatchers should use a "fixed-sidebar, fluid-content" model.
- **Touch Targets:** All interactive elements must maintain a minimum height of 48px to accommodate rapid, on-the-go interaction by campus couriers.

## Elevation & Depth
Depth is handled through **Ambient Shadows** and **Tonal Layering**. 

The background remains flat (#F8F9FA), while interactive "Cards" use a subtle, highly diffused shadow (Y: 4px, Blur: 20px, Opacity: 6% Black) to appear slightly lifted. This indicates clickability without the "heavy" feel of traditional skeuomorphism. 

Crucial action elements, like the "Track Order" button or floating action buttons, may use a tinted shadow (Orange) to create a glowing, energetic effect that draws the eye. Status banners use flat, high-saturation fills with no shadows to communicate urgency.

## Shapes
The shape language is defined by **Large Rounded Corners**. 

A radius of `0.5rem` (8px) is the standard for most components, while `1rem` (16px) is used for containers and cards to evoke a friendly, modern app aesthetic. Buttons that represent primary actions should lean towards a fully rounded (pill) style to maximize the "action-oriented" feel. This softness contrasts with the bold typography to balance "Speed" with "Friendliness."

## Components
- **Buttons:** Primary buttons use a full-width, pill-shaped Energetic Orange fill with white Montserrat bold text. Secondary buttons use a Deep Navy outline.
- **Status Chips:** Small, rounded-sm badges. Use "Success Green" for 'Delivered', "Pending Yellow" for 'In Kitchen', and "Error Red" for 'Delayed'. Text inside chips should be Inter Bold 12px.
- **Input Fields:** Large 56px height inputs with a light gray fill (#F1F3F5) and a 1px border that turns Deep Navy on focus.
- **Order Cards:** White background, 16px corner radius, subtle shadow. The order number should be Deep Navy Montserrat, while the ETA is highlighted in Energetic Orange.
- **Tracking Progress Bar:** A thick 8px track using a light gray base, with the filled portion in Energetic Orange to show movement and "speed."
- **Interactive Map Pins:** Energetic Orange circles with white icons for the destination, and Deep Navy for the courier's current location.