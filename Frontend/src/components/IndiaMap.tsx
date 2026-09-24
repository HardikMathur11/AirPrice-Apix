import React, { useState } from 'react';
import { AIRPORT_COORDINATES, ROUTES_DATA } from '../data/mockData';
import { RouteData } from '../types';
import { Plane, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface IndiaMapProps {
  onSelectRoute: (routeId: string) => void;
  selectedRouteId?: string;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({ onSelectRoute, selectedRouteId }) => {
  const [hoveredRoute, setHoveredRoute] = useState<RouteData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Color mapping based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return '#EF4444'; // Red for severe fare shock
      case 'warning':
        return '#F59E0B'; // Amber for moderate increase
      default:
        return '#10B981'; // Green for stable
    }
  };

  return (
    <div id="india-airfare-heatmap" className="relative w-full bg-white rounded-2xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1769E0]" />
            <h3 className="text-base sm:text-lg font-bold text-[#102A43]">
              India Airfare Heatmap
            </h3>
          </div>
          <p className="text-xs text-[#627D98] mt-0.5">
            Real-time route corridors with pricing velocity & anomaly state. Click route to analyze.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-[#F6F9FC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]/70">
          <span className="flex items-center gap-1.5 font-medium text-[#102A43]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            Stable
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#102A43]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            Moderate Increase
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#102A43]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
            Fare Shock
          </span>
        </div>
      </div>

      <div className="relative w-full aspect-[4/3] max-h-[460px] flex items-center justify-center bg-[#FAFCFF] rounded-xl overflow-hidden border border-[#EAF3FF]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

        <svg
          viewBox="0 0 600 580"
          className="w-full h-full max-h-[450px] select-none"
          onMouseLeave={() => setHoveredRoute(null)}
        >
          <defs>
            <linearGradient id="indiaMapFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EAF3FF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#D8E8FC" stopOpacity="0.3" />
            </linearGradient>
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* India land outline simplification for clean vector representation */}
          <path
            d="M 230,40 
               C 270,30 310,50 310,75 
               C 310,95 290,120 300,140 
               C 340,150 400,165 440,185 
               C 490,175 520,195 520,225 
               C 510,250 460,265 435,275 
               C 390,290 380,330 350,370 
               C 335,420 320,490 280,545 
               C 250,500 240,460 215,410 
               C 185,380 160,330 180,280 
               C 170,240 185,210 200,185 
               C 210,140 200,80 230,40 Z"
            fill="url(#indiaMapFill)"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Render Route Arcs */}
          {ROUTES_DATA.map((route) => {
            const originCoord = AIRPORT_COORDINATES[route.originCode];
            const destCoord = AIRPORT_COORDINATES[route.destinationCode];
            if (!originCoord || !destCoord) return null;

            // Arc curve midpoint calculation with bezier bend
            const midX = (originCoord.x + destCoord.x) / 2;
            const midY = (originCoord.y + destCoord.y) / 2;
            const dx = destCoord.x - originCoord.x;
            const dy = destCoord.y - originCoord.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Curvature offset perpendicular to line
            const normX = -dy / (dist || 1);
            const normY = dx / (dist || 1);
            const curvature = 24;
            const ctrlX = midX + normX * curvature;
            const ctrlY = midY + normY * curvature;

            const pathD = `M ${originCoord.x} ${originCoord.y} Q ${ctrlX} ${ctrlY} ${destCoord.x} ${destCoord.y}`;
            const color = getStatusColor(route.status);
            const isSelected = selectedRouteId === route.id;
            const isHovered = hoveredRoute?.id === route.id;

            return (
              <g
                key={route.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelectRoute(route.id)}
                onMouseEnter={(e) => {
                  setHoveredRoute(route);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPos({ x: (originCoord.x + destCoord.x) / 2, y: ctrlY });
                }}
              >
                {/* Wider invisible hitbox for easy hovering */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="18"
                />

                {/* Animated underglow if critical shock or selected */}
                {(route.status === 'critical' || isSelected) && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={isSelected ? '6' : '4'}
                    strokeOpacity="0.4"
                    className="animate-pulse"
                  />
                )}

                {/* Main route arc */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth={isSelected ? '3.5' : isHovered ? '3' : '2'}
                  strokeDasharray={route.status === 'critical' ? 'none' : isHovered ? 'none' : '4 2'}
                  filter="url(#routeGlow)"
                />

                {/* Flight icon indicator along arc midpoint */}
                <circle
                  cx={ctrlX}
                  cy={ctrlY}
                  r={isSelected ? '5' : isHovered ? '4.5' : '3.5'}
                  fill={color}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* Render Airport Nodes */}
          {Object.entries(AIRPORT_COORDINATES).map(([code, airport]) => {
            const hasCritical = ROUTES_DATA.some(
              (r) => (r.originCode === code || r.destinationCode === code) && r.status === 'critical'
            );

            return (
              <g key={code} className="cursor-default">
                {hasCritical && (
                  <circle
                    cx={airport.x}
                    cy={airport.y}
                    r="9"
                    fill="#EF4444"
                    fillOpacity="0.2"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={airport.x}
                  cy={airport.y}
                  r="5"
                  fill="#0B1F3A"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={airport.x + 8}
                  y={airport.y + 4}
                  fontSize="10"
                  fontWeight="700"
                  fill="#102A43"
                  className="pointer-events-none drop-shadow-xs"
                >
                  {code}
                </text>
                <text
                  x={airport.x + 8}
                  y={airport.y + 14}
                  fontSize="8"
                  fontWeight="500"
                  fill="#627D98"
                  className="pointer-events-none"
                >
                  {airport.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Interactive Hover Tooltip */}
        {hoveredRoute && (
          <div
            className="absolute z-20 pointer-events-none bg-[#0B1F3A] text-white p-3 rounded-xl shadow-xl text-xs max-w-xs transition-all border border-[#1769E0]/40"
            style={{
              left: `${Math.min(Math.max(tooltipPos.x - 40, 10), 400)}px`,
              top: `${Math.min(Math.max(tooltipPos.y - 70, 10), 340)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="font-bold text-sm tracking-wide text-[#EAF3FF]">
                {hoveredRoute.originCity} ({hoveredRoute.originCode}) → {hoveredRoute.destinationCity} ({hoveredRoute.destinationCode})
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  hoveredRoute.status === 'critical'
                    ? 'bg-[#EF4444] text-white'
                    : hoveredRoute.status === 'warning'
                    ? 'bg-[#F59E0B] text-white'
                    : 'bg-[#10B981] text-white'
                }`}
              >
                {hoveredRoute.status === 'critical' ? 'Fare Shock' : hoveredRoute.status === 'warning' ? 'Moderate' : 'Stable'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/10">
              <div>
                <span className="text-[#9FB3C8] block">Current Fare</span>
                <span className="font-mono font-bold text-sm text-white">₹{hoveredRoute.currentFare.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[#9FB3C8] block">Change</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    hoveredRoute.changePercent > 30 ? 'text-red-300' : hoveredRoute.changePercent > 10 ? 'text-amber-300' : 'text-emerald-300'
                  }`}
                >
                  +{hoveredRoute.changePercent}%
                </span>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-[#CBD5E1] flex items-center justify-between">
              <span>{hoveredRoute.dailyFlights} flights/day</span>
              <span className="text-[#93C5FD] font-semibold">Click to analyze →</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Route Selector Chips */}
      <div className="mt-4 pt-3 border-t border-[#E2E8F0]/60">
        <div className="text-xs font-semibold text-[#627D98] uppercase tracking-wider mb-2">
          Frequent Tracked Corridors:
        </div>
        <div className="flex flex-wrap gap-2">
          {ROUTES_DATA.slice(0, 7).map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectRoute(r.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 border ${
                selectedRouteId === r.id
                  ? 'bg-[#1769E0] text-white border-[#1769E0] shadow-xs'
                  : 'bg-[#F6F9FC] text-[#102A43] border-[#E2E8F0] hover:bg-[#EAF3FF] hover:border-[#2F80ED]/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  r.status === 'critical' ? 'bg-[#EF4444]' : r.status === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                }`}
              />
              <span className="font-semibold">{r.originCode}–{r.destinationCode}</span>
              <span className="font-mono text-[11px] opacity-80">₹{r.currentFare}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
