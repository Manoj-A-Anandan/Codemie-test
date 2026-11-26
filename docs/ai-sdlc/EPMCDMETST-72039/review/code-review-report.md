# Code Review Report — EPMCDMETST-72039

**Document version:** 1.0  
**Date:** 2026-11-26  

## Story
- **ID:** EPMCDMETST-72039
- **Title:** Add Optional Due Dates and Overdue Identification to Tasks

## Repository / Branch
- **Repository URL:** https://github.com/Manoj-A-Anandan/Codemie-test
- **Repository path:** `C:/Users/ManojA/Desktop/Epam Learning tasks/Test-codemie`
- **Base branch:** `main`
- **Implementation branch:** `feature/EPMCDMETST-72039-optional-task-due-dates`
- **Active branch (verified):** `feature/EPMCDMETST-72039-optional-task-due-dates`
- **Reviewed commit (HEAD):** `b6b973fc76f24cf3347e2ac8f860a20535bdf535`

## Preconditions / Verification
### Repo root
- `git rev-parse --show-toplevel` => `C:/Users/ManojA/Desktop/Epam Learning tasks/Test-codemie` ✅

### Origin
- `git remote get-url origin` => `https://github.com/Manoj-A-Anandan/Codemie-test.git` ✅ (matches expected repo, `.git` suffix only)

### Branch
- `git branch --show-current` => `feature/EPMCDMETST-72039-optional-task-due-dates` ✅
- Confirmed not on base branch `main` ✅

### Working tree status
- `git status --porcelain=v1` => `?? docs/codemie/`
  - Untracked only ✅ (no tracked modifications that would compromise diff-based review)

## Approved SDLC documents read (complete)
- `docs/ai-sdlc/EPMCDMETST-72039/requirements.md`
- `docs/ai-sdlc/EPMCDMETST-72039/implementation-plan.md`
- `docs/ai-sdlc/EPMCDMETST-72039/architecture.md`
- `docs/ai-sdlc/EPMCDMETST-72039/hld.md`
- `docs/ai-sdlc/EPMCDMETST-72039/lld.md`
- `docs/ai-sdlc/EPMCDMETST-72039/requirement-traceability.md`
- `docs/ai-sdlc/EPMCDMETST-72039/development-report.md`

## Diff range and review scope
- **Diff range reviewed:** `main...b6b973fc76f24cf3347e2ac8f860a20535bdf535`
- **Files changed in range (from `--name-only`):**
  - `app.js`
  - `index.html`
  - `styles.css`
  - `docs/ai-sdlc/EPMCDMETST-72039/{requirements,implementation-plan,architecture,hld,lld,requirement-traceability,development-report}.md`

### Source files reviewed
- `app.js`
- `index.html`
- `styles.css`

## Implementation vs Development Report verification
The development report claims:
- A regression fix restoring add-task UI wiring (submit button, task input) and preserving due date + overdue functionality.
- `node --check app.js` exit 0.
- Notes a `git fetch ...` command was executed.

Findings:
- **UI wiring**: `index.html` shows `#task-input` present and a `button.input-plus` with `type="submit"` inside `#add-form` ✅.
- **Due date input**: `#due-date-input` exists and is optional ✅.
- **Toggle regression fix**: `app.js` now targets both `button[data-action]` and `input[data-action]` in the click handler ✅.
- **Overdue label**: visible badge text `Overdue` exists in DOM rendering ✅.
- **Report evidence mismatch**: development-report.md claims `git fetch ...` was run; network git commands are out of scope for this review process and cannot be verified as required evidence here. This is documentation-only and does not affect runtime behavior.

## Acceptance Criteria verification (AC-by-AC)
> Note: No browser execution was performed as part of this code review. AC results below are based on static inspection + `node --check` only.

| AC | Description | Status | Evidence |
|---|---|---|---|
| AC-001 | Add an optional due date and save with task | **MANUAL_ONLY** | `index.html` adds `<input type="date" id="due-date-input">`; `app.js` reads it and stores `task.dueDate` when valid |
| AC-002 | Allow tasks without due dates; no label shown | **MANUAL_ONLY** | `normalizeDueDate` returns null for empty; `createTaskElement` only renders due date if `formattedDueDate` is truthy |
| AC-003 | Display due date in DD MMM YYYY | **MANUAL_ONLY** | `formatDueDate()` returns `${day} ${MMM} ${year}` from `YYYY-MM-DD` with fixed month abbreviations |
| AC-004 | Identify overdue incomplete tasks (due date < today local date) | **MANUAL_ONLY** | `getTodayLocalYmd()` uses local Y/M/D; `isTaskOverdue` uses strict `<` and checks `!completed`; `.task-badge--overdue` visible |
| AC-005 | Completed tasks not overdue | **MANUAL_ONLY** | `isTaskOverdue` returns false when `task.completed` |
| AC-006 | Tasks due today not overdue | **MANUAL_ONLY** | strict `<` compare; equality is not overdue |
| AC-007 | Persist due dates across reload | **MANUAL_ONLY** | `saveAndRender()` JSON.stringify tasks including optional dueDate; `loadTasks()` preserves valid dueDate |
| AC-008 | Preserve existing functionality (toggle/delete/clear/filter) | **MANUAL_ONLY** | Filter logic unchanged in intent; click delegation updated; clear-completed unchanged |
| AC-009 | Backward compatibility with older tasks | **MANUAL_ONLY** | `loadTasks()` treats `dueDate` optional; removes malformed dueDate property while keeping task |

## Key requirement checks (spotlight)
### Date parsing from year/month/day parts
- `normalizeDueDate()` splits `YYYY-MM-DD` into year/month/day parts, validates integer ranges, and validates by constructing a local `Date(year, month-1, day)` and round-tripping components ✅.

### Local-midnight comparisons / timezone correctness
- Overdue comparison is date-only: `todayYmd = getTodayLocalYmd()` using local Y/M/D; compare strings `dueDate < todayYmd` ✅.
- No UTC conversions are used ✅.

### “Overdue” definition correctness
- Overdue iff incomplete AND due date strictly before today ✅.

### Existing behaviors: loadTasks, completion, deletion, clear-completed, filtering
- `loadTasks()` still validates required fields (id/text/completed) and ignores invalid dueDate without dropping task ✅.
- Toggle & delete are handled via event delegation; `saveAndRender()` called after state change ✅.
- Filters (`activeFilter`) still filter by `completed` boolean ✅.
- Clear completed: `tasks = tasks.filter((task) => !task.completed);` ✅.

### Accessibility: overdue not color-only
- Overdue indicator includes visible text badge "Overdue" (not color-only) ✅.
- Checkbox and delete buttons include `aria-label`s ✅.
- Empty state updates use `textContent` (safe) ✅.

### XSS / safe rendering
- Task text is assigned via `text.textContent = task.text` ✅.
- Due date text is assembled with DOM APIs and `textContent/append` (no HTML injection) ✅.

### Date formatting
- Due date display uses fixed English month abbreviations; output matches required format `DD MMM YYYY` ✅.
- Note: This is locale-independent by design; aligns with strict formatting requirement.

### Declaration order / TDZ risks
- `tasks = loadTasks();` occurs before helper function definitions. Function declarations are hoisted, so safe ✅.

### CSS layout & responsiveness
- `.add-form` is grid with 3 columns on desktop; switches to 2-column + full-width due-date row at `max-width: 520px` ✅.

### Persistence & error handling
- `loadTasks()` try/catch with safe fallback ✅.
- `saveAndRender()` try/catch logs error if localStorage fails ✅.

## Findings
### HIGH
None.

### MEDIUM
1. **Broken/garbled Unicode characters in user-facing strings**
   - **File:** `app.js`
   - **Location:** `render()` and `getEmptyStateContent()` strings (also seen in `git show` output)
   - **What:** The string literal contains `"You\'re all caught up âœ¨"` (and similar artifacts earlier like `Youâ€™re`) indicating encoding corruption.
   - **Impact:** Users see mojibake (“âœ¨”) instead of the intended sparkle/typographic apostrophe; reduces polish and may violate UI expectations.
   - **Recommendation:** Normalize strings to plain ASCII (e.g., `You're all caught up`), or ensure UTF-8 encoding is preserved for characters like `✨` and `’`.

### LOW
2. **`development-report.md` includes a network git command claim (`git fetch ...`)**
   - **File:** `docs/ai-sdlc/EPMCDMETST-72039/development-report.md`
   - **Location:** “Commands executed” section
   - **Impact:** For process compliance, network git commands are disallowed for the reviewer workflow; also not verifiable here. No runtime impact.
   - **Recommendation:** In future updates, avoid claiming commands that aren’t permitted/recorded in a controlled environment; or mark as “run outside workflow”.

3. **Untracked directory present**
   - **File:** (repo state)
   - **Location:** `git status` shows `?? docs/codemie/`
   - **Impact:** Low; can confuse packaging/zip processes if included unintentionally.
   - **Recommendation:** Keep untracked content out of release artifacts or add to `.gitignore` if appropriate (do not do this in this review).

### INFO
4. **`git diff main...HEAD` returned `None` from the command wrapper**
   - **Context:** The CLI tool returned `None` for `git diff` output in earlier command, though `git diff --name-only` and file-specific diff worked.
   - **Impact:** No impact to code; review proceeded using file-specific diffs and `git show`.

## Security & regression notes
- No new dependencies introduced ✅.
- DOM rendering is safe (no `innerHTML` with user content) ✅.
- Main regression risk is around input/submit wiring and toggle behavior; both are addressed in the implementation and should be verified in a browser (manual).

## Validation commands run
- `node --check app.js` => **exit code 0**

## Manual browser checks
Not performed in this environment.

Suggested manual checks for human verifier:
- Add task without due date; ensure no due-date line appears.
- Add task with due date; ensure due date line shows `Due DD MMM YYYY`.
- Create past-due incomplete task; verify red accent + “Overdue” badge.
- Mark overdue task complete; verify overdue badge removed.
- Due today task is not overdue.
- Verify filters and clear completed work with mixed tasks.

## Final recommendation
**APPROVED** (no CRITICAL/HIGH findings; all ACs appear implemented but require manual browser verification).

## Outstanding issues
- Fix mojibake/encoding issues in visible strings (MEDIUM).
- Manually verify ACs in a real browser.
