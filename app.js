const STORAGE_KEY = "taskie_tasks_v2";

let tasks = [];
let currentFilter = "all";

const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const sortPriorityBtn = document.getElementById("sortPriorityBtn");
const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");
const completionRate = document.getElementById("completionRate");
const statusMessage = document.getElementById("statusMessage");
const progressTrack = document.querySelector(".progress-track");
const progressFill = document.getElementById("progressFill");

const priorityRank = {
  high: 0,
  medium: 1,
  low: 2,
};

const priorityLabels = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

let sortByPriority = false;

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      tasks = parsed.map((task) => ({
        id: task.id || crypto.randomUUID(),
        text: typeof task.text === "string" ? task.text : "",
        completed: Boolean(task.completed),
        priority: priorityLabels[task.priority] ? task.priority : "medium",
      }));
    }
  } catch {
    tasks = [];
  }
}

function updateStatus() {
  const total = tasks.length;
  const remaining = tasks.filter((task) => !task.completed).length;
  const completed = total - remaining;
  const highPriorityOpen = tasks.filter(
    (task) => !task.completed && task.priority === "high"
  ).length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  taskCount.textContent = `${remaining} active, ${completed} completed`;
  totalCount.textContent = String(total);
  activeCount.textContent = String(remaining);
  completedCount.textContent = String(completed);
  completionRate.textContent = `${rate}%`;
  progressFill.style.width = `${rate}%`;
  progressTrack.setAttribute("aria-valuenow", String(rate));

  if (total === 0) {
    statusMessage.textContent = "No tasks yet. Add your first priority to get started.";
    return;
  }

  if (remaining === 0) {
    statusMessage.textContent = "Everything is complete. Nice work keeping the list clear.";
    return;
  }

  if (completed === 0) {
    statusMessage.textContent = highPriorityOpen > 0
      ? `Fresh board. ${highPriorityOpen} high-priority task${highPriorityOpen === 1 ? "" : "s"} waiting.`
      : "Fresh board. Start moving through the highest-impact work first.";
    return;
  }

  statusMessage.textContent = highPriorityOpen > 0
    ? `Progress is building. ${highPriorityOpen} high-priority task${highPriorityOpen === 1 ? "" : "s"} still need attention.`
    : "Progress is building. Keep the active list lean and focused.";
}

function getFilteredTasks() {
  let filtered = tasks;

  if (currentFilter === "active") {
    filtered = tasks.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    filtered = tasks.filter((task) => task.completed);
  }

  if (!sortByPriority) {
    return filtered;
  }

  return [...filtered].sort((a, b) => {
    const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return Number(a.completed) - Number(b.completed);
  });
}

function renderTasks() {
  taskList.innerHTML = "";
  sortPriorityBtn.classList.toggle("active", sortByPriority);

  const filtered = getFilteredTasks();
  emptyState.classList.toggle("hidden", filtered.length > 0);

  filtered.forEach((task) => {
    const item = document.createElement("article");
    item.className = `task-item priority-${task.priority} ${task.completed ? "completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Toggle task completion");
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const taskMain = document.createElement("div");
    taskMain.className = "task-main";

    const textEl = document.createElement("p");
    textEl.className = "task-text";
    textEl.textContent = task.text;
    textEl.title = task.text;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const badge = document.createElement("span");
    badge.className = "task-badge";
    badge.textContent = task.completed ? "Completed" : "In Progress";

    const priorityBadge = document.createElement("span");
    priorityBadge.className = `task-badge priority-${task.priority}`;
    priorityBadge.textContent = priorityLabels[task.priority];

    meta.append(badge, priorityBadge);
    taskMain.append(textEl, meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "icon-btn";
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(task.id, textEl));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-btn delete";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    actions.append(editBtn, deleteBtn);
    item.append(checkbox, taskMain, actions);
    taskList.append(item);
  });

  updateStatus();
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
    priority: prioritySelect.value,
  });

  taskInput.value = "";
  prioritySelect.value = "medium";
  saveTasks();
  renderTasks();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function startEdit(taskId, textElement) {
  const target = tasks.find((task) => task.id === taskId);
  if (!target) return;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "task-text-input";
  input.value = target.text;

  const commitEdit = () => {
    const nextText = input.value.trim();
    if (!nextText) {
      renderTasks();
      return;
    }

    tasks = tasks.map((task) =>
      task.id === taskId ? { ...task, text: nextText } : task
    );
    saveTasks();
    renderTasks();
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") commitEdit();
    if (event.key === "Escape") renderTasks();
  });
  input.addEventListener("blur", commitEdit);

  textElement.replaceWith(input);
  input.focus();
  input.select();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

function togglePrioritySort() {
  sortByPriority = !sortByPriority;
  renderTasks();
}

function setFilter(nextFilter) {
  currentFilter = nextFilter;
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === nextFilter);
  });
  renderTasks();
}

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTask();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

clearCompletedBtn.addEventListener("click", clearCompleted);
sortPriorityBtn.addEventListener("click", togglePrioritySort);

loadTasks();
renderTasks();
