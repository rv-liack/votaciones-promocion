// Gráfico de torta SVG sin librerías externas.
interface Slice {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Slice[];
  size?: number;
}

export function PieChart({ data, size = 220 }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2;
  const strokeWidth = 2;
  const cx = radius;
  const cy = radius;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Sin datos">
        <circle cx={cx} cy={cy} r={radius - strokeWidth} fill="none" stroke="rgb(var(--edge))" strokeWidth={strokeWidth} />
      </svg>
    );
  }

  let cumulative = 0;
  const slices = data.map((d) => {
    const fraction = d.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += fraction;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + (radius - strokeWidth) * Math.cos(startAngle);
    const y1 = cy + (radius - strokeWidth) * Math.sin(startAngle);
    const x2 = cx + (radius - strokeWidth) * Math.cos(endAngle);
    const y2 = cy + (radius - strokeWidth) * Math.sin(endAngle);

    const largeArc = fraction > 0.5 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius - strokeWidth} ${radius - strokeWidth} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { ...d, path, fraction };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Gráfico de torta: distribución de votos">
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            stroke="rgb(var(--surface))"
            strokeWidth={1}
            className="transition-opacity hover:opacity-80"
          >
            <title>{`${s.label}: ${s.value} votos (${(s.fraction * 100).toFixed(1)}%)`}</title>
          </path>
        ))}
      </svg>
      <ul className="flex flex-col gap-2 text-sm">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden />
            <span className="text-secondary">{s.label}</span>
            <span className="ml-auto font-mono text-xs text-primary">
              {s.value} ({(s.fraction * 100).toFixed(1)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
