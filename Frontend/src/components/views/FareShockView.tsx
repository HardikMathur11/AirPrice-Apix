import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { ScreenId, Language, FareShockAlert } from '../../types';
import { FARE_SHOCK_ALERTS, ROUTES_DATA } from '../../data/mockData';
import { TRANSLATIONS } from '../../i18n/translations';
import { apiService } from '../../services/api';

interface FareShockViewProps {
  onSelectRoute: (routeId: string) => void;
  onNavigate: (screen: ScreenId) => void;
  language: Language;
  onOpenAlertModal: () => void;
}

export const FareShockView: React.FC<FareShockViewProps> = ({
  onSelectRoute,
  onNavigate,
  language,
  onOpenAlertModal,
}) => {
  const t = TRANSLATIONS[language];
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'severe' | 'moderate'>('all');
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<FareShockAlert | null>(null);
  const [alerts, setAlerts] = useState<FareShockAlert[]>(FARE_SHOCK_ALERTS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLiveAlerts = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAlerts();
      if (res.alerts && res.alerts.length > 0) {
        setAlerts(res.alerts);
      }
    } catch (err) {
      console.warn('API fetch alerts note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAlerts();
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
              {t.shockCenterTitle}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold animate-pulse font-mono">
              3 ACTIVE ANOMALIES
            </span>
          </div>
          <p className="text-sm text-[#627D98] mt-1 font-medium">
            {t.shockCenterSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAlertModal}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#1769E0] text-white hover:bg-[#1253B3] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Configure New Trigger</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <span className="text-xs text-[#627D98] font-semibold uppercase tracking-wider block mb-1">
            {t.activeAlerts}
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-black text-red-600">
            03
          </div>
          <div className="text-[11px] text-[#627D98] mt-1">
            Across 48 tracked corridors
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <span className="text-xs text-[#627D98] font-semibold uppercase tracking-wider block mb-1">
            {t.severeAlerts}
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-black text-red-600">
            01
          </div>
          <div className="text-[11px] text-red-600 font-semibold mt-1">
            &gt;+50% price escalation
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <span className="text-xs text-[#627D98] font-semibold uppercase tracking-wider block mb-1">
            {t.moderateAlerts}
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-black text-amber-600">
            02
          </div>
          <div className="text-[11px] text-[#627D98] mt-1">
            +20% to +50% price drift
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <span className="text-xs text-[#627D98] font-semibold uppercase tracking-wider block mb-1">
            {t.routesAffected}
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-black text-[#0B1F3A]">
            05
          </div>
          <div className="text-[11px] text-[#627D98] mt-1">
            Corridors showing contagion
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#627D98]">Filter by Severity:</span>
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#E2E8F0]">
            {(['all', 'severe', 'moderate'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                  filterSeverity === s
                    ? 'bg-[#1769E0] text-white shadow-xs'
                    : 'text-[#627D98] hover:text-[#102A43]'
                }`}
              >
                {s === 'all' ? 'All Incidents (3)' : s === 'severe' ? 'Severe Only (1)' : 'Moderate (2)'}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-[#627D98] font-mono hidden sm:block">
          Auto-Detection Threshold: Z-score &gt; 2.5σ
        </span>
      </div>

      {/* Alert Cards Grid */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-2xl p-5 md:p-6 border transition-all shadow-xs hover:shadow-md ${
              alert.severity === 'severe'
                ? 'border-red-300 hover:border-red-500'
                : 'border-amber-300 hover:border-amber-500'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left side details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      alert.severity === 'severe'
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {alert.severity === 'severe' ? '🔴 SEVERE' : '🟠 MODERATE'}
                  </span>
                  <span className="text-xs text-[#627D98] flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Detected {alert.detectedTime}</span>
                  </span>
                  {alert.detailedAnalysis.regulatoryFlag && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                      DGCA Flagged
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-3">
                  <h3 className="text-2xl font-black font-mono text-[#0B1F3A]">
                    {alert.routeLabel}
                  </h3>
                  <span className="text-xs font-bold text-[#627D98]">
                    ({alert.origin} to {alert.destination})
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#102A43] font-medium italic">
                  &ldquo;{alert.reason}&rdquo;
                </p>
              </div>

              {/* Price comparison numbers */}
              <div className="flex flex-wrap items-center gap-4 bg-[#F6F9FC] p-4 rounded-xl border border-[#E2E8F0]">
                <div>
                  <span className="text-[10px] text-[#627D98] uppercase font-bold block">
                    Current Fare
                  </span>
                  <span className="font-mono text-xl font-black text-red-600">
                    ₹{alert.currentFare.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="border-l border-[#CBD5E1] pl-4">
                  <span className="text-[10px] text-[#627D98] uppercase font-bold block">
                    Normal Baseline
                  </span>
                  <span className="font-mono text-xl font-black text-[#627D98]">
                    ₹{alert.normalFare.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="border-l border-[#CBD5E1] pl-4">
                  <span className="text-[10px] text-[#627D98] uppercase font-bold block">
                    Deviation
                  </span>
                  <span className="font-mono text-xl font-black text-red-600">
                    +{alert.deviationPercent}%
                  </span>
                </div>

                <div className="pl-2 flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedAlertForModal(alert)}
                    className="px-4 py-2 bg-[#1769E0] hover:bg-[#1253B3] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    View Analysis
                  </button>
                  <button
                    onClick={() => {
                      onSelectRoute(alert.routeId);
                      onNavigate('routes');
                    }}
                    className="text-[11px] font-bold text-[#1769E0] hover:underline text-center"
                  >
                    Open Sector →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analysis Modal when clicking "View Analysis" */}
      {selectedAlertForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  Anomaly Root-Cause Diagnostics
                </span>
                <h3 className="text-lg font-black text-[#0B1F3A] font-mono">
                  {selectedAlertForModal.routeLabel} ({selectedAlertForModal.origin} → {selectedAlertForModal.destination})
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlertForModal(null)}
                className="text-[#627D98] hover:text-[#102A43] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#102A43] block">Capacity & Inventory Stress Index</span>
                <p className="text-[#627D98]">
                  Available seat inventory on morning and evening departures is currently at{' '}
                  <strong className="text-red-600">{selectedAlertForModal.detailedAnalysis.seatAvailabilityIndex}%</strong>{' '}
                  (Critical bottleneck threshold is &lt;20%).
                </p>
              </div>

              <div className="p-3 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#102A43] block">Demand Surge Multiplier</span>
                <p className="text-[#627D98]">
                  Search query intensity on this corridor is running at{' '}
                  <strong className="text-[#1769E0]">{selectedAlertForModal.detailedAnalysis.demandSurgeRatio}x</strong>{' '}
                  above 30-day baseline average.
                </p>
              </div>

              <div className="p-3 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#102A43] block">Regulatory & Advisory Recommendation</span>
                <p className="text-[#627D98]">
                  {selectedAlertForModal.detailedAnalysis.recommendedAction}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-between gap-3">
              <button
                onClick={() => {
                  onSelectRoute(selectedAlertForModal.routeId);
                  onNavigate('routes');
                  setSelectedAlertForModal(null);
                }}
                className="w-full py-2.5 bg-[#1769E0] text-white font-bold text-xs rounded-xl hover:bg-[#1253B3] transition-colors cursor-pointer text-center"
              >
                Explore Full Route Intelligence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
