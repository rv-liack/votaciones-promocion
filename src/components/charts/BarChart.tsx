// Gráfico de barras SVG sin librerías externas.
interface Bar {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: Bar[];
  maxValue?: number;
  unit?: string;
  height?: number;
}

export function BarChart({ data, maxValue, unit = '', height = 200 }: Props) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  const barWidth = 48;
  const gap = 24;
  const labelHeight = 40;
  const chartHeight = height;
  const totalWidth = data.length * (barWidth + gap) + gap;
  const svgHeight = chartHeight + labelHeight;

  return (
    <svg
      width="100%"
      height={svgHeight}
      viewBox={`0 0 ${totalWidth} ${svgHeight}`}
      role="img"
      aria-label="Gráfico de barras"
      className="overflow-visible"
    >
      {data.map((d, i) => {
        const barHeight = max > 0 ? (d.value / max) * chartHeight : 0;
        const x = gap + i * (barWidth + gap);
        const y = chartHeight - barHeight;
        const color = d.color ?? 'rgb(var(--primary))';
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={4}
              className="transition-all hover:opacity-80"
            >
              <title>{`${d.label}: ${d.value}${unit}`}</title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={chartHeight + 16}
              textAnchor="middle"
              className="fill-current font-mono text-[10px] text-secondary"
            >
              {d.label.length > 12 ? d.label.slice(0, 10) + '…' : d.label}
            </text>
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              className="fill-current font-mono text-[11px] text-primary"
            >
              {d.value}{unit}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
