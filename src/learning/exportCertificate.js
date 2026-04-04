/**
 * BA Certificate Export — Branded PDF via jsPDF (CDN-loaded)
 *
 * Generates a professional completion certificate when a student
 * finishes a chapter module. Called from chapter export flows.
 */

const JSPDF_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js";

let jspdfLoaded = false;

function loadJsPDF() {
  if (jspdfLoaded && window.jspdf) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = JSPDF_CDN;
    script.onload = () => { jspdfLoaded = true; resolve(); };
    script.onerror = () => reject(new Error("Failed to load jsPDF"));
    document.head.appendChild(script);
  });
}

function verificationCode(slug, name, dateStr) {
  const raw = slug + "|" + name.toLowerCase() + "|" + dateStr;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return "BA-" + Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
}

/**
 * Generate and download a branded PDF certificate.
 *
 * @param {Object} opts
 * @param {string} opts.studentName
 * @param {string} opts.moduleId - e.g. "ch01-why-law"
 * @param {string} opts.chapterTitle - e.g. "Why Law"
 * @param {number} opts.chapterNum
 * @param {number} opts.score
 * @param {number} opts.total
 */
export async function downloadCertificatePDF({
  studentName,
  moduleId,
  chapterTitle,
  chapterNum,
  score = 0,
  total = 0,
}) {
  if (!studentName) return;

  await loadJsPDF();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const code = verificationCode(moduleId, studentName, dateStr);
  const pct = total ? Math.round((score / total) * 100) : 0;

  // Background
  doc.setFillColor(10, 50, 85); // sprawl-deep-blue
  doc.rect(0, 0, W, H, "F");

  // Decorative border
  doc.setDrawColor(255, 214, 92); // sprawl-yellow
  doc.setLineWidth(1.5);
  doc.roundedRect(10, 10, W - 20, H - 20, 3, 3, "S");
  doc.setLineWidth(0.5);
  doc.roundedRect(14, 14, W - 28, H - 28, 2, 2, "S");

  // Corner accents
  doc.setDrawColor(178, 31, 44); // sprawl-deep-red
  doc.setLineWidth(0.8);
  doc.line(14, 30, 30, 14);
  doc.line(14, 35, 35, 14);
  doc.line(W - 14, 30, W - 30, 14);
  doc.line(W - 14, 35, W - 35, 14);
  doc.line(14, H - 30, 30, H - 14);
  doc.line(14, H - 35, 35, H - 14);
  doc.line(W - 14, H - 30, W - 30, H - 14);
  doc.line(W - 14, H - 35, W - 35, H - 14);

  // Header
  doc.setTextColor(255, 214, 92);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("BA: LAW OF THE FIRM", W / 2, 32, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(160, 160, 180);
  doc.text("Seth C. Oranburg \u2022 New Boston 2077", W / 2, 39, { align: "center" });

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Certificate of Completion", W / 2, 58, { align: "center" });

  // Rule
  doc.setDrawColor(255, 214, 92);
  doc.setLineWidth(0.6);
  doc.line(W / 2 - 50, 63, W / 2 + 50, 63);

  // "This certifies that"
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 200);
  doc.text("This certifies that", W / 2, 75, { align: "center" });

  // Student name
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(studentName, W / 2, 88, { align: "center" });

  const nameWidth = doc.getTextWidth(studentName);
  doc.setDrawColor(255, 214, 92);
  doc.setLineWidth(0.3);
  doc.line(W / 2 - nameWidth / 2 - 5, 91, W / 2 + nameWidth / 2 + 5, 91);

  // Completion text
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 200);
  doc.text("has successfully completed", W / 2, 102, { align: "center" });

  // Chapter title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 214, 92);
  doc.text(`Chapter ${chapterNum}: ${chapterTitle}`, W / 2, 114, { align: "center" });

  // Module ID
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 200);
  doc.text("BA: Law of the Firm", W / 2, 122, { align: "center" });

  // Score box
  if (total > 0) {
    const boxW = 70, boxH = 22, boxX = W / 2 - boxW / 2, boxY = 130;
    doc.setFillColor(15, 60, 95);
    doc.setDrawColor(255, 214, 92);
    doc.setLineWidth(0.4);
    doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, "FD");

    doc.setFontSize(9);
    doc.setTextColor(160, 160, 180);
    doc.text("SCORE", W / 2, boxY + 7, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(`${score} / ${total}  (${pct}%)`, W / 2, boxY + 17, { align: "center" });
  }

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 160, 180);
  doc.text("Completed: " + dateStr, W / 2, 165, { align: "center" });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 140);
  doc.text("Verification: " + code, W / 2, 180, { align: "center" });
  doc.text("BA: Law of the Firm \u2022 oranburg.law", W / 2, 186, { align: "center" });

  doc.save(`BA-${moduleId}-certificate.pdf`);
}
