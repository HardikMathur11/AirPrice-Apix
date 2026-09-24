import React from 'react';
import {
  LayoutDashboard,
  Compass,
  TrendingUp,
  AlertTriangle,
  PieChart,
  ShieldCheck,
  Terminal,
  Activity,
  CalendarCheck,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ScreenId, Language, UserMode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  language: Language;
  userMode: UserMode;
  activeShocksCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  language,
  userMode,
  activeShocksCount = 3,
}) => {
  const t = TRANSLATIONS[language];

  const navItems: {
    id: ScreenId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'overview', label: t.overview, icon: LayoutDashboard },
    { id: 'routes', label: t.routes, icon: Compass },
    { id: 'when-to-book', label: t.whenToBook, icon: CalendarCheck, badge: 'AI', badgeColor: 'bg-[#EAF3FF] text-[#1769E0]' },
    { id: 'forecast', label: t.forecast, icon: TrendingUp },
    {
      id: 'shocks',
      label: t.fareShocks,
      icon: AlertTriangle,
      badge: activeShocksCount,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    { id: 'inflation', label: t.inflation, icon: PieChart },
    { id: 'reliability', label: t.reliability, icon: ShieldCheck },
    { id: 'api', label: t.apiData, icon: Terminal },
    { id: 'health', label: t.systemHealth, icon: Activity },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between bg-white border-r border-[#E2E8F0] h-[calc(100vh-4rem)] sticky top-16 p-4">
      {/* Top Nav List */}
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#627D98] px-3 mb-2.5">
            Policy Analytics Suite
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1769E0] text-white shadow-xs'
                      : 'text-[#102A43] hover:bg-[#F6F9FC] hover:text-[#1769E0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-[#627D98]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        item.badgeColor || 'bg-[#EAF3FF] text-[#1769E0]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Highlight Feature Card: "Kab Book Karein?" */}
        <div
          onClick={() => onNavigate('when-to-book')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-[#1769E0] text-white cursor-pointer shadow-md hover:scale-[1.02] transition-all group"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white uppercase tracking-wider">
              Citizen Advisory
            </span>
            <span className="text-[11px] text-[#93C5FD] font-mono">~38% Off</span>
          </div>
          <h4 className="text-xs font-bold leading-snug group-hover:text-[#93C5FD] transition-colors">
            Kab Book Karein?
          </h4>
          <p className="text-[10px] text-[#CBD5E1] mt-1 line-clamp-2">
            AI-calculated golden booking window for maximum fare savings.
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-white group-hover:translate-x-0.5 transition-transform">
            <span>Explore Recommendation</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Bottom Authority & Governance Trust Box */}
      <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
        <div className="p-3 bg-[#F6F9FC] rounded-xl border border-[#E2E8F0] text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#0B1F3A] text-[11px] mb-1">
            <Award className="w-3.5 h-3.5 text-[#1769E0]" />
            <span>National Index Standards</span>
          </div>
          <p className="text-[10px] text-[#627D98] leading-tight">
            Compliant with MoSPI, RBI & DGCA aviation index methodology specifications.
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#627D98] px-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Crawlers Live (6E, AI, OTA)
          </span>
          <span className="font-mono">APIx v2.4</span>
        </div>
      </div>
    </aside>
  );
};
