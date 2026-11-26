/*
  Date helpers validation — EPMCDMETST-72039

  Non-invasive check script:
  - Does not modify application source.
  - Does not require DOM/browser APIs.
  - Re-implements the date helper logic *as implemented* in app.js and checks it
    against requirements/ACs.

  Run:
    node docs/ai-sdlc/EPMCDMETST-72039/testing/date-helpers.check.js
*/

"use strict";

function normalizeDueDate(input) {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

  const [yearText, monthText, dayText] = trimmed.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const candidate = new Date(year, month - 1, day);
  if (candidate.getFullYear() !== year || candidate.getMonth() !== month - 1 || candidate.getDate() !== day) {
    return null;
  }

  return trimmed;
}

function getTodayLocalYmd(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isTaskOverdue(task, todayYmd) {
  if (!task || task.completed) return false;
  const dueDate = normalizeDueDate(task.dueDate);
  if (!dueDate) return false;
  return dueDate < todayYmd;
}

function formatDueDate(yyyyMmDd) {
  const dueDate = normalizeDueDate(yyyyMmDd);
  if (!dueDate) return "";
  const [year, month, day] = dueDate.split("-");
  const monthIndex = Number(month) - 1;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabel = months[monthIndex];
  if (!monthLabel) return "";
  return `${day} ${monthLabel} ${year}`;
}

function assertEqual(name, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${name} FAILED\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
  }
}

function assert(name, condition, details) {
  if (!condition) {
    throw new Error(`${name} FAILED${details ? `\n  ${details}` : ""}`);
  }
}

function run() {
  const results = [];

  // Valid date parsing
  results.push(["normalize valid yyyy-mm-dd", () => assertEqual("normalize", normalizeDueDate("2027-01-05"), "2027-01-05")]);

  // Invalid date handling
  results.push(["normalize rejects empty", () => assertEqual("normalize empty", normalizeDueDate(""), null)]);
  results.push(["normalize rejects whitespace", () => assertEqual("normalize ws", normalizeDueDate("   "), null)]);
  results.push(["normalize rejects bad pattern", () => assertEqual("normalize pattern", normalizeDueDate("01-05-2027"), null)]);
  results.push(["normalize rejects invalid month", () => assertEqual("normalize month", normalizeDueDate("2027-13-01"), null)]);
  results.push(["normalize rejects invalid day", () => assertEqual("normalize day", normalizeDueDate("2027-01-32"), null)]);
  results.push(["normalize rejects non-existent date (Feb 30)", () => assertEqual("normalize feb", normalizeDueDate("2027-02-30"), null)]);

  // Date formatting
  results.push(["format due date -> DD MMM YYYY", () => assertEqual("format", formatDueDate("2027-01-05"), "05 Jan 2027")]);
  results.push(["format invalid returns empty string", () => assertEqual("format invalid", formatDueDate("bad"), "")]);

  // Local-midnight behavior (derived from local date parts)
  results.push([
    "getTodayLocalYmd uses local Y/M/D",
    () => {
      const now = new Date(2027, 0, 5, 23, 59, 59, 999); // local Jan 5
      assertEqual("today local", getTodayLocalYmd(now), "2027-01-05");
    },
  ]);

  // Overdue boundaries + missing due dates + completed tasks
  results.push([
    "isTaskOverdue: missing due date => false",
    () => assertEqual("overdue missing", isTaskOverdue({ completed: false }, "2027-01-05"), false),
  ]);
  results.push([
    "isTaskOverdue: completed => false",
    () => assertEqual("overdue completed", isTaskOverdue({ completed: true, dueDate: "2027-01-01" }, "2027-01-05"), false),
  ]);
  results.push([
    "isTaskOverdue: due < today => true",
    () => assertEqual("overdue true", isTaskOverdue({ completed: false, dueDate: "2027-01-04" }, "2027-01-05"), true),
  ]);
  results.push([
    "isTaskOverdue: due == today => false (not overdue)",
    () => assertEqual("overdue boundary", isTaskOverdue({ completed: false, dueDate: "2027-01-05" }, "2027-01-05"), false),
  ]);
  results.push([
    "isTaskOverdue: invalid due date => false",
    () => assertEqual("overdue invalid", isTaskOverdue({ completed: false, dueDate: "2027-02-30" }, "2027-03-01"), false),
  ]);

  // Date boundary cases
  results.push([
    "Leap day valid (2028-02-29)",
    () => assertEqual("leap valid", normalizeDueDate("2028-02-29"), "2028-02-29"),
  ]);
  results.push([
    "Non-leap day invalid (2027-02-29)",
    () => assertEqual("leap invalid", normalizeDueDate("2027-02-29"), null),
  ]);

  let passed = 0;
  for (const [name, fn] of results) {
    fn();
    passed++;
  }

  // Small sanity check that string compare works as expected for YYYY-MM-DD
  assert("lexicographic compare sanity", "2027-01-09" < "2027-01-10", "YYYY-MM-DD should compare lexicographically");

  console.log(`DATE_HELPERS_CHECK PASS: ${passed} checks`);
}

try {
  run();
} catch (err) {
  console.error(String(err && err.stack ? err.stack : err));
  process.exitCode = 1;
  console.log("DATE_HELPERS_CHECK FAIL");
}
