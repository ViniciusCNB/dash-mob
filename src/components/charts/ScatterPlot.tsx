import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { EficienciaLinha } from '@/hooks/useApiQueries';

const MARGIN = { top: 30, right: 30, bottom: 80, left: 80 };

type ScatterPlotProps = {
  data: EficienciaLinha[];
  className?: string;
};

interface TooltipData {
  x: number;
  y: number;
  data: EficienciaLinha;
  visible: boolean;
}

export const ScatterPlot = ({ data, className = "" }: ScatterPlotProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const axesRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, data: {} as EficienciaLinha, visible: false });
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const boundsWidth = dimensions.width - MARGIN.right - MARGIN.left;
  const boundsHeight = dimensions.height - MARGIN.top - MARGIN.bottom;

  // Função para ajustar dimensões
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newWidth = Math.max(600, containerWidth - 40); // Mínimo 600px, máximo o container
        setDimensions({ 
          width: newWidth, 
          height: Math.min(600, newWidth * 0.75) // Proporção 4:3, máximo 600px de altura
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calcular médias para os quadrantes
  const avgPassageirosPorKm = useMemo(() => {
    if (!data.length) return 0;
    return data.reduce((sum, d) => sum + d.passageiros_por_km, 0) / data.length;
  }, [data]);

  const avgPassageirosPorMinuto = useMemo(() => {
    if (!data.length) return 0;
    return data.reduce((sum, d) => sum + d.passageiros_por_minuto, 0) / data.length;
  }, [data]);

  // Adicionar jitter para evitar sobreposição
  const dataWithJitter = useMemo(() => {
    if (!data.length) return [];
    
    return data.map((d, index) => {
      // Usar o índice como seed para manter posições consistentes
      const seed = index * 0.1;
      const jitterX = (Math.sin(seed) * 0.5) * 0.015; // 1.5% de jitter controlado
      const jitterY = (Math.cos(seed) * 0.5) * 0.015;
      
      return {
        ...d,
        jitteredX: d.passageiros_por_minuto + jitterX,
        jitteredY: d.passageiros_por_km + jitterY
      };
    });
  }, [data]);

  // Escalas
  const xScale = useMemo(() => {
    const [xMin, xMax] = d3.extent(data, (d) => d.passageiros_por_minuto);
    const padding = (xMax! - xMin!) * 0.1;
    return d3
      .scaleLinear()
      .domain([Math.max(0, xMin! - padding), xMax! + padding])
      .range([0, boundsWidth]);
  }, [data, boundsWidth]);

  const yScale = useMemo(() => {
    const [yMin, yMax] = d3.extent(data, (d) => d.passageiros_por_km);
    const padding = (yMax! - yMin!) * 0.1;
    return d3
      .scaleLinear()
      .domain([Math.max(0, yMin! - padding), yMax! + padding])
      .range([boundsHeight, 0]);
  }, [data, boundsHeight]);

  // Escala do tamanho das bolinhas - mais variação
  const bubbleSize = useMemo(() => {
    const [min, max] = d3.extent(data, (d) => d.total_passageiros);
    return d3.scaleSqrt().domain([min || 0, max || 0]).range([4, 30]);
  }, [data]);

  // Definir cores por quadrante
  const getQuadrantColor = (d: EficienciaLinha) => {
    const isHighX = d.passageiros_por_minuto >= avgPassageirosPorMinuto;
    const isHighY = d.passageiros_por_km >= avgPassageirosPorKm;
    
    if (isHighX && isHighY) return "#22c55e"; // Verde - As melhores
    if (!isHighX && isHighY) return "#f59e0b"; // Laranja - Lentas e Lotadas
    if (!isHighX && !isHighY) return "#ef4444"; // Vermelho - Alvos de Otimização
    return "#3b82f6"; // Azul - Rápidas e Vazias
  };

  // Funções do tooltip
  const showTooltip = (event: React.MouseEvent, d: EficienciaLinha, index: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTooltip({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      data: d,
      visible: true
    });
    setHoveredPoint(index);
  };

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
    setHoveredPoint(null);
  };

  // Efeito para desenhar os eixos
  useEffect(() => {
    if (!svgRef.current) return;

    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll('*').remove();

    // Eixo X
    const xAxisGenerator = d3.axisBottom(xScale).tickFormat(d3.format(".2f"));
    svgElement
      .append('g')
      .attr('transform', `translate(0, ${boundsHeight})`)
      .call(xAxisGenerator);

    // Eixo Y
    const yAxisGenerator = d3.axisLeft(yScale).tickFormat(d3.format(".1f"));
    svgElement
      .append('g')
      .call(yAxisGenerator);

    // Linhas das médias
    svgElement
      .append('line')
      .attr('x1', xScale(avgPassageirosPorMinuto))
      .attr('x2', xScale(avgPassageirosPorMinuto))
      .attr('y1', 0)
      .attr('y2', boundsHeight)
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.8);

    svgElement
      .append('line')
      .attr('x1', 0)
      .attr('x2', boundsWidth)
      .attr('y1', yScale(avgPassageirosPorKm))
      .attr('y2', yScale(avgPassageirosPorKm))
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.8);

    // Rótulos dos eixos
    svgElement
      .append('text')
      .attr('x', boundsWidth / 2)
      .attr('y', boundsHeight + 60)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text('Passageiros por Minuto (Eficiência Temporal)');

    svgElement
      .append('text')
      .attr('x', -boundsHeight / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text('Passageiros por Km (Eficiência Espacial)');

  }, [xScale, yScale, boundsHeight, boundsWidth, avgPassageirosPorMinuto, avgPassageirosPorKm]);

  return (
    <div ref={containerRef} className={`w-full relative ${className}`}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="overflow-visible">
        {/* Áreas dos quadrantes */}
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {/* Quadrante 1 - As melhores (Superior Direito) */}
          <rect
            x={xScale(avgPassageirosPorMinuto)}
            y={0}
            width={boundsWidth - xScale(avgPassageirosPorMinuto)}
            height={yScale(avgPassageirosPorKm)}
            fill="#22c55e"
            opacity={0.04}
          />
          
          {/* Quadrante 2 - Lentas e Lotadas (Superior Esquerdo) */}
          <rect
            x={0}
            y={0}
            width={xScale(avgPassageirosPorMinuto)}
            height={yScale(avgPassageirosPorKm)}
            fill="#f59e0b"
            opacity={0.04}
          />
          
          {/* Quadrante 3 - Alvos de Otimização (Inferior Esquerdo) */}
          <rect
            x={0}
            y={yScale(avgPassageirosPorKm)}
            width={xScale(avgPassageirosPorMinuto)}
            height={boundsHeight - yScale(avgPassageirosPorKm)}
            fill="#ef4444"
            opacity={0.04}
          />
          
          {/* Quadrante 4 - Rápidas e Vazias (Inferior Direito) */}
          <rect
            x={xScale(avgPassageirosPorMinuto)}
            y={yScale(avgPassageirosPorKm)}
            width={boundsWidth - xScale(avgPassageirosPorMinuto)}
            height={boundsHeight - yScale(avgPassageirosPorKm)}
            fill="#3b82f6"
            opacity={0.04}
          />
        </g>

        {/* Pontos de dados */}
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {dataWithJitter.map((d, i) => (
            <circle
              key={i}
              cx={xScale(d.jitteredX)}
              cy={yScale(d.jitteredY)}
              r={hoveredPoint === i ? bubbleSize(d.total_passageiros) * 1.1 : bubbleSize(d.total_passageiros)}
              fill={getQuadrantColor(d)}
              fillOpacity={hoveredPoint !== null && hoveredPoint !== i ? 0.3 : 0.7}
              stroke={getQuadrantColor(d)}
              strokeWidth={hoveredPoint === i ? 2.5 : 1.5}
                             className="cursor-pointer hover:fill-opacity-90 hover:stroke-width-2 transition-all duration-200 drop-shadow-sm"
                             onMouseEnter={(e) => showTooltip(e, d, i)}
               onMouseLeave={hideTooltip}
               onMouseMove={(e) => showTooltip(e, d, i)}
            />
          ))}
        </g>

        {/* Eixos */}
        <g
          ref={axesRef}
          transform={`translate(${MARGIN.left}, ${MARGIN.top})`}
        />
      </svg>

      {/* Tooltip customizado */}
      {tooltip.visible && (
        <div
          className="absolute z-10 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: tooltip.x > dimensions.width - 200 ? 'translateX(-100%)' : 'translateX(0)',
          }}
        >
          <div className="font-semibold text-gray-900 mb-1">
            Linha {tooltip.data.cod_linha}
          </div>
          {tooltip.data.nome_linha && (
            <div className="text-sm text-gray-600 mb-2 max-w-48">
              {tooltip.data.nome_linha}
            </div>
          )}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Passageiros/Min:</span>
              <span className="font-medium">{tooltip.data.passageiros_por_minuto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Passageiros/Km:</span>
              <span className="font-medium">{tooltip.data.passageiros_por_km.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-gray-100">
              <span className="text-gray-600">Total Passageiros:</span>
              <span className="font-medium text-blue-600">{tooltip.data.total_passageiros.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 