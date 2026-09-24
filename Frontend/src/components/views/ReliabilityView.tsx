import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Database,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { RouteData, ScreenId, Language } from '../../types';
import { ROUTES_DATA } from '../../data/mockData';
import { TRANSLATIONS } from '../../i18n/translations';

interface ReliabilityViewProps {
  onOpenReliabilityModal: (route: RouteData) => void;
  language: Language;
}

export const ReliabilityView: React.FC<ReliabilityViewProps> = ({
  onOpenReliabilityModal,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoutes = ROUTES_DATA.filter(
    (r) =>
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.originCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.destinationCity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
              {t.dataReliabilityTitle}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold font-mono">
              94% Index Bharosa
            </span>
          </div>
          <p className="text-sm text-[#627D98] mt-1 font-medium">
            Transparent data pedigree, multi-source agreement rates and crawl hygiene auditing.
          </p>
        </div>

        <div className="text-xs text-[#627D98] bg-white px-3 py-1.5 rounded-xl border border-[#E2E8F0] shadow-2xs font-mono">
          Last Global Verification: 2 mins ago
        </div>
      </div>

      {/* 4 Trust Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <span className="text-xs text-[#627D98] font-semibold uppercase tracking-wider block mb-1">
            Global Index Reliability
          </span>
          <div className="font-mono text-3xl font-black text-emerald-600">
            94 / 100
          </div>
          <div className="text-xs text-[#627D98] mt-2">
            Grade A Government Standard
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <span className="text-xs text-[#627D98] font-semibold uppercase tracking-wider block mb-1">
            {t.sourceAgreement}
          </span>
          <div className="font-mono text-3xl font-black text-[#1769E0]">
            97.4%
          </div>
          <div className="text-xs text-[#627D98] mt-2">
            Cross-OTA consensus metric
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <span className="text-xs text-[#627D98] font-semibold uppercase tracking-wider block mb-1">
            {t.sampleSize}
          </span>
          <div className="font-mono text-3xl font-black text-[#0B1F3A]">
            14,280
          </div>
          <div className="text-xs text-[#627D98] mt-2">
            Flights parsed every 24 hours
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <span className="text-xs text-[#627D98] font-semibold uppercase tracking-wider block mb-1">
            {t.missingData} (Overall)
          </span>
          <div className="font-mono text-3xl font-black text-[#102A43]">
            1.6%
          </div>
          <div className="text-xs text-[#627D98] mt-2">
            Well within DGCA threshold (&lt;3.5%)
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#0B1F3A]">
              Corridor-Level Reliability Ledger
            </h3>
            <p className="text-xs text-[#627D98]">
              Click on any reliability score to inspect source agreement, sample depth, and model accuracy.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#627D98] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search route or airport..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#1769E0]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#627D98] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Route Corridor</th>
                <th className="py-3 px-3">Reliability Score</th>
                <th className="py-3 px-3">Active Sources</th>
                <th className="py-3 px-3">Monitored Flights</th>
                <th className="py-3 px-3">Missing Data %</th>
                <th className="py-3 px-3">Confidence Status</th>
                <th className="py-3 px-3 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]/60">
              {filteredRoutes.map((route) => {
                const score = route.reliabilityScore;
                const statusLevel = score >= 85 ? 'high' : score >= 70 ? 'medium' : 'low';

                return (
                  <tr
                    key={route.id}
                    onClick={() => onOpenReliabilityModal(route)}
                    className="hover:bg-[#F6F9FC] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#102A43] font-mono text-sm group-hover:text-[#1769E0] transition-colors">
                        {route.originCode}–{route.destinationCode}
                      </div>
                      <div className="text-[11px] text-[#627D98]">
                        {route.originCity} to {route.destinationCity}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-sm text-[#0B1F3A]">
                          {score}
                        </span>
                        <span className="text-[#627D98] font-mono text-xs">/100</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-semibold text-[#102A43]">
                      {route.sourcesCount} feeds
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[#102A43]">
                      {route.dailyFlights.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <span
                        className={
                          route.missingDataPercent > 5 ? 'text-red-600 font-bold' : 'text-[#627D98]'
                        }
                      >
                        {route.missingDataPercent}%
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          statusLevel === 'high'
                            ? 'bg-emerald-100 text-emerald-700'
                            : statusLevel === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            statusLevel === 'high'
                              ? 'bg-emerald-500'
                              : statusLevel === 'medium'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span>
                          {statusLevel === 'high'
                            ? '🟢 High'
                            : statusLevel === 'medium'
                            ? '🟠 Medium'
                            : '🔴 Low'}
                        </span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReliabilityModal(route);
                        }}
                        className="px-2.5 py-1 bg-[#EAF3FF] hover:bg-[#D8E8FC] text-[#1769E0] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Why {score}/100?
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
