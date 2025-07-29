import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Download } from "lucide-react";

const MARGIN = { top: 30, right: 30, bottom: 60, left: 60 };

type DataPoint = { x: number; y: number; label?: string };

type AreaChartProps = {
  data: DataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  showExportButton?: boolean;
  chartTitle?: string;
};

export const AreaChart = ({
  data,
  xAxisLabel = "",
  yAxisLabel = "",
  className = "",
  showExportButton = false,
  chartTitle = "grafico_tendencia",
}: AreaChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Responsivo - observa mudanças no tamanho do container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: Math.max(400, width), height: 400 });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { width, height } = dimensions;
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Escalas
  const yMax = d3.max(data, (d) => d.y) || 0;
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, yMax * 1.1]) // Adiciona 10% de margem no topo
      .range([boundsHeight, 0]);
  }, [boundsHeight, yMax]);

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([0, boundsWidth]);
  }, [boundsWidth, data.length]);

  // Construção da área e linha
  const areaBuilder = d3
    .area<DataPoint>()
    .x((d, i) => xScale(i))
    .y1((d) => yScale(d.y))
    .y0(yScale(0))
    .curve(d3.curveCardinal);

  const lineBuilder = d3
    .line<DataPoint>()
    .x((d, i) => xScale(i))
    .y((d) => yScale(d.y))
    .curve(d3.curveCardinal);

  const areaPath = areaBuilder(data);
  const linePath = lineBuilder(data);

  // Função para detectar hover baseado na posição X do mouse
  const handleMouseMoveInChart = (event: React.MouseEvent<SVGGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - MARGIN.left;

    // Converter posição X do mouse para índice do dado
    const index = Math.round(xScale.invert(mouseX));

    if (index >= 0 && index < data.length) {
      setHoveredIndex(index);
    } else {
      setHoveredIndex(null);
    }

    // Atualizar posição do mouse para o tooltip (relativo ao container)
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setMousePos({
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top,
      });
    }
  };

  // Função para exportar como PNG
  const exportToPNG = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const img = new Image();
    canvas.width = width;
    canvas.height = height;

    // Fundo branco
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `${chartTitle.replace(/\s+/g, "_").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    img.src = svgUrl;
  };

  // Função para formatar a data no formato solicitado
  const formatDateForTooltip = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00"); // Adicionar hora para evitar problemas de timezone
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return `${monthNames[date.getMonth()]}/${date.getFullYear()}`;
  };

  // Renderização dos eixos
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Limpar eixos anteriores
    svg.select(".x-axis").remove();
    svg.select(".y-axis").remove();
    svg.select(".x-axis-label").remove();
    svg.select(".y-axis-label").remove();

    // Eixo X
    const xAxisGenerator = d3
      .axisBottom(xScale)
      .ticks(Math.min(data.length, 10))
      .tickFormat((d) => {
        const index = Number(d);
        if (data[index]?.label) {
          // Formatar a data para exibir como "jun/2024"
          const date = new Date(data[index].label + "T00:00:00");
          const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
          return `${monthNames[date.getMonth()]}/${date.getFullYear()}`;
        }
        return (index + 1).toString();
      });

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(${MARGIN.left}, ${height - MARGIN.bottom})`)
      .call(xAxisGenerator)
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", "12px");

    // Eixo Y
    const yAxisGenerator = d3.axisLeft(yScale).ticks(5);
    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)
      .call(yAxisGenerator)
      .selectAll("text")
      .style("font-size", "12px");

    // Labels dos eixos
    if (xAxisLabel) {
      svg
        .append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", MARGIN.left + boundsWidth / 2)
        .attr("y", height - 10)
        .style("font-size", "14px")
        .style("fill", "#666")
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      svg
        .append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .attr("x", -MARGIN.top - boundsHeight / 2)
        .attr("y", 15)
        .style("font-size", "14px")
        .style("fill", "#666")
        .text(yAxisLabel);
    }
  }, [xScale, yScale, boundsHeight, boundsWidth, height, data, xAxisLabel, yAxisLabel]);

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
        opacity={0.8}
        strokeDasharray={value === 0 ? "none" : "2,2"}
      />
    </g>
  ));

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-80 text-gray-500 ${className}`}>Sem dados para exibir</div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full relative ${className}`}>
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
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1976d2" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#1976d2" stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Grid lines */}
          {gridLines}

          {/* Área */}
          {areaPath && <path d={areaPath} fill="url(#areaGradient)" stroke="none" />}

          {/* Linha */}
          {linePath && <path d={linePath} fill="none" stroke="#1976d2" strokeWidth={3} />}

          {/* Área invisível para detectar hover */}
          <rect
            width={boundsWidth}
            height={boundsHeight}
            fill="transparent"
            onMouseMove={handleMouseMoveInChart}
            onMouseLeave={() => setHoveredIndex(null)}
          />

          {/* Pontos */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={xScale(i)}
              cy={yScale(d.y)}
              r={hoveredIndex === i ? 6 : 4}
              fill="#1976d2"
              stroke="white"
              strokeWidth={2}
              style={{
                transition: "all 0.2s ease-in-out",
                pointerEvents: "none", // Para não interferir com a detecção de hover da área
              }}
            />
          ))}

          {/* Linha vertical de indicação no hover */}
          {hoveredIndex !== null && (
            <line
              x1={xScale(hoveredIndex)}
              x2={xScale(hoveredIndex)}
              y1={0}
              y2={boundsHeight}
              stroke="#1976d2"
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.7}
            />
          )}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="absolute z-10 bg-popover border border-border rounded-lg shadow-lg p-3 text-sm pointer-events-none"
          style={{
            left: Math.min(mousePos.x + 10, width - 200),
            top: Math.max(mousePos.y - 60, 10),
            minWidth: "150px",
          }}
        >
          <div className="space-y-1">
            <div className="font-semibold text-foreground">
              {data[hoveredIndex].label
                ? formatDateForTooltip(data[hoveredIndex].label!)
                : `Período ${hoveredIndex + 1}`}
            </div>
            <div className="text-foreground">
              <span className="text-muted-foreground">Ocorrências:</span>{" "}
              <span className="font-medium">{data[hoveredIndex].y.toLocaleString("pt-BR")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
