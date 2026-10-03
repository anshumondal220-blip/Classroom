'use client';

import React, { useState } from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import Navbar from './Navbar';
import HeroLanding from './HeroLanding';
import CampusMap from './CampusMap';
import RouteFinder from './RouteFinder';
import FacilityDirectory from './FacilityDirectory';
import ReportIssueModal from './ReportIssueModal';
import EmergencyHub from './EmergencyHub';
import AiAssistant from './AiAssistant';
import DashboardStats from './DashboardStats';
import AccessibilitySettingsModal from './AccessibilitySettingsModal';
import {
  MapPin,
  Route,
  Layers,
  AlertTriangle,
  LifeBuoy,
  Sparkles,
  Phone,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function AppMain() {
  const { activeTab, setActiveTab } = useAccessibility();

  // Settings modal open state
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Report Issue modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportFacilityName, setReportFacilityName] = useState<string | undefined>();
  const [reportLocation, setReportLocation] = useState<string | undefined>();

  const handleTriggerReport = (facilityName?: string, location?: string) => {
    setReportFacilityName(facilityName);
    setReportLocation(location);
    setReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Accessible Navbar */}
      <Navbar onOpenSettings={() => setSettingsOpen(true)} />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Render View Based on Active Tab */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            <HeroLanding />
            <DashboardStats />

            {/* Interactive Campus Map Preview */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>Interactive Campus Blueprint</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click any marker to view accessibility specs or calculate an immediate step-free route.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('map')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <span>Full Map View</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <CampusMap />
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-6 w-6 text-blue-600" />
                <span>Interactive Campus Map</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Explore buildings, classrooms, ramps, elevators, restrooms, and emergency assembly zones. Click any point to calculate routes.
              </p>
            </div>
            <CampusMap />
          </div>
        )}

        {activeTab === 'finder' && (
          <div className="space-y-8">
            <RouteFinder />
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Visualized Active Route on Campus</span>
              </h3>
              <CampusMap />
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <FacilityDirectory onTriggerReportIssue={handleTriggerReport} />
        )}

        {activeTab === 'report' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                  <span>Report an Accessibility Barrier</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Report broken elevators, ice on ramps, construction closures, or power door failures to update real-time routing.
                </p>
              </div>
              <button
                onClick={() => setReportModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors shrink-0"
              >
                + New Barrier Report
              </button>
            </div>

            {/* Always Render the Modal or Embed */}
            <ReportIssueModal
              isOpen={true}
              onClose={() => setActiveTab('home')}
              initialFacilityName={reportFacilityName}
              initialLocation={reportLocation}
            />
          </div>
        )}

        {activeTab === 'emergency' && <EmergencyHub />}

        {activeTab === 'assistant' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <span>AI Accessibility Assistant</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Natural-language Q&A powered by Google Gemini, grounded in campus building architecture and accessibility accommodations.
              </p>
            </div>
            <AiAssistant />
          </div>
        )}
      </main>

      {/* Floating Action Navigation Dock for Mobile / Fast Switching */}
      <aside aria-label="Quick Actions" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-full border border-slate-700 shadow-2xl text-white">
        <button
          onClick={() => setActiveTab('finder')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            activeTab === 'finder' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
          }`}
          aria-label="Quick Route Finder"
        >
          <Route className="h-3.5 w-3.5" />
          <span>Route</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            activeTab === 'map' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
          }`}
          aria-label="Quick Map View"
        >
          <MapPin className="h-3.5 w-3.5" />
          <span>Map</span>
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            activeTab === 'assistant' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
          }`}
          aria-label="Quick AI Assistant"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>AI</span>
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            activeTab === 'emergency' ? 'bg-red-600 text-white' : 'text-red-400 hover:text-red-200'
          }`}
          aria-label="Quick Emergency Evacuation"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Emergency</span>
        </button>
      </aside>

      {/* Accessible Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 dark:text-white tracking-tight">
                  ACCESSIBILITY NAVIGATOR
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  Navigate Campus Without Barriers
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                A universal college campus mobility prototype engineered in compliance with ADA Title II and WCAG 2.2 AA standards.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-blue-600" />
                <span>Disability Services: <strong>+1 (555) 019-4357</strong></span>
              </span>
              <button
                onClick={() => setSettingsOpen(true)}
                className="text-blue-600 hover:underline dark:text-blue-400 font-bold"
              >
                Accessibility Settings
              </button>
              <button
                onClick={() => handleTriggerReport()}
                className="text-amber-600 hover:underline dark:text-amber-400 font-bold"
              >
                Report a Barrier
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 Metropolitan University Campus • Office of Accessibility & Student Accommodations</span>
            <span>All campus pathways regularly inspected for snow, construction, and power lift reliability.</span>
          </div>
        </div>
      </footer>

      {/* Accessibility & Display Settings Modal */}
      <AccessibilitySettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Barrier Report Modal */}
      {reportModalOpen && (
        <ReportIssueModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          initialFacilityName={reportFacilityName}
          initialLocation={reportLocation}
        />
      )}
    </div>
  );
}
