const COUNTRY_CODES = [
  { code: "+234", label: "\uD83C\uDDF3\uD83C\uDDEC +234" },
  { code: "+233", label: "\uD83C\uDDEC\uD83C\uDDED +233" },
  { code: "+254", label: "\uD83C\uDDF0\uD83C\uDDEA +254" },
  { code: "+27", label: "\uD83C\uDDFF\uD83C\uDDE6 +27" },
  { code: "+237", label: "\uD83C\uDDE8\uD83C\uDDF2 +237" },
  { code: "+229", label: "\uD83C\uDDE7\uD83C\uDDEF +229" },
  { code: "+228", label: "\uD83C\uDDF9\uD83C\uDDEC +228" },
  { code: "+1", label: "\uD83C\uDDFA\uD83C\uDDF8 +1" },
  { code: "+44", label: "\uD83C\uDDEC\uD83C\uDDE7 +44" },
];

function splitPhone(value: string) {
  const found = COUNTRY_CODES.find(function (c) { return value.indexOf(c.code) === 0; });
  if (found) {
    return { code: found.code, number: value.slice(found.code.length).replace(/^\s+/, "") };
  }
  return { code: "+234", number: value };
}

export function PhoneInput(props: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const parsed = splitPhone(props.value || "");

  function handleCodeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    props.onChange(e.target.value + " " + parsed.number);
  }
  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    props.onChange(parsed.code + " " + e.target.value);
  }

  return (
    <div className="flex gap-2">
      <select
        value={parsed.code}
        onChange={handleCodeChange}
        className="w-[5.5rem] shrink-0 rounded-xl border border-border bg-background px-1.5 text-sm outline-none focus:border-primary"
      >
        {COUNTRY_CODES.map(function (c) {
          return <option key={c.code} value={c.code}>{c.label}</option>;
        })}
      </select>
      <input
        type="tel"
        required={props.required}
        value={parsed.number}
        onChange={handleNumberChange}
        placeholder={props.placeholder || "080X XXX XXXX"}
        className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
