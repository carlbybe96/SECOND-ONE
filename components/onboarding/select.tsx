import { Check } from "lucide-react";

export type Option = {
  value: string;
  label?: string;
  icon?: string;
  hint?: string;
};

export function ChoiceGrid({ options, value, onChange }: { options: Option[]; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="choices">
      {options.map((o) => (
        <button key={o.value} type="button" className={`choice${value === o.value ? " sel" : ""}`} onClick={() => onChange(o.value)} aria-pressed={value === o.value}>
          {o.icon && <span className="ico">{o.icon}</span>}
          <span>
            {o.label ?? o.value}
            {o.hint && <small>{o.hint}</small>}
          </span>
          <span className="chk">
            <Check size={13} strokeWidth={3} />
          </span>
        </button>
      ))}
    </div>
  );
}

export function ChipRow({ options, value, onChange }: { options: Option[]; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="chip-row">
      {options.map((o) => (
        <button key={o.value} type="button" className={`chip${value === o.value ? " sel" : ""}`} onClick={() => onChange(o.value)} aria-pressed={value === o.value}>
          {o.icon ? `${o.icon} ${o.label ?? o.value}` : (o.label ?? o.value)}
        </button>
      ))}
    </div>
  );
}

/** Puces à choix multiples. */
export function MultiChips({ options, values, onChange }: { options: Option[]; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="chip-row">
      {options.map((o) => {
        const on = values.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            className={`chip${on ? " sel" : ""}`}
            onClick={() => onChange(on ? values.filter((v) => v !== o.value) : [...values, o.value])}
            aria-pressed={on}
          >
            {o.label ?? o.value}
          </button>
        );
      })}
    </div>
  );
}

export function RowLabel({ children }: { children: React.ReactNode }) {
  return <div className="row-label">{children}</div>;
}
