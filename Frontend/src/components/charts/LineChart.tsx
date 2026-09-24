import React, { useState } from 'react';
import { HISTORICAL_TREND_DATA } from '../../data/mockData';

interface LineChartProps {
  title?: string;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  title = 'Airfare Price Index — 30 Day Trend',
  className = '',
}) => {
  const [activeRange, setActiveRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = HISTORICAL_TREND_DATA[activeRange] || HISTORICAL_TREND_DATA['30D'];

  // Dimensions
  const svgWidth = 680;
  const svgHeight = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };

  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Scales
  const allValues = data.flatMap((d) => [d.current, d.previous, d.baseline]);
  const minY = Math.floor(Math.min(...allValues) / 5) * 5 - 5;
  const maxY = Math.ceil(Math.max(...allValues) / 5) * 5 + 5;

  const getX = (idx: number) => padding.left + (idx / (data.length - 1)) * chartWidth;
  const getY = (val: number) => padding.top + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;

  // Path generators
  const currentPathD = data.reduce(
    (acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.current)}`,
    ''
  );

  const previousPathD = data.reduce(
    (acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.previous)}`,
    ''
  );

  const baselineY = getY(100);

  const areaGradientD = `${currentPathD} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`;

  // Grid line ticks
  const yTicks = [minY, 100, Math.round((100 + maxY) / 2), maxY];

  const activeHoverItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div id="apix-trend-chart-container" className={`bg-white rounded-2xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1769E0]" />
            <h3 className="text-base sm:text-lg font-bold text-[#102A43]">{title}</h3>
          </div>
          <p className="text-xs text-[#627D98] mt-0.5">
            Normalized against Jan 2024 baseline (100.0). Updated in real-time.
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center bg-[#F6F9FC] p-1 rounded-xl border border-[#E2E8F0] self-start sm:self-auto">
          {(['7D', '30D', '90D', '1Y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => {
                setActiveRange(range);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeRange === range
                  ? 'bg-[#1769E0] text-white shadow-xs'
                  : 'text-[#627D98] hover:text-[#102A43] hover:bg-[#EAF3FF]'
              }`}
            >
              {range === '1Y' ? '1 Year' : range === '90D' ? '90 Days' : range === '30D' ? '30 Days' : '7 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs mb-3 text-[#627D98]">
        <div className="flex items-center gap-1.5 font-medium text-[#102A43]">
          <span className="w-3.5 h-1 rounded-full bg-[#1769E0]" />
          <span>Current APIx</span>
          <span className="font-mono font-bold text-[#1769E0] ml-1">122.3</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-1 rounded-full bg-[#9FB3C8]" />
          <span>Previous Period</span>
          <span className="font-mono text-[#627D98] ml-1">113.0</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-0.5 border-t border-dashed border-[#627D98]" />
          <span>Baseline (100.0)</span>
        </div>
      </div>

      {/* Chart SVG */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="apixAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1769E0" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1769E0" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((val) => {
            const yPos = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={svgWidth - padding.right}
                  y2={yPos}
                  stroke="#E2E8F0"
                  strokeDasharray={val === 100 ? '4 3' : '2 2'}
                  strokeWidth={val === 100 ? '1.5' : '1'}
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 4}
                  fontSize="10"
                  fill={val === 100 ? '#1769E0' : '#627D98'}
                  fontWeight={val === 100 ? '700' : '500'}
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {data.map((d, i) => (
            <text
              key={d.date}
              x={getX(i)}
              y={svgHeight - 12}
              fontSize="10"
              fill="#627D98"
              textAnchor="middle"
            >
              {d.date}
            </text>
          ))}

          {/* Area fill */}
          <path d={areaGradientD} fill="url(#apixAreaGrad)" />

          {/* Baseline reference line */}
          <line
            x1={padding.left}
            y1={baselineY}
            x2={svgWidth - padding.right}
            y2={baselineY}
            stroke="#1769E0"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
          />

          {/* Previous period line */}
          <path
            d={previousPathD}
            fill="none"
            stroke="#9FB3C8"
            strokeWidth="2"
            strokeDasharray="4 3"
          />

          {/* Current line */}
          <path
            d={currentPathD}
            fill="none"
            stroke="#1769E0"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Interactive Hover Vertical Bar & Points */}
          {data.map((d, i) => {
            const x = getX(i);
            const yCurrent = getY(d.current);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
              >
                {/* Hit area */}
                <rect
                  x={x - chartWidth / (data.length * 2)}
                  y={padding.top}
                  width={chartWidth / data.length}
                  height={chartHeight}
                  fill="transparent"
                />

                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="#1769E0"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                <circle
                  cx={x}
                  cy={yCurrent}
                  r={isHovered ? '6' : '3.5'}
                  fill="#1769E0"
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? '3' : '2'}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {activeHoverItem && hoveredIdx !== null && (
          <div
            className="absolute z-10 pointer-events-none bg-[#0B1F3A] text-white p-2.5 rounded-xl shadow-xl text-xs border border-[#1769E0]/40 transition-all duration-75"
            style={{
              left: `${Math.min(
                Math.max((hoveredIdx / (data.length - 1)) * 80 + 10, 10),
                70
              )}%`,
              top: '15px',
            }}
          >
            <div className="text-[11px] font-semibold text-[#9FB3C8] mb-1">
              Date: {activeHoverItem.date}, 2026
            </div>
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] text-[#CBD5E1] block">APIx Value</span>
                <span className="font-mono text-sm font-bold text-white">
                  {activeHoverItem.current.toFixed(1)}
                </span>
              </div>
              <div className="pl-3 border-l border-white/20">
                <span className="text-[10px] text-[#CBD5E1] block">% vs Baseline</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  +{activeHoverItem.change}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
