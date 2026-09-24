import React, { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  AlertTriangle,
  TrendingUp,
  MoreHorizontal,
  X,
  PieChart,
  ShieldCheck,
  Terminal,
  Activity,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';
import { ScreenId, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface MobileNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  language: Language;
  activeShocksCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentScreen,
  onNavigate,
  language,
  activeShocksCount = 3,
}) => {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const t = TRANSLATIONS[language];

  const primaryItems: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'routes', label: 'Routes', icon: Compass },
    { id: 'shocks', label: 'Alerts', icon: AlertTriangle, badge: activeShocksCount },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  ];

  const moreItems: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'when-to-book', label: t.whenToBook, icon: CalendarCheck },
    { id: 'inflation', label: t.inflation, icon: PieChart },
    { id: 'reliability', label: t.reliability, icon: ShieldCheck },
    { id: 'api', label: t.apiData, icon: Terminal },
    { id: 'health', label: t.systemHealth, icon: Activity },
  ];

  return (
    <>
      {/* Bottom Floating/Docked Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-2 py-2 shadow-lg">
        <div className="grid grid-cols-5 gap-1">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setShowMoreDrawer(false);
                }}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
                  isActive ? 'text-[#1769E0] font-bold' : 'text-[#627D98] hover:text-[#102A43]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#1769E0]' : 'text-[#627D98]'}`} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white font-mono text-[9px] px-1 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1">{item.label}</span>
              </button>
            );
          })}

          {/* More Toggle */}
          <button
            onClick={() => setShowMoreDrawer(!showMoreDrawer)}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
              showMoreDrawer ? 'text-[#1769E0] font-bold' : 'text-[#627D98] hover:text-[#102A43]'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 text-[#627D98]" />
            <span className="text-[10px] mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* "More" Modal / Drawer */}
      {showMoreDrawer && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#0B1F3A]/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl border-t border-[#E2E8F0] space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="text-sm font-bold text-[#0B1F3A]">All Intelligence Views</span>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="p-1.5 rounded-full bg-[#F6F9FC] text-[#627D98]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setShowMoreDrawer(false);
                    }}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                      isActive
                        ? 'bg-[#EAF3FF] border-[#1769E0] text-[#1769E0] font-bold'
                        : 'border-[#E2E8F0] bg-[#FAFCFF] text-[#102A43] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#1769E0]" />
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
