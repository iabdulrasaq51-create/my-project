const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

// 1. Handle form submission
taskForm.addEventListener("submit", function (event) {
event.preventDefault();

// 2. Check if input is empty
const taskText = taskInput.value.trim();

if (taskText === "") {
alert("Please enter a task!");
return;
}

// 3. Render the new task
const taskItem = document.createElement("li");
taskItem.textContent = taskText;
taskList.appendChild(taskItem);

// Clear input after adding task
taskInput.value = "";
});

