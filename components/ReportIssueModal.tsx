'use client';

import React, { useState } from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { AccessibilityIssue, CAMPUS_NODES } from '@/lib/campus-data';
import {
  AlertTriangle,
  Upload,
  CheckCircle,
  ThumbsUp,
  Clock,
  MapPin,
  X,
  Filter,
  ShieldAlert,
} from 'lucide-react';

interface ReportIssueModalProps {
  initialFacilityName?: string;
  initialLocation?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportIssueModal({
  initialFacilityName,
  initialLocation,
  isOpen,
  onClose,
}: ReportIssueModalProps) {
  const { issues, addIssue, upvoteIssue, resolveIssue, announce } = useAccessibility();

  const [issueType, setIssueType] = useState<AccessibilityIssue['type']>('broken_elevator');
  const [location, setLocation] = useState(
    initialLocation || (initialFacilityName ? `${initialFacilityName}` : 'Academic Hall - Central Core')
  );
  const [nodeId, setNodeId] = useState<string>('academic-elevator');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<AccessibilityIssue['severity']>('medium');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [filterType, setFilterType] = useState<string>('all');

  const issueTypes = [
    { id: 'broken_elevator', label: 'Broken elevator' },
    { id: 'blocked_ramp', label: 'Blocked ramp' },
    { id: 'stairs_maintenance', label: 'Stairs under maintenance' },
    { id: 'construction', label: 'Construction / Pathway closure' },
    { id: 'inaccessible_entrance', label: 'Inaccessible entrance' },
    { id: 'blocked_pathway', label: 'Blocked accessible pathway' },
    { id: 'automatic_door_failure', label: 'Automatic power door failure' },
    { id: 'other', label: 'Other issue' },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    addIssue({
      type: issueType,
      location,
      nodeId: nodeId || undefined,
      description,
      severity,
      status: 'reported',
      imageUrl: imagePreview || undefined,
    });

    setSubmittedSuccess(true);
    announce('Thank you. Your accessibility report has been submitted.');
    setTimeout(() => {
      setSubmittedSuccess(false);
      setDescription('');
      setImagePreview(null);
      onClose();
    }, 2200);
  };

  const filteredIssues = issues.filter((iss) => {
    if (filterType === 'all') return true;
    if (filterType === 'active') return iss.status !== 'resolved';
    if (filterType === 'resolved') return iss.status === 'resolved';
    return iss.type === filterType;
  });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-issue-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 id="report-issue-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Report an Accessibility Issue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help fellow students by flagging broken elevators, blocked ramps, or hazards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {submittedSuccess ? (
            <div className="py-10 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Thank you. Your accessibility report has been submitted.
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Campus Facility Management has been alerted and route calculations will automatically account for this obstacle.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Issue Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Issue Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as AccessibilityIssue['type'])}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                >
                  {issueTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Input & Campus Node Binding */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Location Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Academic Hall West Entrance Ramp"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Affected Campus Node (For Dynamic Routing)
                  </label>
                  <select
                    value={nodeId}
                    onChange={(e) => setNodeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">General campus area</option>
                    {CAMPUS_NODES.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Severity Level */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Severity Level
                </span>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high', 'critical'] as const).map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-colors border ${
                        severity === sev
                          ? sev === 'critical' || sev === 'high'
                            ? 'bg-red-600 text-white border-red-700 shadow-sm'
                            : 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the physical barrier or obstacle in detail (e.g. elevator out of service, automatic sliding doors stuck closed, ramp iced over)..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              {/* Optional Image Upload */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Optional Image Upload
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                    <Upload className="h-4 w-4 text-blue-600" />
                    <span>Choose Photo / Snapshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute top-0 right-0 p-0.5 bg-black/70 text-white rounded-bl"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </form>
          )}

          {/* Active Community Reported Issues Feed */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Live Campus Barrier Reports ({filteredIssues.length})</span>
              </h3>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    filterType === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('active')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    filterType === 'active'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterType('resolved')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    filterType === 'resolved'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredIssues.map((iss) => (
                <div
                  key={iss.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          iss.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : iss.severity === 'critical' || iss.severity === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {iss.status}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {iss.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span>{iss.location}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{iss.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => upvoteIssue(iss.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                      title="Confirm this barrier"
                    >
                      <ThumbsUp className="h-3 w-3 text-blue-600" />
                      <span>{iss.upvotes}</span>
                    </button>
                    {iss.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => resolveIssue(iss.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 transition-colors"
                      >
                        Mark Fixed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
