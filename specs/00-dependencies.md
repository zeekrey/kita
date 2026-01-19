# Spec: Dependencies & Setup

## Overview

Install and configure all additional dependencies needed for the project.

## Tasks

### 0.1 Install better-auth

**Package**: `better-auth`

**Command**:

```bash
bun add better-auth
```

**Acceptance Criteria**:

- [ ] Package installed and listed in package.json
- [ ] No dependency conflicts

---

### 0.2 Install bits-ui

**Package**: `bits-ui`

**Command**:

```bash
bun add bits-ui
```

**Acceptance Criteria**:

- [ ] Package installed and listed in package.json
- [ ] Components can be imported in Svelte files

---

### 0.3 Configure Project Fonts

**Fonts to use**:

- Headings: **Fraunces** (distinctive serif with optical sizing)
- Body: **Nunito** (friendly, rounded sans-serif - good for kindergarten context)

**Implementation**:

1. Add Google Fonts link to `src/app.html`
2. Configure in Tailwind CSS

**app.html addition**:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
	href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Nunito:wght@400;500;600;700&display=swap"
	rel="stylesheet"
/>
```

**CSS variables** (in layout.css or app.css):

```css
:root {
	--font-heading: 'Fraunces', serif;
	--font-body: 'Nunito', sans-serif;
}
```

**Acceptance Criteria**:

- [ ] Fonts load correctly
- [ ] Headings use Fraunces
- [ ] Body text uses Nunito
- [ ] No FOUT (flash of unstyled text) on page load

---

## Files to Create/Modify

- `package.json` (dependencies added)
- `src/app.html` (font links)
- `src/routes/layout.css` (font variables)
