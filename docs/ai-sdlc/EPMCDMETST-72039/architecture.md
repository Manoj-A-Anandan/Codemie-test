# Architecture — EPMCDMETST-72039: Optional Due Dates & Overdue Identification

**Document version:** 1.0  
**Date:** 2026-11-25  
**Story ID:** EPMCDMETST-72039  
**Repository:** Daylight ToDo (static SPA)  

## 1. Business and system context
### 1.1 Business context
Daylight ToDo is a lightweight browser-based to-do list that helps users capture tasks and track progress. This story adds optional due dates and an overdue indicator to support basic prioritization while keeping the experience simple.

### 1.2 System context
- **Client:** Single-page static web application
- **Runtime:** Browser
- **Persistence:** `localStorage` (key: `daylight-todos`)
- **Users:** Single end user on a device/browser profile
- **External services:** None

## 2. Existing architecture (as-is)
### 2.1 Architectural style
- Monolithic front-end script (`app.js`) responsible for:
  - state in memory (`tasks`, `activeFilter`)
  - DOM interactions (events, rendering)
  - persistence (`localStorage`)

### 2.2 Existing data model (persisted)
Persisted array of tasks:
- `id: string`
- `text: string`
- `completed: boolean`
- `createdAt: number`

### 2.3 Existing main flows
- **Add task:** Form submit → validate text → prepend task → save to `localStorage` → `render()`
- **Toggle/delete:** Event delegation on list → update state → save → render
- **Filtering:** UI sets `activeFilter` → render

## 3. Proposed architecture (to-be)
The architecture remains a static SPA; the change is a **schema extension** and **purely client-side** computation.

### 3.1 Key proposal
- Extend persisted task schema with optional field:
  - `dueDate?: string` (proposed format: `YYYY-MM-DD`)
- Add two small pure helper concepts inside `app.js`:
  - `formatDueDate(dueDate) -> "DD MMM YYYY" | ""`
  - `isOverdue(task, today) -> boolean`

### 3.2 Architectural constraints preserved
- No new backend.
- No build step, packages, or runtime dependencies.
- Backward compatible loading of tasks that predate the feature.

## 4. Components and integrations
### 4.1 Components
1. **UI Layer (index.html + styles.css)**
   - Add optional due date input to the add form
   - Add overdue visual indicator style

2. **Application logic (app.js)**
   - Form submit handler: capture optional due date
   - `loadTasks()` parsing/validation updated to tolerate optional/malformed dueDate
   - `createTaskElement(task)` updated to conditionally render due date and overdue indicator
   - `render()` unchanged in purpose; it will indirectly reflect overdue status via per-item render

3. **Persistence (localStorage)**
   - Same storage key and serialization
   - Schema extended in a backward compatible manner

### 4.2 Integrations
- **Browser APIs:**
  - `localStorage`
  - `Intl.DateTimeFormat` (already used for today label; due date display will be deterministic per requirements)
  - `crypto.randomUUID` fallback (existing)

## 5. Data flow
### 5.1 Add task with due date
1. User enters text, optionally selects due date
2. Submit handler validates text and due date
3. Task created with optional `dueDate`
4. Save to `localStorage`
5. Render list: due date displayed; overdue state computed

### 5.2 Load and render on startup
1. `loadTasks()` reads from `localStorage`
2. Validates required fields (id/text/completed)
3. Optional `dueDate`:
   - if missing → keep task
   - if malformed → ignore dueDate but keep task
4. `render()` filters by `activeFilter`
5. `createTaskElement()` derives UI:
   - shows due date when present
   - applies overdue indicator if `dueDate < today` and `!completed`

## 6. Security and compatibility
### 6.1 Security
- No authentication/authorization.
- No network communication.
- LocalStorage risks remain: user can manually modify stored values; system must be resilient (NFR-004).

### 6.2 Compatibility
- Backward compatible schema: existing tasks lacking `dueDate` remain valid.
- `<input type="date">` is broadly supported; if not available, it behaves as text input in older browsers (mitigation: defensive validation).

## 7. Decisions, assumptions, and risks
### 7.1 Design decisions
- **D1:** Store `dueDate` as `YYYY-MM-DD` string (proposed)
- **D2:** Determine overdue via **local calendar date** and date-only comparison
- **D3:** Display due date as deterministic **DD MMM YYYY** (fixed month abbreviations) to avoid locale drift
- **D4:** Malformed dueDate does not invalidate the task; it is ignored

### 7.2 Assumptions
- Users primarily use modern browsers.
- No requirement for due-date editing.

### 7.3 Risks
- **R1:** Locale or timezone edge cases if dueDate parsing introduces time-of-day.
  - Mitigation: keep dueDate date-only; avoid `Date` timezone conversions where possible.
- **R2:** UI crowding in the list item (mobile).
  - Mitigation: make due date secondary text; wrap appropriately.
- **R3:** Accessibility regression.
  - Mitigation: labeled input; overdue indicator includes text and not color-only.
