import { useState } from "react";
import { downloadCertificatePDF } from "../../learning/exportCertificate";

const STUDENT_NAME_KEY = "ba-student-name";

function getStoredName() {
  try { return localStorage.getItem(STUDENT_NAME_KEY) || ""; } catch { return ""; }
}

function storeName(name) {
  try { localStorage.setItem(STUDENT_NAME_KEY, name.trim()); } catch { /* noop */ }
}

/**
 * "Download Certificate (PDF)" button.
 * Prompts for student name on first use, then generates a branded PDF.
 *
 * Props:
 *   moduleId, chapterTitle, chapterNum, score, total
 */
export default function CertificateButton({ moduleId, chapterTitle, chapterNum, score = 0, total = 0 }) {
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [nameInput, setNameInput] = useState(getStoredName());

  async function generate(name) {
    setLoading(true);
    try {
      await downloadCertificatePDF({
        studentName: name,
        moduleId,
        chapterTitle,
        chapterNum,
        score,
        total,
      });
    } catch {
      /* silent */
    }
    setLoading(false);
  }

  function handleClick() {
    const existing = getStoredName();
    if (existing) {
      generate(existing);
    } else {
      setShowPrompt(true);
    }
  }

  function handleConfirm() {
    const val = nameInput.trim();
    if (!val) return;
    storeName(val);
    setShowPrompt(false);
    generate(val);
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-5 py-2 border border-sprawl-yellow/50 text-sprawl-yellow font-headline uppercase text-sm rounded hover:bg-sprawl-yellow/10 disabled:opacity-40 transition-all"
      >
        {loading ? "Generating..." : "Download Certificate (PDF)"}
      </button>

      {showPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-sprawl-deep-blue border border-sprawl-yellow/40 rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-headline text-sprawl-yellow uppercase tracking-wider text-lg mb-3">
              Export Certificate
            </h3>
            <p className="text-gray-300 mb-4">
              Enter your name as it should appear on the certificate:
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              placeholder="Your full name"
              autoFocus
              className="w-full px-3 py-2 bg-sprawl-deep-blue/50 border border-gray-600 rounded text-white text-base mb-4 focus:border-sprawl-yellow outline-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 border border-gray-600 text-gray-400 font-headline uppercase text-sm rounded hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-sm rounded hover:bg-sprawl-yellow/80"
              >
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
