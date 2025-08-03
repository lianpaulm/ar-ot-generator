import { rows, accRows } from "../main.js";

let templateBinary = null;
let excelTemplateBuffer = null;
let accTemplateBinary = null;

export async function loadTemplates() {
  const word = fetch("templates/ot-template.docx").then(res => res.arrayBuffer()).then(buf => {
    templateBinary = buf;
    enable("generateWord");
  });

  const excel = fetch("templates/ot-template.xlsx").then(res => res.arrayBuffer()).then(buf => {
    excelTemplateBuffer = buf;
    enable("generateExcel");
  });

  const acc = fetch("templates/acc-template.docx").then(res => res.arrayBuffer()).then(buf => {
    accTemplateBinary = buf;
    enable("generateAccWord");
  });

  await Promise.all([word, excel, acc]);
}

function enable(id) {
  const btn = document.getElementById(id);
  if (btn) btn.disabled = false;
}

export function generateWordFromTemplate(data, isAcc = false) {
  const template = isAcc ? accTemplateBinary : templateBinary;
  if (!template || data.length === 0) {
    alert("Template not loaded or data missing.");
    return;
  }

  const zip = new PizZip(new Uint8Array(template));
  const doc = new window.docxtemplater().loadZip(zip).setOptions({
    delimiters: { start: "[[", end: "]]" }
  });

  const isOt = !isAcc;
  const payload = isOt
    ? {
        date_period: `${document.getElementById("period_month").value} ${document.getElementById("period_range").value}, ${document.getElementById("period_year").value}`,
        date_application: new Date(document.getElementById("date_application").value).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
        full_name: "Lian Paul Molo",
        ot_entries: data,
      }
    : {
        date_period: `${document.getElementById("acc_month").value} ${document.getElementById("acc_day_range").value}, ${document.getElementById("acc_year").value}`,
        full_name: "Lian Paul Molo",
        ac_entries: data,
      };

  try {
    doc.setData(payload).render();
    const out = doc.getZip().generate({ type: "blob" });
    const filename = isAcc ? "Accomplishment" : "OT-Sheet";
    saveAs(out, `${filename}.docx`);
  } catch (e) {
    console.error(e);
    alert("Error generating Word document.");
  }
}

export async function generateExcelFromTemplate(data) {
  if (!excelTemplateBuffer) {
    alert("Excel template not loaded.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(excelTemplateBuffer);
  const worksheet = workbook.worksheets[0];
  const startRow = 10;

  data.forEach((entry, i) => {
    const row = startRow + i;
    const write = (cell, value) => {
      const ref = worksheet.getCell(cell);
      const style = { ...ref.style };
      ref.value = value;
      ref.style = style;
    };

    write(`A${row}`, entry.full_day);
    write(`B${row}`, entry.day_of_week);
    write(`C${row}`, entry.time_from);
    write(`D${row}`, entry.time_to);
    write(`E${row}`, entry.specific_work);
  });

  const period = `${document.getElementById("period_month").value} ${document.getElementById("period_range").value}, ${document.getElementById("period_year").value}`;
  worksheet.getCell("G5").value = period;

  const appDate = new Date(document.getElementById("date_application").value);
  worksheet.getCell("G4").value = appDate.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

  const buffer = await workbook.xlsx.writeBuffer();
  const safePeriod = period.replace(/[^a-zA-Z0-9]/g, "_");
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `OT-Sheet_${safePeriod}.xlsx`);
}


