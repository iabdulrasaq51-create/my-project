document.addEventListener("DOMContentLoaded", () => {
  const taskList = document.getElementById("task-list");
  const counterSpan = document.getElementById("task-counter");
  const taskInput = document.getElementById("task-input");
  const addBtn = document.getElementById("add-btn");

  function updateCounter() {
    const checkboxes = document.querySelectorAll(".task-checkbox");
    const totalTasks = checkboxes.length;
    const completedTasks = document.querySelectorAll(".task-checkbox:checked").length;
    counterSpan.textContent = `${completedTasks}/${totalTasks}`;
  }

  // Attach event listener to update count on check change
  function attachCheckboxListeners() {
    const checkboxes = document.querySelectorAll(".task-checkbox");
    checkboxes.forEach((checkbox) => {
      // Remove old listeners to avoid duplicates if re-attached
      checkbox.replaceWith(checkbox.cloneNode(true));
    });
    
    // Re-select and add listener
    document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", updateCounter);
    });
  }

  // Add new task functionality when clicking '+'
  addBtn.addEventListener("click", () => {
    const taskTextValue = taskInput.value.trim();
    if (taskTextValue === "" || taskTextValue === "inpute a new task") return;

    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" class="task-checkbox">
        <span class="task-text">${taskTextValue}</span>
      </div>
      <span class="menu-dots">&#8942;</span>
    `;

    taskList.appendChild(li);
    taskInput.value = "";
    attachCheckboxListeners();
    updateCounter();
  });

  // Initial setup
  attachCheckboxListeners();
  updateCounter();
});