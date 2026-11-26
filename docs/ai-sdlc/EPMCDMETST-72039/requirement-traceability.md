# Requirement Traceability — EPMCDMETST-72039

**Document version:** 1.0  
**Date:** 2026-11-25  

> This matrix maps **every FR, NFR, and AC** from `requirements.md` to the design components in this design package.  
> Where identifiers refer to functions/classes that do not yet exist, they are marked **(proposed)**.

| Requirement ID | Acceptance Criterion ID | Requirement Summary | Design Component | Source or Proposed File | Implementation Task | Verification Approach |
|---|---|---|---|---|---|---|
| FR-001 | AC-001 | Provide optional due date input when creating a task | Add-form UI: due date input; submit handler reads it | `index.html`; `app.js` submit handler | IP-001, IP-002 | Manual UI test: create task with due date; inspect UI and persisted JSON |
| FR-002 | AC-002 | Allow tasks without due date | Submit handler treats empty due date as valid | `app.js` submit handler | IP-003 | Manual UI test: create task without due date; ensure saved and no due date label |
| FR-003 | AC-001, AC-007 | Persist due date in localStorage | Task schema adds `dueDate?`; `saveAndRender()` persists; `loadTasks()` loads | `app.js` | IP-002, IP-004 | Reload app; verify dueDate exists in localStorage and UI shows it |
| FR-004 | AC-003 | Display due date on task item when present | Conditional DOM element (proposed) `.task-due-date` | `app.js` `createTaskElement(task)` | IP-005 | Manual UI check: due date appears only when set |
| FR-005 | AC-003 | Display due date as DD MMM YYYY | Formatter helper `formatDueDate()` (proposed) | `app.js` (proposed helper) | IP-006 | Manual + console check: date format matches `05 Jan 2027` |
| FR-006 | AC-004 | Mark overdue when dueDate < today and incomplete | Overdue helper `isTaskOverdue()` (proposed) + CSS class/badge | `app.js` (proposed helpers) + `styles.css` | IP-007, IP-008 | Set due date to past; verify overdue indicator visible |
| FR-007 | AC-005 | Completed tasks not marked overdue | Overdue logic checks `completed === false` | `app.js` (proposed helper) | IP-007 | Complete overdue task; indicator removed |
| FR-008 | AC-006 | Tasks due today not overdue | Overdue logic uses strict `<` not `<=` | `app.js` (proposed helper) | IP-007 | Create task due today; verify not overdue |
| FR-009 | AC-008 | Preserve existing behaviors (toggle/delete/filters/clear) | No changes to filter model; ensure event delegation still works | `app.js` `render()`, list click handler | IP-010 | Manual regression pass across existing controls |
| FR-010 | AC-009 | Backward compatibility with existing stored tasks | `loadTasks()` keeps required-field validation and treats dueDate as optional | `app.js` `loadTasks()` | IP-004, IP-009 | Seed localStorage with old tasks (no dueDate); verify load/display |
| NFR-001 | AC-004, AC-006 | Overdue based on local calendar date (not UTC) | `getTodayLocalYmd()` (proposed) using local Y/M/D | `app.js` (proposed helper) | IP-007 | Date boundary testing by changing system date/timezone |
| NFR-002 | AC-004 | Overdue indicator accessible + sufficient contrast | Visible badge text “Overdue”; optional ARIA; CSS contrast | `styles.css`; `app.js` `createTaskElement()` | IP-008 | Accessibility review: keyboard focus, readable text; contrast check |
| NFR-003 | AC-008 | Performance remains responsive for hundreds of tasks | O(n) render; helpers constant-time; no expensive parsing in loops | `app.js` render pipeline | IP-010 | Manual performance sanity: add hundreds tasks; verify responsiveness |
| NFR-004 | AC-009 | Resilient parsing; tolerate missing/malformed due dates | `normalizeDueDate()` (proposed) + ignore malformed values | `app.js` `loadTasks()` | IP-004, IP-009 | Negative test: malformed dueDate in storage does not crash and task remains |
| AC-001 | AC-001 | Task saved with selected due date | UI + persistence + schema extension | `index.html`, `app.js` | IP-001, IP-002, IP-003 | Manual end-to-end; verify localStorage payload |
| AC-002 | AC-002 | Task saved without due date; no label shown | Conditional rendering (no placeholder) | `app.js` `createTaskElement()` | IP-005 | Manual UI test (no due date label) |
| AC-003 | AC-003 | Due date displayed in DD MMM YYYY | Formatter helper (proposed) + render | `app.js` | IP-006, IP-005 | Manual UI check + console checks |
| AC-004 | AC-004 | Overdue marked when dueDate earlier than today and incomplete | Overdue helper (proposed) + CSS | `app.js`, `styles.css` | IP-007, IP-008 | Manual UI test with system date or past due date |
| AC-005 | AC-005 | Completed tasks not marked overdue | Overdue helper includes completed check | `app.js` | IP-007 | Manual: mark completed and verify indicator gone |
| AC-006 | AC-006 | Due today not overdue | Overdue helper uses strict compare | `app.js` | IP-007 | Manual: set dueDate=today; verify not overdue |
| AC-007 | AC-007 | Due dates persist after reload | Persistence uses same STORAGE_KEY | `app.js` | IP-002, IP-004 | Reload and verify due date still visible |
| AC-008 | AC-008 | Existing features preserved | Regression tests; unchanged behavior | `app.js`, `index.html`, `styles.css` | IP-010 | Manual regression suite |
| AC-009 | AC-009 | Existing tasks compatible | Loader does not drop older tasks; dueDate optional | `app.js` `loadTasks()` | IP-004, IP-009 | Seed old schema tasks; verify compatibility |

## Missing mappings
- None identified for FR/NFR/AC in Requirements v1.0.
