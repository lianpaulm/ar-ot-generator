import { months, years, periodRanges, getTodayDate } from './utils/constants.js';
import { showTab, populateSelectOptions, populateMonthAndYearSelects } from './utils/uiHelpers.js';
import { handleOtForm, createOtRow } from './forms/overtimeForm.js';
import { handleAccForm, createAccRow } from './forms/accomplishmentForm.js';
import { loadTemplates, generateWordFromTemplate, generateExcelFromTemplate } from './utils/templateHandlers.js';

export const rows = [];
export const accRows = [];

document.addEventListener("DOMContentLoaded", () => {
  populateSelectOptions("period_range", periodRanges);
  populateSelectOptions("acc_day_range", periodRanges);
  populateMonthAndYearSelects(months, years);

  document.getElementById("date_application").value = getTodayDate();

  window.showTab = showTab;
  showTab("accomplishmentTab"); 

  loadTemplates();

  document.getElementById("otForm").addEventListener("submit", handleOtForm);
  document.getElementById("accForm").addEventListener("submit", handleAccForm);

  document.getElementById("generateWord").addEventListener("click", () => generateWordFromTemplate(rows));
  document.getElementById("generateExcel").addEventListener("click", () => generateExcelFromTemplate(rows));
  document.getElementById("generateAccWord").addEventListener("click", () => generateWordFromTemplate(accRows, true));
});
