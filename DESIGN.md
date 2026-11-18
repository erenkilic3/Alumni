---
version: "2.0.0"
name: "AlumniSphere Design System"
description: "Editorial alumni network interface with warm paper surfaces, forest-green actions, clay accents, and responsive light/dark themes."
source: "client/public/styles.css"
---

# AlumniSphere Design System

> The implementation source of truth is [`client/public/styles.css`](./client/public/styles.css); brand guidance is in [`brand.md`](./brand.md).

## 1. Visual direction

AlumniSphere should feel like a thoughtful university publication made useful: personal, calm, and credible. Newsreader adds an editorial voice while Inter keeps navigation and controls practical. The interface favors open space, thin dividers, and content-led layouts over a stack of identical cards.

## 2. Color tokens

### Light theme

| Role | Token | Value |
| --- | --- | --- |
| Canvas | `--paper` | `#f5f3ed` |
| Surface | `--surface` | `#fbfaf6` |
| Raised surface | `--surface-raised` | `#fffefa` |
| Tinted surface | `--surface-tint` | `#eeece4` |
| Primary ink | `--ink` | `#1d2b24` |
| Secondary ink | `--ink-soft` | `#415149` |
| Muted ink | `--muted` | `#6b756e` |
| Forest green | `--green` | `#245442` |
| Clay accent | `--clay` | `#b75e45` |
| Divider | `--line` | `#d8d8cf` |

### Dark theme

`[data-theme="dark"]` reassigns the same semantic tokens to a deep green-gray canvas (`#19221d`), raised green-gray surfaces, soft ivory text, lighter green actions, and muted clay highlights. Components reference semantic tokens rather than hard-coded theme colors.

`--success`, `--warning`, and `--danger` identify semantic states. Pair status colors with readable labels or icons.

## 3. Typography

- **Display:** Newsreader, regular weight; use for the hero, section headings, large metrics, and selected quotations.
- **Interface:** Inter; use for body copy, navigation, controls, and buttons.
- **Technical labels:** JetBrains Mono; reserve for compact counts and system metadata.
- Keep paragraphs readable at `1.55–1.8` line height. Use tight tracking only for large headings.

## 4. Layout and components

- Content width: `1200px`; horizontal gutters adapt from `18px` on small screens to `32px` on desktop.
- The navigation is a restrained, sticky bar with an underline for the active section.
- The hero pairs a large editorial statement with a single human profile feature; network metrics form a ruled strip below it.
- Directory profiles are information-rich rows, not repeated raised cards. On narrower screens they reorganize into two columns and then a single-column stack.
- Opportunity listings use a clear title, company, metadata, requirements, and action hierarchy.
- Forms and modals use square-cornered controls and thin borders. Preserve visible focus states.
- Avoid decorative gradients, excessive shadows, glass effects, and pill-shaped UI. Rounded crops are reserved for portraits.

## 5. Interaction and responsive behavior

- Use short color and position transitions for hover and tab changes.
- Preserve keyboard focus visibility and native form affordances.
- Honor `prefers-reduced-motion`.
- At tablet widths, stack secondary navigation and reorganize directory rows. On mobile, keep navigation usable, reduce hero scale, stack form fields, and allow modal content to scroll.
- Theme preference is persisted by the client and should not change layout geometry.

## 6. Content principles

- Describe the human value of the network before its infrastructure.
- Use action labels that explain the outcome.
- Do not fabricate network metrics when the API has not supplied them.
- Keep system health visible but visually secondary to people and opportunities.
