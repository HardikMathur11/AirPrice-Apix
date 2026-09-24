/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserMode, Language, ScreenId, RouteData } from './types';
import { ROUTES_DATA } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';

// Views
import { LandingView } from './components/views/LandingView';
import { OverviewView } from './components/views/OverviewView';
import { RoutesView } from './components/views/RoutesView';
import { WhenToBookView } from './components/views/WhenToBookView';
import { ForecastView } from './components/views/ForecastView';
import { FareShockView } from './components/views/FareShockView';
import { InflationView } from './components/views/InflationView';
import { ReliabilityView } from './components/views/ReliabilityView';
import { ApiDataView } from './components/views/ApiDataView';
import { SystemHealthView } from './components/views/SystemHealthView';

// Modals
import { FareAlertModal } from './components/modals/FareAlertModal';
import { ReliabilityDetailModal } from './components/modals/ReliabilityDetailModal';
import { InflationExplainerModal } from './components/modals/InflationExplainerModal';

export default function App() {
  // Global Application State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('landing');
  const [userMode, setUserMode] = useState<UserMode>('policy');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('DEL-BOM');

  // Modal State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isExplainerModalOpen, setIsExplainerModalOpen] = useState(false);
  const [reliabilityModalRoute, setReliabilityModalRoute] = useState<RouteData | null>(null);

  // Active route object
  const activeRoute =
    ROUTES_DATA.find((r) => r.id === selectedRouteId) || ROUTES_DATA[0];

  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  const handleOpenReliabilityModal = (route: RouteData) => {
    setReliabilityModalRoute(route);
  };

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-[#102A43] flex flex-col font-sans selection:bg-[#EAF3FF] selection:text-[#1769E0]">
      {/* Top Universal Navbar */}
      <Navbar
        currentScreen={currentScreen}
        userMode={userMode}
        onToggleUserMode={setUserMode}
        language={language}
        onToggleLanguage={setLanguage}
        onNavigate={setCurrentScreen}
        onSelectRoute={handleSelectRoute}
        onOpenAlertModal={() => setIsAlertModalOpen(true)}
      />

      {/* Main App Container: Full-Width Landing or Dashboard Shell with Sidebar */}
      {currentScreen === 'landing' ? (
        <LandingView
          onNavigate={setCurrentScreen}
          onSelectRoute={handleSelectRoute}
          userMode={userMode}
          onToggleUserMode={setUserMode}
          language={language}
          onOpenAlertModal={() => setIsAlertModalOpen(true)}
        />
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 lg:pb-8">
          {/* Desktop Sidebar */}
          <Sidebar
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            language={language}
            userMode={userMode}
          />

          {/* Dynamic Main Content Canvas */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
            {currentScreen === 'overview' && (
              <OverviewView
                onNavigate={setCurrentScreen}
                onSelectRoute={handleSelectRoute}
                language={language}
                userMode={userMode}
                onOpenAlertModal={() => setIsAlertModalOpen(true)}
              />
            )}

            {currentScreen === 'routes' && (
              <RoutesView
                selectedRouteId={selectedRouteId}
                onSelectRoute={handleSelectRoute}
                onNavigate={setCurrentScreen}
                language={language}
                onOpenAlertModal={() => setIsAlertModalOpen(true)}
                onOpenReliabilityModal={handleOpenReliabilityModal}
              />
            )}

            {currentScreen === 'when-to-book' && (
              <WhenToBookView
                selectedRouteId={selectedRouteId}
                onSelectRoute={handleSelectRoute}
                onNavigate={setCurrentScreen}
                language={language}
                onOpenAlertModal={() => setIsAlertModalOpen(true)}
              />
            )}

            {currentScreen === 'forecast' && (
              <ForecastView
                selectedRouteId={selectedRouteId}
                onSelectRoute={handleSelectRoute}
                onNavigate={setCurrentScreen}
                language={language}
                onOpenAlertModal={() => setIsAlertModalOpen(true)}
              />
            )}

            {currentScreen === 'shocks' && (
              <FareShockView
                onSelectRoute={handleSelectRoute}
                onNavigate={setCurrentScreen}
                language={language}
                onOpenAlertModal={() => setIsAlertModalOpen(true)}
              />
            )}

            {currentScreen === 'inflation' && (
              <InflationView
                onNavigate={setCurrentScreen}
                language={language}
                onOpenExplainerModal={() => setIsExplainerModalOpen(true)}
              />
            )}

            {currentScreen === 'reliability' && (
              <ReliabilityView
                onOpenReliabilityModal={handleOpenReliabilityModal}
                language={language}
              />
            )}

            {currentScreen === 'api' && <ApiDataView language={language} />}

            {currentScreen === 'health' && <SystemHealthView language={language} />}
          </main>
        </div>
      )}

      {/* Mobile Bottom Dock Navigation */}
      <MobileNav
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        language={language}
      />

      {/* Global Interactive Modals */}
      <FareAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        initialRouteId={selectedRouteId}
        language={language}
      />

      <InflationExplainerModal
        isOpen={isExplainerModalOpen}
        onClose={() => setIsExplainerModalOpen(false)}
        language={language}
      />

      <ReliabilityDetailModal
        isOpen={!!reliabilityModalRoute}
        onClose={() => setReliabilityModalRoute(null)}
        route={reliabilityModalRoute}
        language={language}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-6 px-4 text-center text-xs text-[#627D98] space-y-2 hidden lg:block">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <span className="font-bold text-[#0B1F3A]">AirPrice APIx India</span>
          <span>•</span>
          <button
            onClick={() => setIsExplainerModalOpen(true)}
            className="hover:text-[#1769E0] transition-colors cursor-pointer"
          >
            Index Methodology & Weights
          </button>
          <span>•</span>
          <button
            onClick={() => setCurrentScreen('api')}
            className="hover:text-[#1769E0] transition-colors cursor-pointer"
          >
            REST API Documentation
          </button>
          <span>•</span>
          <button
            onClick={() => setCurrentScreen('health')}
            className="hover:text-[#1769E0] transition-colors cursor-pointer"
          >
            System Status & Telemetry
          </button>
        </div>
        <p className="text-[11px] text-[#9FB3C8]">
          AirPrice APIx complies with Government of India MoSPI, RBI Research & DGCA aviation index specifications. Real-time airline data collected across licensed feeds.
        </p>
      </footer>
    </div>
  );
}

