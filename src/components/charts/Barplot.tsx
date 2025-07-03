import * as d3 from "d3";
import { useState, useEffect, useRef } from "react";

const getMargin = (rotateLabels: boolean) => ({
  top: 20,
  right: 30,
  bottom: rotateLabels ? 80 : 60,
  left: 60,
});
const BAR_PADDING = 0.2;

export type BarplotDataItem = {
  name: string;
  value: number;
  fullName?: string; // Nome completo para tooltip
  id?: number; // ID do item
  isHighlighted?: boolean; // Se o item deve ser destacado
};

type BarplotProps = {
  data: BarplotDataItem[];
  valueLabel?: string; // Label para o valor no tooltip (ex: "Passageiros", "Viagens")
  itemLabel?: string; // Label para o item no tooltip (ex: "Linha", "Bairro")
  rotateLabels?: boolean; // Se deve rotacionar as labels do eixo X em 45°
};

// Função para formatar números grandes
const formatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString("pt-BR");
};

// Função para formatar valor completo para tooltip
const formatFullValue = (value: number): string => {
  return value.toLocaleString("pt-BR");
};

export const Barplot = ({ data, valueLabel = "Valor", itemLabel = "Linha", rotateLabels = false }: BarplotProps) => {
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
  const MARGIN = getMargin(rotateLabels);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const sortedData = data.sort((a, b) => b.value - a.value);
  const groups = sortedData.map((d) => d.name);

  const xScale = d3.scaleBand().domain(groups).range([0, boundsWidth]).padding(BAR_PADDING);

  const max = d3.max(sortedData.map((d) => d.value)) ?? 10;
  const yScale = d3
    .scaleLinear()
    .domain([0, max * 1.1])
    .range([boundsHeight, 0]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const allShapes = sortedData.map((d, i) => {
    const x = xScale(d.name);
    if (x === undefined) return null;

    const isHovered = hoveredIndex === i;
    const isHighlighted = d.isHighlighted || false;
    const barHeight = boundsHeight - yScale(d.value);

    // Definir cores baseadas no estado
    let fillColor = "#2196f3"; // Cor padrão
    let strokeColor = "#1976d2"; // Stroke padrão

    if (isHighlighted) {
      fillColor = "#ff9800"; // Laranja para destacar
      strokeColor = "#f57c00";
    }

    if (isHovered) {
      fillColor = isHighlighted ? "#ffb74d" : "#1976d2";
      strokeColor = isHighlighted ? "#ff9800" : "#2196f3";
    }

    return (
      <g key={i}>
        {/* Barra principal */}
        <rect
          x={x}
          y={yScale(d.value)}
          width={xScale.bandwidth()}
          height={barHeight}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isHighlighted ? 2 : 1}
          rx={2}
          style={{
            transition: "all 0.2s ease-in-out",
            cursor: "pointer",
            filter: isHovered ? "brightness(1.1)" : "none",
          }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
          onMouseMove={handleMouseMove}
        />

        {/* Valor acima da barra (apenas se não estiver muito próximo) */}
        {barHeight > 20 && (
          <text
            x={x + xScale.bandwidth() / 2}
            y={yScale(d.value) - 5}
            textAnchor="middle"
            fontSize={10}
            fill="hsl(var(--foreground))"
            fontWeight="500"
            style={{ pointerEvents: "none" }}
          >
            {formatValue(d.value)}
          </text>
        )}

        {/* Label do eixo X */}
        <text
          x={x + xScale.bandwidth() / 2}
          y={boundsHeight + (rotateLabels ? 35 : 15)}
          textAnchor={rotateLabels ? "end" : "middle"}
          fontSize={11}
          fill="hsl(var(--muted-foreground))"
          fontWeight="500"
          style={{ pointerEvents: "none" }}
          transform={rotateLabels ? `rotate(-45, ${x + xScale.bandwidth() / 2}, ${boundsHeight + 35})` : undefined}
        >
          {d.name}
        </text>
      </g>
    );
  });

  // Grid lines para melhor legibilidade
  const gridLines = yScale.ticks(5).map((value, i) => (
    <g key={i}>
      <line
        x1={0}
        x2={boundsWidth}
        y1={yScale(value)}
        y2={yScale(value)}
        stroke="hsl(var(--border))"
        strokeWidth={0.5}
        opacity={0.3}
      />
      <text
        x={-10}
        y={yScale(value)}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={9}
        fill="hsl(var(--muted-foreground))"
      >
        {formatValue(value)}
      </text>
    </g>
  ));

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg width={width} height={height} className="overflow-visible">
        <g width={boundsWidth} height={boundsHeight} transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {gridLines}
          {allShapes}
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
            <div className="flex items-center gap-2">
              <div className="font-semibold text-foreground">
                {itemLabel} {sortedData[hoveredIndex].name}
              </div>
              {sortedData[hoveredIndex].isHighlighted && (
                <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">Selecionada</div>
              )}
            </div>
            {sortedData[hoveredIndex].fullName && (
              <div className="text-muted-foreground text-xs">{sortedData[hoveredIndex].fullName}</div>
            )}
            <div className="text-foreground">
              <span className="text-muted-foreground">{valueLabel}:</span>{" "}
              <span className="font-medium">{formatFullValue(sortedData[hoveredIndex].value)}</span>
            </div>
            {sortedData[hoveredIndex].id && (
              <div className="text-muted-foreground text-xs">ID: {sortedData[hoveredIndex].id}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
