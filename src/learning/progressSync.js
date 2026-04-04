/**
 * Sync student progress to the Quaere backend for teacher tracking.
 *
 * This sends a POST to the Quaere Activity Progress API when a student
 * completes (or updates progress on) a chapter module. The API upserts
 * by (studentEmail, moduleId), so duplicate calls are safe.
 *
 * The student's email is stored in localStorage after first prompt.
 * If no email is set, sync is silently skipped (progress still saves locally).
 *
 * The same API endpoint works for both BA (courseCode: "BA-LOTF") and
 * K/Contract Law (courseCode: "K-CONTRACTS") — just change the courseCode.
 */

const QUAERE_API = "https://quaere-1cgr.onrender.com/api/activity-progress";
const COURSE_CODE = "BA-LOTF";
const STORAGE_KEY = "ba-student-email";

export function getStudentEmail() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStudentEmail(email) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, email.trim().toLowerCase());
}

export function clearStudentEmail() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Send progress to Quaere. Called when a student completes a module.
 * Fails silently — local progress is always the source of truth.
 */
export async function syncProgress({
  moduleId,
  chapterNum,
  chapterTitle,
  completed = false,
  scores = null,
  counselNotes = null,
}) {
  const email = getStudentEmail();
  if (!email) return null;

  const body = {
    studentEmail: email,
    courseCode: COURSE_CODE,
    moduleId,
    chapterNum,
    chapterTitle,
    completed,
    scores,
    counselNotes,
  };

  try {
    const res = await fetch(QUAERE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    // Network error — silent fail, local progress is fine
    return null;
  }
}
