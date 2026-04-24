# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

This project uses a compact dashboard-style visual rhythm. The main quality risk in frontend work is not "wrong framework usage", but **density drift**: dialogs, menus, auth forms, and dashboard chrome each accumulating their own text sizes, heights, paddings, and radii until the UI feels oversized and inconsistent.

When the UI feels too large or too loose, fix the **shared scale first**, then the shells, then individual components. Do not rescue one dialog or one menu at a time unless the rest of the scale is already aligned.

---

## Forbidden Patterns

### Don't: Tune UI density component-by-component first

**Problem**:

- Shrinking only one dialog, menu, or auth card creates visual mismatch with the rest of the app.
- Follow-up work becomes repeated "make this one smaller too" edits.

**Avoid**:

- Changing only `max-w-*`, `text-[*px]`, `h-[*px]`, `rounded-[*px]`, or `px-*` on a single overlay first
- Repeating arbitrary size values across auth, dashboard, menu, and dialog surfaces

**Instead**:

1. Adjust shared density tokens in `app/app.css`
2. Update shared primitives and shells
3. Only then add narrow component overrides

### Don't: Assume Base UI or shadcn defaults caused oversized UI

**Why it's bad**:

- `@base-ui/react` is headless and does not impose visual scale by itself.
- In this project, oversized UI usually came from local arbitrary values, not the primitive library.

**Check first**:

- `app/app.css`
- `app/components/ui/button.tsx`
- auth shell / dashboard shell / user menu / dialog wrappers

### Don't: Introduce new arbitrary sizes when a shared token already exists

Avoid new one-off values like:

- `text-[13px]`, `text-[15px]`
- `h-[42px]`, `h-10`
- `rounded-[12px]`, `rounded-[14px]`

unless the element is truly exceptional and cannot use the shared scale.

---

## Required Patterns

### Convention: Use a shared density scale from `app/app.css`

The source of truth for everyday UI density lives in `app/app.css`.

Current shared scale:

- `--app-font-caption`
- `--app-font-sm`
- `--app-font-body`
- `--app-font-title`
- `--app-line-caption`
- `--app-line-sm`
- `--app-line-body`
- `--app-control-height-sm`
- `--app-control-height`
- `--app-control-height-lg`
- `--app-radius-control`
- `--app-radius-panel`
- `--app-sidebar-width`
- `--app-sidebar-width-collapsed`
- `--app-auth-input-height`

**Rule**: For UI density changes, edit these tokens before editing leaf components.

### Convention: Reuse shared shells before inventing new spacing rules

Prefer existing shared layers:

- `AppDialog` and `.app-dialog-*`
- `glass-*` shell classes in `app/app.css`
- shared `button.tsx` sizes
- `auth-shell.tsx` for auth layout and input rhythm
- dashboard shell and user menu patterns

**Why**:

- They let auth pages, menus, dialogs, and dashboard chrome move together as one system.
- They reduce repeated follow-up fixes.

### Convention: Normalize by surface family

When adjusting visual density, check all related surfaces:

- Auth: card, helper text, inputs, buttons, email suggestions
- Dashboard: topbar, search, sidebar links, content paddings
- User menu: trigger, popup width, item height, submenu widths
- Dialogs: overlay padding, width, title, row spacing, control height

Do not declare a density change complete after looking at only one surface.

### Pattern: Compact-first, then readability correction

For dashboard-like pages, start from a compact scale and then raise text slightly if it feels undersized.

This project settled on a pattern close to:

- body/action text around `14px`
- compact support text around `12px`
- common controls around `36px`
- slightly larger search/auth controls around `38px`
- controls around `10px` radius
- panels around `12px` radius

This keeps the UI close to ChatGPT/shadcn dashboard density without looking cramped.

### Pattern: Dark mode must be validated with the same density pass

When tuning size and spacing, validate both:

- light mode
- dark mode

Density bugs often show up as "dark mode feels messier" because contrast, not just size, changes how loose or crowded the UI reads.

---

## Testing Requirements

For frontend density, spacing, or overlay-size changes:

- Run `pnpm typecheck`
- Run `pnpm build`
- Manually inspect the affected surface family, not just one component

Minimum manual coverage for app-wide density changes:

- Login page
- Register page
- Dashboard topbar and sidebar
- User menu popup
- Settings dialog
- Account/profile dialog
- Light mode and dark mode

---

## Code Review Checklist

Reviewers should verify:

- Did the change start from shared tokens or shared shells?
- Did it avoid adding new arbitrary size values without a good reason?
- Did it reduce drift across auth, dashboard, menu, and dialog surfaces?
- If a dialog/menu was resized, were sibling surfaces checked too?
- Does the UI still feel compact but readable?
- Were `pnpm typecheck` and `pnpm build` run?
