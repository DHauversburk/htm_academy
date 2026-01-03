# HTM Academy Design System

> **Inspired by**: Uber's minimalism, Project Vector's clinical enterprise aesthetic, and modern healthtech branding

---

## 🎨 Brand Identity

### Logo Usage
- **Primary**: Black knight + medical cross with "HTM ACADEMY" wordmark
- **Monochrome**: Use on colored backgrounds
- **Icon Only**: For favicons, app icons (32px minimum)

### Brand Voice
- **Professional** - Enterprise healthcare training platform
- **Strategic** - Chess knight represents decision-making and problem-solving
- **Medical** - Cross symbolizes healthcare focus
- **Modern** - Clean, technical, forward-thinking

---

## 🌈 Color Palette

### Primary Colors
```css
--color-primary: #4f46e5;        /* Indigo 600 - Primary Actions */
--color-primary-dark: #4338ca;   /* Indigo 700 - Hover States */
--color-primary-light: #6366f1;  /* Indigo 500 - Accents */
```

### Neutral Colors (Light Mode)
```css
--color-bg-light: #ffffff;           /* Pure White - Main Background */
--color-bg-secondary: #f8fafc;       /* Slate 50 - Secondary Background */
--color-bg-tertiary: #f1f5f9;        /* Slate 100 - Cards */
--color-border: #e2e8f0;             /* Slate 200 - Borders */
--color-text-primary: #0f172a;       /* Slate 900 - Primary Text */
--color-text-secondary: #475569;     /* Slate 600 - Secondary Text */
--color-text-tertiary: #94a3b8;      /* Slate 400 - Muted Text */
```

### Neutral Colors (Dark Mode)
```css
--color-bg-dark: #020617;            /* Slate 950 - Main Background */
--color-bg-dark-secondary: #0f172a;  /* Slate 900 - Cards */
--color-bg-dark-tertiary: #1e293b;   /* Slate 800 - Elevated Cards */
--color-border-dark: #334155;        /* Slate 700 - Borders */
--color-text-dark-primary: #f8fafc;  /* Slate 50 - Primary Text */
--color-text-dark-secondary: #cbd5e1; /* Slate 300 - Secondary Text */
--color-text-dark-tertiary: #64748b; /* Slate 500 - Muted Text */
```

### Functional Colors
```css
--color-success: #10b981;      /* Emerald 500 - Success States */
--color-warning: #f59e0b;      /* Amber 500 - Warning States */
--color-error: #ef4444;        /* Red 500 - Error States */
--color-info: #3b82f6;         /* Blue 500 - Info States */
```

### Medical/Game Colors
```css
--color-medical-teal: #14b8a6;     /* Teal 500 - Medical Equipment */
--color-nurse-green: #4ade80;      /* Green 400 - NPCs */
--color-urgent-red: #dc2626;       /* Red 600 - Critical Interruptions */
--color-routine-yellow: #fbbf24;   /* Yellow 400 - Standard Tasks */
```

---

## 📐 Typography

### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Type Scale
```css
/* Display */
--text-display: 3.5rem;      /* 56px - Hero Headings */
--text-h1: 2.5rem;           /* 40px - Page Titles */
--text-h2: 2rem;             /* 32px - Section Headings */
--text-h3: 1.5rem;           /* 24px - Subsection Headings */
--text-h4: 1.25rem;          /* 20px - Card Titles */

/* Body */
--text-body-lg: 1.125rem;    /* 18px - Large Body */
--text-body: 1rem;           /* 16px - Default Body */
--text-body-sm: 0.875rem;    /* 14px - Small Body */
--text-caption: 0.75rem;     /* 12px - Captions/Labels */
--text-tiny: 0.625rem;       /* 10px - Metadata */
```

### Font Weights
```css
--weight-light: 300;
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;
```

### Letter Spacing (Tracking)
```css
--tracking-tight: -0.025em;      /* Tight - Large Headings */
--tracking-normal: 0;            /* Normal - Body Text */
--tracking-wide: 0.025em;        /* Wide - Small Text */
--tracking-wider: 0.05em;        /* Wider - Buttons */
--tracking-widest: 0.1em;        /* Widest - Labels (ALL CAPS) */
```

### Line Heights
```css
--leading-tight: 1.25;       /* Headings */
--leading-normal: 1.5;       /* Body Text */
--leading-relaxed: 1.75;     /* Loose Body */
```

---

## 🧱 Spacing System

### Base Unit: 4px (0.25rem)

```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

---

## 🎭 Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;     /* 4px - Small Elements */
--radius-md: 0.5rem;      /* 8px - Buttons, Inputs */
--radius-lg: 0.75rem;     /* 12px - Cards */
--radius-xl: 1rem;        /* 16px - Large Cards */
--radius-full: 9999px;    /* Full - Pills, Avatars */
```

---

## 🌑 Shadows

```css
/* Light Mode */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Dark Mode - Lighter shadows for visibility */
--shadow-dark-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-dark-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
--shadow-dark-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4);
```

---

## 🔘 Component Patterns

### Buttons

#### Primary Button
```css
background: var(--color-primary);
color: white;
padding: 0.75rem 1.5rem;
border-radius: var(--radius-md);
font-weight: var(--weight-semibold);
letter-spacing: var(--tracking-wider);
text-transform: uppercase;
font-size: var(--text-body-sm);
transition: all 0.2s ease;

/* Hover */
background: var(--color-primary-dark);
transform: scale(0.98);
```

#### Secondary Button
```css
background: transparent;
color: var(--color-primary);
border: 2px solid var(--color-primary);
/* ... same padding, radius, etc. */
```

#### Ghost Button
```css
background: transparent;
color: var(--color-text-secondary);
border: none;
/* Hover */
background: var(--color-bg-secondary);
```

### Cards

#### Basic Card
```css
background: var(--color-bg-tertiary);
border-radius: var(--radius-lg);
padding: var(--space-6);
box-shadow: var(--shadow-sm);
border: 1px solid var(--color-border);
```

#### Interactive Card (Hover Effect)
```css
transition: all 0.2s ease;
cursor: pointer;

/* Hover */
box-shadow: var(--shadow-md);
transform: translateY(-2px);
border-color: var(--color-primary-light);
```

### Inputs

```css
background: var(--color-bg-light);
border: 2px solid var(--color-border);
border-radius: var(--radius-md);
padding: 0.75rem 1rem;
font-size: var(--text-body);
color: var(--color-text-primary);
transition: border-color 0.2s ease;

/* Focus */
border-color: var(--color-primary);
outline: none;
box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
```

---

## 🎮 Game-Specific UI

### Health/Status Bars
```css
background: var(--color-bg-dark-secondary);
border-radius: var(--radius-full);
height: 8px;
overflow: hidden;

/* Fill */
background: linear-gradient(90deg, var(--color-success), var(--color-medical-teal));
height: 100%;
transition: width 0.3s ease;
```

### Interruption Priority Colors
```css
--priority-critical: var(--color-urgent-red);
--priority-high: var(--color-error);
--priority-medium: var(--color-warning);
--priority-low: var(--color-routine-yellow);
```

### NPC Dialogue Boxes
```css
background: rgba(15, 23, 42, 0.95);  /* Slate-900 with transparency */
backdrop-filter: blur(10px);
border: 1px solid var(--color-border-dark);
border-radius: var(--radius-lg);
padding: var(--space-6);
box-shadow: var(--shadow-xl);
```

---

## 🎨 CSS Custom Properties Setup

### Root Variables (index.css)
```css
:root {
  /* Colors */
  --primary: #4f46e5;
  --bg: #ffffff;
  --text: #0f172a;
  --border: #e2e8f0;
  
  /* Spacing */
  --space-unit: 0.25rem;
  
  /* Typography */
  --font-sans: 'Inter', sans-serif;
}

[data-theme="dark"] {
  --bg: #020617;
  --text: #f8fafc;
  --border: #334155;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large Displays */
```

---

## ✨ Animation Guidelines

### Timing Functions
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Durations
```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
```

### Common Transitions
```css
/* Button Press */
transition: transform 150ms ease, background-color 250ms ease;

/* Card Hover */
transition: box-shadow 250ms ease, transform 250ms ease;

/* Modal Entry */
animation: slideUp 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🎯 Usage Examples

### Hero Section
```html
<section class="hero">
  <h1 class="display">HTM ACADEMY</h1>
  <p class="subtitle">Master Healthcare Technology Management</p>
  <button class="btn-primary">Start Training</button>
</section>
```

```css
.hero {
  padding: var(--space-24) var(--space-6);
  text-align: center;
  background: linear-gradient(180deg, var(--color-bg-light) 0%, var(--color-bg-secondary) 100%);
}

.display {
  font-size: var(--text-display);
  font-weight: var(--weight-extrabold);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}

.subtitle {
  font-size: var(--text-body-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-8);
}
```

---

## 📋 Accessibility

- **Contrast Ratios**: Minimum 4.5:1 for body text, 3:1 for large text
- **Focus States**: Always visible with 3px outline
- **Interactive Elements**: Minimum 44x44px touch target
- **Motion**: Respect `prefers-reduced-motion`

---

## 🚀 Implementation Checklist

- [ ] Add Inter font from Google Fonts
- [ ] Set up CSS custom properties in `index.css`
- [ ] Create component library (buttons, cards, inputs)
- [ ] Implement dark mode toggle
- [ ] Test responsive layouts across breakpoints
- [ ] Validate color contrast ratios
- [ ] Add animation utilities
- [ ] Document component usage

---

**Last Updated**: 2026-01-03  
**Version**: 1.0.0  
**Maintained by**: HTM Academy Design Team
