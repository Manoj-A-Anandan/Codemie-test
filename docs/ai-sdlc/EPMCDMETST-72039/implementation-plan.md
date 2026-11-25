# Implementation Plan — EPMCDMETST-72039: Add Optional Due Dates and Overdue Identification to Tasks

**Document version:** 1.0  
**Date:** 2026-11-25  
**Story ID:** EPMCDMETST-72039  
**Story title:** Add Optional Due Dates and Overdue Identification to Tasks  
**Base branch:** `main`  
**Implementation branch:** `feature/EPMCDMETST-72039-optional-task-due-dates`  

## 1. Story context and approved scope
This change adds an **optional due date** to tasks, persists it in `localStorage`, displays it in the UI in **DD MMM YYYY** format, and visually marks tasks as **overdue** when their due date is **earlier than today’s local calendar date** and the task is **incomplete**.

### In scope
- Add optional due date input at task creation time.
- Persist due date with each task.
- Display due date on task items only when present.
- Determine overdue status using **date-only local** comparisons.
- Accessible + high-contrast overdue indicator.
- Backward compatibility with existing tasks that have no due date.
- Preserve existing behaviors: create, toggle, delete, clear completed, filters.

### Out of scope (per approved requirements)
- Editing/changing due dates after creation.
- Reminders/notifications, recurring tasks, calendar integration.
- Deadline-based sorting/filtering.

## 2. Preconditions verification (evidence-based)
### 2.1 Repository identity
- **Expected path:** `C:/Users/ManojA/Desktop/Epam Learning tasks/Test-codemie`
- **Expected remote:** `https://github.com/Manoj-A-Anandan/Codemie-test`
- **Verified origin URL (command):**
  - `git -C "C:/Users/ManojA/Desktop/Epam Learning tasks/Test-codemie" remote get-url origin`
  - Output: `https://github.com/Manoj-A-Anandan/Codemie-test.git`

### 2.2 Active branch
- **Expected feature branch:** `feature/EPMCDMETST-72039-optional-task-due-dates`
- **Verified active branch (command):**
  - `git -C "C:/Users/ManojA/Desktop/Epam Learning tasks/Test-codemie" branch --show-current`
  - Output: `feature/EPMCDMETST-72039-optional-task-due-dates`
- **Branch rule compliance:** Using the existing feature branch; no branch creation/switching performed.

### 2.3 Requirements document existence
- **Requirements path (approved):** `docs/ai-sdlc/EPMCDMETST-72039/requirements.md`
- Verified readable from disk.

## 3. Repository analysis (structure & technology)
### 3.1 Tech
- Static single-page app: `index.html`, `styles.css`, `app.js`
- No bundler, no package manager, no test framework detected.
- Persistence: browser `localStorage` key `daylight-todos`.

### 3.2 Current task data model (from `app.js`)
```js
{
  id: string,
  text: string,
  completed: boolean,
  createdAt: number
}
```

### 3.3 Planned extension (backward compatible)
Add an **optional** field:
- `dueDate?: string` (proposed storage format: `YYYY-MM-DD` as produced by native `<input type="date">`)

Rationale:
- Date-only string avoids time-of-day ambiguity and supports local-date comparisons.
- Easy to serialize in `localStorage`.

## 4. Requirement-to-task mapping (FR / NFR / AC)
> Each requirement below maps to one or more implementation tasks (see §5 Task breakdown).

### Functional requirements
- **FR-001 (optional due date input):** IP-001, IP-003
- **FR-002 (allow no due date):** IP-001, IP-003
- **FR-003 (persist due date):** IP-002, IP-004
- **FR-004 (display due date):** IP-005
- **FR-005 (format DD MMM YYYY):** IP-006
- **FR-006 (mark overdue incomplete):** IP-007, IP-008
- **FR-007 (completed not overdue):** IP-007
- **FR-008 (due today not overdue):** IP-007
- **FR-009 (preserve existing behaviors):** IP-010
- **FR-010 (compat with older stored tasks):** IP-004, IP-009

### Non-functional requirements
- **NFR-001 (local date correctness):** IP-007
- **NFR-002 (accessible/contrast overdue indicator):** IP-008
- **NFR-003 (performance):** IP-010
- **NFR-004 (resilient parsing):** IP-004, IP-009

### Acceptance criteria
- **AC-001:** IP-001, IP-002, IP-003
- **AC-002:** IP-001, IP-003, IP-005
- **AC-003:** IP-005, IP-006
- **AC-004:** IP-007, IP-008
- **AC-005:** IP-007
- **AC-006:** IP-007
- **AC-007:** IP-002
- **AC-008:** IP-010, IP-011
- **AC-009:** IP-004, IP-009

## 5. Work breakdown structure (WBS) and task list
### Implementation tasks
- **IP-001 — UI: add due date input control to add-form**
  - Add an optional due-date field to `index.html` within `#add-form`.
  - Prefer native `<input type="date">` for simplicity (no build step).
  - Ensure accessibility: label via `aria-label` or associated `<label>`.

- **IP-002 — Data model: extend created task object with optional dueDate**
  - Update `submit` handler in `app.js` to read due date value (if any) and include it on the new task.
  - Clear/reset due date input after add.

- **IP-003 — Validation rules for due date input (optional)**
  - Ensure empty due date is allowed.
  - If due date provided, store it only if it matches expected pattern (`YYYY-MM-DD`) (native date input should enforce; still validate defensively).

- **IP-004 — Storage/load: update loadTasks() to tolerate optional dueDate**
  - Keep existing required field validation unchanged (id/text/completed).
  - Add tolerant parsing:
    - If `dueDate` missing: OK.
    - If `dueDate` present but malformed: ignore (do not drop whole task).

- **IP-005 — Rendering: show due date only when present**
  - Update `createTaskElement()` to conditionally append a due-date element.
  - Ensure layout doesn’t break for tasks without due date.

- **IP-006 — Formatting utility: display due date as DD MMM YYYY**
  - Implement a small formatter in `app.js`:
    - Convert `YYYY-MM-DD` to a local date (date-only) and format into `DD MMM YYYY`.
    - Use deterministic formatting to satisfy the strict format requirement (avoid locale variance).

- **IP-007 — Overdue calculation: local calendar date compare (date-only)**
  - Implement a helper that:
    - derives “today” as local `YYYY-MM-DD` (or comparable y/m/d tuple)
    - compares dueDate string to today string (lexicographic works for `YYYY-MM-DD`).
  - Overdue if `dueDate < today` AND `completed === false`.
  - Not overdue if no due date, completed, or dueDate == today.

- **IP-008 — UI styling: overdue indicator (accessible + contrast)**
  - Add CSS for an overdue state (e.g., `.is-overdue` on `.task-item` and/or badge).
  - Include accessible text:
    - either visible badge “Overdue”
    - or `aria-label` augmentation for screen readers.

- **IP-009 — Backward compatibility test pass: existing stored tasks**
  - Ensure tasks without `dueDate` render correctly and are not dropped by loader.
  - Ensure adding dueDate doesn’t change existing storage key or schema expectations.

- **IP-010 — Regression pass for existing features**
  - Verify filters, toggle complete, delete, clear completed still work with tasks with/without due dates.
  - Confirm event delegation remains correct after DOM changes.

- **IP-011 — Documentation updates (local only)**
  - Update `docs/ai-sdlc/EPMCDMETST-72039/implementation-plan.md` only if needed during revision.
  - No changes to requirements doc.

### Testing tasks (manual + lightweight automated where possible)
- **TP-001 — Manual UI smoke tests** (see §8)
- **TP-002 — Boundary & negative tests** (see §8)
- **TP-003 — Cross-date / timezone edge checks** (see §8)

## 6. Affected files and components
### Primary files
- `index.html`
  - Add due date input to the add form.
- `app.js`
  - Extend task creation.
  - Add due date parsing/formatting.
  - Add overdue evaluation.
  - Update rendering.
  - Harden loader.
- `styles.css`
  - Add styles for due-date label and overdue state/badge.

### Components/functions impacted
- `taskForm` submit handler
- `loadTasks()`
- `createTaskElement(task)`
- `render()` (only insofar as it calls createTaskElement; filter logic unchanged)

## 7. Dependencies and implementation approach
### Dependencies
- Browser support for `<input type="date">` and `localStorage`.
- Existing DOM structure and event delegation in `taskList` click handler.

### Approach decisions (explicit)
- **Due date storage format:** `YYYY-MM-DD` string.
- **Overdue compare mechanism:** string comparison on `YYYY-MM-DD` (safe because fixed-width and lexicographically ordered).
- **Formatting:** manual map of month abbreviations to ensure **DD MMM YYYY** regardless of locale.

## 8. Testing strategy
Because no test framework exists in the repo, testing will primarily be **manual** with optional **console-driven checks**.

### 8.1 Unit-level (conceptual / console)
- Validate helper functions (formatter and overdue comparator) via console calls.
- Cases:
  - `formatDueDate("2027-01-05") -> "05 Jan 2027"`
  - invalid inputs return empty string or a safe fallback.

### 8.2 Integration/UI tests (manual)
- Create task without due date → task appears, no due date label.
- Create task with due date in future → label shown, not overdue.
- Create task with due date earlier than today → label shown, overdue styling.
- Mark overdue task as completed → overdue indicator removed.
- Task due today → not overdue.

### 8.3 Regression tests
- Toggle completion works for tasks with/without due dates.
- Delete works.
- Filters: All/To do/Done work.
- Clear completed works.
- Empty state works.

### 8.4 Negative & boundary tests
- Task text empty (existing validation) still blocks creation.
- Malformed `dueDate` in `localStorage` (manually edit storage in devtools):
  - app loads without crashing
  - task remains visible
  - due date omitted/ignored
- Max length task text (160) with due date.
- Large list (hundreds) still responsive.

### 8.5 Date boundary tests (NFR-001)
- Change device/system date to simulate:
  - due yesterday vs today vs tomorrow
- Confirm comparisons are date-only (no time-of-day effects).

## 9. Implementation sequence (execution plan)
1. **IP-001:** Update `index.html` to include optional due date input.
2. **IP-002 + IP-003:** Update `app.js` submit handler to capture due date and validate.
3. **IP-004:** Update `loadTasks()` to tolerate optional/malformed due dates.
4. **IP-006:** Add formatting helper.
5. **IP-007:** Add overdue helper and compute overdue state.
6. **IP-005:** Update `createTaskElement()` to render due date + overdue marker.
7. **IP-008:** Update `styles.css` for due date + overdue UI.
8. **IP-009 + IP-010:** Backward compatibility + regression passes.
9. **TP-001/2/3:** Manual testing.

## 10. Risks and mitigations
- **Risk: timezone/date parsing errors** if due dates are stored with time components.
  - *Mitigation:* store `YYYY-MM-DD` only; compare as date-only.
- **Risk: locale variance in DD MMM YYYY** if using `Intl.DateTimeFormat`.
  - *Mitigation:* manual formatting (fixed month abbreviations) for display.
- **Risk: loadTasks() filters out tasks** due to schema change.
  - *Mitigation:* keep required-field validation same; treat dueDate as optional and ignore malformed values.
- **Risk: accessibility regressions** with new UI elements.
  - *Mitigation:* ensure labeled date input; overdue indicator has text and/or ARIA.

## 11. Completion criteria / Definition of Done
- All acceptance criteria AC-001 .. AC-009 satisfied.
- Due dates persist across reload.
- Overdue marking logic matches requirements (local date, incomplete only, not due today).
- No regressions in existing features.
- App does not crash on missing/malformed due dates in storage.
- Implementation plan and requirements docs remain present and consistent under `docs/ai-sdlc/EPMCDMETST-72039/`.

---

## Appendix A — Planned UI semantics (non-binding)
- Due date input placed next to the task text field (or beneath on small screens).
- Task item may include a small secondary text line: `Due 05 Jan 2027`.
- Overdue state may include a badge: `Overdue` and/or red accent border.
