import React from 'react';

interface Contributor {
  route: string;
  contributionPercent: number;
  highlight?: boolean;
}

interface HorizontalBarChartProps {
  onViewFullAnalysis?: () => void;
  contributors?: Contributor[];
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  onViewFullAnalysis,
  contributors = [
    { route: 'DEL → BOM', contributionPercent: 2.4, highlight: true },
    { route: 'DEL → BLR', contributionPercent: 1.7, highlight: false },
    { route: 'BOM → BLR', contributionPercent: 1.2, highlight: false },
    { route: 'Others', contributionPercent: 2.7, highlight: false },
  ],
}) => {
  const maxVal = 3.0;

  return (
    <div id="inflation-contributors-card" className="bg-white rounded-2xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1769E0]" />
            <h3 className="text-base sm:text-lg font-bold text-[#102A43]">
              Where Is Airfare Inflation Coming From?
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#1769E0] bg-[#EAF3FF] px-2 py-0.5 rounded-md">
            Total +8.0%
          </span>
        </div>
        <p className="text-xs text-[#627D98] mb-5">
          Corridor-weighted contribution to national Airfare Price Index (APIx) movement.
        </p>

        {/* Bars */}
        <div className="space-y-4">
          {contributors.map((c) => {
            const widthPct = (c.contributionPercent / maxVal) * 100;
            return (
              <div key={c.route} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#102A43] font-mono">
                    {c.route}
                  </span>
                  <span className="font-mono font-bold text-[#102A43]">
                    {c.contributionPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-[#F1F5F9] rounded-full overflow-hidden flex items-center">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      c.highlight ? 'bg-[#1769E0]' : 'bg-[#2F80ED]'
                    }`}
                    style={{ width: `${Math.min(widthPct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {onViewFullAnalysis && (
        <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
          <button
            onClick={onViewFullAnalysis}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#1769E0] bg-[#EAF3FF] hover:bg-[#D8E8FC] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Full Inflation Analysis</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};
