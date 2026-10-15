(() => {
  "use strict";

  /* =========================================================
     TODO APP: all JavaScript lives in this file
       1. Config & state
       2. Storage
       3. Rendering
       4. Add task
       5. Check / uncheck + counter
       6. Edit & delete menu
       7. Init
     ========================================================= */

  /* ---------- 1. Config & state ---------- */
  const STORAGE_KEY = "todo-done:tasks";
  const COLOR_RE = /^#[0-9a-f]{6}$/i;

  // Checkbox border colours (from the design)
  const COLORS = ["#6b6b9a", "#3f8f8a", "#b0405a", "#7a3fa8", "#e5e5e5", "#a8a35a"];

  // First-run sample data: 8 tasks, 5 done (matches the design)
  const SEED = [
    { done: true, color: "#6b6b9a" },
    { done: false, color: "#3f8f8a" },
    { done: true, color: "#b0405a" },
    { done: true, color: "#7a3fa8" },
    { done: false, color: "#e5e5e5" },
    { done: true, color: "#a8a35a" },
    { done: false, color: "#a8a35a" },
    { done: true, color: "#a8a35a" },
  ].map((t, i) => ({ id: `seed-${i}`, text: "Text", ...t }));

  const DOTS_SVG = `
    <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="1.9" /><circle cx="12" cy="12" r="1.9" /><circle cx="12" cy="19" r="1.9" />
    </svg>`;

  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");
  const counterEl = document.getElementById("counter");
  const emptyEl = document.getElementById("empty-state");

  let tasks = loadTasks();

  /* ---------- 2. Storage ---------- */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((t) => t && typeof t.text === "string")
            .map((t) => ({
              id: String(t.id || uid()),
              text: t.text,
              done: Boolean(t.done),
              color: COLOR_RE.test(t.color) ? t.color : COLORS[0],
            }));
        }
      }
    } catch (_) {
      /* ignore corrupted storage and fall back to the sample data */
    }
    return SEED.map((t) => ({ ...t }));
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (_) {
      /* storage may be unavailable (private mode, quota) */
    }
  }

  // Keep storage in sync after an edit
  function saveToStorage(id, newText) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.text = newText;
    saveTasks();
  }

  // Keep storage in sync after a delete (by id, so duplicate texts are safe)
  function removeFromStorage(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
  }

  /* ---------- 3. Rendering ---------- */
  function createTaskEl(task, animate = false) {
    const li = document.createElement("li");
    li.className =
      "todo-item flex h-[50px] items-center rounded-xl border border-[#27272a] bg-[#18181b] pl-[18px] pr-2 md:h-[56px]" +
      (animate ? " task-enter" : "");
    li.dataset.id = task.id;

    li.innerHTML = `
      <label class="todo-check" style="--check-color:${task.color}">
        <input type="checkbox" class="todo-checkbox" aria-label="Mark task as done" ${task.done ? "checked" : ""} />
        <span class="todo-box"></span>
      </label>
      <span class="todo-text ml-[18px] min-w-0 flex-1 break-words text-base font-semibold leading-tight"></span>
      <button type="button" class="todo-dots flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
        aria-label="Task options" aria-haspopup="menu" aria-expanded="false">${DOTS_SVG}</button>
      <div class="menu-popup" role="menu">
        <button type="button" class="menu-edit" role="menuitem">✏️ Edit</button>
        <button type="button" class="menu-delete" role="menuitem">🗑️ Delete</button>
      </div>`;

    // textContent (not innerHTML) so typed text can never inject markup
    li.querySelector(".todo-text").textContent = task.text;
    return li;
  }

  function renderTasks() {
    taskList.replaceChildren(...tasks.map((t) => createTaskEl(t)));
    refreshStatus();
  }

  function refreshStatus() {
    const done = tasks.filter((t) => t.done).length;
    counterEl.textContent = `${done}/${tasks.length}`;
    emptyEl.classList.toggle("hidden", tasks.length > 0);
  }

  /* ---------- 4. Add task ---------- */
  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const taskText = taskInput.value.trim();
    if (taskText === "") {
      alert("Please enter a task!");
      taskInput.focus();
      return;
    }

    const task = {
      id: uid(),
      text: taskText,
      done: false,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    tasks.push(task);
    saveTasks();

    taskList.appendChild(createTaskEl(task, true));
    refreshStatus();

    taskInput.value = "";
    taskInput.focus();
  });

  /* ---------- 5. Check / uncheck + counter ---------- */
  taskList.addEventListener("change", (event) => {
    if (!event.target.matches(".todo-checkbox")) return;
    const item = event.target.closest(".todo-item");
    const task = tasks.find((t) => t.id === item.dataset.id);
    if (!task) return;
    task.done = event.target.checked;
    saveTasks();
    refreshStatus();
  });

  /* ---------- 6. Edit & delete menu ---------- */
  function closeAllMenus() {
    document.querySelectorAll(".menu-popup.show").forEach((p) => {
      p.classList.remove("show");
      const btn = p.parentElement.querySelector(".todo-dots");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  // Open/close the popup when ⋮ is clicked, or handle Edit / Delete
  document.addEventListener("click", (e) => {
    const dotsBtn = e.target.closest(".todo-dots");
    if (dotsBtn) {
      const popup = dotsBtn.parentElement.querySelector(".menu-popup");
      const wasOpen = popup.classList.contains("show");
      closeAllMenus();
      if (!wasOpen) {
        popup.classList.add("show");
        dotsBtn.setAttribute("aria-expanded", "true");
      }
      return;
    }

    const editBtn = e.target.closest(".menu-edit");
    if (editBtn) {
      const todoItem = editBtn.closest(".todo-item");
      closeAllMenus();
      startEdit(todoItem);
      return;
    }

    const deleteBtn = e.target.closest(".menu-delete");
    if (deleteBtn) {
      const todoItem = deleteBtn.closest(".todo-item");
      closeAllMenus();
      deleteTodo(todoItem);
      return;
    }

    // Clicked anywhere else: close all popups
    closeAllMenus();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllMenus();
  });

  // EDIT: swap the text for an input, save on Enter or blur, cancel on Escape
  function startEdit(todoItem) {
    const textEl = todoItem.querySelector(".todo-text");
    if (!textEl) return; // already editing

    const oldText = textEl.textContent.trim();
    const input = document.createElement("input");
    input.type = "text";
    input.value = oldText;
    input.maxLength = 120;
    input.className = "edit-input";
    input.setAttribute("aria-label", "Edit task");

    textEl.replaceWith(input);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    let finished = false;
    const finishEdit = (save) => {
      if (finished) return;
      finished = true;
      const newText = (save && input.value.trim()) || oldText; // keep old text if empty
      textEl.textContent = newText;
      input.replaceWith(textEl);
      saveToStorage(todoItem.dataset.id, newText);
    };

    input.addEventListener("blur", () => finishEdit(true));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") finishEdit(true);
      if (e.key === "Escape") finishEdit(false);
    });
  }

  // DELETE: ask first, then remove the task
  function deleteTodo(todoItem) {
    const task = tasks.find((t) => t.id === todoItem.dataset.id);
    const text = task ? task.text : "this task";
    if (confirm(`Delete "${text}"?`)) {
      todoItem.remove();
      removeFromStorage(todoItem.dataset.id);
      refreshStatus();
    }
  }

  /* ---------- 7. Init ---------- */
  renderTasks();
})();
