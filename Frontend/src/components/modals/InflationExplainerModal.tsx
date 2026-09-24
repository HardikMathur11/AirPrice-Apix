import React from 'react';
import { X, Sparkles, BookOpen, Layers, BarChart3 } from 'lucide-react';

interface InflationExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

export const InflationExplainerModal: React.FC<InflationExplainerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0B1F3A] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1769E0]/30 border border-[#1769E0]/40">
              <Sparkles className="w-5 h-5 text-[#93C5FD]" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                How Airfare Inflation & AI Attribution is Calculated
              </h3>
              <p className="text-xs text-[#9FB3C8]">
                MoSPI, RBI & DGCA Compliant Econometric Methodology
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9FB3C8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#102A43]">
          {/* Step 1 */}
          <div className="p-3.5 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0B1F3A] mb-1">
              <span className="w-5 h-5 rounded-full bg-[#1769E0] text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Airfare Price Index (APIx) Calculation</span>
            </div>
            <p className="text-[#627D98] leading-relaxed">
              APIx uses a chained <strong>Törnqvist Price Index</strong> weighting across top 48 domestic corridors by passenger kilometers (RPKs). Base period is Jan 2024 = 100.0. Real-time transaction samples are gathered every 15 minutes across direct airlines and OTAs.
            </p>
            <div className="mt-2 font-mono text-[11px] bg-white p-2 rounded border border-[#CBD5E1] text-[#1769E0]">
              ln(APIx_t / APIx_t-1) = Σ 0.5 * (s_i,t + s_i,t-1) * ln(p_i,t / p_i,t-1)
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0B1F3A] mb-1">
              <span className="w-5 h-5 rounded-full bg-[#1769E0] text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Explainable AI: Shapley Additive Decomposition</span>
            </div>
            <p className="text-[#627D98] leading-relaxed">
              To answer <em>“Why did fares increase by ₹1,000?”</em>, our gradient boosted econometric engine calculates <strong>Shapley Values (SHAP)</strong> across 5 distinct marginal drivers:
            </p>
            <ul className="mt-2 space-y-1 text-[#627D98] list-disc list-inside">
              <li><strong className="text-[#102A43]">Demand Pressure (40%):</strong> Passenger Load Factor (PLF) exceeding route historical 82% threshold.</li>
              <li><strong className="text-[#102A43]">Seasonal / Festival (25%):</strong> Empirical uplift correlated with regional festival calendar (Diwali, Chhath, Durga Puja).</li>
              <li><strong className="text-[#102A43]">Booking Window Compression (15%):</strong> Late bookings (&lt;7 days) migrating to dynamic tier-5 fare buckets.</li>
              <li><strong className="text-[#102A43]">Aviation Fuel (ATF) & Taxes (10%):</strong> Benchmark crude/refinery adjustments + state VAT.</li>
              <li><strong className="text-[#102A43]">Fleet & Slot Bottlenecks (10%):</strong> Groundings and congested prime runway peak slots.</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0B1F3A] mb-1">
              <span className="w-5 h-5 rounded-full bg-[#1769E0] text-white flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Fare Shock Anomaly Detection</span>
            </div>
            <p className="text-[#627D98] leading-relaxed">
              A fare shock alert is generated when a route's current 24-hour moving median fare exceeds <strong>+2.5 standard deviations (Z-score &gt; 2.5)</strong> above its 30-day baseline, automatically notifying regulators when price gouging or capacity shortages occur.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1769E0] hover:bg-[#1253B3] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
