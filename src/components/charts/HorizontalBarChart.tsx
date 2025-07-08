import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { TaxaFalhasEmpresa } from '@/hooks/useApiQueries';

const MARGIN = { top: 30, right: 60, bottom: 50, left: 200 };

type HorizontalBarChartProps = {
  data: TaxaFalhasEmpresa[];
  width?: number;
  height?: number;
  className?: string;
};

export const HorizontalBarChart = ({ 
  data, 
  width = 800, 
  height = 400, 
  className = "" 
}: HorizontalBarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Ordenar dados por taxa (maior para menor)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.taxa_falhas_por_10k_viagens - a.taxa_falhas_por_10k_viagens);
  }, [data]);

  // Escalas
  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(sortedData.map(d => d.nome_empresa))
      .range([0, boundsHeight])
      .padding(0.2);
  }, [sortedData, boundsHeight]);

  const xScale = useMemo(() => {
    const maxValue = d3.max(sortedData, d => d.taxa_falhas_por_10k_viagens) || 0;
    return d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([0, boundsWidth]);
  }, [sortedData, boundsWidth]);

  // Escala de cor baseada na taxa
  const colorScale = useMemo(() => {
    const maxValue = d3.max(sortedData, d => d.taxa_falhas_por_10k_viagens) || 0;
    return d3
      .scaleSequential(d3.interpolateRdYlBu)
      .domain([maxValue, 0]); // Vermelho para valores altos, azul para baixos
  }, [sortedData]);

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
      .data(sortedData)
      .join('rect')
      .attr('y', d => yScale(d.nome_empresa)!)
      .attr('x', 0)
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(d.taxa_falhas_por_10k_viagens))
      .attr('fill', d => colorScale(d.taxa_falhas_por_10k_viagens))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('rx', 4);

    // Valores nas barras
    container
      .selectAll('.bar-value')
      .data(sortedData)
      .join('text')
      .attr('class', 'bar-value')
      .attr('x', d => xScale(d.taxa_falhas_por_10k_viagens) + 8)
      .attr('y', d => yScale(d.nome_empresa)! + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text(d => d.taxa_falhas_por_10k_viagens.toFixed(1));

    // Eixo Y (nomes das empresas)
    container
      .append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#374151');

    // Eixo X
    container
      .append('g')
      .attr('transform', `translate(0, ${boundsHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('.1f')))
      .selectAll('text')
      .style('font-size', '11px')
      .style('fill', '#374151');

    // Título do eixo X
    container
      .append('text')
      .attr('x', boundsWidth / 2)
      .attr('y', boundsHeight + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text('Taxa de Falhas por 10.000 Viagens');

    // Linha de referência (média)
    const media = d3.mean(sortedData, d => d.taxa_falhas_por_10k_viagens) || 0;
    container
      .append('line')
      .attr('x1', xScale(media))
      .attr('x2', xScale(media))
      .attr('y1', 0)
      .attr('y2', boundsHeight)
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.7);

    // Label da média
    container
      .append('text')
      .attr('x', xScale(media))
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#6b7280')
      .text(`Média: ${media.toFixed(1)}`);

  }, [sortedData, xScale, yScale, boundsWidth, boundsHeight, colorScale]);

  return (
    <div className={`w-full ${className}`}>
      <svg ref={svgRef} width={width} height={height} className="overflow-visible">
      </svg>
    </div>
  );
}; 