import { useState } from "react";
import { getStudentEmail, setStudentEmail, clearStudentEmail } from "../../learning/progressSync";

export default function StudentIdentity() {
  const [email, setEmail] = useState(getStudentEmail() || "");
  const [saved, setSaved] = useState(!!getStudentEmail());
  const [editing, setEditing] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) return;
    setStudentEmail(trimmed);
    setSaved(true);
    setEditing(false);
  }

  function handleClear() {
    clearStudentEmail();
    setEmail("");
    setSaved(false);
    setEditing(false);
  }

  if (saved && !editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-ui text-sm text-gray-400 truncate max-w-[140px]" title={getStudentEmail()}>
          {getStudentEmail()}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="font-ui text-sm text-sprawl-yellow/60 hover:text-sprawl-yellow"
          aria-label="Change email"
        >
          edit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.edu"
        className="w-36 rounded border border-sprawl-yellow/30 bg-transparent px-2 py-1 font-ui text-sm text-white placeholder-gray-600 focus-visible:outline focus-visible:outline-1 focus-visible:outline-sprawl-yellow"
        aria-label="Student email for progress tracking"
      />
      <button
        type="submit"
        className="rounded border border-sprawl-yellow/40 px-2 py-1 font-ui text-sm text-sprawl-yellow hover:bg-sprawl-yellow/10"
      >
        Save
      </button>
      {saved && (
        <button
          type="button"
          onClick={handleClear}
          className="font-ui text-sm text-gray-500 hover:text-gray-300"
        >
          clear
        </button>
      )}
    </form>
  );
}
