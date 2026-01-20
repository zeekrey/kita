# Kita - Kindergarten Management App

## Project Overview

A SvelteKit application to support daily kindergarten operations with:

- **Public Dashboard**: Display at the entrance showing birthdays, meals, teachers on duty, and announcements
- **Admin Area**: Protected interface for managing all kindergarten data

## Build & Run

Succinct rules for how to BUILD the project:

## Validation

Run these after implementing to get immediate feedback:

- E2E Tests: `bun run test:e2e` (uses Playwright, requires dev server)
- Lint: `bun lint`
- Format: `bun run format`

Note: Do NOT use `bun test` directly as it conflicts with Playwright. Always use `bun run test:e2e` for E2E tests.

## Operational Notes

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
