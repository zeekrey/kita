# Implementation Plan: Additional Public Dashboards

> **Last Updated:** 2026-01-20
> **Scope:** Add a second public dashboard optimized for small kids.

## Goal

Add one more dashboard (in addition to the current root dashboard) that is available **without login** and is optimized for children on a big screen:

- Less text, more pictures
- Playful, clear visuals
- Shows by picture:
  - What food is served today
  - Who has birthday today (big)
  - Who has birthday in the next 10 days (small)
  - Which teacher is available (on duty)

All dashboards must have a button to switch to another dashboard.

## Decisions (from user)

1. **Images:** Use `/uploads/...` paths stored in DB (`fotoPath`) when available.
   - If there is no picture, show the person’s initials.
2. **Auto refresh:** Keep the existing auto refresh behavior (same interval as current dashboard).
3. **Route:** New dashboard path is `/kids`.

## Implementation Steps

### 1) Create the new public route

- Create `src/routes/kids/+page.svelte`
  - Minimal text UI, large tiles/cards, playful color palette
  - Use images when available; otherwise initials badge
  - Add a “Switch dashboard” button linking back to `/`
  - Keep the same auto refresh logic (e.g. `invalidateAll()` every 30s)

### 2) Server-side loader for /kids

- Create `src/routes/kids/+page.server.js`
  - Reuse the same data sources as `src/routes/+page.server.js`:
    - Meals (today)
    - Teachers on duty (filtered to current time)
    - Birthday children (annual birthdays by `MM-DD`)
    - (Announcements are optional for kids view; default: omit)

Add computed birthday groupings:

- `birthdaysToday`: children whose birthday matches today (`MM-DD`)
- `birthdaysNext10Days`: children whose birthday is in the next 10 days (excluding today)
  - Sort by upcoming date
  - Limit optionally (e.g. max 12) so it stays visually tidy

### 3) Add dashboard switch button to the existing dashboard

- Update `src/routes/+page.svelte`
  - Add a small corner button (or header button) linking to `/kids`
  - Keep design consistent with the current dashboard

### 4) Kids-first UI rules

#### Birthdays

- “Today” birthdays:
  - Very large cards (photo or initials)
  - Name in big type
  - Optional: simple celebratory styling (stars/confetti shapes, but no kiosk mode)

- “Next 10 days” birthdays:
  - Small tiles (photo/initials + first name)
  - Minimal text (no full details)

#### Meals

- Show today’s meals as big “food cards”
  - Include a food icon (emoji or simple SVG) + meal name
  - If multiple meal entries exist for a day, show them as separate tiles

#### Teachers on duty

- Teacher cards as photos/initials
  - Show name (short)
  - Optional: show time range as small text

### 5) Keep routes public

- Ensure no auth gating is added to `/` or `/kids`.
- Admin routes remain protected by `src/routes/admin/+layout.server.js`.

## Data + Image Notes

- Uploads are served from `static/uploads` and stored as paths like `/uploads/<uuid>.<ext>`.
- Children photos: `kinder.fotoPath`
- Teacher photos: `erzieher.fotoPath`
- Initials fallback:
  - Use first letter of `vorname` + first letter of `nachname` (robust to missing values)

## Known Constraints / Follow-ups

- Date handling currently uses UTC formatting in `src/lib/utils/date.js` (via `toISOString()`). Around midnight local time, “today” can be off by one day. Consider switching to local date logic later if this becomes visible on screens.
- `/api/upload` is currently public. If the app is internet-facing, consider restricting uploads to authenticated admins later.

## Verification Checklist

- Open `/` and `/kids` without login
- Verify “Switch dashboard” works both ways
- Verify images load from `/uploads/...` and initials render when `fotoPath` is empty
- Verify auto refresh still works (same interval)
- Check layout on big-screen resolution (e.g. 1920x1080)
