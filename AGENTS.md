# Kita - Kindergarten Management App

## Project Overview

A SvelteKit application to support daily kindergarten operations with:
- **Public Dashboard**: Display at the entrance showing birthdays, meals, teachers on duty, and announcements
- **Admin Area**: Protected interface for managing all kindergarten data

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | SvelteKit + Svelte 5 |
| Runtime | Bun |
| Styling | Tailwind CSS v4 |
| UI Components | Bits UI |
| Database | SQLite |
| ORM | Drizzle ORM |
| Authentication | better-auth |

## Architecture Guidelines

### Database
- Use German table/column names for domain entities (kinder, erzieher, gruppen, etc.)
- Use English for technical columns (createdAt, updatedAt, id)
- All tables must have UUID primary keys generated with `crypto.randomUUID()`
- Include `createdAt` and `updatedAt` timestamps on all tables

### Routes
- Public routes: `/` (dashboard)
- API routes: `/api/auth/*` (better-auth), `/api/upload` (file uploads)
- Admin routes: `/admin/*` (protected, require authentication)
- Use German route names for admin sections (`/admin/kinder`, `/admin/erzieher`, etc.)

### Authentication
- Use better-auth for session management
- Protect all `/admin/*` routes with server-side auth checks in `+layout.server.js`
- Login page at `/admin/login` is public

### File Uploads
- Store uploaded photos in `static/uploads/` directory
- Use UUID filenames to prevent conflicts
- Accept only image formats (jpg, png, webp)

### UI/UX Guidelines
- Language: German only (all user-facing text)
- Design: Clean, modern, distinctive (avoid generic AI aesthetics)
- Typography: Use distinctive font pairings, avoid Inter/Roboto
- Colors: Warm, inviting palette with clear hierarchy
- Dashboard: Optimized for widescreen monitors, auto-refresh every 30s

### Code Style
- Use JSDoc for type hints (no TypeScript)
- Follow SvelteKit conventions for file structure
- Use Svelte 5 runes ($state, $derived, $effect)
- Prefer server-side data loading with `+page.server.js`

---

## MCP Tools (Svelte Server)

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
