'use client';

import React, { useState } from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { CAMPUS_NODES } from '@/lib/campus-data';
import {
  Route,
  ArrowUpDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Navigation,
  Volume2,
  Share2,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function RouteFinder() {
  const {
    startLocationId,
    setStartLocationId,
    destinationLocationId,
    setDestinationLocationId,
    preferences,
    setPreferences,
    routeResult,
    runRouteCalculation,
    swapLocations,
    loadDemoScenario,
    speak,
    voiceGuidance,
    announce,
    setActiveTab,
  } = useAccessibility();

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [activeRouteTab, setActiveRouteTab] = useState<'accessible' | 'normal'>('accessible');

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    runRouteCalculation();
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    const updated = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(updated);
    runRouteCalculation(startLocationId, destinationLocationId, updated);
  };

  const readStepAloud = (instruction: string, sub?: string) => {
    const text = `${instruction}. ${sub || ''}`;
    speak(text);
    announce(`Speaking: ${text}`);
  };

  const accessibleRoute = routeResult?.accessibleRoute;
  const normalRoute = routeResult?.normalRoute;

  return (
    <div className="space-y-6">
      {/* Route Finder Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Route className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span>Accessible Route Finder</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select origin, destination, and your mobility requirements to calculate barrier-free campus routes.
            </p>
          </div>

          {/* Quick Demo Mode Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Demos:
            </span>
            <button
              type="button"
              onClick={() => loadDemoScenario('room305')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
            >
              Gate → Room 305
            </button>
            <button
              type="button"
              onClick={() => loadDemoScenario('computerLab')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              Gate → Computer Lab
            </button>
            <button
              type="button"
              onClick={() => loadDemoScenario('washroom')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors"
            >
              Parking → Washroom
            </button>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="mt-5 space-y-5">
          {/* Origin and Destination Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
            {/* Start Location */}
            <div>
              <label htmlFor="start-location" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Starting Point
              </label>
              <select
                id="start-location"
                value={startLocationId}
                onChange={(e) => {
                  setStartLocationId(e.target.value);
                  runRouteCalculation(e.target.value, destinationLocationId);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {CAMPUS_NODES.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} {node.floor > 0 ? `(Floor ${node.floor})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center pt-5">
              <button
                type="button"
                onClick={swapLocations}
                className="p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                title="Swap Start and Destination"
                aria-label="Swap Start and Destination"
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>

            {/* Destination Location */}
            <div>
              <label htmlFor="destination-location" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Destination
              </label>
              <select
                id="destination-location"
                value={destinationLocationId}
                onChange={(e) => {
                  setDestinationLocationId(e.target.value);
                  runRouteCalculation(startLocationId, e.target.value);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {CAMPUS_NODES.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name} {node.floor > 0 ? `(Floor ${node.floor})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Accessibility Requirements Checkboxes */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Accessibility Preferences
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.avoidStairs}
                  onChange={() => handlePreferenceChange('avoidStairs')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Avoid stairs</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.wheelchairAccessible}
                  onChange={() => handlePreferenceChange('wheelchairAccessible')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Wheelchair accessible</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.preferRamps}
                  onChange={() => handlePreferenceChange('preferRamps')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Prefer ramps</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.elevatorRequired}
                  onChange={() => handlePreferenceChange('elevatorRequired')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Elevator required</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.avoidReportedHazards !== false}
                  onChange={() => handlePreferenceChange('avoidReportedHazards')}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Avoid reported hazards</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              <span>Calculate Accessible Route</span>
            </button>
          </div>
        </form>
      </div>

      {/* Error Message if No Route Exists */}
      {routeResult?.errorMessage && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">{routeResult.errorMessage}</p>
            <p className="mt-1 text-xs opacity-90">
              Try adjusting your accessibility preferences or select an alternate destination on the Ground level.
            </p>
          </div>
        </div>
      )}

      {/* Route Comparison & Step-by-Step Navigation Section */}
      {routeResult && (accessibleRoute || normalRoute) && (
        <div className="space-y-6">
          {/* Section Header with Comparison Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Route Comparison</span>
            </h3>

            {/* Accessible vs Normal Route Tab Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveRouteTab('accessible')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeRouteTab === 'accessible'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Accessible Route</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRouteTab('normal')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeRouteTab === 'normal'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                <span>Standard (Stair) Route</span>
              </button>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Accessible Route Card */}
            {accessibleRoute && (
              <div
                className={`relative rounded-2xl border-2 p-5 transition-all ${
                  activeRouteTab === 'accessible'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md dark:border-emerald-600 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Recommended Accessible Route
                  </span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">100% Step-Free</span>
                </div>

                {/* Path Trail Summary */}
                <div className="mt-3 flex items-center gap-2 overflow-x-auto text-xs font-bold text-slate-800 dark:text-slate-200 py-1">
                  {accessibleRoute.path.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <span className="shrink-0 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                        {node.name.length > 18 ? node.name.slice(0, 16) + '...' : node.name}
                      </span>
                      {i < accessibleRoute.path.length - 1 && <span className="text-emerald-600 font-bold">→</span>}
                    </React.Fragment>
                  ))}
                </div>

                {/* Key Metrics */}
                <div className="mt-4 grid grid-cols-4 gap-2 border-t border-b border-emerald-200/60 dark:border-emerald-800/60 py-3 text-center">
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Distance</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{accessibleRoute.totalDistance}m</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Est. Time</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">~{accessibleRoute.estimatedMinutes} min</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Stairs</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">0</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Ramps / Lifts</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {accessibleRoute.rampsCount} / {accessibleRoute.elevatorsCount}
                    </span>
                  </div>
                </div>

                {/* Why Accessible Route is Suitable */}
                <div className="mt-3 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Why this route is suitable:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {accessibleRoute.badges.map((b, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                      >
                        {b}
                      </span>
                    ))}
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100/80 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                      ✓ Wide Door Clearance (&gt;95cm)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Normal / Standard Route Card */}
            {normalRoute && (
              <div
                className={`relative rounded-2xl border-2 p-5 transition-all ${
                  activeRouteTab === 'normal'
                    ? 'border-slate-500 bg-slate-50 shadow-md dark:border-slate-600 dark:bg-slate-800/40'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    Standard Route
                  </span>
                  {normalRoute.stairsCount > 0 && (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Contains Physical Barriers
                    </span>
                  )}
                </div>

                {/* Path Trail Summary */}
                <div className="mt-3 flex items-center gap-2 overflow-x-auto text-xs font-bold text-slate-800 dark:text-slate-200 py-1">
                  {normalRoute.path.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <span className="shrink-0 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                        {node.name.length > 18 ? node.name.slice(0, 16) + '...' : node.name}
                      </span>
                      {i < normalRoute.path.length - 1 && <span className="text-slate-400 font-bold">→</span>}
                    </React.Fragment>
                  ))}
                </div>

                {/* Key Metrics */}
                <div className="mt-4 grid grid-cols-4 gap-2 border-t border-b border-slate-200 dark:border-slate-700 py-3 text-center">
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Distance</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{normalRoute.totalDistance}m</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Est. Time</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">~{normalRoute.estimatedMinutes} min</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Stairs</span>
                    <span className="text-base font-black text-red-600 dark:text-red-400">{normalRoute.stairsCount}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Ramps / Lifts</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {normalRoute.rampsCount} / {normalRoute.elevatorsCount}
                    </span>
                  </div>
                </div>

                {/* Barriers Callout */}
                <div className="mt-3 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Route Characteristics:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {normalRoute.stairsCount > 0 ? (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800">
                        ⚠️ Not Accessible: {normalRoute.stairsCount} Steps
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Standard Walkway
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Turn-by-Turn Navigation Steps Sheet */}
          {accessibleRoute && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-blue-600" />
                    <span>Turn-by-Turn Accessible Guidance ({accessibleRoute.steps.length} steps)</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Step-by-step cues with elevator announcements and ramp incline grades.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const allInstructions = accessibleRoute.steps.map((s) => s.instruction).join('. Next, ');
                    speak(allInstructions);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Listen to All Steps</span>
                </button>
              </div>

              {/* Steps Timeline List */}
              <div className="mt-5 space-y-4">
                {accessibleRoute.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all ${
                      activeStepIndex === idx
                        ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                    }`}
                    onClick={() => setActiveStepIndex(idx)}
                  >
                    {/* Step Number Badge */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                      {step.stepNumber}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{step.instruction}</h5>
                        {step.distance > 0 && (
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {step.distance} meters
                          </span>
                        )}
                      </div>

                      {step.subText && (
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{step.subText}</p>
                      )}

                      {/* Accessibility Specific Cue */}
                      {step.accessibilityNote && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="h-3 w-3 shrink-0" />
                          <span>{step.accessibilityNote}</span>
                        </div>
                      )}
                    </div>

                    {/* Step Speech Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        readStepAloud(step.instruction, step.accessibilityNote);
                      }}
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Read this step aloud"
                      aria-label={`Read step ${step.stepNumber} aloud`}
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
