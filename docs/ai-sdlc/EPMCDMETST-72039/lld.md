# Low-Level Design (LLD) — EPMCDMETST-72039

**Document version:** 1.0  
**Date:** 2026-11-25  

## 1. Scope
This LLD specifies the module-level changes inside the existing static SPA to support:
- optional due date at task creation
- persistence in `localStorage`
- display in `DD MMM YYYY`
- overdue marking for incomplete tasks with dueDate before today (local calendar date)

No backend or due date editing is introduced.

## 2. Current modules and responsibilities (as-is)
### 2.1 `app.js` (single module)
- DOM bindings to:
  - `#add-form`, `#task-input`, `#task-list`, `#clear-completed`, `.filter-button` etc.
- In-memory state:
  - `tasks: Task[]`
  - `activeFilter: 'all'|'active'|'completed'`
- Persistence:
  - `loadTasks()` reads/validates stored tasks
  - `saveAndRender()` stores tasks and calls `render()`
- Rendering:
  - `render()` computes counts, filter view, updates DOM
  - `createTaskElement(task)` creates `<li>` for a task

## 3. Proposed data model changes
### 3.1 Task type (conceptual)
> Proposed interface (not existing code):
```ts
type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string; // proposed: YYYY-MM-DD
};
```

### 3.2 Storage format
- Continue using `STORAGE_KEY = "daylight-todos"`
- `dueDate` stored only when valid and provided.

## 4. Proposed function / responsibility changes
### 4.1 Form submit handler (existing anonymous callback)
**Current:** reads `taskInput.value`, validates non-empty, adds task.

**Change:**
- Read due date input value (new DOM element, e.g. `#due-date-input` proposed).
- Validate:
  - empty string => no dueDate on task
  - non-empty => must match `^\d{4}-\d{2}-\d{2}$` and represent a plausible date (basic check)
- Add `dueDate` property only if valid.
- Reset both text input and due date input after submit.

### 4.2 `loadTasks()`
**Current validation:** keep tasks where id/text/completed have correct types.

**Change:** keep the same required-field validation; add optional dueDate handling:
- If `typeof task.dueDate !== 'string'` => treat as missing
- If string but invalid format => ignore it (do not drop task)
- If valid format => keep as `dueDate`

**Persistence behavior:**
- `loadTasks()` must never throw; continues to catch JSON parse errors.

### 4.3 `createTaskElement(task)`
**Current DOM:** `<li.task-item>` includes toggle button, text span, delete button.

**Change:**
- If `task.dueDate` present and valid:
  - append an additional element (proposed) `span.task-due-date` with text `Due 05 Jan 2027` or just `05 Jan 2027` (exact prefix can be finalized during implementation; must not violate BR-003 for missing due dates).
- Compute overdue state:
  - `overdue = isTaskOverdue(task, getTodayLocalYmd())`
- If overdue:
  - add CSS class (proposed) `is-overdue` to `li.task-item`
  - append badge element (proposed) `span.task-badge task-badge--overdue` with visible text `Overdue`
  - ensure screen readers can perceive status (badge text is sufficient; optionally also add `aria-label` additions)

### 4.4 `render()`
No functional change expected. Rendering remains O(n). Overdue computation happens during element creation.

## 5. New helper functions (proposed identifiers)
> These functions do not exist yet; names may vary during implementation.

### 5.1 `normalizeDueDate(input: unknown): string | null`
**Responsibility:**
- Return a normalized `YYYY-MM-DD` string if valid; otherwise `null`.

**Rules:**
- Accept only strings.
- Trim whitespace.
- Match `^\d{4}-\d{2}-\d{2}$`.
- Basic bounds check for month/day (1-12, 1-31). (Optional deeper validation: construct date and verify components.)

**Error handling:** never throw.

### 5.2 `getTodayLocalYmd(now = new Date()): string`
**Responsibility:**
- Convert local calendar date to `YYYY-MM-DD`.

**Implementation notes:**
- Use `now.getFullYear()`, `now.getMonth()+1`, `now.getDate()`.
- Zero-pad month/day.

### 5.3 `isTaskOverdue(task: Task, todayYmd: string): boolean`
**Responsibility:**
- Determine overdue status per requirements:
  - if no dueDate => false
  - if completed => false
  - if dueDate < todayYmd => true
  - if dueDate == todayYmd => false

**Comparison:**
- Lexicographic comparison is safe for fixed-width `YYYY-MM-DD`.

### 5.4 `formatDueDate(yyyyMmDd: string): string`
**Responsibility:**
- Convert `YYYY-MM-DD` to `DD MMM YYYY`.

**Implementation notes:**
- Use fixed month abbreviations: `[Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]`.
- Extract year/month/day by splitting string.
- Return formatted string with zero-padded day.

**Edge cases:**
- If input invalid => return empty string and omit rendering.

## 6. UI / CSS changes (proposed)
### 6.1 `index.html`
- Add an optional due date input inside `.add-form`.
- Accessibility:
  - ensure label (either visible `<label>` or `aria-label="Due date"`).

### 6.2 `styles.css`
- Add styles (proposed selectors):
  - `.due-date-input` for form field sizing
  - `.task-due-date` secondary text style (muted)
  - `.task-item.is-overdue` highlight (border/left accent)
  - `.task-badge--overdue` readable/high contrast

**NFR-002 note:** overdue state must not rely on color only → include badge text.

## 7. Validation rules summary
- Text is required (existing).
- Due date optional.
- When present, must be a valid `YYYY-MM-DD`.
- Tasks due today are not overdue.
- Completed tasks are never overdue.

## 8. Error handling
- `loadTasks()` keeps its try/catch and logs.
- New helpers never throw.
- When encountering malformed dueDate in storage:
  - ignore dueDate and continue rendering task.

## 9. Persistence behavior
- Save includes `dueDate` only if present.
- Existing tasks without dueDate remain unchanged.
- Malformed dueDate is not re-saved as-is if normalization is applied during save; however, out-of-scope is data migration. During load, keep task but drop dueDate to prevent UI errors.

## 10. Edge cases
- User selects due date but clears it before submit → stored without dueDate.
- User manually edits localStorage and sets non-string dueDate → ignored.
- Month abbreviations locale mismatch: design chooses fixed abbreviations to meet strict format.
- Mobile layout: ensure due date wraps and does not hide delete button.

## 11. Testability notes
- Helpers can be invoked in browser console for quick checks.
- Manual tests cover:
  - persistence and overdue computations around midnight (local date)
  - backward compatibility with old stored tasks
