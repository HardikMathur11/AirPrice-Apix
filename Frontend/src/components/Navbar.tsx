import React, { useState, useRef, useEffect } from 'react';
import {
  Plane,
  BarChart3,
  Search,
  Bell,
  User,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Flame,
  X,
  ExternalLink,
  ArrowRight,
  Building2,
} from 'lucide-react';
import { UserMode, Language, ScreenId } from '../types';
import { FARE_SHOCK_ALERTS, ROUTES_DATA } from '../data/mockData';
import { TRANSLATIONS } from '../i18n/translations';

interface NavbarProps {
  currentScreen?: ScreenId;
  userMode: UserMode;
  onToggleUserMode: (mode: UserMode) => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onNavigate: (screen: ScreenId) => void;
  onSelectRoute: (routeId: string) => void;
  onOpenAlertModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen = 'landing',
  userMode,
  onToggleUserMode,
  language,
  onToggleLanguage,
  onNavigate,
  onSelectRoute,
  onOpenAlertModal,
}) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(FARE_SHOCK_ALERTS);
  const [hasUnread, setHasUnread] = useState(true);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRoutes = searchQuery.trim()
    ? ROUTES_DATA.filter(
        (r) =>
          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.destinationCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.originCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.destinationCode.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* Minimal Logo: Plane + Data signal bars */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0B1F3A] to-[#1769E0] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <div className="relative flex items-center justify-center">
                <Plane className="w-4 h-4 text-white -rotate-45" />
                <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-[#0B1F3A]">
                  AirPrice <span className="text-[#1769E0]">APIx</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EAF3FF] text-[#1769E0] uppercase tracking-wider font-mono">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-[#627D98] font-medium hidden md:block">
                India's Real-Time Airfare Intelligence Platform
              </p>
            </div>
          </div>

          {/* Live Data Badge */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-[#F6F9FC] rounded-full border border-[#E2E8F0] text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-bold text-[10px] text-[#102A43] tracking-wider uppercase">
              {t.liveData}
            </span>
            <span className="text-[10px] text-[#627D98] font-medium border-l border-[#E2E8F0] pl-2">
              {t.updatedAgo}
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#627D98] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#F6F9FC] border border-[#E2E8F0] rounded-xl text-[#102A43] placeholder-[#627D98] focus:bg-white focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#EAF3FF] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#627D98] hover:text-[#102A43]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-11 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-50 animate-in fade-in duration-100 max-h-72 overflow-y-auto">
              {filteredRoutes.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[#627D98] uppercase tracking-wider">
                    Corridors Found ({filteredRoutes.length})
                  </div>
                  {filteredRoutes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        onSelectRoute(r.id);
                        onNavigate('routes');
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="p-2 rounded-xl hover:bg-[#EAF3FF] cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1769E0]" />
                        <div>
                          <span className="text-xs font-bold text-[#102A43]">
                            {r.originCity} ({r.originCode}) → {r.destinationCity} ({r.destinationCode})
                          </span>
                          <span className="text-[10px] text-[#627D98] block">
                            {r.dailyFlights} daily flights • Reliability: {r.reliabilityScore}/100
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#0B1F3A]">
                        ₹{r.currentFare}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-[#627D98]">
                  No routes matching &ldquo;{searchQuery}&rdquo;. Try DEL-BOM or BLR.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Nav Tools: Audience Toggle, Language, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Policy & Regulator Official Suite Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1F3A] text-white border border-[#1769E0]/30 shadow-xs text-xs font-bold font-mono">
            <Building2 className="w-3.5 h-3.5 text-[#93C5FD]" />
            <span>MoSPI · RBI · DGCA Suite</span>
          </div>

          {/* Language Selector: EN / HI */}
          <button
            onClick={() => onToggleLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-[#E2E8F0] bg-[#F6F9FC] hover:bg-[#EAF3FF] hover:border-[#1769E0]/40 text-[#102A43] transition-colors cursor-pointer"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5 text-[#1769E0]" />
            <span>{language === 'en' ? 'HI' : 'EN'}</span>
          </button>

          {/* Quick Screen Switcher: Landing vs Live Dashboard */}
          {currentScreen === 'landing' ? (
            <button
              onClick={() => onNavigate('overview')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#1769E0] hover:bg-[#1253B3] text-white shadow-xs transition-colors cursor-pointer"
            >
              <span>Live Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('landing')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#EAF3FF] text-[#0B1F3A] hover:text-[#1769E0] shadow-2xs transition-colors cursor-pointer"
            >
              <span>Home / Landing</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setHasUnread(false);
              }}
              className="relative p-2 rounded-xl border border-[#E2E8F0] bg-[#F6F9FC] hover:bg-[#EAF3FF] text-[#102A43] transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#102A43]" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-4 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0B1F3A]">
                      Real-Time Airfare Alerts
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                      {notifications.length} Active
                    </span>
                  </div>
                  <button
                    onClick={onOpenAlertModal}
                    className="text-[11px] font-semibold text-[#1769E0] hover:underline"
                  >
                    + New Alert
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        onSelectRoute(alert.routeId);
                        onNavigate('shocks');
                        setShowNotifications(false);
                      }}
                      className="p-2.5 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] hover:bg-[#EAF3FF] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#102A43] font-mono">
                          {alert.routeLabel}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            alert.severity === 'severe'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          +{alert.deviationPercent}%
                        </span>
                      </div>
                      <p className="text-[11px] text-[#627D98] leading-tight mb-1">
                        {alert.reason}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-[#627D98]">
                        <span>Live: ₹{alert.currentFare} (Norm: ₹{alert.normalFare})</span>
                        <span className="text-[#1769E0] font-medium">{alert.detectedTime}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-[#E2E8F0] flex justify-between items-center text-xs">
                  <button
                    onClick={() => {
                      onNavigate('shocks');
                      setShowNotifications(false);
                    }}
                    className="text-[#1769E0] font-semibold hover:underline"
                  >
                    View All Shock Incidents →
                  </button>
                  <span className="text-[10px] text-[#627D98]">DGCA / RBI Feed</span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-1 border-l border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-xl bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              GOI
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-xs font-bold text-[#102A43] block leading-tight">
                MoSPI Officer
              </span>
              <span className="text-[10px] text-[#627D98] block">
                DGCA & RBI Authorized
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
