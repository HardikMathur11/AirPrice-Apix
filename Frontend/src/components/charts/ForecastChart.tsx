import React, { useState } from 'react';

interface ForecastChartProps {
  currentFare: number;
  routeLabel: string;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  currentFare = 5000,
  routeLabel = 'DEL → BOM',
}) => {
  const [horizon, setHorizon] = useState<'7D' | '15D' | '30D'>('7D');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Generate dynamic trajectory based on horizon
  const generateData = () => {
    if (horizon === '7D') {
      return [
        { date: 'Sep 02', price: 4950, type: 'past', isCurrent: false },
        { date: 'Sep 03', price: 5080, type: 'past', isCurrent: false },
        { date: 'Today', price: currentFare, type: 'today', isCurrent: true },
        { date: '+2 Days', price: 5320, upper: 5550, lower: 5100, type: 'predicted', confidence: 93 },
        { date: '+4 Days', price: 5480, upper: 5720, lower: 5250, type: 'predicted', confidence: 91 },
        { date: '+6 Days', price: 5620, upper: 5890, lower: 5350, type: 'predicted', confidence: 88 },
        { date: '+7 Days', price: 5700, upper: 6050, lower: 5400, type: 'predicted', confidence: 85 },
      ];
    } else if (horizon === '15D') {
      return [
        { date: 'Aug 25', price: 4700, type: 'past', isCurrent: false },
        { date: 'Aug 30', price: 4900, type: 'past', isCurrent: false },
        { date: 'Today', price: currentFare, type: 'today', isCurrent: true },
        { date: '+4 Days', price: 5400, upper: 5650, lower: 5150, type: 'predicted', confidence: 92 },
        { date: '+8 Days', price: 5750, upper: 6100, lower: 5400, type: 'predicted', confidence: 87 },
        { date: '+12 Days', price: 6100, upper: 6550, lower: 5650, type: 'predicted', confidence: 82 },
        { date: '+15 Days', price: 6350, upper: 6900, lower: 5800, type: 'predicted', confidence: 79 },
      ];
    } else {
      return [
        { date: 'Aug 10', price: 4500, type: 'past', isCurrent: false },
        { date: 'Aug 25', price: 4850, type: 'past', isCurrent: false },
        { date: 'Today', price: currentFare, type: 'today', isCurrent: true },
        { date: '+7 Days', price: 5600, upper: 5950, lower: 5250, type: 'predicted', confidence: 89 },
        { date: '+14 Days', price: 6200, upper: 6700, lower: 5700, type: 'predicted', confidence: 83 },
        { date: '+21 Days', price: 6600, upper: 7250, lower: 5950, type: 'predicted', confidence: 76 },
        { date: '+30 Days', price: 6950, upper: 7800, lower: 6100, type: 'predicted', confidence: 71 },
      ];
    }
  };

  const data = generateData();

  const svgWidth = 640;
  const svgHeight = 250;
  const pad = { top: 30, right: 30, bottom: 40, left: 55 };
  const chartW = svgWidth - pad.left - pad.right;
  const chartH = svgHeight - pad.top - pad.bottom;

  const allVals = data.flatMap((d) => [d.price, d.upper || d.price, d.lower || d.price]);
  const yMin = Math.floor(Math.min(...allVals) / 500) * 500 - 500;
  const yMax = Math.ceil(Math.max(...allVals) / 500) * 500 + 500;

  const getX = (i: number) => pad.left + (i / (data.length - 1)) * chartW;
  const getY = (val: number) => pad.top + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

  const todayIndex = data.findIndex((d) => d.type === 'today');

  // Paths
  const pastPath = data.slice(0, todayIndex + 1).reduce(
    (acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.price)}`,
    ''
  );

  const predictedPath = data.slice(todayIndex).reduce(
    (acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(todayIndex + i)} ${getY(d.price)}`,
    ''
  );

  // Confidence Band for predicted portion
  const predItems = data.slice(todayIndex);
  const upperPath = predItems.reduce(
    (acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(todayIndex + i)} ${getY(d.upper || d.price)}`,
    ''
  );
  const lowerPathRev = [...predItems].reverse().reduce(
    (acc, d, i) => `${acc} L ${getX(todayIndex + predItems.length - 1 - i)} ${getY(d.lower || d.price)}`,
    ''
  );
  const confidenceBandPath = `${upperPath} ${lowerPathRev} Z`;

  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div id="ai-fare-forecast-chart" className="bg-white rounded-2xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1769E0]" />
            <h3 className="text-base sm:text-lg font-bold text-[#102A43]">
              AirPrice AI Forecast — {routeLabel}
            </h3>
          </div>
          <p className="text-xs text-[#627D98] mt-0.5">
            Predictive corridor trajectory powered by seat load models & festival curves.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center bg-[#F6F9FC] p-1 rounded-xl border border-[#E2E8F0] self-start sm:self-auto">
          {(['7D', '15D', '30D'] as const).map((h) => (
            <button
              key={h}
              onClick={() => {
                setHorizon(h);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                horizon === h
                  ? 'bg-[#1769E0] text-white shadow-xs'
                  : 'text-[#627D98] hover:text-[#102A43] hover:bg-[#EAF3FF]'
              }`}
            >
              {h === '7D' ? '7 Days' : h === '15D' ? '15 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs mb-3 text-[#627D98]">
        <div className="flex items-center gap-1.5 font-medium text-[#102A43]">
          <span className="w-3.5 h-1 rounded-full bg-[#0B1F3A]" />
          <span>Historical / Current</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-[#1769E0]">
          <span className="w-3.5 h-1 rounded-full bg-[#1769E0] border-t border-dashed" />
          <span>Predicted Price Trajectory</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-xs bg-[#EAF3FF] border border-[#2F80ED]/30" />
          <span>Prediction Confidence Band (91%)</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Y Axis Grid */}
          {[yMin, Math.round((yMin + yMax) / 2), yMax].map((val) => {
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

          {/* Confidence Band */}
          <path d={confidenceBandPath} fill="#EAF3FF" opacity="0.8" />
          <path
            d={upperPath}
            fill="none"
            stroke="#93C5FD"
            strokeWidth="1"
            strokeDasharray="3 2"
          />

          {/* Today Separator Vertical Line */}
          <line
            x1={getX(todayIndex)}
            y1={pad.top}
            x2={getX(todayIndex)}
            y2={pad.top + chartH}
            stroke="#1769E0"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x={getX(todayIndex)}
            y={pad.top - 8}
            fontSize="9"
            fill="#1769E0"
            fontWeight="700"
            textAnchor="middle"
          >
            TODAY
          </text>

          {/* Historical Path */}
          <path d={pastPath} fill="none" stroke="#0B1F3A" strokeWidth="2.5" />

          {/* Predicted Path */}
          <path
            d={predictedPath}
            fill="none"
            stroke="#1769E0"
            strokeWidth="2.8"
            strokeDasharray="5 3"
          />

          {/* X Axis Labels */}
          {data.map((d, i) => (
            <text
              key={d.date}
              x={getX(i)}
              y={svgHeight - 12}
              fontSize="10"
              fill={d.type === 'today' ? '#1769E0' : '#627D98'}
              fontWeight={d.type === 'today' ? '700' : '500'}
              textAnchor="middle"
            >
              {d.date}
            </text>
          ))}

          {/* Interactive points */}
          {data.map((d, i) => {
            const x = getX(i);
            const y = getY(d.price);
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
                <circle
                  cx={x}
                  cy={y}
                  r={d.type === 'today' ? '6' : isHovered ? '5.5' : '4'}
                  fill={d.type === 'today' ? '#1769E0' : d.type === 'past' ? '#0B1F3A' : '#2F80ED'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {activeItem && hoveredIdx !== null && (
          <div
            className="absolute z-10 pointer-events-none bg-[#0B1F3A] text-white p-2.5 rounded-xl shadow-xl text-xs border border-[#1769E0]/40"
            style={{
              left: `${Math.min(Math.max((hoveredIdx / (data.length - 1)) * 80 + 5, 5), 70)}%`,
              top: '10px',
            }}
          >
            <div className="text-[10px] text-[#9FB3C8] mb-1 font-semibold flex items-center justify-between gap-3">
              <span>{activeItem.date}</span>
              <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-white/10">
                {activeItem.type}
              </span>
            </div>
            <div className="font-mono text-sm font-bold text-white mb-0.5">
              ₹{activeItem.price.toLocaleString('en-IN')}
            </div>
            {activeItem.upper && (
              <div className="text-[10px] text-[#93C5FD]">
                Range: ₹{activeItem.lower?.toLocaleString('en-IN')} – ₹{activeItem.upper?.toLocaleString('en-IN')}
              </div>
            )}
            {activeItem.confidence && (
              <div className="text-[9px] text-emerald-400 font-semibold mt-1">
                Model Confidence: {activeItem.confidence}%
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
