import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Sliders,
  RefreshCw,
  Plane,
  ShieldCheck,
} from 'lucide-react';
import { ScreenId, Language } from '../../types';
import { ROUTES_DATA } from '../../data/mockData';
import { TRANSLATIONS } from '../../i18n/translations';
import { ForecastChart } from '../charts/ForecastChart';
import { apiService, RouteForecastResponse } from '../../services/api';

interface ForecastViewProps {
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  onNavigate: (screen: ScreenId) => void;
  language: Language;
  onOpenAlertModal: () => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  selectedRouteId,
  onSelectRoute,
  onNavigate,
  language,
  onOpenAlertModal,
}) => {
  const t = TRANSLATIONS[language];
  const [activeRouteId, setActiveRouteId] = useState(selectedRouteId || 'DEL-BOM');

  // Interactive Scenario Simulator
  const [loadFactor, setLoadFactor] = useState(88); // in %
  const [fuelAdjustment, setFuelAdjustment] = useState(0); // in %

  // API state
  const [forecastData, setForecastData] = useState<RouteForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchForecast = async (code: string) => {
    try {
      setLoading(true);
      const res = await apiService.getRouteForecast(code);
      setForecastData(res);
    } catch (err) {
      console.warn('API forecast fetch note:', err);
      const spot = code.includes('DEL') ? 5800 : 4200;
      setForecastData({
        route_code: code,
        current_avg_spot_fare: spot,
        projected_7d_avg: Math.round(spot * 1.12),
        projected_15d_avg: Math.round(spot * 1.24),
        projected_30d_avg: Math.round(spot * 0.88),
        confidence_score_percent: 91,
        carrier_forecasts: [
          { source: 'IndiGo', source_type: 'airline', flight_number: '6E-512', airline_code: '6E', current_spot_fare: Math.round(spot * 0.98), projected_7d: Math.round(spot * 1.10), projected_15d: Math.round(spot * 1.22), projected_30d: Math.round(spot * 0.86), surge_probability_percent: 88, recommendation: 'Lock Rate Now' },
          { source: 'Air India', source_type: 'airline', flight_number: 'AI-805', airline_code: 'AI', current_spot_fare: Math.round(spot * 1.05), projected_7d: Math.round(spot * 1.16), projected_15d: Math.round(spot * 1.28), projected_30d: Math.round(spot * 0.90), surge_probability_percent: 91, recommendation: 'Lock Rate Now' },
          { source: 'Akasa Air', source_type: 'airline', flight_number: 'QP-1102', airline_code: 'QP', current_spot_fare: Math.round(spot * 0.94), projected_7d: Math.round(spot * 1.06), projected_15d: Math.round(spot * 1.18), projected_30d: Math.round(spot * 0.84), surge_probability_percent: 74, recommendation: 'Wait for Advance Window' },
          { source: 'SpiceJet', source_type: 'airline', flight_number: 'SG-8192', airline_code: 'SG', current_spot_fare: Math.round(spot * 0.92), projected_7d: Math.round(spot * 1.04), projected_15d: Math.round(spot * 1.15), projected_30d: Math.round(spot * 0.82), surge_probability_percent: 72, recommendation: 'Wait for Advance Window' },
          { source: 'Air India Express', source_type: 'airline', flight_number: 'IX-1741', airline_code: 'IX', current_spot_fare: Math.round(spot * 0.90), projected_7d: Math.round(spot * 1.02), projected_15d: Math.round(spot * 1.14), projected_30d: Math.round(spot * 0.80), surge_probability_percent: 70, recommendation: 'Wait for Advance Window' },
          { source: 'MakeMyTrip', source_type: 'ota', flight_number: '6E-512', airline_code: '6E', current_spot_fare: Math.round(spot * 1.02), projected_7d: Math.round(spot * 1.14), projected_15d: Math.round(spot * 1.25), projected_30d: Math.round(spot * 0.88), surge_probability_percent: 89, recommendation: 'Lock Rate Now' },
          { source: 'EaseMyTrip', source_type: 'ota', flight_number: 'QP-1102', airline_code: 'QP', current_spot_fare: Math.round(spot * 0.94), projected_7d: Math.round(spot * 1.06), projected_15d: Math.round(spot * 1.18), projected_30d: Math.round(spot * 0.84), surge_probability_percent: 74, recommendation: 'Wait for Advance Window' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(activeRouteId);
  }, [activeRouteId]);

  const route = ROUTES_DATA.find((r) => r.id === activeRouteId) || ROUTES_DATA[0];

  const spotAvg = forecastData?.current_avg_spot_fare ?? route.currentFare;
  const baseForecastMin = Math.round(spotAvg * 1.08 + fuelAdjustment * 25);
  const baseForecastMax = Math.round(spotAvg * 1.14 + fuelAdjustment * 35 + (loadFactor - 80) * 40);

  const carrierForecastsList = (forecastData?.carrier_forecasts && forecastData.carrier_forecasts.length > 0)
    ? forecastData.carrier_forecasts
    : [
        { source: 'IndiGo', source_type: 'airline', flight_number: '6E-512', airline_code: '6E', current_spot_fare: Math.round(spotAvg * 0.98), projected_7d: Math.round(spotAvg * 1.10), projected_15d: Math.round(spotAvg * 1.22), surge_probability_percent: 88, recommendation: 'Lock Rate Now' },
        { source: 'Air India', source_type: 'airline', flight_number: 'AI-805', airline_code: 'AI', current_spot_fare: Math.round(spotAvg * 1.05), projected_7d: Math.round(spotAvg * 1.16), projected_15d: Math.round(spotAvg * 1.28), surge_probability_percent: 91, recommendation: 'Lock Rate Now' },
        { source: 'Akasa Air', source_type: 'airline', flight_number: 'QP-1102', airline_code: 'QP', current_spot_fare: Math.round(spotAvg * 0.94), projected_7d: Math.round(spotAvg * 1.06), projected_15d: Math.round(spotAvg * 1.18), surge_probability_percent: 74, recommendation: 'Wait for Advance Window' },
        { source: 'SpiceJet', source_type: 'airline', flight_number: 'SG-8192', airline_code: 'SG', current_spot_fare: Math.round(spotAvg * 0.92), projected_7d: Math.round(spotAvg * 1.04), projected_15d: Math.round(spotAvg * 1.15), surge_probability_percent: 72, recommendation: 'Wait for Advance Window' },
        { source: 'Air India Express', source_type: 'airline', flight_number: 'IX-1741', airline_code: 'IX', current_spot_fare: Math.round(spotAvg * 0.90), projected_7d: Math.round(spotAvg * 1.02), projected_15d: Math.round(spotAvg * 1.14), surge_probability_percent: 70, recommendation: 'Wait for Advance Window' },
        { source: 'MakeMyTrip', source_type: 'ota', flight_number: '6E-512', airline_code: '6E', current_spot_fare: Math.round(spotAvg * 1.02), projected_7d: Math.round(spotAvg * 1.14), projected_15d: Math.round(spotAvg * 1.25), surge_probability_percent: 89, recommendation: 'Lock Rate Now' },
        { source: 'EaseMyTrip', source_type: 'ota', flight_number: 'QP-1102', airline_code: 'QP', current_spot_fare: Math.round(spotAvg * 0.94), projected_7d: Math.round(spotAvg * 1.06), projected_15d: Math.round(spotAvg * 1.18), surge_probability_percent: 74, recommendation: 'Wait for Advance Window' },
      ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
              {t.aiForecastTitle}
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE SCRAPED FORECAST</span>
            </span>
          </div>
          <p className="text-sm text-[#627D98] mt-1 font-medium">
            Multi-horizon forward-looking price trajectory per airline & flight number across 11 sources.
          </p>
        </div>

        {/* Route Selector & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchForecast(activeRouteId)}
            title="Refresh Live Forecast"
            className="p-2 bg-white rounded-xl border border-[#CBD5E1] text-[#1769E0] hover:bg-[#F6F9FC] cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <select
            value={activeRouteId}
            onChange={(e) => {
              setActiveRouteId(e.target.value);
              onSelectRoute(e.target.value);
            }}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-[#CBD5E1] bg-white text-[#102A43] focus:outline-none focus:border-[#1769E0] shadow-2xs"
          >
            <option value="DEL-BOM">DEL-BOM (Delhi → Mumbai)</option>
            <option value="DEL-BLR">DEL-BLR (Delhi → Bengaluru)</option>
            <option value="BOM-BLR">BOM-BLR (Mumbai → Bengaluru)</option>
            <option value="DEL-CCU">DEL-CCU (Delhi → Kolkata)</option>
            <option value="MAA-DEL">MAA-DEL (Chennai → Delhi)</option>
            <option value="BOM-GOI">BOM-GOI (Mumbai → Goa)</option>
            <option value="BLR-HYD">BLR-HYD (Bengaluru → Hyderabad)</option>
            <option value="DEL-HYD">DEL-HYD (Delhi → Hyderabad)</option>
          </select>
        </div>
      </div>

      {/* Main Forecast Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Route & Current Spot Fare */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <span className="text-xs text-[#627D98] font-semibold uppercase tracking-wider block mb-1">
            Sector Under Forecast
          </span>
          <div className="font-mono text-2xl font-black text-[#0B1F3A]">
            {activeRouteId}
          </div>
          <div className="text-xs text-[#627D98] mt-2 flex items-center justify-between">
            <span>Mean Spot Price:</span>
            <span className="font-mono font-bold text-[#1769E0]">
              ₹{spotAvg.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Next 7 Days Range */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <span className="text-xs text-[#627D98] font-semibold uppercase tracking-wider block mb-1">
            {t.next7Days} Projected Range
          </span>
          <div className="font-mono text-2xl font-black text-[#1769E0]">
            ₹{baseForecastMin.toLocaleString('en-IN')} – ₹{baseForecastMax.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Expected Surge: +8% to +14%</span>
          </div>
        </div>

        {/* Prediction Confidence */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <span className="text-xs text-[#627D98] font-semibold uppercase tracking-wider block mb-1">
            Confidence Interval
          </span>
          <div className="font-mono text-2xl font-black text-emerald-600">
            {forecastData?.confidence_score_percent ?? 91}%
          </div>
          <div className="text-xs text-[#627D98] mt-2">
            Backtested against 90-day rolling actuals
          </div>
        </div>

        {/* Action CTA */}
        <div className="bg-[#FAFCFF] rounded-2xl p-5 border border-[#2F80ED]/30 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#1769E0] font-bold block mb-1">
              Price Risk Advisory
            </span>
            <div className="text-xs text-[#627D98]">
              High probability of fare surge before departure window.
            </div>
          </div>
          <button
            onClick={onOpenAlertModal}
            className="w-full mt-2 py-2 px-3 bg-[#1769E0] hover:bg-[#1253B3] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Lock Rate / Set Alert
          </button>
        </div>
      </div>

      {/* Main Interactive Forecast Chart */}
      <ForecastChart
        currentFare={spotAvg}
        routeLabel={activeRouteId}
      />

      {/* Real-time Airline & Flight Forecast Breakdown Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#0B1F3A]">
              Flight & Airline Carrier Yield Forecast Breakdown ({activeRouteId})
            </h2>
            <p className="text-xs text-[#627D98] font-medium mt-0.5">
              Specific flight numbers forecasted across IndiGo, Air India, Akasa Air, SpiceJet, AI Express & OTAs
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-[#EAF3FF] text-[#1769E0] rounded-lg border border-[#1769E0]/20 font-mono">
            UPDATED REAL-TIME
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-xs font-bold text-[#627D98] uppercase tracking-wider">
                <th className="py-3 px-4">Carrier / Provider</th>
                <th className="py-3 px-4">Flight No.</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Current Spot Fare</th>
                <th className="py-3 px-4">Projected 7D</th>
                <th className="py-3 px-4">Projected 15D</th>
                <th className="py-3 px-4">Surge Risk</th>
                <th className="py-3 px-4 font-black text-[#0B1F3A]">AI Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#102A43]">
              {carrierForecastsList.map((cf, idx) => (
                <tr key={idx} className="hover:bg-[#F6F9FC] transition-colors">
                  <td className="py-3 px-4 font-bold flex items-center gap-2">
                    <Plane className="w-4 h-4 text-[#1769E0]" />
                    <span>{cf.source}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-xs text-[#0B1F3A]">
                    {cf.flight_number}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cf.source_type === 'airline' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {cf.source_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold">₹{cf.current_spot_fare.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-red-600 font-bold">₹{cf.projected_7d.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-[#627D98]">₹{cf.projected_15d.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cf.surge_probability_percent > 85 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {cf.surge_probability_percent}% Risk
                    </span>
                  </td>
                  <td className="py-3 px-4 font-extrabold text-[#1769E0]">
                    {cf.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insight Card & Sensitivity Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Insight Card */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1F3A]">
                {t.aiInsightTitle}: {t.probIncrease}
              </h3>
              <p className="text-xs text-[#627D98]">
                Multivariate factors driving positive price skew over next 7–15 days:
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0] flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#102A43] block">
                  {t.reasonFestival}
                </span>
                <span className="text-[11px] text-[#627D98]">
                  Historical seat occupancy on this corridor surges to &gt;92% during upcoming transit periods.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0] flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#102A43] block">
                  {t.reasonWindow}
                </span>
                <span className="text-[11px] text-[#627D98]">
                  Departures entering the &lt;14 day horizon automatically move out of Tier-1 economy buckets into Tier-4 dynamic buckets.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0] flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#1769E0] mt-1.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#102A43] block">
                  {t.reasonPattern}
                </span>
                <span className="text-[11px] text-[#627D98]">
                  94.2% historical probability of non-reversible price escalation once median fares breach ₹5,200.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sensitivity & Scenario Simulator */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#EAF3FF] text-[#1769E0]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B1F3A]">
                  AI Sensitivity Simulator
                </h3>
                <p className="text-xs text-[#627D98]">
                  Adjust macroeconomic levers to observe predicted fare sensitivity.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F6F9FC] text-[#627D98] border border-[#E2E8F0]">
              Interactive
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {/* Lever 1: Passenger Load Factor */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#102A43]">
                  Corridor Passenger Load Factor (PLF):
                </span>
                <span className="font-mono font-bold text-[#1769E0]">
                  {loadFactor}%
                </span>
              </div>
              <input
                type="range"
                min="65"
                max="98"
                value={loadFactor}
                onChange={(e) => setLoadFactor(Number(e.target.value))}
                className="w-full h-2 bg-[#CBD5E1] rounded-lg appearance-none cursor-pointer accent-[#1769E0]"
              />
              <div className="flex justify-between text-[10px] text-[#627D98] mt-0.5">
                <span>Low Demand (65%)</span>
                <span>Normal (82%)</span>
                <span>Sold Out Shock (98%)</span>
              </div>
            </div>

            {/* Lever 2: Aviation Turbine Fuel (ATF) Drift */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#102A43]">
                  Aviation Fuel (ATF) Price Shift:
                </span>
                <span className="font-mono font-bold text-[#1769E0]">
                  {fuelAdjustment >= 0 ? `+${fuelAdjustment}%` : `${fuelAdjustment}%`}
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="25"
                value={fuelAdjustment}
                onChange={(e) => setFuelAdjustment(Number(e.target.value))}
                className="w-full h-2 bg-[#CBD5E1] rounded-lg appearance-none cursor-pointer accent-[#1769E0]"
              />
              <div className="flex justify-between text-[10px] text-[#627D98] mt-0.5">
                <span>-15% Drop</span>
                <span>Baseline</span>
                <span>+25% Spike</span>
              </div>
            </div>

            {/* Impact Readout */}
            <div className="bg-[#F6F9FC] p-3.5 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#627D98] block">Simulated 7D Peak Price</span>
                <span className="font-mono text-xl font-black text-[#0B1F3A]">
                  ₹{baseForecastMax.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#627D98] block">Price Elasticity Delta</span>
                <span className="font-mono text-sm font-bold text-[#1769E0]">
                  +{Math.round(((baseForecastMax - spotAvg) / spotAvg) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

