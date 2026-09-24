import React from 'react';
import {
  PieChart,
  Landmark,
  TrendingUp,
  Download,
  FileText,
  Share2,
  HelpCircle,
  Sparkles,
  Award,
} from 'lucide-react';
import { ScreenId, Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { InflationBreakdown } from '../charts/InflationBreakdown';

interface InflationViewProps {
  onNavigate: (screen: ScreenId) => void;
  language: Language;
  onOpenExplainerModal: () => void;
}

export const InflationView: React.FC<InflationViewProps> = ({
  onNavigate,
  language,
  onOpenExplainerModal,
}) => {
  const t = TRANSLATIONS[language];

  const handleDownloadReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Factor,Amount_INR,Percentage,Description\n' +
      'Demand Pressure,400,40%,Passenger load factor surge\n' +
      'Festival / Season,250,25%,Forward date seat blocking\n' +
      'Booking Window Compression,150,15%,Late bookings tier-5 shift\n' +
      'Aviation Turbine Fuel & Taxes,100,10%,State VAT and crude index pass-through\n' +
      'Fleet & Slot Constraints,100,10%,Engine grounding and runway slots\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'AirPrice_APIx_Inflation_Decomposition_MoSPI.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
              {t.inflationIntelligenceTitle}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#1769E0] text-xs font-bold border border-[#1769E0]/20 font-mono">
              MoSPI / RBI Edition
            </span>
          </div>
          <p className="text-sm text-[#627D98] mt-1 font-medium">
            National domestic passenger transport price indices and econometric factor attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReport}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F6F9FC] text-[#102A43] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#1769E0]" />
            <span>Download MoSPI CSV</span>
          </button>
          <button
            onClick={onOpenExplainerModal}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#1769E0] hover:bg-[#1253B3] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Methodology</span>
          </button>
        </div>
      </div>

      {/* Main KPI Card: Overall Airfare Inflation */}
      <div className="bg-gradient-to-r from-[#0B1F3A] via-[#102A43] to-[#1769E0] text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#93C5FD] uppercase tracking-wider block">
            {t.overallInflation} (Year-over-Year WPI/CPI Sub-Index)
          </span>
          <div className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white">
            +8.0%
          </div>
          <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-xl">
            Domestic passenger transport headline inflation has accelerated by <strong>180 bps</strong> over the previous quarterly reading, with business hubs contributing 5.3% of the aggregate drift.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/15 text-left md:text-right space-y-2">
          <div>
            <span className="text-[11px] text-[#93C5FD] uppercase block font-semibold">
              CPI Transport Basket Weight
            </span>
            <span className="font-mono text-xl font-black text-white">
              0.87%
            </span>
          </div>
          <div className="pt-2 border-t border-white/15">
            <span className="text-[11px] text-[#93C5FD] uppercase block font-semibold">
              DGCA Capacity Utilization
            </span>
            <span className="font-mono text-xl font-black text-emerald-400">
              87.4% PLF
            </span>
          </div>
        </div>
      </div>

      {/* Inflation Breakdown Clean Stacked Visualization & Explainable AI */}
      <InflationBreakdown onOpenExplainerModal={onOpenExplainerModal} />

      {/* Route Contribution Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <HorizontalBarChart />
        </div>

        <div className="lg:col-span-6 bg-white rounded-2xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#1769E0]" />
            <h3 className="text-base font-bold text-[#0B1F3A]">
              Central Bank & Ministry Action Notes
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="font-bold text-[#102A43] block">
                1. Monetary Policy Impact (RBI Monetary Policy Committee)
              </span>
              <p className="text-[#627D98] leading-relaxed">
                Air passenger fare volatility adds approximately 7 bps of second-round pressure to core services CPI. Price shocks are primarily localized to metropolitan business clusters rather than broad-based.
              </p>
            </div>

            <div className="p-3 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="font-bold text-[#102A43] block">
                2. DGCA Route Slot Allocation Advisory
              </span>
              <p className="text-[#627D98] leading-relaxed">
                To mitigate the 2.4% price spike on DEL–BOM and 1.8% spike on BLR–HYD, slot authorizations for secondary carriers and unutilized peak hours should be expedited.
              </p>
            </div>

            <div className="p-3 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="font-bold text-[#102A43] block">
                3. ATF Tax Harmonization (MoSPI Recommendation)
              </span>
              <p className="text-[#627D98] leading-relaxed">
                Inter-state sales tax on ATF ranges between 4% and 29%. Harmonization under uniform GST would dampen the pass-through component by an estimated ₹75 per ticket.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
