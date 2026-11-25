# Requirements — EPMCDMETST-72039: Add Optional Due Dates and Overdue Identification to Tasks

**Document version:** 1.0  
**Date:** 2026-11-25  
**Product:** Daylight ToDo  
**Story ID:** EPMCDMETST-72039  
**Story title:** Add Optional Due Dates and Overdue Identification to Tasks  
**Story URL:** https://jiraeu.epam.com/browse/EPMCDMETST-72039  

## 1. Business objective
Enable users to optionally assign a due date to a task, display it consistently, and visually identify overdue *incomplete* tasks using the user’s **current local calendar date**—while preserving existing task creation, completion, deletion, filtering, and storage behavior.

## 2. Story information (verified from Jira)
**User story:**
- As a person managing daily tasks,
- I want to assign an optional due date to a task and identify when it becomes overdue,
- So that I can prioritize upcoming work, track deadlines, and avoid missing important tasks.

**Status:** Open

## 3. Repository / application context (verified)
### 3.1 Technology & structure
- Single-page static web app: `index.html`, `styles.css`, `app.js`
- Runs in browser; persistence via `localStorage`
- No package manager / no test framework detected in repo root

### 3.2 Verified existing functionality (from code inspection)
1. Create tasks via form input (`#add-form`, `#task-input`), saved to `localStorage` under key `daylight-todos`.
2. Task object shape (current):
   - `id: string`
   - `text: string`
   - `completed: boolean`
   - `createdAt: number (ms epoch)`
3. Toggle complete / incomplete via a button.
4. Delete tasks.
5. Filters: All / To do (`active`) / Done (`completed`).
6. Clear completed tasks.
7. Renders a “today” label in header using `Intl.DateTimeFormat` with user locale.
8. Basic backward-compatible load: `loadTasks()` filters stored entries to valid basic shape.

## 4. User roles
- **End user (task manager):** creates and manages tasks in the Daylight ToDo UI.

## 5. In-scope functional requirements
### FR-001 Optional due date input when creating a task
The task creation UI **shall** provide a way to optionally set a due date when adding a new task.

### FR-002 Create tasks without a due date
The system **shall** allow saving a task without selecting any due date.

### FR-003 Persist due date with the task
When provided, the due date **shall** be stored alongside the task in browser `localStorage` such that it is available after reload/reopen.

### FR-004 Display due date on task items
For tasks that have an assigned due date, the task list UI **shall** display the due date.

### FR-005 Due date display format
Displayed due dates **shall** use a consistent, readable format: **DD MMM YYYY** (e.g., `05 Jan 2027`).

### FR-006 Identify overdue incomplete tasks
The system **shall** visibly mark a task as **overdue** when:
- it has a due date earlier than the user’s **current local calendar date**, and
- it is **incomplete**.

### FR-007 Completed tasks are not overdue
The system **shall not** mark completed tasks as overdue, even if their due date is earlier than the current local calendar date.

### FR-008 Tasks due today are not overdue
The system **shall not** mark tasks as overdue when their due date equals the current local calendar date.

### FR-009 Preserve existing functionality
The introduction of due dates and overdue marking **shall not** break or change behavior of:
- create, toggle complete, delete
- clear completed
- filters (All / To do / Done)

### FR-010 Maintain compatibility with previously stored tasks
Tasks stored prior to the due-date feature **shall** continue to load and be usable without requiring a due date and without data loss.

## 6. Non-functional requirements
### NFR-001 Local date correctness
Overdue calculation **shall** be based on the user’s **local calendar date** (not UTC date-time), avoiding incorrect overdue status around midnight/timezone boundaries.

### NFR-002 Accessibility & contrast for overdue indicator
Overdue marking **shall** be visually distinguishable with sufficient contrast and include accessible text (e.g., label/badge text exposed to assistive technology).

### NFR-003 Performance
Rendering and filtering **shall** remain responsive for typical personal to-do list sizes (e.g., up to hundreds of tasks) without noticeable lag.

### NFR-004 Backward compatibility / resilient parsing
Loading tasks from `localStorage` **shall** tolerate missing due-date fields and ignore malformed due-date values without breaking the app.

## 7. Business rules & validations
### BR-001 Due date optionality
A due date is optional; absence of due date is a valid task state.

### BR-002 Overdue determination uses date-only comparison
Overdue is determined by comparing **date only** values:
- Convert both “today” and “due date” to local calendar dates (year-month-day).
- A task is overdue if `dueDate < today`.

### BR-003 No due-date label when not set
If a task has no due date, the UI **must not** display any due-date label/placeholder.

### BR-004 Immutability of due date (scope constraint)
Editing/changing due dates after creation is out of scope; UI and behavior should not introduce due-date editing.

## 8. Acceptance criteria (testable)
### AC-001 Add an optional due date
**Given** I am creating a new task  
**When** I select a due date and submit the task  
**Then** the task is saved with the selected due date.

### AC-002 Allow tasks without due dates
**Given** I am creating a new task  
**When** I submit the task without selecting a due date  
**Then** the task is saved successfully without a due date  
**And** no due-date label is displayed for that task.

### AC-003 Display the due date
**Given** a task has an assigned due date  
**When** I view the task in the task list  
**Then** the due date is displayed in format **DD MMM YYYY**.

### AC-004 Identify overdue tasks
**Given** a task has a due date earlier than the current local calendar date  
**And** the task is incomplete  
**When** I view the task list  
**Then** the task is visibly marked as overdue.

### AC-005 Do not mark completed tasks as overdue
**Given** a task has a due date earlier than the current local calendar date  
**And** the task is completed  
**When** I view the task list  
**Then** the task is not marked as overdue.

### AC-006 Handle tasks due today
**Given** a task has a due date equal to the current local calendar date  
**When** I view the task list  
**Then** the task is not marked as overdue.

### AC-007 Persist due dates
**Given** I created a task with a due date  
**When** I reload or reopen the application  
**Then** the task and its assigned due date remain available.

### AC-008 Preserve existing functionality
**Given** tasks exist with or without due dates  
**When** I complete, delete, clear completed, or use the All / To do / Done filters  
**Then** all existing controls continue to function correctly.

### AC-009 Maintain existing task compatibility
**Given** tasks were created before due dates were introduced  
**When** I open the application  
**Then** those tasks remain available without requiring a due date  
**And** no existing task data is lost.

## 9. Out of scope
- Notifications/reminders
- Recurring tasks
- Editing/changing due dates after creation
- Calendar integration
- Email/push notifications
- Advanced deadline-based filtering or sorting

## 10. Assumptions & constraints
- Browser supports `localStorage`.
- “Current local calendar date” is derived from the user’s device locale/timezone.
- Date input and display will be implemented without introducing a build step (repo is static files).

## 11. Dependencies
- Existing task creation and rendering logic (`app.js`).
- Existing storage key `daylight-todos` and persistence model.
- Existing UI structure in `index.html` and styling in `styles.css`.

## 12. Risks
- **Date parsing/format drift:** storing due dates as strings may lead to timezone or parsing inconsistencies if not normalized.
- **Backward compatibility filter:** current `loadTasks()` filters tasks by required fields; adding due date must not cause older tasks to be dropped.
- **Locale formatting:** achieving strict `DD MMM YYYY` across locales may require a fixed locale or manual formatting.

## 13. Open questions
1. **Storage format:** Should due date be stored as an ISO date string (`YYYY-MM-DD`) or as epoch ms at local midnight?
2. **UI control:** Should the due date input be a native `<input type="date">` or a custom control?
3. **Overdue indicator style:** Badge text suggested by story; confirm desired wording (e.g., “Overdue”).
4. **Display locale vs fixed month abbreviation:** AC requires `DD MMM YYYY`; should month abbreviations be English (`Jan`) regardless of user locale?

## 14. Requirement traceability
| Jira AC | Covered by | Notes |
|---|---|---|
| AC1 | FR-001, FR-003 | Optional due date captured & persisted |
| AC2 | FR-002, BR-003 | No due date allowed; no label |
| AC3 | FR-004, FR-005 | Display & format |
| AC4 | FR-006, BR-002 | Overdue incomplete |
| AC5 | FR-007 | Completed not overdue |
| AC6 | FR-008 | Due today not overdue |
| AC7 | FR-003 | Persistence |
| AC8 | FR-009 | Regression preservation |
| AC9 | FR-010, NFR-004 | Backward compatibility |
