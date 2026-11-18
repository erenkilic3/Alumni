---
version: "1.0.0"
name: "AlumniSphere Design System"
description: "Linear-inspired, dark-first alumni network design system with precise obsidian surfaces, restrained indigo-violet accents, and dual-mode (Dark/Light) CSS custom properties."
source: "client/public/styles.css"
spec: "awesome-design-md (VoltAgent/awesome-design-md)"
---

# DESIGN.md — AlumniSphere Design System

> Referenced by [`client/public/styles.css`](./client/public/styles.css) and [`brand.md`](./brand.md).

---

## 1. Visual Theme & Atmosphere

- **Aesthetic Direction**: Linear-inspired, ultra-minimal dark-first developer & academic network aesthetic (`VoltAgent/awesome-design-md`). Deep obsidian canvas (`#08090a`) paired with elevated panels (`#0f1011`, `#141516`), 1px hairline borders (`rgba(255, 255, 255, 0.08)`), and purposeful Linear Indigo (`#5e6ad2`) accents.
- **Density & Rhythm**: Airy, structured dashboard layout (`1280px` max container width) with crisp inner hairline highlights, measured negative display tracking (`-0.04em`), and smooth micro-interactions (`0.18s–0.28s cubic-bezier(0.4, 0, 0.2, 1)`).
- **Dual-Theme Support**: Dark mode is the default `:root` token set; Light mode is activated cleanly via `[data-theme="light"]` without altering layout geometry.

---

## 2. Color Palette & Roles (`colors`)

### Dark Theme (`:root` — Default)

| Role | Token | Value | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas** | `--bg-primary` | `#08090a` | Deep obsidian page background |
| **Surface 1** | `--bg-secondary` | `#0f1011` | Secondary panels & modal base |
| **Surface 2 (Glass)** | `--bg-card` | `rgba(20, 21, 22, 0.85)` | Navbar, cards & translucent containers |
| **Surface Hover** | `--bg-card-hover` | `#18191b` | Interactive card hover state |
| **Input Surface** | `--bg-input` | `#141516` | Form inputs, secondary buttons & tags |
| **Hairline** | `--border-color` | `rgba(255, 255, 255, 0.08)` | 1px card, navbar & divider borders |
| **Hairline Highlight** | `--border-highlight` | `rgba(94, 106, 210, 0.45)` | Focused/active interactive borders |
| **Ink (Primary)** | `--text-primary` | `#f7f8f8` | Headings, primary labels & values |
| **Ink (Secondary)** | `--text-secondary` | `#d0d6e0` | Subtitles, descriptions & nav links |
| **Ink (Muted)** | `--text-muted` | `#8a8f98` | Placeholders & tertiary metadata |
| **Primary Accent** | `--accent-primary` | `#5e6ad2` | Brand marks, focus rings & explicit CTAs |
| **Primary Hover** | `--accent-primary-hover` | `#6e7be2` | Accent hover state |
| **Signature Gradient** | `--accent-gradient` | `linear-gradient(135deg, #5e6ad2 0%, #8b5cf6 100%)` | Primary CTAs & hero highlights |
| **Accent Glow** | `--accent-glow` | `rgba(94, 106, 210, 0.28)` | Subtle elevation glow on primary actions |

### Light Theme (`[data-theme="light"]`)

| Role | Token | Value |
| :--- | :--- | :--- |
| **Canvas** | `--bg-primary` | `#fafafa` |
| **Surface 1** | `--bg-secondary` | `#ffffff` |
| **Surface 2 (Glass)** | `--bg-card` | `rgba(255, 255, 255, 0.92)` |
| **Input Surface** | `--bg-input` | `#f4f4f5` |
| **Hairline** | `--border-color` | `rgba(0, 0, 0, 0.08)` |
| **Ink (Primary)** | `--text-primary` | `#09090b` |
| **Ink (Secondary)** | `--text-secondary` | `#3f3f46` |
| **Ink (Muted)** | `--text-muted` | `#71717a` |
| **Primary Accent** | `--accent-primary` | `#5e6ad2` |
| **Signature Gradient** | `--accent-gradient` | `linear-gradient(135deg, #5e6ad2 0%, #7c3aed 100%)` |

### Semantic Indicators

| Role | Token | Value | Subtle Surface |
| :--- | :--- | :--- | :--- |
| **Success** | `--success` | `#10b981` | `rgba(16, 185, 129, 0.14)` |
| **Warning** | `--warning` | `#f59e0b` | `rgba(245, 158, 11, 0.14)` |
| **Info** | `--info` | `#3b82f6` | `rgba(59, 130, 246, 0.14)` |

---

## 3. Typography Rules (`typography`)

- **Heading Font (`--font-heading`)**: `'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif` — Crisp technical sans-serif with tight negative tracking (`-0.04em`) on display headings.
- **Body Font (`--font-body`)**: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` with `font-feature-settings: "cv02", "cv03", "cv04", "cv11"`.
- **Mono Font (`--font-mono`)**: `'JetBrains Mono', ui-monospace, SFMono-Regular, monospace` — Used for status badges, API pills, and technical metadata.

| Style | Font | Weight | Typical Size | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `Inter` | `600` | `clamp(2.25rem, 4.5vw, 3.25rem)` | Tight negative tracking (`-0.04em`), line-height `1.1` |
| **Section Heading** | `Inter` | `600 / 700` | `1.35rem – 1.75rem` | Clear hierarchy over muted subtitles |
| **Stat Value** | `Inter` | `700` | `1.75rem` | High-contrast numeric emphasis |
| **Body Copy** | `Inter` | `400 / 500` | `0.95rem – 1.05rem` | Line-height `1.6` |
| **Status Pill / Badge** | `JetBrains Mono` | `500` | `0.75rem` | Crisp `0.02em` tracking |

---

## 4. Spacing & Layout Tokens

- **Container Max Width**: `1280px` (`.nav-container`, `.container`)
- **Horizontal Gutter**: `24px` (`padding: 0 24px`)
- **Navbar Height / Padding**: `padding: 14px 0`, `gap: 20px`
- **Button Padding**: `9px 18px` with `gap: 8px`
- **Elevation Shadows**:
  - `--shadow-sm`: `0 1px 2px rgba(0, 0, 0, 0.45)` plus a subtle inset highlight
  - `--shadow-md`: `0 8px 24px rgba(0, 0, 0, 0.5)` plus a subtle inset highlight
  - `--shadow-lg`: `0 20px 44px rgba(0, 0, 0, 0.7)` plus a subtle inset highlight
  - `--shadow-glow`: `0 0 24px rgba(94, 106, 210, 0.3)`

---

## 5. Border Radii & Shapes (`rounded`)

| Category | Radius | Elements |
| :--- | :--- | :--- |
| **Controls (`sm`)** | `8px – 10px` | `.btn`, form inputs, compact links |
| **Cards & Modals (`lg`)** | `16px – 20px` | Alumni cards, job cards, `.modal-card` |
| **Status & Tags (`pill`)** | `9999px` | `.status-pill`, skill tags, mentor badges |

---

## 6. Component Stylings (`components`)

### Navigation Bar (`.navbar`)
- Sticky top bar (`z-index: 100`), translucent surface (`--bg-card`) with `backdrop-filter: blur(16px)` and `1px solid var(--border-color)` bottom border.

### Buttons & CTAs (`.btn`)
- **Primary (`.btn-primary`)**: `--accent-gradient` background, `#ffffff` text, `0 4px 14px var(--accent-glow)` shadow, lifts `-2px` on hover.
- **Secondary (`.btn-secondary`)**: `--bg-input` surface, `--text-secondary` ink, `1px solid var(--border-color)`.
- **Outline (`.btn-outline`)**: Transparent fill with `1px solid var(--border-color)` and `--border-highlight` on hover.

### Cards & Modals
- Glassmorphic panels using `--bg-card`, `1px solid var(--border-color)`, and `--shadow-md` / `--shadow-lg`.
- Modal overlay (`.modal-overlay`) uses centered flex positioning with smooth opacity/scale transition (`--transition-normal`).

---

## 7. Signature Patterns

1. **Live Architecture Status Pills**: Compact pill badges in the navbar showing real-time connectivity (`API`, `PostgreSQL`, `Docker`) with animated pulsing dots.
2. **Gradient Text Highlights**: Hero headlines highlight key domain phrases using `background: var(--accent-gradient)` clipped to text.
3. **Zero-Friction Theme Switching**: Single toggle button updates `data-theme` on `<html>` and persists preference in `localStorage`.
