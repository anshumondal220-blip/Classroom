'use client';

import React, { useState } from 'react';
import { EMERGENCY_RESOURCES, EmergencyResource } from '@/lib/campus-data';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  CheckCircle,
  AlertTriangle,
  HeartPulse,
  DoorOpen,
  Radio,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function EmergencyHub() {
  const {
    setDestinationLocationId,
    runRouteCalculation,
    setActiveTab,
    startLocationId,
    announce,
  } = useAccessibility();

  const [confirmEmergencyModal, setConfirmEmergencyModal] = useState(false);
  const [emergencySimulated, setEmergencySimulated] = useState(false);

  const handleRouteToExit = (resource: EmergencyResource) => {
    setDestinationLocationId(resource.nodeId);
    runRouteCalculation(startLocationId, resource.nodeId, {
      avoidStairs: true,
      wheelchairAccessible: true,
      preferRamps: true,
      elevatorRequired: false,
      avoidReportedHazards: true,
    });
    setActiveTab('finder');
    announce(`Calculating emergency evacuation route to ${resource.name}`);
  };

  const handleTriggerSimulatedAlert = () => {
    setEmergencySimulated(true);
    setConfirmEmergencyModal(false);
    announce('Emergency simulation activated. Showing step-free evacuation pathways.');
  };

  return (
    <div className="space-y-6">
      {/* Emergency Header Warning Banner */}
      <div className="rounded-2xl border-2 border-red-500 bg-red-50/70 p-6 dark:border-red-600 dark:bg-red-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-red-600 text-white shrink-0 shadow-md">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200">
                Life Safety & Accessibility
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Emergency Accessibility & Evacuation Hub
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-xl">
                Real-time accessible evacuation egresses, 2-hour fire rated Areas of Rescue Assistance, and direct dispatch for mobility crisis response.
              </p>
            </div>
          </div>

          {/* Safe Emergency Button (Does not accidentally call 911) */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setConfirmEmergencyModal(true)}
              className="w-full md:w-auto px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-red-400"
              aria-label="Activate Emergency Assistance Guide"
            >
              <Radio className="h-5 w-5 animate-pulse" />
              <span>Request Assistance Protocol</span>
            </button>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 text-center mt-1">
              Protected button • Prompts confirmation
            </span>
          </div>
        </div>
      </div>

      {/* Simulated Alert Notification if Activated */}
      {emergencySimulated && (
        <div className="rounded-xl border border-red-400 bg-red-100 p-4 dark:border-red-700 dark:bg-red-950/80 text-red-950 dark:text-red-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-red-600 animate-ping shrink-0" />
            <div className="text-sm">
              <span className="font-bold">Evacuation Assistance Mode Active:</span>
              <span className="ml-1 text-xs">
                All campus maps are highlighting Ground Level Step-Free exits and Rescue Refuges.
              </span>
            </div>
          </div>
          <button
            onClick={() => setEmergencySimulated(false)}
            className="px-3 py-1 text-xs font-bold bg-white text-red-700 rounded-lg border border-red-300 hover:bg-red-50"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Emergency Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EMERGENCY_RESOURCES.map((resource) => (
          <div
            key={resource.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      resource.type === 'exit'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : resource.type === 'shelter'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : resource.type === 'medical'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {resource.type === 'exit' ? (
                      <DoorOpen className="h-5 w-5" />
                    ) : resource.type === 'shelter' ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : resource.type === 'medical' ? (
                      <HeartPulse className="h-5 w-5" />
                    ) : (
                      <PhoneCall className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {resource.type} • Floor {resource.floor}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {resource.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Location & Contact Info */}
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{resource.location}</span>
                </div>
                {resource.phone && (
                  <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
                    <PhoneCall className="h-3.5 w-3.5 shrink-0" />
                    <span>Emergency Contact: {resource.phone}</span>
                  </div>
                )}
              </div>

              {/* Evacuation Protocol Instruction */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                <strong className="block text-slate-700 dark:text-slate-300 mb-0.5">
                  Evacuation Action:
                </strong>
                <p className="text-slate-600 dark:text-slate-400">{resource.evacuationInstructions}</p>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1 pt-1">
                {resource.features.map((feat, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleRouteToExit(resource)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs shadow-sm transition-colors"
              >
                <span>Navigate to this Safe Egress</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Safety Modal for Emergency Trigger */}
      {confirmEmergencyModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Emergency Assistance Protocol
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 text-left">
              This application is a <strong>campus navigation prototype</strong>. Clicking confirm will highlight all emergency exits and guide you along step-free evacuation routes.
            </p>

            <div className="p-3 rounded-xl bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-200 text-xs font-semibold text-left">
              ⚠️ In a real life-threatening emergency, dial <strong>911</strong> or call Campus Police at <strong>+1 (555) 019-9111</strong> immediately.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmEmergencyModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerSimulatedAlert}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Confirm Evacuation Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
