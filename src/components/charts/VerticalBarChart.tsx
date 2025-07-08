import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { RankingLinhasFalhas } from '@/hooks/useApiQueries';

const MARGIN = { top: 30, right: 30, bottom: 120, left: 60 };

type VerticalBarChartProps = {
  data: RankingLinhasFalhas[];
  onBarClick?: (linha: RankingLinhasFalhas) => void;
  selectedLinha?: string | null;
  width?: number;
  height?: number;
  className?: string;
};

export const VerticalBarChart = ({ 
  data, 
  onBarClick,
  selectedLinha,
  width = 800, 
  height = 500, 
  className = "" 
}: VerticalBarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Pegar apenas top 10
  const topData = useMemo(() => {
    return data.slice(0, 10);
  }, [data]);

  // Escalas
  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(topData.map(d => d.cod_linha))
      .range([0, boundsWidth])
      .padding(0.3);
  }, [topData, boundsWidth]);

  const yScale = useMemo(() => {
    const maxValue = d3.max(topData, d => d.total_falhas) || 0;
    return d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([boundsHeight, 0]);
  }, [topData, boundsHeight]);

  // Função para determinar cor da barra
  const getBarColor = (codLinha: string) => {
    if (selectedLinha === codLinha) return '#ef4444'; // Vermelho para selecionada
    if (hoveredBar === codLinha) return '#f97316'; // Laranja para hover
    return '#3b82f6'; // Azul padrão
  };

  // Renderizar gráfico
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

    // Barras
    container
      .selectAll('rect')
      .data(topData)
      .join('rect')
      .attr('x', d => xScale(d.cod_linha)!)
      .attr('y', d => yScale(d.total_falhas))
      .attr('width', xScale.bandwidth())
      .attr('height', d => boundsHeight - yScale(d.total_falhas))
      .attr('fill', d => getBarColor(d.cod_linha))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        setHoveredBar(d.cod_linha);
      })
      .on('mouseleave', function() {
        setHoveredBar(null);
      })
      .on('click', function(event, d) {
        onBarClick?.(d);
      });

    // Valores nas barras
    container
      .selectAll('.bar-value')
      .data(topData)
      .join('text')
      .attr('class', 'bar-value')
      .attr('x', d => xScale(d.cod_linha)! + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.total_falhas) - 8)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text(d => d.total_falhas);

    // Eixo X
    const xAxis = container
      .append('g')
      .attr('transform', `translate(0, ${boundsHeight})`)
      .call(d3.axisBottom(xScale));

    // Rotacionar labels do eixo X
    xAxis
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#374151')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Eixo Y
    container
      .append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format('d')))
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#374151');

    // Labels dos eixos
    container
      .append('text')
      .attr('x', boundsWidth / 2)
      .attr('y', boundsHeight + 100)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text('Código da Linha');

    container
      .append('text')
      .attr('x', -boundsHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text('Número de Falhas Mecânicas');

    // Linha de destaque para item selecionado
    if (selectedLinha) {
      const selectedData = topData.find(d => d.cod_linha === selectedLinha);
      if (selectedData) {
        container
          .append('rect')
          .attr('x', xScale(selectedData.cod_linha)! - 5)
          .attr('y', yScale(selectedData.total_falhas) - 5)
          .attr('width', xScale.bandwidth() + 10)
          .attr('height', boundsHeight - yScale(selectedData.total_falhas) + 10)
          .attr('fill', 'none')
          .attr('stroke', '#ef4444')
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', '5,5')
          .attr('rx', 6)
          .style('pointer-events', 'none');
      }
    }

  }, [topData, xScale, yScale, boundsWidth, boundsHeight, hoveredBar, selectedLinha, onBarClick]);

  return (
    <div className={`w-full ${className}`}>
      <svg ref={svgRef} width={width} height={height} className="overflow-visible">
      </svg>
      
      {/* Instruções */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Clique em uma barra para ver detalhes da linha
      </div>
    </div>
  );
}; 