import React, { useState } from 'react';
import { ROUTE_TRENDS } from '../../data/mockData';

interface RouteTrendChartProps {
  routeId: string;
  routeLabel: string;
}

export const RouteTrendChart: React.FC<RouteTrendChartProps> = ({
  routeId,
  routeLabel,
}) => {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const fallbackData = ROUTE_TRENDS['DEL-BOM'][range];
  const data = ROUTE_TRENDS[routeId]?.[range] || fallbackData;

  const svgWidth = 640;
  const svgHeight = 250;
  const pad = { top: 25, right: 25, bottom: 40, left: 55 };

  const chartW = svgWidth - pad.left - pad.right;
  const chartH = svgHeight - pad.top - pad.bottom;

  const minVal = Math.min(...data.map((d) => d.min));
  const maxVal = Math.max(...data.map((d) => d.max));
  const yMin = Math.floor(minVal / 500) * 500 - 500;
  const yMax = Math.ceil(maxVal / 500) * 500 + 500;

  const getX = (i: number) => pad.left + (i / (data.length - 1)) * chartW;
  const getY = (val: number) => pad.top + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

  // Path for max (upper) and min (lower) band
  const upperPath = data.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.max)}`, '');
  const lowerPathReverse = [...data].reverse().reduce((acc, d, i) => `${acc} L ${getX(data.length - 1 - i)} ${getY(d.min)}`, '');
  const bandPath = `${upperPath} ${lowerPathReverse} Z`;

  // Average line
  const avgPath = data.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.avg)}`, '');

  const yTicks = [yMin, Math.round((yMin + yMax) / 2), yMax];
  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#102A43]">
            Fare Trend — {routeLabel}
          </h3>
          <p className="text-xs text-[#627D98] mt-0.5">
            Average fare with dynamic min-max corridor spread across flights.
          </p>
        </div>

        <div className="flex items-center bg-[#F6F9FC] p-1 rounded-xl border border-[#E2E8F0] self-start sm:self-auto">
          {(['7D', '30D', '90D'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRange(r);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                range === r
                  ? 'bg-[#1769E0] text-white shadow-xs'
                  : 'text-[#627D98] hover:text-[#102A43] hover:bg-[#EAF3FF]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs mb-3 text-[#627D98]">
        <div className="flex items-center gap-1.5 font-medium text-[#102A43]">
          <span className="w-3 h-1 rounded-full bg-[#1769E0]" />
          <span>Average Fare</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-xs bg-[#EAF3FF] border border-[#2F80ED]/30" />
          <span>Min–Max Price Band</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Y Grid */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={svgWidth - pad.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                />
                <text
                  x={pad.left - 8}
                  y={y + 4}
                  fontSize="10"
                  fill="#627D98"
                  textAnchor="end"
                  className="font-mono"
                >
                  ₹{val.toLocaleString('en-IN')}
                </text>
              </g>
            );
          })}

          {/* X Axis */}
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

          {/* Min-Max Shaded Band */}
          <path d={bandPath} fill="#EAF3FF" opacity="0.8" />
          <path d={upperPath} fill="none" stroke="#93C5FD" strokeWidth="1" strokeDasharray="3 3" />

          {/* Average Line */}
          <path d={avgPath} fill="none" stroke="#1769E0" strokeWidth="2.5" />

          {/* Interactive hover points */}
          {data.map((d, i) => {
            const x = getX(i);
            const yAvg = getY(d.avg);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
              >
                <rect
                  x={x - chartW / (data.length * 2)}
                  y={pad.top}
                  width={chartW / data.length}
                  height={chartH}
                  fill="transparent"
                />
                {isHovered && (
                  <line
                    x1={x}
                    y1={pad.top}
                    x2={x}
                    y2={pad.top + chartH}
                    stroke="#1769E0"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                )}
                <circle
                  cx={x}
                  cy={yAvg}
                  r={isHovered ? '5.5' : '3'}
                  fill="#1769E0"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {activeItem && hoveredIdx !== null && (
          <div
            className="absolute z-10 pointer-events-none bg-[#0B1F3A] text-white p-2.5 rounded-xl shadow-xl text-xs border border-[#1769E0]/40"
            style={{
              left: `${Math.min(Math.max((hoveredIdx / (data.length - 1)) * 80 + 5, 5), 70)}%`,
              top: '10px',
            }}
          >
            <div className="text-[10px] text-[#9FB3C8] mb-1 font-semibold">
              {activeItem.date}, 2026
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-[9px] text-[#93C5FD] block">Min</span>
                <span className="text-white font-bold">₹{activeItem.min}</span>
              </div>
              <div className="border-x border-white/20 px-2">
                <span className="text-[9px] text-[#93C5FD] block">Avg</span>
                <span className="text-[#38BDF8] font-bold">₹{activeItem.avg}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#93C5FD] block">Max</span>
                <span className="text-amber-300 font-bold">₹{activeItem.max}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
