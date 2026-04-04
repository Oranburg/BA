import { useState } from "react";
import ReactMarkdown from "react-markdown";

const TABS = ["Overview", "Comms Log", "Ledger Fragment", "Evidence"];

const SAMPLE_CONTENT = {
  Overview: `# Case File: Zeeva v. Sammy\n\n**Matter:** Attribution of AI "hallucination" under Respondeat Superior\n\n**Facts:** Zeeva's Architect AI (a non-human agent) generated an erroneous legal memo that caused a third party to enter a losing transaction.\n\n**Issue:** Is Zeeva (Principal) liable for the Architect AI's (Agent) errors?\n\n**Relevant Law:** RSA § 7.07 — Employer subject to vicarious liability for torts of employees acting within scope of employment.`,
  "Comms Log": `## Neural-Link Handshake Log\n\n\`\`\`\n[2025-01-15 09:23:11] ZEEVA → ARCHITECT_AI: "Draft memo re: merger terms"\n[2025-01-15 09:23:45] ARCHITECT_AI: "Manifest intent confirmed. Executing task."\n[2025-01-15 09:31:02] ARCHITECT_AI → ZEEVA: "Memo complete. Transmitted to Third Party."\n[2025-01-15 09:31:15] THIRD_PARTY: "Memo received. Relying on analysis."\n[2025-01-15 11:42:00] THIRD_PARTY: "ERROR: Memo contained material misstatements."\n\`\`\``,
  "Ledger Fragment": `## Transaction Ledger — Partial\n\n| Date | Entry | Debit | Credit |\n|------|-------|-------|--------|\n| 01/15 | AI-Memo Fee | $500 | — |\n| 01/15 | Third Party Escrow | — | $250,000 |\n| 01/15 | Third Party Loss | $250,000 | — |\n\n**Net Loss to Third Party:** $250,000\n\n*Note: Ledger fragment recovered from encrypted partition.*`,
  Evidence: `## Evidence Summary\n\n- **Exhibit A:** Neural-link handshake logs (authenticated)\n- **Exhibit B:** Architect AI configuration file (shows Zeeva as Principal)\n- **Exhibit C:** Third Party reliance letter\n- **Exhibit D:** RSA § 1.01 (Agency definition)\n- **Exhibit E:** RSA § 7.07 (Respondeat Superior)\n\n> *"The control test is satisfied when the Principal retains the right to control the manner and means of the Agent's performance."*`,
};

export default function InvestigationDesk() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="bg-white dark:bg-sprawl-deep-blue/80 border border-gray-200 dark:border-sprawl-yellow/20 rounded-lg overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-sprawl-yellow/20 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-headline uppercase tracking-wider text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-sprawl-yellow/10 text-sprawl-yellow border-b-2 border-sprawl-yellow"
                : "text-gray-500 dark:text-gray-400 hover:text-sprawl-deep-blue dark:hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-5 prose prose-sm dark:prose-invert max-w-none font-body text-sm">
        <ReactMarkdown>{SAMPLE_CONTENT[activeTab]}</ReactMarkdown>
      </div>
    </div>
  );
}
