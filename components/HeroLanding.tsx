'use client';

import React from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  Navigation,
  MapPin,
  Route,
  Sparkles,
  Layers,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  Clock,
  Compass,
} from 'lucide-react';

export default function HeroLanding() {
  const { setActiveTab, loadDemoScenario } = useAccessibility();

  const featureCards = [
    {
      icon: '♿',
      title: 'Accessible Routes',
      description: 'Dijkstra-calculated step-free corridors avoiding stairs and obstacles with turn-by-turn auditory guidance.',
      action: () => setActiveTab('finder'),
      tag: 'Step-Free AI',
    },
    {
      icon: '🛗',
      title: 'Elevators',
      description: 'Live operational status, door widths, braille controls, and audio floor chime availability across campus.',
      action: () => setActiveTab('map'),
      tag: 'Real-Time Status',
    },
    {
      icon: '🛤️',
      title: 'Ramps & Slopes',
      description: 'ADA-compliant heated ramp locations with incline slope indicators (1:12 to 1:16) and continuous dual handrails.',
      action: () => setActiveTab('map'),
      tag: 'Low-Grade Paths',
    },
    {
      icon: '🚻',
      title: 'Accessible Facilities',
      description: 'Directory of all-gender comfort rooms with ceiling hoists, adult changing tables, and emergency pull cords.',
      action: () => setActiveTab('facilities'),
      tag: 'Universal Design',
    },
    {
      icon: '🚨',
      title: 'Emergency Access',
      description: 'Ground-level step-free exits, 2-hour fire-rated Areas of Rescue Assistance, and 24/7 mobility cart dispatch.',
      action: () => setActiveTab('emergency'),
      tag: 'Life Safety',
    },
    {
      icon: '🤖',
      title: 'AI Assistant',
      description: 'Natural language campus guide powered by Gemini AI to answer questions like “How to reach Room 305 without stairs?”.',
      action: () => setActiveTab('assistant'),
      tag: 'Gemini 3.8 Flash',
    },
  ];

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-blue-50/70 via-white to-white p-8 sm:p-12 shadow-sm dark:border-slate-800 dark:from-slate-900/80 dark:via-slate-900 dark:to-slate-900">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/70 px-3.5 py-1 text-xs font-bold text-blue-800 dark:border-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Inclusive Campus Navigation Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Navigate Campus <span className="text-blue-600 dark:text-blue-400">Without Barriers.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Find accessible routes, facilities, and support across your campus. Designed specifically for wheelchair users, students with mobility difficulties, and visitors needing step-free navigation.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('finder')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Route className="h-4 w-4" />
              <span>Find Accessible Route</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 font-bold text-sm shadow-sm transition-all"
            >
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Explore Campus Map</span>
            </button>
          </div>

          {/* Quick Demo Launchers */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Try a Quick Scenario:
            </span>
            <button
              onClick={() => loadDemoScenario('room305')}
              className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors"
            >
              Main Gate → Room 305 (Avoid Stairs)
            </button>
            <button
              onClick={() => loadDemoScenario('computerLab')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 px-3 py-1 rounded-lg transition-colors"
            >
              Main Gate → Computer Lab 101
            </button>
          </div>
        </div>

        {/* Small accessibility illustration watermark on the right */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none">
          <svg width="340" height="340" viewBox="0 0 100 100" fill="currentColor" className="text-blue-600">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="30" r="8" />
            <path d="M 50 38 L 50 62 L 68 62 L 68 78 L 74 78 L 74 56 L 56 56 L 56 44 Z" />
            <path d="M 40 50 A 18 18 0 1 0 58 68 L 50 68 A 10 10 0 1 1 40 58 Z" />
          </svg>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Campus Accessibility Infrastructure
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive accommodations verified in accordance with universal design and ADA standards.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card, i) => (
            <div
              key={i}
              onClick={card.action}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl" role="img" aria-label={card.title}>
                    {card.icon}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full">
                    {card.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {card.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Explore Feature</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
