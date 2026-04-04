import { useState } from "react";

const DEFAULTS = {
  party: "Zeeva",
  standard: "reasonably believed",
  authority: "actual authority",
  outcome: "is liable",
  damages: "compensatory damages",
};

function SelectField({ field, options, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className="inline-block bg-sprawl-yellow/20 border-b-2 border-sprawl-yellow text-sprawl-deep-blue dark:text-sprawl-yellow font-headline uppercase tracking-wider text-sm px-2 py-0.5 mx-1 focus:outline-none rounded-sm"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-sprawl-deep-blue text-white normal-case">
          {o}
        </option>
      ))}
    </select>
  );
}

export default function MadLibsHolding() {
  const [form, setForm] = useState(DEFAULTS);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
    setSubmitted(false);
  }

  return (
    <div className="bg-white dark:bg-sprawl-deep-blue/80 border border-gray-200 dark:border-sprawl-yellow/20 rounded-lg p-6">
      <h3 className="font-headline text-lg uppercase tracking-wider text-sprawl-deep-blue dark:text-sprawl-yellow mb-1">
        Mad-Libs Holding
      </h3>
      <p className="font-ui text-sm text-gray-500 dark:text-gray-400 mb-5">
        Draft the court's final judgment using inline menus
      </p>

      <div className="font-body text-base leading-relaxed text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-sprawl-deep-blue/50 rounded p-4 border border-gray-200 dark:border-gray-700">
        <p>
          The Court holds that
          <SelectField field="party" options={["Zeeva", "Sammy", "The Partnership", "The Corporation", "The LLC"]} value={form.party} onChange={handleChange} />
          <SelectField field="standard" options={["reasonably believed", "knew or should have known", "intentionally caused", "negligently allowed"]} value={form.standard} onChange={handleChange} />
          the agent acted with
          <SelectField field="authority" options={["actual authority", "apparent authority", "inherent authority", "no authority"]} value={form.authority} onChange={handleChange} />
          . Therefore, the defendant
          <SelectField field="outcome" options={["is liable", "is not liable", "is jointly liable", "is vicariously liable"]} value={form.outcome} onChange={handleChange} />
          and must pay
          <SelectField field="damages" options={["compensatory damages", "punitive damages", "nominal damages", "restitution", "no damages"]} value={form.damages} onChange={handleChange} />.
        </p>
      </div>

      <button
        onClick={() => setSubmitted(true)}
        className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase tracking-wider text-sm rounded hover:bg-sprawl-yellow/80 transition-all"
      >
        Submit Holding
      </button>

      {submitted && (
        <div className="mt-3 p-3 bg-sprawl-teal/10 border border-sprawl-teal rounded">
          <p className="font-ui text-sm text-sprawl-teal">
            ✓ Holding recorded. Compare your analysis with the model answer.
          </p>
        </div>
      )}
    </div>
  );
}
