import { useMemo, useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import styles from "./pie-chart.module.css";

export type PieChartDataItem = {
  name: string;
  value: number;
  id?: number;
  fullName?: string;
};

type PieChartProps = {
  data: PieChartDataItem[];
  valueLabel?: string;
};

const MARGIN_X = 80;
const MARGIN_Y = 30;
const INFLEXION_PADDING = 15;

const colors = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#6d28d9",
  "#059669",
  "#dc2626",
];

// Função para formatar números grandes
const formatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString("pt-BR");
};

// Função para formatar valor completo
const formatFullValue = (value: number): string => {
  return value.toLocaleString("pt-BR");
};

export const PieChart = ({ data, valueLabel = "Quantidade" }: PieChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({
          width: offsetWidth || 400,
          height: offsetHeight || 300,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const { width, height } = dimensions;
  const radius = Math.min(width - 2 * MARGIN_X, height - 2 * MARGIN_Y) / 2;

  const pie = useMemo(() => {
    const pieGenerator = d3.pie<unknown, PieChartDataItem>().value((d) => d.value);
    return pieGenerator(data);
  }, [data]);

  const arcGenerator = d3.arc();

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const shapes = pie.map((grp, i) => {
    const isHovered = hoveredIndex === i;
    const outerRadius = isHovered ? radius + 5 : radius;

    const sliceInfo = {
      innerRadius: 0,
      outerRadius: outerRadius,
      startAngle: grp.startAngle,
      endAngle: grp.endAngle,
    };

    const centroid = arcGenerator.centroid(sliceInfo);
    const slicePath = arcGenerator(sliceInfo);

    const inflexionInfo = {
      innerRadius: radius + INFLEXION_PADDING,
      outerRadius: radius + INFLEXION_PADDING,
      startAngle: grp.startAngle,
      endAngle: grp.endAngle,
    };
    const inflexionPoint = arcGenerator.centroid(inflexionInfo);

    const isRightLabel = inflexionPoint[0] > 0;
    const labelPosX = inflexionPoint[0] + 30 * (isRightLabel ? 1 : -1);
    const textAnchor = isRightLabel ? "start" : "end";

    // Label mais limpo e com truncamento se necessário
    const maxLabelLength = 20;
    const truncatedName =
      grp.data.name.length > maxLabelLength ? `${grp.data.name.substring(0, maxLabelLength)}...` : grp.data.name;
    const label = `${truncatedName} (${formatValue(grp.data.value)})`;

    return (
      <g
        key={i}
        className={styles.slice}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setHoveredIndex(i)}
        onMouseLeave={() => setHoveredIndex(null)}
        onMouseMove={handleMouseMove}
      >
        <path
          d={slicePath || ""}
          fill={colors[i % colors.length] || colors[0]}
          stroke="white"
          strokeWidth={2}
          style={{
            transition: "all 0.2s ease-in-out",
            filter: isHovered ? "brightness(1.1)" : "none",
          }}
        />

        {/* Ponto central */}
        <circle cx={centroid[0]} cy={centroid[1]} r={2} fill="var(--foreground)" />

        {/* Linha de conexão */}
        <line
          x1={centroid[0]}
          y1={centroid[1]}
          x2={inflexionPoint[0]}
          y2={inflexionPoint[1]}
          stroke="var(--muted-foreground)"
          strokeWidth={1}
        />

        {/* Linha horizontal */}
        <line
          x1={inflexionPoint[0]}
          y1={inflexionPoint[1]}
          x2={labelPosX}
          y2={inflexionPoint[1]}
          stroke="var(--muted-foreground)"
          strokeWidth={1}
        />

        {/* Label */}
        <text
          x={labelPosX + (isRightLabel ? 2 : -2)}
          y={inflexionPoint[1]}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fontSize={12}
          fill="var(--foreground)"
          fontWeight="500"
        >
          {label}
        </text>
      </g>
    );
  });

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg width={width} height={height} className="overflow-hidden">
        <g transform={`translate(${width / 2}, ${height / 2})`} className={styles.container}>
          {shapes}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="absolute z-10 bg-popover border border-border rounded-lg shadow-lg p-3 text-sm pointer-events-none"
          style={{
            left: Math.min(mousePos.x + 10, width - 200),
            top: Math.max(mousePos.y - 80, 10),
            minWidth: "180px",
          }}
        >
          <div className="space-y-1">
            <div className="font-semibold text-foreground">{pie[hoveredIndex].data.name}</div>
            {pie[hoveredIndex].data.fullName && (
              <div className="text-muted-foreground text-xs">{pie[hoveredIndex].data.fullName}</div>
            )}
            <div className="text-foreground">
              <span className="text-muted-foreground">{valueLabel}:</span>{" "}
              <span className="font-medium">{formatFullValue(pie[hoveredIndex].data.value)}</span>
            </div>
            <div className="text-muted-foreground text-xs">
              Porcentagem:{" "}
              {((pie[hoveredIndex].data.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
            </div>
            {pie[hoveredIndex].data.id && (
              <div className="text-muted-foreground text-xs">ID: {pie[hoveredIndex].data.id}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
