import * as d3 from "d3";
import { useState, useEffect, useRef } from "react";
import { Download } from "lucide-react";

const getMargin = (rotateLabels: boolean, hasXAxisLabel: boolean, hasYAxisLabel: boolean) => ({
  top: 20,
  right: 30,
  bottom: rotateLabels ? (hasXAxisLabel ? 100 : 80) : hasXAxisLabel ? 80 : 60,
  left: hasYAxisLabel ? 80 : 60,
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
  preserveOrder?: boolean; // Se deve preservar a ordem original dos dados
  showExportButton?: boolean; // Se deve mostrar botão de exportar
  chartTitle?: string; // Título para o arquivo exportado
  xAxisLabel?: string; // Título do eixo X
  yAxisLabel?: string; // Título do eixo Y
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

export const Barplot = ({
  data,
  valueLabel = "Valor",
  itemLabel = "Linha",
  rotateLabels = false,
  preserveOrder = false,
  showExportButton = false,
  chartTitle = "grafico",
  xAxisLabel,
  yAxisLabel,
}: BarplotProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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
  const MARGIN = getMargin(rotateLabels, !!xAxisLabel, !!yAxisLabel);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const sortedData = preserveOrder ? data : data.sort((a, b) => b.value - a.value);
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

  // Função para exportar o gráfico como PNG
  const exportToPNG = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const img = new Image();

    // Definir tamanho do canvas
    canvas.width = width;
    canvas.height = height;

    // Fundo branco para o gráfico
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      // Criar link para download
      const link = document.createElement("a");
      link.download = `${chartTitle.replace(/\s+/g, "_").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    // Converter SVG para data URL
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    img.src = svgUrl;
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
            fill="var(--foreground)"
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
          fill="var(--muted-foreground)"
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
  const gridLines = yScale.ticks(6).map((value, i) => (
    <g key={i}>
      <line
        x1={0}
        x2={boundsWidth}
        y1={yScale(value)}
        y2={yScale(value)}
        stroke="#e2e8f0"
        strokeWidth={1}
        opacity={1}
        strokeDasharray={value === 0 ? "none" : "2,2"}
      />
      <text x={-10} y={yScale(value)} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#64748b">
        {formatValue(value)}
      </text>
    </g>
  ));

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Botão de exportar */}
      {showExportButton && (
        <button
          onClick={exportToPNG}
          className="absolute top-0 right-0 z-20 p-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
          title="Exportar como PNG"
        >
          <Download className="w-4 h-4 text-gray-600" />
        </button>
      )}

      <svg ref={svgRef} width={width} height={height} className="overflow-visible">
        <g width={boundsWidth} height={boundsHeight} transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {gridLines}
          {allShapes}

          {/* Label do eixo X */}
          {xAxisLabel && (
            <text
              x={boundsWidth / 2}
              y={boundsHeight + (rotateLabels ? 70 : 50)}
              textAnchor="middle"
              fontSize={12}
              style={{
                fill: "var(--muted-foreground)",
                fontWeight: "500",
              }}
            >
              {xAxisLabel}
            </text>
          )}

          {/* Label do eixo Y */}
          {yAxisLabel && (
            <text
              x={-MARGIN.left + 15}
              y={boundsHeight / 1.75}
              textAnchor="middle"
              fontSize={12}
              style={{
                fill: "var(--muted-foreground)",
                fontWeight: "500",
              }}
              transform={`rotate(-90, ${-MARGIN.left + 15}, ${boundsHeight / 2})`}
            >
              {yAxisLabel}
            </text>
          )}
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
                {itemLabel ? `${itemLabel} ${sortedData[hoveredIndex].name}` : sortedData[hoveredIndex].name}
              </div>
              {sortedData[hoveredIndex].isHighlighted && (
                <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">Selecionada</div>
              )}
            </div>
            {sortedData[hoveredIndex].fullName &&
              sortedData[hoveredIndex].fullName !== sortedData[hoveredIndex].name && (
                <div className="text-muted-foreground text-xs">{sortedData[hoveredIndex].fullName}</div>
              )}
            <div className="text-foreground">
              <span className="text-muted-foreground">{valueLabel}:</span>{" "}
              <span className="font-medium">{formatFullValue(sortedData[hoveredIndex].value)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
