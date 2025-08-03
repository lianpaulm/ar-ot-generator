let templateBinary = null;
let excelTemplateBuffer = null;
let accTemplateBinary = null;
const rows = [];
const accRows = [];

const months = [
"January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"
];
const today = new Date();
const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);

const monthSelect = document.getElementById("period_month");
months.forEach((m, i) => {
const option = document.createElement("option");
option.value = m;
option.text = m;
if (i === lastMonth.getMonth()) option.selected = true;
monthSelect.appendChild(option);
});

const periodRanges = ["1-15", "16-30", "16-31"];
const periodRangeSelects = [
document.getElementById("period_range"),  // OT
document.getElementById("acc_day_range")  // Accomplishment
];

periodRangeSelects.forEach(select => {
periodRanges.forEach((range, i) => {
const opt = document.createElement("option");
opt.value = range;
opt.text = range;
if (i === 0) opt.selected = true; // Default to "1-15"
select.appendChild(opt);
});
});

const years = [2025, 2026, 2027];
const yearSelects = [
document.getElementById("period_year"),  // OT
document.getElementById("acc_year")      // Accomplishment
];

yearSelects.forEach(select => {
years.forEach((y, i) => {
const opt = document.createElement("option");
opt.value = y;
opt.text = y;
if (y === 2025) opt.selected = true;
select.appendChild(opt);
});
});

const accMonthSelect = document.getElementById("acc_month");
months.forEach((m, i) => {
const option = document.createElement("option");
option.value = m;
option.text = m;
if (i === lastMonth.getMonth()) option.selected = true;
accMonthSelect.appendChild(option);
});

function showTab(tabId) {
document.getElementById("accomplishmentTab").style.display = "none";
document.getElementById("overtimeTab").style.display = "none";
document.getElementById(tabId).style.display = "block";
}

// Default tab on load
showTab("accomplishmentTab");

// Default OT time
document.getElementById("from").value = "16:00";
document.getElementById("to").value = "18:00";

// Default Date of Application = today
document.getElementById("date_application").value = today.toISOString().split("T")[0];


// Fetch templates from /templates folder
fetch("templates/ot-template.docx")
.then(res => res.arrayBuffer())
.then(buffer => {
templateBinary = buffer;
console.log("✅ Word OT template loaded");
if (excelTemplateBuffer) document.getElementById("generateWord").disabled = false;
});


fetch("templates/ot-template.xlsx")
.then(res => res.arrayBuffer())
.then(buffer => {
    excelTemplateBuffer = buffer;
    document.getElementById("generateExcel").disabled = false;
    console.log("✅ Excel OT template loaded");
    if (templateBinary) document.getElementById("generateWord").disabled = false;
});

fetch("templates/acc-template.docx")
.then(res => res.arrayBuffer())
.then(buffer => {
accTemplateBinary = buffer;
console.log("✅ Accomplishment template loaded");
document.getElementById("generateAccWord").disabled = false;
});


// OT Form Submission
document.getElementById("otForm").addEventListener("submit", e => {
  e.preventDefault();

  const timeFrom = new Date(`1970-01-01T${from.value}`);
  const timeTo = new Date(`1970-01-01T${to.value}`);
  const timeFormat = t => t.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' });

  const periodMonth = document.getElementById("period_month").value;
  const periodYear = document.getElementById("period_year").value;
  const fullDay = `${periodMonth} ${day.value}, ${periodYear}`;

  const row = {
    day: day.value,
    full_day: fullDay,
    day_of_week: day_of_week.value,
    time_from: timeFormat(timeFrom),
    time_to: timeFormat(timeTo),
    specific_work: work.value,
    claim_es: claim.value === "ES" ? "✓" : "",
    claim_coc: claim.value === "COC" ? "✓" : "",
    claim_both: claim.value === "BOTH" ? "✓" : "",
    remarks: remarks.value,
  };

  rows.push(row); // Push original
  const tr = createOtRow(row);
  document.getElementById("otTableBody").appendChild(tr);

  e.target.reset();
});

function createOtRow(rowData) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td class="row-action">+</td>
    <td>${rowData.day}</td>
    <td>${rowData.day_of_week}</td>
    <td>${rowData.time_from}</td>
    <td>${rowData.time_to}</td>
    <td class="work-cell">${rowData.specific_work}</td>
  `;

  const plusBtn = tr.querySelector(".row-action");
  plusBtn.addEventListener("click", () => {
    const clonedRow = { ...rowData };           // Clone data
    rows.push(clonedRow);                       // ✅ Add to data array
    const newTr = createOtRow(clonedRow);       // Create DOM row
    tr.after(newTr);                            // Insert below
  });

  return tr;
}



// Accomplishment Form Submission
document.getElementById("accForm").addEventListener("submit", e => {
  e.preventDefault();

  const month = document.getElementById("acc_month").value;
  const year = document.getElementById("acc_year").value;
  const day = document.getElementById("acc_day").value;
  const task = document.getElementById("acc_task").value;

  const fullDate = `${month} ${day}, ${year}`;
  const row = { date: fullDate, task };

  accRows.push(row); // ✅ Add to data
  const tr = createAccRow(row);
  document.getElementById("accTableBody").appendChild(tr);

  e.target.reset();
});

function createAccRow(rowData) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td class="row-action">+</td>
    <td class="date-cell">${rowData.date}</td>
    <td class="work-cell">${rowData.task}</td>
  `;

  const plusBtn = tr.querySelector(".row-action");
  plusBtn.addEventListener("click", () => {
    const clonedRow = { ...rowData };          // Clone data
    accRows.push(clonedRow);                   // ✅ Add clone to data array
    const newTr = createAccRow(clonedRow);     // Generate row
    tr.after(newTr);                           // Insert after
  });

  return tr;
}



// Generate OT Word
document.getElementById("generateWord").addEventListener("click", () => {
if (!templateBinary || rows.length === 0) {
    alert("Please wait for the OT template to load and add at least one entry.");
    return;
}

// const zip = new PizZip(templateBinary);
const zip = new PizZip(new Uint8Array(templateBinary));
const doc = new window.docxtemplater().loadZip(zip).setOptions({
    delimiters: { start: "[[", end: "]]" }
});

const data = {
    date_period: `${document.getElementById("period_month").value} ${document.getElementById("period_range").value}, ${document.getElementById("period_year").value}`,
    date_application: new Date(document.getElementById("date_application").value).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
    full_name: "Lian Paul Molo",
    ot_entries: rows,
};

try {
    doc.setData(data).render();
    const out = doc.getZip().generate({ type: "blob" });
    saveAs(out, "OT-Sheet.docx");
} catch (error) {
    console.error("Render error", error);
    alert("Failed to render OT Word document.");
}
});

// Generate OT Excel
document.getElementById("generateExcel").addEventListener("click", async () => {
if (!excelTemplateBuffer) {
    alert("Excel template not yet loaded.");
    return;
}

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.load(excelTemplateBuffer);
const worksheet = workbook.worksheets[0];

const startRow = 10;
rows.forEach((entry, i) => {
    const r = startRow + i;

    const writePreserveStyle = (cellRef, value) => {
    const cell = worksheet.getCell(cellRef);
    const prevStyle = { ...cell.style };
    cell.value = value;
    cell.style = prevStyle;
    };

    writePreserveStyle(`A${r}`, entry.full_day);
    writePreserveStyle(`B${r}`, entry.day_of_week);
    writePreserveStyle(`C${r}`, entry.time_from);
    writePreserveStyle(`D${r}`, entry.time_to);
    writePreserveStyle(`E${r}`, entry.specific_work);
});

const periodValue = `${document.getElementById("period_month").value} ${document.getElementById("period_range").value}, ${document.getElementById("period_year").value}`;
if (periodValue) worksheet.getCell("G5").value = periodValue;

const appDate = document.getElementById("date_application").value;
if (appDate) worksheet.getCell("G4").value = new Date(appDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

const buffer = await workbook.xlsx.writeBuffer();
const safePeriod = periodValue.replace(/[^a-zA-Z0-9]/g, "_") || "Generated";
const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
saveAs(blob, `OT-Sheet_${safePeriod}.xlsx`);
});

// Generate Accomplishment Word
document.getElementById("generateAccWord").addEventListener("click", () => {
if (!accTemplateBinary) {
    alert("Accomplishment template not yet loaded. Please wait...");
    return;
}
if (accRows.length === 0) {
    alert("Please add at least one accomplishment entry.");
    return;
}

// const zip = new PizZip(accTemplateBinary);
const zip = new PizZip(new Uint8Array(accTemplateBinary));
const doc = new window.docxtemplater().loadZip(zip).setOptions({
    delimiters: { start: "[[", end: "]]" }
});

const accPeriod = `${document.getElementById("acc_month").value} ${document.getElementById("acc_day_range").value}, ${document.getElementById("acc_year").value}`;
const data = {
    full_name: "Lian Paul Molo",
    date_period: accPeriod,
    ac_entries: accRows,
};

try {
    doc.setData(data).render();
    const out = doc.getZip().generate({ type: "blob" });
    saveAs(out, `Accomplishment_${accPeriod.replace(/[^a-zA-Z0-9]/g, "_")}.docx`);
} catch (error) {
    console.error("Render error", error);
    alert("Failed to generate the Accomplishment Word document.");
}
});