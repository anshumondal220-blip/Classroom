'use client';

import React from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { CAMPUS_FACILITIES, CAMPUS_NODES, CAMPUS_EDGES } from '@/lib/campus-data';
import {
  Layers,
  Sparkles,
  Route,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardStats() {
  const { issues, setActiveTab } = useAccessibility();

  const totalFacilities = CAMPUS_FACILITIES.length + 14; // Including outdoor comfort amenities
  const elevatorsCount = CAMPUS_NODES.filter((n) => n.category === 'elevator').length;
  const rampsCount = CAMPUS_NODES.filter((n) => n.category === 'ramp').length;
  const accessibleWashroomsCount = CAMPUS_NODES.filter((n) => n.category === 'washroom').length + 4;
  const activeReportedIssues = issues.filter((iss) => iss.status !== 'resolved').length;
  const accessiblePathsCount = CAMPUS_EDGES.filter((e) => e.wheelchairAccessible).length;

  // Accessibility Score
  const score = Math.round(100 - activeReportedIssues * 2.5);

  const stats = [
    {
      title: 'Accessible Facilities',
      value: totalFacilities,
      subtitle: `${accessibleWashroomsCount} Universal Washrooms • ${rampsCount} ADA Ramps`,
      icon: Layers,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      action: () => setActiveTab('facilities'),
      actionLabel: 'View Directory',
    },
    {
      title: 'Operational Elevators',
      value: elevatorsCount,
      subtitle: 'All equipped with voice & braille',
      icon: Sparkles,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      action: () => setActiveTab('map'),
      actionLabel: 'View on Map',
    },
    {
      title: 'Step-Free Routes',
      value: accessiblePathsCount,
      subtitle: 'Smooth paved & tactile guided paths',
      icon: Route,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      action: () => setActiveTab('finder'),
      actionLabel: 'Find Route',
    },
    {
      title: 'Reported Barriers',
      value: activeReportedIssues,
      subtitle: `${issues.length - activeReportedIssues} verified resolved this week`,
      icon: AlertTriangle,
      color: activeReportedIssues > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      action: () => setActiveTab('report'),
      actionLabel: 'Manage Reports',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Overview Status Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Campus Accessibility Health Index
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{score}%</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle className="h-3 w-3" />
                Fully Functional Network
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>Campus Mobility Escort Available 24/7:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">+1 (555) 019-9111</span>
        </div>
      </div>

      {/* Grid of Clean Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {s.title}
                  </span>
                  <div className={`p-2 rounded-xl ${s.bgColor} ${s.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {s.value}
                  </span>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{s.subtitle}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={s.action}
                  className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors group"
                >
                  <span>{s.actionLabel}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
