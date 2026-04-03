import { Link } from "react-router-dom";
import { DOCUMENTS } from "./corpus";

export default function TomeIndexPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-headline text-3xl uppercase tracking-wider text-sprawl-yellow">Tome Corpus Index</h1>
      <p className="mt-2 text-sm font-ui text-gray-400">What we have, which version, and coverage status.</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-sprawl-yellow/20">
        <table className="min-w-full text-sm">
          <thead className="bg-sprawl-bright-blue/20">
            <tr className="text-left font-headline uppercase tracking-wider text-xs text-sprawl-yellow">
              <th className="px-3 py-2">Document</th>
              <th className="px-3 py-2">Aliases</th>
              <th className="px-3 py-2">Version</th>
              <th className="px-3 py-2">Coverage</th>
              <th className="px-3 py-2">Cited in chapters</th>
              <th className="px-3 py-2">Last verified</th>
            </tr>
          </thead>
          <tbody>
            {DOCUMENTS.map((doc) => (
              <tr key={doc.id} className="border-t border-sprawl-yellow/10 align-top">
                <td className="px-3 py-2">
                  <Link to={`/tome/${doc.slug}`} className="font-ui text-sprawl-teal hover:underline">
                    {doc.shortName}
                  </Link>
                  <p className="font-body text-gray-200">{doc.title}</p>
                  <p className="font-ui text-xs text-gray-400">Version in use: {doc.versionInUse}</p>
                </td>
                <td className="px-3 py-2 font-ui text-gray-300">{(doc.aliases || []).join(", ")}</td>
                <td className="px-3 py-2 font-ui text-gray-300">{doc.version}</td>
                <td className="px-3 py-2">
                  <span className="rounded bg-sprawl-yellow/10 px-2 py-0.5 font-ui text-xs text-sprawl-yellow">{doc.coverage}</span>
                </td>
                <td className="px-3 py-2 font-ui text-gray-300">
                  {(doc.chapters || []).length ? doc.chapters.map((c) => `Ch. ${c}`).join(", ") : "—"}
                </td>
                <td className="px-3 py-2 font-ui text-gray-400">{doc.lastVerified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
