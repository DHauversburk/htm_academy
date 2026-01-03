# HTM Academy - Brand Assets & Guidelines

## 📦 Logo Versions

### 1. **Primary Logo** (Knight + Wordmark)
- **File**: `htm_academy_minimal_logo.png`
- **Usage**: Main branding, website headers, marketing materials
- **Minimum Size**: 120px width
- **Clear Space**: Minimum 20px on all sides

### 2. **Wordmark Only**
- **File**: `htm_wordmark_only.png`
- **Usage**: Compact spaces, navigation bars, mobile headers
- **Minimum Size**: 80px width
- **Style**: "HTM ACADEMY" in bold, tracked sans-serif

### 3. **Icon/Symbol** (Knight + Cross)
- **File**: `public/logo.svg`
- **Usage**: Favicons, app icons, social media avatars
- **Minimum Size**: 32px (favicon), 180px (app icon)
- **Format**: SVG (scalable), PNG exports for various sizes

---

## 🎨 Color Application

### Primary Palette
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Indigo 600** | `#4f46e5` | Primary buttons, links, active states |
| **Slate 950** | `#020617` | Dark mode background |
| **Slate 900** | `#0f172a` | Logo, primary text (light mode) |
| **Pure White** | `#ffffff` | Light mode background, dark mode text |

### Accent Colors
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Medical Teal** | `#14b8a6` | Equipment-related UI |
| **Nurse Green** | `#4ade80` | NPC markers, success states |
| **Urgent Red** | `#dc2626` | Critical interruptions, errors |
| **Routine Yellow** | `#fbbf24` | Standard tasks, warnings |

---

## 🖼️ Logo Usage Guidelines

### ✅ DO
- Use approved logo files only
- Maintain aspect ratio when scaling
- Ensure sufficient contrast with background
- Use SVG format when possible for crisp rendering
- Place logo on solid backgrounds (white, slate-900, or indigo-600)

### ❌ DON'T
- Distort, rotate, or skew the logo
- Add effects (shadows, glows, outlines)
- Change logo colors (except approved variations)
- Place logo on busy or low-contrast backgrounds
- Use outdated or modified logo versions

---

## 🔤 Typography System

### Primary Typeface: **Inter**
- **Source**: Google Fonts
- **Weights Used**: 
  - Light (300) - Rarely
  - Regular (400) - Body text
  - Medium (500) - Emphasized text
  - Semibold (600) - Subheadings
  - Bold (700) - Headings
  - Extrabold (800) - Display text

### Monospace: **JetBrains Mono**
- **Usage**: Code snippets, technical data, logs
- **Weight**: Regular (400) and Bold (700)

### Import Code
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

---

## 📐 Layout Principles

### Grid System
- **Base Unit**: 4px (0.25rem)
- **Gutter**: 24px (1.5rem) on desktop, 16px (1rem) on mobile
- **Max Content Width**: 1280px (centered)
- **Breakpoints**: 
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### Whitespace Philosophy
> **"Whitespace is not empty space—it's breathing room."**

- Generous padding around all content sections
- Minimum 48px vertical spacing between major sections
- Use whitespace to create visual hierarchy
- Never let content touch viewport edges (min 16px margin)

---

## 🎭 Brand Voice & Tone

### Voice Characteristics
- **Professional**: Enterprise-grade training platform
- **Strategic**: Emphasis on decision-making and critical thinking
- **Supportive**: Encouraging, not punitive
- **Technical**: Accurate medical terminology, but accessible

### Tone Guidelines
| Context | Tone | Example |
|---------|------|---------|
| **Marketing** | Confident, inspiring | "Master the art of healthcare technology management" |
| **In-Game** | Instructive, urgent | "Critical equipment failure in ICU - respond immediately" |
| **Educational** | Clear, methodical | "Follow proper calibration procedures for patient safety" |
| **Feedback** | Constructive, specific | "Good response time! Consider prioritizing life-support systems first." |

---

## 🎮 UI Component Styling

### Buttons
```css
/* Primary Call-to-Action */
.btn-primary {
  background: #4f46e5;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #4338ca;
  transform: scale(0.98);
}

.btn-primary:active {
  transform: scale(0.95);
}
```

### Cards
```css
.card {
  background: #f8fafc; /* Light mode */
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

[data-theme="dark"] .card {
  background: #0f172a;
  border-color: #334155;
}
```

### Input Fields
```css
.input {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.input:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}
```

---

## 🌐 Web Application Branding

### Favicon Sizes
Generate the following sizes from `logo.svg`:
- **16x16** - Browser tab (small)
- **32x32** - Browser tab (standard)
- **180x180** - Apple Touch Icon
- **192x192** - Android Chrome
- **512x512** - PWA icon

### Meta Tags
```html
<meta name="theme-color" content="#4f46e5">
<meta name="apple-mobile-web-app-title" content="HTM Academy">
<meta name="application-name" content="HTM Academy">
```

### Open Graph / Social Media
```html
<meta property="og:title" content="HTM Academy - Healthcare Technology Management Training">
<meta property="og:description" content="Master critical decision-making in healthcare technology through immersive simulation.">
<meta property="og:image" content="/og-image.png">
<meta property="og:type" content="website">
```

---

## 📱 Responsive Design

### Mobile First Principles
1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Font Sizes**: Minimum 16px for body text (prevents zoom on iOS)
3. **Navigation**: Hamburger menu below 768px
4. **Cards**: Stack vertically on mobile, grid on tablet+

### Desktop Enhancements
1. **Hover States**: Subtle animations and color shifts
2. **Keyboard Navigation**: Visible focus indicators
3. **Multi-Column Layouts**: Utilize screen width efficiently

---

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color Contrast**: 
  - Body text: 4.5:1 minimum
  - Large text (18pt+): 3:1 minimum
  - UI components: 3:1 minimum

- **Focus Indicators**: 
  - Always visible
  - High contrast outline (3px solid)
  - Never use `outline: none` without replacement

- **Alternative Text**: 
  - All images must have meaningful alt text
  - Decorative images: `alt=""`

### Screen Reader Support
- Semantic HTML (`<nav>`, `<main>`, `<article>`)
- ARIA labels for interactive elements
- Skip navigation links
- Proper heading hierarchy (single `<h1>`, logical flow)

---

## 🎬 Animation Guidelines

### Micro-Interactions
**Purpose**: Provide feedback, guide attention, enhance delight

**Examples**:
- Button press: Scale down to 98% (150ms)
- Card hover: Lift up 2px + shadow (250ms)
- Menu open: Slide in from right (350ms)
- Toast notification: Slide up from bottom (300ms)

### Respect User Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📄 File Naming Conventions

### Assets
- **Logos**: `htm-logo-[variation]-[size].[ext]`
  - Example: `htm-logo-wordmark-light.svg`
- **Icons**: `icon-[name]-[size].[ext]`
  - Example: `icon-equipment-24.svg`
- **Images**: `[page]-[description]-[variant].[ext]`
  - Example: `hero-hospital-background-dark.jpg`

### Code Files
- **Components**: `PascalCase.tsx`
- **Utilities**: `camelCase.ts`
- **Stylesheets**: `kebab-case.css`

---

## 🚀 Quick Reference

### Color Tokens (CSS Variables)
```css
--primary: #4f46e5;
--bg-light: #ffffff;
--bg-dark: #020617;
--text-light: #0f172a;
--text-dark: #f8fafc;
--border: #e2e8f0;
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
```

### Common Spacing
```css
/* Padding/Margin */
4px  (0.25rem) - Tight
8px  (0.5rem)  - Small
16px (1rem)    - Medium
24px (1.5rem)  - Large
48px (3rem)    - Extra Large
```

### Border Radius
```css
4px  - Small elements (badges)
8px  - Buttons, inputs
12px - Cards
16px - Large containers
```

---

## 📞 Brand Contact

**Design Questions**: design@htmacademy.edu  
**Brand License**: MIT (for educational use)  
**Last Updated**: 2026-01-03  
**Version**: 1.0.0

---

Built with ❤️ for healthcare technology professionals.
