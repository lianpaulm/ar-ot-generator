import { accRows } from "../main.js";

export function handleAccForm(e) {
  e.preventDefault();

  const fullDate = `${acc_month.value} ${acc_day.value}, ${acc_year.value}`;
  const row = { date: fullDate, task: acc_task.value };

  accRows.push(row);
  document.getElementById("accTableBody").appendChild(createAccRow(row));
  e.target.reset();
}

export function createAccRow(rowData) {
  const tr = document.createElement("tr");

  const task = document.createElement("td");
  task.className = "work-cell";
  task.contentEditable = true;
  task.textContent = rowData.task;

  const date = document.createElement("td");
  date.className = "date-cell";
  date.contentEditable = true;
  date.textContent = rowData.date;

  const action = document.createElement("td");
  action.className = "row-action";
  action.textContent = "+";

  tr.appendChild(action);
  tr.appendChild(date);
  tr.appendChild(task);

  // Keep rowData in sync with edits
  task.addEventListener("input", () => {
    rowData.task = task.textContent;
  });
  date.addEventListener("input", () => {
    rowData.date = date.textContent;
  });

  // Handle Enter vs Shift+Enter behavior
  [task, date].forEach(cell => {
    cell.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevent new line
        cell.blur(); // Commit edit
      }
    });
  });

  // Handle cloning and insert at correct position in accRows
  action.addEventListener("click", () => {
    const copy = { ...rowData }; // Copy current values
    const newRow = createAccRow(copy);

    tr.after(newRow); // Add visually under current row

    const index = accRows.indexOf(rowData);
    accRows.splice(index + 1, 0, copy); // Insert into accRows at correct position
  });

  return tr;
}
