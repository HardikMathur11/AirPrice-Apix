import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Download,
  Check,
  Code2,
  Server,
  Key,
  Database,
  RefreshCw,
} from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { ROUTES_DATA, SYSTEM_METRICS, FARE_SHOCK_ALERTS } from '../../data/mockData';
import { apiService } from '../../services/api';

interface ApiDataViewProps {
  language: Language;
}

export const ApiDataView: React.FC<ApiDataViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  // Playground state
  const [selectedEndpoint, setSelectedEndpoint] = useState<
    '/api/v1/apix/current' | '/api/v1/routes' | '/api/v1/routes/prices' | '/api/v1/routes/elasticity' | '/health'
  >('/api/v1/apix/current');
  const [selectedRoute, setSelectedRoute] = useState('DEL-BOM');
  const [selectedWindow, setSelectedWindow] = useState('T+7');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liveResponse, setLiveResponse] = useState<any>(null);

  const fetchPlaygroundData = async () => {
    setIsLoading(true);
    try {
      let res: any;
      if (selectedEndpoint === '/api/v1/apix/current') {
        res = await apiService.getCurrentApix();
      } else if (selectedEndpoint === '/api/v1/routes') {
        res = await apiService.getRoutes();
      } else if (selectedEndpoint === '/api/v1/routes/prices') {
        res = await apiService.getRoutePrices(selectedRoute, selectedWindow);
      } else if (selectedEndpoint === '/api/v1/routes/elasticity') {
        res = await apiService.getRouteElasticity(selectedRoute);
      } else if (selectedEndpoint === '/health') {
        res = await apiService.getHealth();
      }
      setLiveResponse(res);
    } catch (err: any) {
      console.warn('API fetch error in playground:', err);
      setLiveResponse({ error: err.message, status: 'fallback', note: 'Ensure backend is running at http://localhost:8000' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaygroundData();
  }, [selectedEndpoint, selectedRoute, selectedWindow]);

  const jsonString = JSON.stringify(liveResponse || {}, null, 2);

  const handleRunRequest = () => {
    setIsLoading(true);
    setTimeout(() => {
      setResponseTimestamp(new Date().toISOString());
      setIsLoading(false);
    }, 280);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Route,Current_Fare,Normal_Fare,Deviation_Pct,Reliability\n' +
      ROUTES_DATA.map((r) => `${r.id},${r.currentFare},${r.normalFare},${r.changePercent}%,${r.reliabilityScore}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `airprice_apix_export_${selectedEndpoint.replace(/\//g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
              {t.govApiTitle}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold font-mono">
              🟢 API Status: Operational
            </span>
          </div>
          <p className="text-sm text-[#627D98] mt-1 font-medium">
            Programmatic REST endpoints for DGCA, RBI Research and national economic researchers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs bg-white px-3 py-1.5 rounded-xl border border-[#E2E8F0] shadow-2xs font-mono text-[#627D98]">
            SLA: 99.98% • Latency &lt;35ms
          </div>
        </div>
      </div>

      {/* Endpoint Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          {
            path: '/api/v1/apix/current' as const,
            name: 'Current APIx Index',
            desc: 'Aggregate national price index and period changes',
          },
          {
            path: '/api/v1/routes' as const,
            name: 'Monitored Routes',
            desc: 'All 50 DGCA routes & corridor traffic weights',
          },
          {
            path: '/api/v1/routes/prices' as const,
            name: '11 Sources Pricing',
            desc: 'Real-time fare breakdown for a corridor',
          },
          {
            path: '/api/v1/routes/elasticity' as const,
            name: 'Booking Elasticity',
            desc: 'Lead-time pricing curve and max savings',
          },
          {
            path: '/health' as const,
            name: 'System Telemetry',
            desc: 'TimescaleDB, Mongo & Redis health status',
          },
        ].map((ep) => (
          <button
            key={ep.path}
            onClick={() => setSelectedEndpoint(ep.path)}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedEndpoint === ep.path
                ? 'bg-[#EAF3FF] border-[#1769E0] ring-2 ring-[#1769E0]/20 shadow-xs'
                : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#1769E0] mb-1">
              <span className="px-1.5 py-0.5 rounded bg-[#1769E0] text-white text-[9px]">
                GET
              </span>
              <span className="truncate">{ep.path}</span>
            </div>
            <div className="text-xs font-bold text-[#102A43]">{ep.name}</div>
            <p className="text-[11px] text-[#627D98] mt-0.5 leading-snug">
              {ep.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Interactive Playground Control Bar */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#1769E0]" />
            <h3 className="text-base font-bold text-[#0B1F3A]">
              Live API Request Playground
            </h3>
          </div>
          <span className="text-xs text-[#627D98] font-mono">
            Header: X-API-Key: airprice_demo_key_2026
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Endpoint */}
          <div>
            <label className="block text-[11px] font-bold text-[#102A43] uppercase mb-1">
              Target Endpoint
            </label>
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-[#CBD5E1] bg-[#F8FAFC]"
            >
              <option value="/api/v1/apix/current">GET /api/v1/apix/current</option>
              <option value="/api/v1/routes">GET /api/v1/routes</option>
              <option value="/api/v1/routes/prices">GET /api/v1/routes/{'{code}'}/prices</option>
              <option value="/api/v1/routes/elasticity">GET /api/v1/routes/{'{code}'}/elasticity</option>
              <option value="/health">GET /health</option>
            </select>
          </div>

          {/* Route Parameter (disabled for non-route endpoints) */}
          <div>
            <label className="block text-[11px] font-bold text-[#102A43] uppercase mb-1">
              Route Code
            </label>
            <select
              value={selectedRoute}
              disabled={selectedEndpoint !== '/api/v1/routes/prices' && selectedEndpoint !== '/api/v1/routes/elasticity'}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-[#CBD5E1] ${
                selectedEndpoint === '/api/v1/routes/prices' || selectedEndpoint === '/api/v1/routes/elasticity' ? 'bg-[#F8FAFC]' : 'bg-gray-100 opacity-60 cursor-not-allowed'
              }`}
            >
              <option value="DEL-BOM">DEL-BOM (Delhi → Mumbai)</option>
              <option value="DEL-BLR">DEL-BLR (Delhi → Bengaluru)</option>
              <option value="BOM-BLR">BOM-BLR (Mumbai → Bengaluru)</option>
              <option value="DEL-CCU">DEL-CCU (Delhi → Kolkata)</option>
              <option value="MAA-DEL">MAA-DEL (Chennai → Delhi)</option>
            </select>
          </div>

          {/* Booking Window */}
          <div>
            <label className="block text-[11px] font-bold text-[#102A43] uppercase mb-1">
              Booking Lead Window
            </label>
            <select
              value={selectedWindow}
              disabled={selectedEndpoint !== '/api/v1/routes/prices'}
              onChange={(e) => setSelectedWindow(e.target.value)}
              className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-[#CBD5E1] ${
                selectedEndpoint === '/api/v1/routes/prices' ? 'bg-[#F8FAFC]' : 'bg-gray-100 opacity-60 cursor-not-allowed'
              }`}
            >
              <option value="T+1">T+1 Day</option>
              <option value="T+7">T+7 Days</option>
              <option value="T+15">T+15 Days</option>
              <option value="T+30">T+30 Days</option>
              <option value="T+45">T+45 Days</option>
            </select>
          </div>
        </div>

        {/* Run Request Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleRunRequest}
            disabled={isLoading}
            className="px-5 py-2.5 bg-[#1769E0] hover:bg-[#1253B3] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Executing Query...' : t.runApiRequest}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="px-3 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F6F9FC] text-[#102A43] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : t.copyJson}</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F6F9FC] text-[#102A43] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#1769E0]" />
              <span>{t.downloadCsv}</span>
            </button>
          </div>
        </div>

        {/* Realistic JSON Response Display Code Block */}
        <div className="relative rounded-2xl bg-[#0B1F3A] text-white p-4 font-mono text-xs overflow-hidden border border-[#1E293B]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-[#9FB3C8]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 font-bold">HTTP 200 OK</span>
              <span>•</span>
              <span>Content-Type: application/json</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Latency: 24ms</span>
              <span>Size: {(jsonString.length / 1024).toFixed(1)} KB</span>
            </div>
          </div>

          <pre className="overflow-x-auto max-h-96 text-[#E2E8F0] leading-relaxed select-all">
            {jsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};
