export type Option = {
  value: string;
  label?: string;
  icon?: string;
  hint?: string;
};

export function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="choices">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`choice${value === o.value ? " sel" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <span className="ico">{o.icon}</span>}
          <span>
            {o.label ?? o.value}
            {o.hint && <small>{o.hint}</small>}
          </span>
          <div className="chk">✓</div>
        </button>
      ))}
    </div>
  );
}

export function ChipRow({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="chip-row">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`chip${value === o.value ? " sel" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.icon ? `${o.icon} ${o.label ?? o.value}` : (o.label ?? o.value)}
        </button>
      ))}
    </div>
  );
}

export function RowLabel({ children }: { children: React.ReactNode }) {
  return <div className="row-label">{children}</div>;
}