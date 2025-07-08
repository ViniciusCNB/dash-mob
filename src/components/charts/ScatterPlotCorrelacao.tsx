import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CorrelacaoIdadeFalha } from '@/hooks/useApiQueries';

const MARGIN = { top: 30, right: 30, bottom: 80, left: 80 };

type ScatterPlotCorrelacaoProps = {
  data: CorrelacaoIdadeFalha[];
  className?: string;
};

interface TooltipData {
  x: number;
  y: number;
  data: CorrelacaoIdadeFalha;
  visible: boolean;
}

export const ScatterPlotCorrelacao = ({ data, className = "" }: ScatterPlotCorrelacaoProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, data: {} as CorrelacaoIdadeFalha, visible: false });
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const boundsWidth = dimensions.width - MARGIN.right - MARGIN.left;
  const boundsHeight = dimensions.height - MARGIN.top - MARGIN.bottom;

  // Função para ajustar dimensões
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newWidth = Math.max(600, containerWidth - 40);
        setDimensions({ 
          width: newWidth, 
          height: Math.min(600, newWidth * 0.75)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Obter empresas únicas para escala de cor
  const empresas = useMemo(() => {
    return Array.from(new Set(data.map(d => d.nome_empresa))).sort();
  }, [data]);

  // Escalas
  const xScale = useMemo(() => {
    const [xMin, xMax] = d3.extent(data, (d) => d.idade_veiculo_anos);
    const padding = (xMax! - xMin!) * 0.1;
    return d3
      .scaleLinear()
      .domain([Math.max(0, xMin! - padding), xMax! + padding])
      .range([0, boundsWidth]);
  }, [data, boundsWidth]);

  const yScale = useMemo(() => {
    const [yMin, yMax] = d3.extent(data, (d) => d.total_falhas);
    const padding = (yMax! - yMin!) * 0.1;
    return d3
      .scaleLinear()
      .domain([Math.max(0, yMin! - padding), yMax! + padding])
      .range([boundsHeight, 0]);
  }, [data, boundsHeight]);

  // Escala de cor por empresa
  const colorScale = useMemo(() => {
    return d3.scaleOrdinal(d3.schemeCategory10).domain(empresas);
  }, [empresas]);

  // Adicionar jitter para evitar sobreposição
  const dataWithJitter = useMemo(() => {
    if (!data.length) return [];
    
    return data.map((d, index) => {
      const seed = index * 0.1;
      const jitterX = (Math.sin(seed) * 0.5) * 0.02;
      const jitterY = (Math.cos(seed) * 0.5) * 0.02;
      
      return {
        ...d,
        jitteredX: d.idade_veiculo_anos + jitterX,
        jitteredY: d.total_falhas + jitterY
      };
    });
  }, [data]);

  // Funções do tooltip
  const showTooltip = (event: React.MouseEvent, d: CorrelacaoIdadeFalha, index: number) => {
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

  // Linha de tendência
  const trendline = useMemo(() => {
    if (data.length < 2) return null;

    const xValues = data.map(d => d.idade_veiculo_anos);
    const yValues = data.map(d => d.total_falhas);
    
    // Regressão linear simples
    const n = data.length;
    const sumX = d3.sum(xValues);
    const sumY = d3.sum(yValues);
    const sumXY = d3.sum(data.map(d => d.idade_veiculo_anos * d.total_falhas));
    const sumXX = d3.sum(xValues.map(x => x * x));
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const minX = d3.min(xValues)!;
    const maxX = d3.max(xValues)!;
    
    return {
      x1: xScale(minX),
      y1: yScale(intercept + slope * minX),
      x2: xScale(maxX),
      y2: yScale(intercept + slope * maxX),
      slope,
      r: calculateCorrelation(xValues, yValues)
    };
  }, [data, xScale, yScale]);

  function calculateCorrelation(x: number[], y: number[]) {
    const n = x.length;
    const sumX = d3.sum(x);
    const sumY = d3.sum(y);
    const sumXY = d3.sum(x.map((xi, i) => xi * y[i]));
    const sumXX = d3.sum(x.map(xi => xi * xi));
    const sumYY = d3.sum(y.map(yi => yi * yi));
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  // Efeito para desenhar os eixos
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const axesGroup = svg.select('.axes-group');
    
    if (axesGroup.empty()) {
      svg.append('g').attr('class', 'axes-group');
    }
    
    const axes = svg.select('.axes-group');
    axes.selectAll('*').remove();

    axes.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

    // Eixo X
    const xAxisGenerator = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    axes
      .append('g')
      .attr('transform', `translate(0, ${boundsHeight})`)
      .call(xAxisGenerator);

    // Eixo Y
    const yAxisGenerator = d3.axisLeft(yScale).tickFormat(d3.format("d"));
    axes
      .append('g')
      .call(yAxisGenerator);

    // Rótulos dos eixos
    axes
      .append('text')
      .attr('x', boundsWidth / 2)
      .attr('y', boundsHeight + 60)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text('Idade do Veículo (anos)');

    axes
      .append('text')
      .attr('x', -boundsHeight / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text('Número Total de Falhas');

  }, [xScale, yScale, boundsHeight, boundsWidth]);

  return (
    <div ref={containerRef} className={`w-full relative ${className}`}>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="overflow-visible">
        {/* Linha de tendência */}
        {trendline && (
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            <line
              x1={trendline.x1}
              y1={trendline.y1}
              x2={trendline.x2}
              y2={trendline.y2}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.8}
            />
            <text
              x={boundsWidth - 10}
              y={20}
              textAnchor="end"
              style={{ fontSize: '12px', fill: '#ef4444', fontWeight: '500' }}
            >
              r = {trendline.r.toFixed(3)}
            </text>
          </g>
        )}

        {/* Pontos de dados */}
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {dataWithJitter.map((d, i) => (
            <circle
              key={i}
              cx={xScale(d.jitteredX)}
              cy={yScale(d.jitteredY)}
              r={hoveredPoint === i ? 6 : 4}
              fill={colorScale(d.nome_empresa)}
              fillOpacity={hoveredPoint !== null && hoveredPoint !== i ? 0.3 : 0.7}
              stroke={colorScale(d.nome_empresa)}
              strokeWidth={hoveredPoint === i ? 2 : 1}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={(e) => showTooltip(e, d, i)}
              onMouseLeave={hideTooltip}
              onMouseMove={(e) => showTooltip(e, d, i)}
            />
          ))}
        </g>
      </svg>

      {/* Legenda das empresas */}
      <div className="mt-4 flex flex-wrap gap-4">
        {empresas.map(empresa => (
          <div key={empresa} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colorScale(empresa) }}
            />
            <span className="text-sm text-gray-700">{empresa}</span>
          </div>
        ))}
      </div>

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
            Veículo ID: {tooltip.data.id_veiculo}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {tooltip.data.nome_empresa}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Idade:</span>
              <span className="font-medium">{tooltip.data.idade_veiculo_anos} anos</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Falhas:</span>
              <span className="font-medium text-red-600">{tooltip.data.total_falhas}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 