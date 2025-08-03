import { months, years } from './constants.js';

export function populateSelectOptions(id, options) {
  const select = document.getElementById(id);
  options.forEach((optionText, i) => {
    const option = document.createElement("option");
    option.value = optionText;
    option.text = optionText;
    if (i === 0) option.selected = true;
    select.appendChild(option);
  });
}

export function populateMonthAndYearSelects(months, years) {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);

  const monthSelects = ["period_month", "acc_month"];
  const yearSelects = ["period_year", "acc_year"];

  monthSelects.forEach(id => {
    const select = document.getElementById(id);
    months.forEach((m, i) => {
      const option = document.createElement("option");
      option.value = m;
      option.text = m;
      if (i === lastMonth.getMonth()) option.selected = true;
      select.appendChild(option);
    });
  });

  yearSelects.forEach(id => {
    const select = document.getElementById(id);
    years.forEach(y => {
      const option = document.createElement("option");
      option.value = y;
      option.text = y;
      if (y === 2025) option.selected = true;
      select.appendChild(option);
    });
  });
}

export function showTab(tabId) {
  document.getElementById("accomplishmentTab").style.display = "none";
  document.getElementById("overtimeTab").style.display = "none";
  document.getElementById(tabId).style.display = "block";
}
