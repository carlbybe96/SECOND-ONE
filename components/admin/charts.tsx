/**
 * Graphiques simples en HTML (une seule série par graphique, couleur de marque).
 * Valeur au survol pour chaque barre ; seule la valeur marquante est écrite en permanence.
 */

export function Columns({
  data,
  format,
  highlightLast = true,
}: {
  data: { label: string; value: number; hint?: string }[];
  format: (n: number) => string;
  highlightLast?: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const maxIndex = data.findIndex((d) => d.value === max);
  return (
    <div className="cols" role="img" aria-label={data.map((d) => `${d.hint ?? d.label} : ${format(d.value)}`).join(", ")}>
      <div className="cols-plot">
        {data.map((d, i) => {
          const labelled = i === maxIndex || (highlightLast && i === data.length - 1);
          return (
            <div className="col" key={`${d.label}-${i}`}>
              <span className="col-tip">
                {d.hint ?? d.label} · <b>{format(d.value)}</b>
              </span>
              {labelled && d.value > 0 && <span className="col-val">{format(d.value)}</span>}
              <span className="col-bar" style={{ height: `${Math.max(d.value > 0 ? 3 : 0, (d.value / max) * 100)}%` }} />
            </div>
          );
        })}
      </div>
      <div className="cols-axis">
        {data.map((d, i) => (
          <span key={`${d.label}-${i}`}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function HBars({ data, format = (n) => String(n) }: { data: { label: string; count: number }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="hbars">
      {data.map((d) => (
        <div className="hbar" key={d.label} title={`${d.label} : ${format(d.count)}`}>
          <span className="hb-label">{d.label}</span>
          <span className="hb-track">
            <span className="hb-fill" style={{ width: `${(d.count / max) * 100}%` }} />
          </span>
          <span className="hb-val">{format(d.count)}</span>
        </div>
      ))}
    </div>
  );
}
