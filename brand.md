# Brand Guidelines — AlumniSphere

**AlumniSphere** (*Alumni Tracking & Network System*) is a modern, university-focused platform built to strengthen lifelong connections between educational institutions and their graduates through career tracking, mentorship, and opportunity discovery.

---

## 🎓 Brand Identity & Logo

- **Primary Name**: **AlumniSphere**
- **Tagline**: *Tracking & Network System*
- **Wordmark**: `Alumni` (primary foreground) + `Sphere` (accent highlight)
- **Icon Mark**: Graduation cap line icon (`2px–2.2px` stroke weight, rounded caps/joins) paired with the wordmark:

```svg
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
</svg>
```

### Brand Voice & Tone
- **Professional & Welcoming**: Approachable for students, credible for university administrators, and inspiring for alumni.
- **Clarity First**: Concise labels, clear status indicators, and actionable calls to action.

---

## 🎨 Color Palette & Design Tokens

Defined in [`client/public/styles.css`](file:///Users/erenkilic/repo/Alumni/client/public/styles.css). The system supports both **Dark Theme** (default) and **Light Theme** (`data-theme="light"`).

### Dark Theme (Default)

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--bg-primary` | `#0b0f19` | Page canvas background |
| `--bg-secondary` | `#111827` | Secondary surfaces & panels |
| `--bg-card` | `rgba(17, 24, 39, 0.85)` | Glassmorphic cards & containers |
| `--bg-input` | `#1f2937` | Form inputs & controls |
| `--border-color` | `rgba(255, 255, 255, 0.08)` | Subtle card & divider borders |
| `--text-primary` | `#f9fafb` | Headings & primary copy |
| `--text-secondary` | `#9ca3af` | Subtitles, metadata & descriptions |
| `--text-muted` | `#6b7280` | Captions & tertiary labels |
| `--accent-primary` | `#6366f1` | Primary buttons, links & highlights |
| `--accent-primary-hover` | `#4f46e5` | Interactive hover state |
| `--accent-gradient` | `linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)` | Hero gradients & signature accents |

### Light Theme (`[data-theme="light"]`)

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--bg-primary` | `#f8fafc` | Page canvas background |
| `--bg-secondary` | `#ffffff` | Secondary surfaces & panels |
| `--bg-card` | `rgba(255, 255, 255, 0.9)` | Elevated card surfaces |
| `--bg-input` | `#f1f5f9` | Form inputs & controls |
| `--border-color` | `rgba(0, 0, 0, 0.08)` | Subtle card & divider borders |
| `--text-primary` | `#0f172a` | Headings & primary copy |
| `--text-secondary` | `#475569` | Subtitles & descriptions |
| `--accent-primary` | `#4f46e5` | Primary buttons & links |
| `--accent-gradient` | `linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #db2777 100%)` | Hero gradients & signature accents |

### Semantic & Status Colors

| Role | Color | Subtle Background |
| :--- | :--- | :--- |
| **Success** | `#10b981` | `rgba(16, 185, 129, 0.15)` |
| **Warning** | `#f59e0b` | `rgba(245, 158, 11, 0.15)` |
| **Info** | `#3b82f6` | `rgba(59, 130, 246, 0.15)` |

---

## 🔤 Typography

| Role | Font Family | Weights | CSS Variable |
| :--- | :--- | :--- | :--- |
| **Headings & Display** | `Outfit` | `400`, `500`, `600`, `700`, `800` | `--font-heading` |
| **Body & UI Controls** | `Plus Jakarta Sans` | `400`, `500`, `600`, `700` | `--font-body` |

---

## 🧩 Surface & Motion Principles

- **Glassmorphism**: Cards use translucent backgrounds (`--bg-card`) combined with subtle borders (`--border-color`) and layered shadows (`--shadow-sm`, `--shadow-md`, `--shadow-lg`).
- **Accent Glow**: Key interactive elements and hero highlights use `--shadow-glow` (`0 0 25px rgba(99, 102, 241, 0.35)`).
- **Motion Timing**:
  - Fast interactions (buttons, pills, hover states): `0.2s cubic-bezier(0.4, 0, 0.2, 1)` (`--transition-fast`)
  - Normal transitions (modals, theme switches): `0.3s cubic-bezier(0.4, 0, 0.2, 1)` (`--transition-normal`)
