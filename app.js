const STORAGE_KEY = "daylight-todos";
const taskForm = document.querySelector("#add-form");
const taskInput = document.querySelector("#task-input");
const dueDateInput = document.querySelector("#due-date-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const taskTotal = document.querySelector("#task-total");
const remainingCount = document.querySelector("#remaining-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-button");
const todayLabel = document.querySelector("#today-label");

let tasks = loadTasks();
let activeFilter = "all";

todayLabel.textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "long",
  day: "numeric",
}).format(new Date());

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }

  const dueDate = normalizeDueDate(dueDateInput?.value);

  const task = {
    id: createId(),
    text,
    completed: false,
    createdAt: Date.now(),
  };

  if (dueDate) {
    task.dueDate = dueDate;
  }

  tasks.unshift(task);
  taskInput.value = "";
  if (dueDateInput) dueDateInput.value = "";
  saveAndRender();
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const selected = filterButton === button;
      filterButton.classList.toggle("is-active", selected);
      filterButton.setAttribute("aria-pressed", String(selected));
    });
    render();
  });
});

taskList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const taskItem = button.closest("[data-task-id]");
  const task = tasks.find((item) => item.id === taskItem?.dataset.taskId);
  if (!task) return;

  if (button.dataset.action === "toggle") {
    task.completed = !task.completed;
  } else if (button.dataset.action === "delete") {
    tasks = tasks.filter((item) => item.id !== task.id);
  }
  saveAndRender();
});

clearCompletedButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveAndRender();
});

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

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

function loadTasks() {
  try {
    const storedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(storedTasks)) return [];

    return storedTasks
      .filter(
        (task) =>
          task &&
          typeof task.id === "string" &&
          typeof task.text === "string" &&
          typeof task.completed === "boolean",
      )
      .map((task) => {
        const dueDate = normalizeDueDate(task.dueDate);
        if (dueDate) {
          return { ...task, dueDate };
        }

        if (Object.hasOwn(task, "dueDate")) {
          const { dueDate: _, ...rest } = task;
          return rest;
        }

        return task;
      });
  } catch (error) {
    console.error("Could not load saved tasks.", error);
    return [];
  }
}

function saveAndRender() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks to local storage.", error);
  }
  render();
}

function getEmptyStateContent(filter, totalCount) {
  if (totalCount === 0) {
    return {
      title: "No tasks yet",
      copy: "Add your first task above to get started.",
    };
  }

  if (filter === "active") {
    return {
      title: "Nothing to do",
      copy: "You’re all caught up. Switch to All or Done to review your list.",
    };
  }

  if (filter === "completed") {
    return {
      title: "No completed tasks",
      copy: "Finish a task to see it show up here.",
    };
  }

  return {
    title: "No tasks",
    copy: "Try adding a task above.",
  };
}

function render() {
  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });
  const remaining = tasks.filter((task) => !task.completed).length;
  const completed = tasks.length - remaining;

  taskTotal.textContent = String(tasks.length);
  remainingCount.textContent =
    remaining === 0 ? "You’re all caught up ✨" : `${remaining} ${remaining === 1 ? "task" : "tasks"} left to do`;
  clearCompletedButton.hidden = completed === 0;

  const shouldShowEmpty = visibleTasks.length === 0;
  emptyState.hidden = !shouldShowEmpty;

  if (shouldShowEmpty) {
    const { title, copy } = getEmptyStateContent(activeFilter, tasks.length);
    const titleEl = emptyState.querySelector(".empty-title");
    const copyEl = emptyState.querySelector(".empty-copy");
    if (titleEl) titleEl.textContent = title;
    if (copyEl) copyEl.textContent = copy;
  }

  taskList.replaceChildren(...visibleTasks.map(createTaskElement));
}

function createTaskElement(task) {
  const item = document.createElement("li");

  const todayYmd = getTodayLocalYmd();
  const overdue = isTaskOverdue(task, todayYmd);

  item.className = `task-item${task.completed ? " is-completed" : ""}${overdue ? " is-overdue" : ""}`;
  item.dataset.taskId = task.id;

  const toggle = document.createElement("input");
  toggle.className = "task-checkbox";
  toggle.type = "checkbox";
  toggle.checked = task.completed;
  toggle.dataset.action = "toggle";
  toggle.setAttribute("aria-label", `${task.completed ? "Mark as not done" : "Complete"}: ${task.text}`);

  const content = document.createElement("div");
  content.className = "task-details";

  const text = document.createElement("p");
  text.className = "task-title";
  text.textContent = task.text;

  content.append(text);

  const formattedDueDate = formatDueDate(task.dueDate);
  if (formattedDueDate) {
    const dueDateElement = document.createElement("p");
    dueDateElement.className = "task-date";
    dueDateElement.textContent = `Due ${formattedDueDate}`;
    content.append(dueDateElement);
  }

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.setAttribute("aria-label", `Delete: ${task.text}`);
  deleteButton.textContent = "×";

  item.append(toggle, content, deleteButton);
  return item;
}

render();
