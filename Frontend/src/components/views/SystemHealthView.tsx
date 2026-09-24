import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Database,
  CheckCircle2,
  RefreshCw,
  Cpu,
  HardDrive,
  Clock,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { apiService, HealthResponse } from '../../services/api';

interface SystemHealthViewProps {
  language: Language;
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [secondsUntilNextCrawl, setSecondsUntilNextCrawl] = useState<number>(() => {
    const nowSec = Math.floor(Date.now() / 1000);
    return 7200 - (nowSec % 7200);
  });

  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      const res = await apiService.getHealth();
      setHealthData(res);
      if (res.next_crawl_time) {
        const nextTime = new Date(res.next_crawl_time).getTime();
        const diffSec = Math.max(0, Math.floor((nextTime - Date.now()) / 1000));
        setSecondsUntilNextCrawl(diffSec);
      }
    } catch (err) {
      console.warn('Health API note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    const timer = setInterval(() => {
      setSecondsUntilNextCrawl((prev) => (prev > 1 ? prev - 1 : 7200));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}h ${m}m ${s < 10 ? '0' : ''}${s}s`;
    }
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const postgresOk = healthData?.database_health.postgresql ?? true;
  const mongoOk = healthData?.database_health.mongodb ?? true;
  const redisOk = healthData?.database_health.redis ?? true;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
              Backend System Health & Database Telemetry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>API ONLINE</span>
            </span>
          </div>
          <p className="text-sm text-[#627D98] font-medium mt-1">
            Real-time status for PostgreSQL/TimescaleDB, MongoDB, Redis, and APScheduler daemon
          </p>
        </div>

        <button
          onClick={fetchHealthStatus}
          className="px-3.5 py-2 text-xs font-bold rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F6F9FC] text-[#102A43] shadow-2xs transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#1769E0] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Database Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TimescaleDB Status */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#627D98]">TimescaleDB (Clean Fares)</span>
            <Database className="w-4 h-4 text-[#1769E0]" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${postgresOk ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-lg font-extrabold text-[#0B1F3A]">{postgresOk ? 'Operational' : 'Simulated DB'}</span>
          </div>
          <p className="text-xs text-[#627D98] font-medium mt-1">PostgreSQL 15+ hypertable storage for time-series APIx</p>
        </div>

        {/* MongoDB Status */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#627D98]">MongoDB (Raw JSON)</span>
            <HardDrive className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${mongoOk ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-lg font-extrabold text-[#0B1F3A]">{mongoOk ? 'Operational' : 'Simulated DB'}</span>
          </div>
          <p className="text-xs text-[#627D98] font-medium mt-1">MongoDB 6.0 raw scrape JSON storage</p>
        </div>

        {/* Redis Status */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#627D98]">Redis (Deduplication)</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${redisOk ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-lg font-extrabold text-[#0B1F3A]">{redisOk ? 'Operational' : 'Memory Cache Fallback'}</span>
          </div>
          <p className="text-xs text-[#627D98] font-medium mt-1">Redis 7.0 cache for key deduplication (TTL 24h)</p>
        </div>
      </div>

      {/* Background Scheduler & Ingestion Status */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#0B1F3A]">
            APScheduler Automated Crawl Daemon Status
          </h2>
          <span className="px-2.5 py-1 text-xs font-bold bg-[#EAF3FF] text-[#1769E0] rounded-lg border border-[#1769E0]/20">
            2-HOUR CYCLE ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0]">
            <div className="text-xs font-bold text-[#627D98]">Next Automated Crawl Cycle</div>
            <div className="text-2xl font-black text-[#1769E0] mt-1">{formatCountdown(secondsUntilNextCrawl)}</div>
            <div className="text-xs text-[#627D98] mt-1 font-medium">Scrapes 11 sources across 50 DGCA routes</div>
          </div>

          <div className="p-4 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0]">
            <div className="text-xs font-bold text-[#627D98]">System API Version</div>
            <div className="text-2xl font-black text-[#0B1F3A] mt-1">{healthData?.version || '1.0.0'}</div>
            <div className="text-xs text-[#627D98] mt-1 font-medium">FastAPI Python 3.11+ async framework</div>
          </div>
        </div>
      </div>
    </div>
  );
};
