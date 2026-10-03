'use client';

import React from 'react';
import Image from 'next/image';
import { Facility } from '@/lib/campus-data';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  X,
  MapPin,
  CheckCircle,
  Clock,
  Navigation,
  AlertTriangle,
  DoorOpen,
  Volume2,
  Building,
} from 'lucide-react';

interface FacilityDetailModalProps {
  facility: Facility | null;
  onClose: () => void;
  onReportIssue: (facilityName: string, location: string) => void;
}

export default function FacilityDetailModal({
  facility,
  onClose,
  onReportIssue,
}: FacilityDetailModalProps) {
  const {
    setDestinationLocationId,
    runRouteCalculation,
    setActiveTab,
    startLocationId,
    announce,
  } = useAccessibility();

  if (!facility) return null;

  const handleGetDirections = () => {
    setDestinationLocationId(facility.nodeId);
    runRouteCalculation(startLocationId, facility.nodeId);
    onClose();
    setActiveTab('finder');
    announce(`Calculating accessible directions to ${facility.name}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="facility-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Photo or Banner */}
        <div className="relative h-44 w-full bg-slate-800 shrink-0">
          <Image
            src={facility.photoUrl}
            alt={facility.name}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Title on Photo */}
          <div className="absolute bottom-3 left-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-600 text-white">
              {facility.category}
            </span>
            <h3
              id="facility-detail-title"
              className="text-lg font-bold text-white tracking-tight mt-1"
            >
              {facility.name}
            </h3>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Status & Hours Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {facility.openingStatus}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{facility.hours}</span>
            </div>
          </div>

          {/* Location & Building Info */}
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Building className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="font-semibold">{facility.building}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-400">{facility.floor}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{facility.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <DoorOpen className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Door Clearance: <strong className="text-slate-900 dark:text-white">{facility.doorWidth}</strong></span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {facility.description}
          </p>

          {/* Accessibility Features Checklist */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Accessibility Features & Accommodations
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {facility.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60 text-xs font-semibold text-emerald-900 dark:text-emerald-200"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
              {facility.hasBraille && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/60 text-xs font-semibold text-blue-900 dark:text-blue-200">
                  <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Tactile & Braille Signage</span>
                </div>
              )}
              {facility.hasAutomaticDoor && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/60 text-xs font-semibold text-blue-900 dark:text-blue-200">
                  <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Power Automated Door Opener</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onReportIssue(facility.name, `${facility.building} — ${facility.floor}`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 border border-amber-300 dark:border-amber-800 transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Report Issue</span>
          </button>

          <button
            type="button"
            onClick={handleGetDirections}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            <Navigation className="h-4 w-4" />
            <span>Get Directions</span>
          </button>
        </div>
      </div>
    </div>
  );
}
