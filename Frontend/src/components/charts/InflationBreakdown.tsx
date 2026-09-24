import React from 'react';
import { INFLATION_FACTORS } from '../../data/mockData';
import { HelpCircle, Sparkles, TrendingUp } from 'lucide-react';

interface InflationBreakdownProps {
  onOpenExplainerModal: () => void;
}

export const InflationBreakdown: React.FC<InflationBreakdownProps> = ({
  onOpenExplainerModal,
}) => {
  const totalIncrease = INFLATION_FACTORS.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div id="inflation-breakdown-panel" className="bg-white rounded-2xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1769E0]" />
            <h3 className="text-base sm:text-lg font-bold text-[#102A43]">
              Inflation Breakdown & Decomposition
            </h3>
          </div>
          <p className="text-xs text-[#627D98] mt-0.5">
            Econometric Shapley decomposition attributing aggregate fare hike components.
          </p>
        </div>

        <div className="bg-[#EAF3FF] px-3.5 py-1.5 rounded-xl border border-[#2F80ED]/30 self-start sm:self-auto flex items-center gap-2">
          <span className="text-xs font-semibold text-[#1769E0]">Aggregate Hike:</span>
          <span className="font-mono text-sm font-extrabold text-[#0B1F3A]">
            +₹{totalIncrease.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Stacked Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-7 rounded-xl overflow-hidden flex shadow-xs border border-[#E2E8F0]">
          {INFLATION_FACTORS.map((f) => (
            <div
              key={f.category}
              className="h-full flex items-center justify-center text-[10px] font-bold text-white transition-all hover:brightness-110 cursor-help"
              style={{
                width: `${f.percentage}%`,
                backgroundColor: f.color,
              }}
              title={`${f.category}: ₹${f.amount} (${f.percentage}%)`}
            >
              {f.percentage >= 15 ? `${f.percentage}%` : ''}
            </div>
          ))}
        </div>

        {/* Mini Legend under stacked bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
          {INFLATION_FACTORS.map((f) => (
            <div key={f.category} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: f.color }}
              />
              <span className="text-[#627D98] truncate text-[11px] font-medium">
                {f.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Factor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
        {INFLATION_FACTORS.map((f) => (
          <div
            key={f.category}
            className="p-3.5 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#102A43] truncate text-[12px]">
                  {f.category.split(' ')[0]}
                </span>
                <span className="font-mono font-bold text-[#1769E0] text-xs">
                  {f.percentage}%
                </span>
              </div>
              <div className="font-mono text-base font-extrabold text-[#0B1F3A] mb-1.5">
                ₹{f.amount}
              </div>
              <p className="text-[11px] text-[#627D98] leading-tight line-clamp-2">
                {f.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Explainable AI Section */}
      <div className="bg-[#FAFCFF] p-4 md:p-5 rounded-2xl border border-[#2F80ED]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1769E0]" />
            <h4 className="text-sm font-bold text-[#0B1F3A]">
              Why Did Fares Increase? (Explainable AI)
            </h4>
          </div>

          <button
            onClick={onOpenExplainerModal}
            className="text-xs font-semibold text-[#1769E0] hover:text-[#0B1F3A] flex items-center gap-1 cursor-pointer transition-colors bg-white px-2.5 py-1 rounded-lg border border-[#E2E8F0]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How is this calculated?</span>
          </button>
        </div>

        <div className="text-xs sm:text-sm text-[#102A43] leading-relaxed mb-3 bg-white p-3.5 rounded-xl border border-[#E2E8F0]/70">
          “Fare increased by <strong className="text-[#0B1F3A]">₹1,000</strong> primarily because of{' '}
          <span className="text-[#1769E0] font-semibold">higher demand (40%)</span> and{' '}
          <span className="text-[#1769E0] font-semibold">seasonal / festival travel (25%)</span>, followed by late booking window compression (15%) and fuel/slot pass-throughs.”
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-[#EAF3FF] text-[#1769E0] font-medium text-[11px]">
            Demand — 40%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#EAF3FF] text-[#1769E0] font-medium text-[11px]">
            Festival — 25%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#EAF3FF] text-[#1769E0] font-medium text-[11px]">
            Booking Window — 15%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#EAF3FF] text-[#1769E0] font-medium text-[11px]">
            Taxes / Fuel — 10%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#EAF3FF] text-[#1769E0] font-medium text-[11px]">
            Other — 10%
          </span>
        </div>
      </div>
    </div>
  );
};
