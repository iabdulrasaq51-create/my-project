// ============ EDIT
// ============ EDIT & DELETE MENU (My task) ============
// 1. Open/close the popup when ⋮ is clicked
document.addEventListener("click", (e) => {
  const dotsBtn = e.target.closest(".todo-dots"); // the ⋮ button
  if (dotsBtn) {
    // Close any other open popup first
    document.querySelectorAll(".menu-popup.show").forEach((p) => {
      if (p !== dotsBtn.nextElementSibling) p.classList.remove("show");
    });
    const popup = dotsBtn.nextElementSibling; // the popup right after the button
    popup.classList.toggle("show");
    return;
  }
  // Clicked on the Edit option
  if (e.target.closest(".menu-edit")) {
    const popup = e.target.closest(".menu-popup");
    const todoItem = popup.closest(".todo-item");
    startEdit(todoItem);
    popup.classList.remove("show");
    return;
  }
  // Clicked on the Delete option
  if (e.target.closest(".menu-delete")) {
    const popup = e.target.closest(".menu-popup");
    const todoItem = popup.closest(".todo-item");
    deleteTodo(todoItem);
    popup.classList.remove("show");
    return;
  }
  // Clicked anywhere else → close all popups
  document.querySelectorAll(".menu-popup.show").forEach((p) =>
    p.classList.remove("show")
  );
});
// 2. EDIT: swap the text for an input, save on Enter or blur
function startEdit(todoItem) {
  const textEl = todoItem.querySelector(".todo-text");
  const oldText = textEl.textContent.trim();
  const input = document.createElement("input");
  input.type = "text";
  input.value = oldText;
  input.className = "edit-input";
  textEl.replaceWith(input);
  input.focus();
  const finishEdit = () => {
    const newText = input.value.trim() || oldText; // keep old text if empty
    textEl.textContent = newText;
    input.replaceWith(textEl);
    saveToStorage(todoItem, newText); // keep storage in sync
  };
  input.addEventListener("blur", finishEdit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur(); // triggers finishEdit
    if (e.key === "Escape") {
      input.value = oldText;
      input.blur();
    }
  });
}
// 3. DELETE: remove the task
function deleteTodo(todoItem) {
  const text = todoItem.querySelector(".todo-text").textContent.trim();
  if (confirm(`Delete "${text}"?`)) {
    todoItem.remove();
    removeFromStorage(text);
  }
}

function saveToStorage(todoItem, newText) {
  
}
function removeFromStorage(text) {
 
}