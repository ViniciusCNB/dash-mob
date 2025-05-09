import * as d3 from "d3";

const MARGIN = { top: 30, right: 30, bottom: 30, left: 30 };
const BAR_PADDING = 0.3;

type BarplotProps = {
  width: number;
  height: number;
  data: { name: string; value: number }[];
};

export const Barplot = ({ width, height, data }: BarplotProps) => {
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const groups = data.sort((a, b) => b.value - a.value).map((d) => d.name);
  const xScale = d3
    .scaleBand()
    .domain(groups)
    .range([0, boundsWidth])
    .padding(BAR_PADDING);

  const max = d3.max(data.map((d) => d.value)) ?? 10;
  const yScale = d3
    .scaleLinear()
    .domain([max * 1.2, 0])
    .range([0, boundsHeight]);

  const allShapes = data.map((d, i) => {
    const x = xScale(d.name);
    if (x === undefined) {
      return null;
    }

    return (
      <g key={i}>
        <rect
          x={x}
          y={yScale(d.value)}
          width={xScale.bandwidth()}
          height={boundsHeight - yScale(d.value)}
          opacity={0.9}
          stroke="#6689c6"
          fill="#6689c6"
          fillOpacity={0.6}
          strokeWidth={1}
          rx={1}
        />
        <text
          x={x + xScale.bandwidth() / 2}
          y={yScale(d.value) - 10}
          textAnchor="middle"
          alignmentBaseline="central"
          fontSize={10}
          fill="var(--primary)"
        >
          {d.value.toLocaleString('pt-BR')}
        </text>
        <text
          x={x + xScale.bandwidth() / 2}
          y={boundsHeight + 10}
          textAnchor="middle"
          alignmentBaseline="central"
          fontSize={12}
          fill="var(--primary)"
        >
          {d.name}
        </text>
      </g>
    );
  });

  const grid = yScale.ticks(5).map((value, i) => (
    <g key={i}>
      <line
        x1={0}
        x2={boundsWidth}
        y1={yScale(value)}
        y2={yScale(value)}
        stroke="var(--primary)"
        opacity={0.15}
      />
      <text
        x={-10}
        y={yScale(value)}
        textAnchor="middle"
        alignmentBaseline="central"
        fontSize={9}
        fill="var(--primary)"
        opacity={0.5}
      >
        {value.toLocaleString('pt-BR')}
      </text>
    </g>
  ));

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        >
          {grid}
          {allShapes}
        </g>
      </svg>
    </div>
  );
};
