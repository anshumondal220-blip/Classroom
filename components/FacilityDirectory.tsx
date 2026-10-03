'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CAMPUS_FACILITIES, Facility } from '@/lib/campus-data';
import { useAccessibility } from '@/context/AccessibilityContext';
import FacilityDetailModal from './FacilityDetailModal';
import {
  Search,
  CheckCircle,
  Clock,
  Navigation,
  MapPin,
  Building,
  Filter,
  Layers,
} from 'lucide-react';

interface FacilityDirectoryProps {
  onTriggerReportIssue: (facilityName: string, location: string) => void;
}

export default function FacilityDirectory({ onTriggerReportIssue }: FacilityDirectoryProps) {
  const {
    setDestinationLocationId,
    runRouteCalculation,
    setActiveTab,
    startLocationId,
    announce,
  } = useAccessibility();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDetailFacility, setActiveDetailFacility] = useState<Facility | null>(null);

  const categories = [
    { id: 'all', label: 'All Facilities' },
    { id: 'washroom', label: 'Accessible Washrooms' },
    { id: 'elevator', label: 'Elevators' },
    { id: 'ramp', label: 'Ramps' },
    { id: 'lab', label: 'Assistive Labs' },
    { id: 'charging', label: 'Wheelchair Charging' },
    { id: 'sensory', label: 'Sensory Rooms' },
  ];

  const filteredFacilities = CAMPUS_FACILITIES.filter((facility) => {
    const matchesCategory =
      selectedCategory === 'all' || facility.category === selectedCategory;

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      facility.name.toLowerCase().includes(q) ||
      facility.building.toLowerCase().includes(q) ||
      facility.location.toLowerCase().includes(q) ||
      facility.description.toLowerCase().includes(q) ||
      facility.features.some((f) => f.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const handleNavigate = (facility: Facility, e: React.MouseEvent) => {
    e.stopPropagation();
    setDestinationLocationId(facility.nodeId);
    runRouteCalculation(startLocationId, facility.nodeId);
    setActiveTab('finder');
    announce(`Calculating accessible directions to ${facility.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-6 w-6 text-blue-600" />
              <span>Campus Accessibility Facility Directory</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explore 24+ accessible restrooms, heated ramps, sensory sanctuaries, and assistive tech suites.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search facility name, feature..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-5 flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFacilities.map((fac) => (
          <div
            key={fac.id}
            onClick={() => setActiveDetailFacility(fac)}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
          >
            <div>
              {/* Photo Banner */}
              <div className="relative h-40 w-full bg-slate-800 overflow-hidden">
                <Image
                  src={fac.photoUrl}
                  alt={fac.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{fac.openingStatus}</span>
                  </span>
                </div>

                {/* Category Tag */}
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-600/90 text-white capitalize backdrop-blur-md">
                    {fac.category}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3">
                  <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                    {fac.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {fac.building}
                  </span>
                  <span>{fac.floor}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {fac.description}
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="h-3 w-3" />
                    Wheelchair accessible
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Door: {fac.doorWidth}
                  </span>
                  {fac.features.slice(0, 1).map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={(e) => handleNavigate(fac, e)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs border border-blue-200 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-sm"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Get Directions</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Facility Detailed Modal */}
      {activeDetailFacility && (
        <FacilityDetailModal
          facility={activeDetailFacility}
          onClose={() => setActiveDetailFacility(null)}
          onReportIssue={(name, loc) => {
            setActiveDetailFacility(null);
            onTriggerReportIssue(name, loc);
          }}
        />
      )}
    </div>
  );
}
