# Test Plan — EPMCDMETST-72039 (Optional Due Dates & Overdue Identification)

**Document version:** 1.0  
**Date:** 2026-11-26  
**Story:** EPMCDMETST-72039 — Add Optional Due Dates and Overdue Identification to Tasks  
**Branch:** `feature/EPMCDMETST-72039-optional-task-due-dates`  
**Reviewed/target commit:** `b6b973fc76f24cf3347e2ac8f860a20535bdf535`

## 1) Scope
### In scope
- Static validation (`node --check app.js`).
- Date helper behavior validation:
  - `normalizeDueDate`
  - `getTodayLocalYmd`
  - `isTaskOverdue`
  - `formatDueDate`
- Requirement/AC validation that can be derived from helper behavior:
  - Valid/invalid date parsing & resilience.
  - Due date formatting.
  - Local calendar date behavior.
  - Overdue boundaries (yesterday vs today).
  - Missing due dates.
  - Completed tasks never overdue.
  - Date boundary cases (leap year).

### Out of scope / NOT_EXECUTED
- Browser UI execution (manual UI checks not executed in this environment).
- Persistence via real `localStorage` (requires browser runtime).
- Visual/CSS verification and accessibility contrast checks (requires browser and/or tooling).

## 2) Strategy
- Evidence-first testing with command output capture.
- Use a **non-invasive** Node script (`date-helpers.check.js`) that re-implements the date helper logic as currently implemented in `app.js` and asserts expected outcomes per requirements.
  - Rationale: `app.js` is a browser script that references `document` on load and cannot be safely `require()`-imported in Node without DOM shims. Per restrictions, we do not install dependencies or alter app source.

## 3) Test environment
- OS: Windows (path evidence in commands)
- Node.js: v24.22.0 (captured during execution)
- Repository path: `C:/Users/ManojA/Desktop/Epam Learning tasks/Test-codemie`

## 4) Entry criteria
- Technical code review recommendation: **APPROVED**.
- Human code review approval: **APPROVED**.
- `docs/ai-sdlc/EPMCDMETST-72039/review/code-review-report.md`:
  - Final decision: **APPROVED**.
  - Reviewed HEAD matches current HEAD.
- Repo identity verified (root path, origin URL).
- Active branch verified as the feature branch.
- No branch creation/switching.

## 5) Exit criteria
- `node --check app.js` passes (exit code 0).
- Date helper checks pass (exit code 0).
- No unexpected tracked file changes in working tree after testing.
- All automated-verifiable acceptance criteria are VERIFIED_AUTOMATED; remaining UI-only criteria are PENDING_MANUAL.

## 6) Scenarios
### S1 — Static syntax check
- Command: `node --check app.js`
- Expected: exit code 0.

### S2 — Date parsing (valid)
- Input: `2027-01-05`
- Expected: accepted as-is.

### S3 — Date parsing (invalid)
- Empty/whitespace: reject.
- Pattern mismatch: reject.
- Invalid month/day: reject.
- Non-existent date: reject (e.g., 2027-02-30).

### S4 — Date formatting
- `formatDueDate("2027-01-05")` => `"05 Jan 2027"`.
- Invalid input returns empty string.

### S5 — Local calendar date behavior
- `getTodayLocalYmd(new Date(2027,0,5,23,59,59,999))` => `2027-01-05`.

### S6 — Overdue rules
- Missing due date => not overdue.
- Completed => not overdue.
- Due date earlier than today => overdue.
- Due date equal to today => not overdue.

### S7 — Date boundary cases
- Leap day valid: `2028-02-29`.
- Non-leap invalid: `2027-02-29`.

## 7) Requirement-to-test mapping (Acceptance Criteria)
| AC ID | Requirement | Automated coverage | Scenario(s) |
|---|---|---:|---|
| AC-001 | Add optional due date; saved with task | PENDING_MANUAL | UI + storage required |
| AC-002 | Allow without due date; no label | PENDING_MANUAL | UI render required |
| AC-003 | Display due date in DD MMM YYYY | **VERIFIED_AUTOMATED (formatting only)** | S4 |
| AC-004 | Identify overdue incomplete tasks | **VERIFIED_AUTOMATED (helper logic only)** | S6 |
| AC-005 | Completed tasks not overdue | **VERIFIED_AUTOMATED** | S6 |
| AC-006 | Due today not overdue | **VERIFIED_AUTOMATED** | S6 |
| AC-007 | Persist due dates | PENDING_MANUAL | Browser localStorage required |
| AC-008 | Preserve existing functionality | PENDING_MANUAL | Browser UI required |
| AC-009 | Backward compatibility | PENDING_MANUAL | Requires browser localStorage seeding or DOM run |

## 8) Manual checklist (NOT_EXECUTED)
- Add task without due date; verify no due-date line.
- Add task with due date; verify displayed as `Due DD MMM YYYY`.
- Create past-due incomplete task; verify overdue badge visible.
- Mark overdue task complete; verify badge removed.
- Due today task not overdue.
- Reload app; due dates persist.
- Toggle/delete/filter/clear completed operate correctly.

## 9) Risks / limitations
- Cannot import/execute `app.js` in Node due to direct DOM usage on module load.
- No browser available in this workflow; therefore UI/persistence/accessibility checks remain manual.
