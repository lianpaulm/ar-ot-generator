import { rows } from "../main.js";

export function handleOtForm(e) {
  e.preventDefault();

  const timeFrom = new Date(`1970-01-01T${from.value}`);
  const timeTo = new Date(`1970-01-01T${to.value}`);
  const formatTime = t => t.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' });

  const fullDay = `${period_month.value} ${day.value}, ${period_year.value}`;
  const row = {
    day: day.value,
    full_day: fullDay,
    day_of_week: day_of_week.value,
    time_from: formatTime(timeFrom),
    time_to: formatTime(timeTo),
    specific_work: work.value,
    claim_es: claim.value === "ES" ? "✓" : "",
    claim_coc: claim.value === "COC" ? "✓" : "",
    claim_both: claim.value === "BOTH" ? "✓" : "",
    remarks: remarks.value,
  };

  rows.push(row);
  document.getElementById("otTableBody").appendChild(createOtRow(row));
  e.target.reset();
}

export function createOtRow(rowData) {
  const tr = document.createElement("tr");

  const fields = [
    { key: "day", value: rowData.day },
    { key: "day_of_week", value: rowData.day_of_week },
    { key: "time_from", value: rowData.time_from },
    { key: "time_to", value: rowData.time_to },
    { key: "specific_work", value: rowData.specific_work }
  ];

  // Plus (+) action cell
  const actionTd = document.createElement("td");
  actionTd.classList.add("row-action");
  actionTd.textContent = "+";
  tr.appendChild(actionTd);

  // Create editable cells
  fields.forEach(field => {
    const td = document.createElement("td");
    td.textContent = field.value;
    td.contentEditable = "true";
    td.classList.add("editable-cell");

    if (field.key === "specific_work") {
    td.classList.add("work-cell");
  }
  
    // Highlight on focus
    td.addEventListener("focus", () => {
      td.classList.add("editing");
    });

    // Save on Enter (but allow Shift+Enter)
    td.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        rowData[field.key] = td.textContent.trim();
        td.blur();
      }
    });

    // Remove highlight on blur
    td.addEventListener("blur", () => {
      td.classList.remove("editing");
    });

    // Keep data in sync during typing too
    td.addEventListener("input", () => {
      rowData[field.key] = td.textContent;
    });

    tr.appendChild(td);
  });

  // Handle copy logic (insert in-place in both DOM and rows array)
  actionTd.addEventListener("click", () => {
    const copy = { ...rowData };
    const newRow = createOtRow(copy);
    tr.after(newRow);

    const index = rows.indexOf(rowData);
    rows.splice(index + 1, 0, copy); // Insert in the correct order
  });

  return tr;
}

