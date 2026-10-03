'use client';

import React, { useState, useRef } from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  CAMPUS_NODES,
  CAMPUS_EDGES,
  CampusNode,
  CampusEdge,
} from '@/lib/campus-data';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  MapPin,
  Route,
  Info,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CampusMapProps {
  onSelectNodeForRoute?: (nodeId: string, type: 'start' | 'dest') => void;
  showComparisonPath?: boolean;
}

export default function CampusMap({ onSelectNodeForRoute, showComparisonPath = true }: CampusMapProps) {
  const {
    startLocationId,
    setStartLocationId,
    destinationLocationId,
    setDestinationLocationId,
    routeResult,
    runRouteCalculation,
    setSelectedNode,
    setSelectedFacility,
    setActiveTab,
    announce,
    issues,
  } = useAccessibility();

  // Map viewport transform (pan & zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Map floor filter
  const [activeFloor, setActiveFloor] = useState<number | 'all'>('all');

  // Layer filters
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'ramps' | 'elevators' | 'washrooms' | 'stairs' | 'emergency'
  >('all');

  // Hover & selection popover
  const [hoveredNode, setHoveredNode] = useState<CampusNode | null>(null);
  const [activeNodeModal, setActiveNodeModal] = useState<CampusNode | null>(null);

  // Search within map
  const [searchQuery, setSearchQuery] = useState('');

  // Map container ref
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Filter nodes based on floor & layer
  const filteredNodes = CAMPUS_NODES.filter((node) => {
    // Floor filter
    if (activeFloor !== 'all' && node.floor !== activeFloor && node.category !== 'gate' && node.category !== 'parking') {
      return false;
    }

    // Layer filter
    if (activeFilter === 'ramps') return node.category === 'ramp';
    if (activeFilter === 'elevators') return node.category === 'elevator';
    if (activeFilter === 'washrooms') return node.category === 'washroom';
    if (activeFilter === 'stairs') return node.category === 'stairs';
    if (activeFilter === 'emergency') return node.category === 'emergency';

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        node.name.toLowerCase().includes(q) ||
        (node.building && node.building.toLowerCase().includes(q)) ||
        (node.description && node.description.toLowerCase().includes(q))
      );
    }

    return true;
  });

  // Pan & Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Ignore clicks on SVG interactive nodes
    if ((e.target as HTMLElement).tagName === 'circle' || (e.target as HTMLElement).closest('.interactive-marker')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Path SVG Coordinates Generator
  const getPolylinePoints = (pathNodes: CampusNode[]): string => {
    return pathNodes.map((n) => `${n.x},${n.y}`).join(' ');
  };

  // Check if a node is blocked by an active reported issue
  const isNodeBlocked = (nodeId: string): boolean => {
    return issues.some(
      (iss) => iss.status !== 'resolved' && iss.nodeId === nodeId && (iss.type === 'broken_elevator' || iss.type === 'inaccessible_entrance')
    );
  };

  const handleNodeClick = (node: CampusNode) => {
    setActiveNodeModal(node);
    setSelectedNode(node);
    announce(`Selected location: ${node.name}. Floor ${node.floor}.`);
  };

  const setAsStart = (nodeId: string) => {
    setStartLocationId(nodeId);
    runRouteCalculation(nodeId, destinationLocationId);
    setActiveNodeModal(null);
    announce(`Starting point set to ${CAMPUS_NODES.find((n) => n.id === nodeId)?.name}`);
  };

  const setAsDestination = (nodeId: string) => {
    setDestinationLocationId(nodeId);
    runRouteCalculation(startLocationId, nodeId);
    setActiveNodeModal(null);
    announce(`Destination set to ${CAMPUS_NODES.find((n) => n.id === nodeId)?.name}`);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-900 shadow-xl dark:border-slate-700">
      {/* Top Map Controls Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Search & Floor Filters */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700 shadow-lg text-white">
          <input
            type="text"
            placeholder="Search building, lab, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 sm:w-64 bg-slate-800 text-sm text-white px-3 py-1.5 rounded-lg border border-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            aria-label="Search map location"
          />

          {/* Floor Level Filter */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveFloor('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeFloor === 'all' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFloor(0)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeFloor === 0 ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Ground
            </button>
            <button
              onClick={() => setActiveFloor(2)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeFloor === 2 ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Fl 2
            </button>
            <button
              onClick={() => setActiveFloor(3)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeFloor === 3 ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Fl 3
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-lg text-white">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-200 hover:text-white transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-200 hover:text-white transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-200 hover:text-white transition-colors"
            title="Reset Map View"
            aria-label="Reset Map View"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Layer Filter Buttons Bar */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-lg text-xs font-semibold text-white pointer-events-auto">
        <span className="px-2 text-slate-400 flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" />
          Layers:
        </span>
        {(['all', 'ramps', 'elevators', 'washrooms', 'stairs', 'emergency'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
              activeFilter === filter ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Route Legend Indicator */}
      {routeResult?.accessibleRoute && (
        <div className="absolute bottom-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700 shadow-xl text-xs text-white max-w-xs pointer-events-auto">
          <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Accessible Route Active</span>
          </div>
          <div className="flex items-center justify-between text-slate-300 gap-3">
            <span>{routeResult.accessibleRoute.totalDistance}m total</span>
            <span>~{routeResult.accessibleRoute.estimatedMinutes} min travel</span>
            <span className="text-emerald-300 font-semibold">0 stairs</span>
          </div>
        </div>
      )}

      {/* SVG Interactive Canvas Container */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-[580px] sm:h-[640px] select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} overflow-hidden relative`}
      >
        <svg
          viewBox="0 0 820 620"
          className="w-full h-full transition-transform duration-75 origin-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Defs for Gradients and Route Glow */}
          <defs>
            <filter id="accessible-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="stair-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            </pattern>
          </defs>

          {/* Campus Background & Grid */}
          <rect width="820" height="620" fill="#0f172a" />
          <rect width="820" height="620" fill="url(#campus-grid)" opacity="0.6" />

          {/* Campus Quadrangle Green Spaces / Landscaping */}
          <path
            d="M 330,340 C 370,320 450,330 490,360 C 510,390 480,440 430,450 C 370,460 310,420 330,340 Z"
            fill="#064e3b"
            opacity="0.35"
            stroke="#047857"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text x="410" y="395" fill="#34d399" fontSize="11" fontWeight="600" textAnchor="middle" opacity="0.6">
            Central Quadrangle Lawn
          </text>

          {/* Paved Walkway Network (Base Canvas Lines) */}
          {CAMPUS_EDGES.map((edge) => {
            const fromNode = CAMPUS_NODES.find((n) => n.id === edge.from);
            const toNode = CAMPUS_NODES.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={edge.id}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={edge.stairs ? '#475569' : '#334155'}
                strokeWidth={edge.stairs ? '2.5' : '4'}
                strokeDasharray={edge.stairs ? '4 4' : undefined}
                strokeLinecap="round"
                opacity="0.8"
              />
            );
          })}

          {/* Campus Buildings Outlines & Labels */}
          {/* Main Gate */}
          <g>
            <rect x="50" y="490" width="80" height="55" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="90" y="522" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">
              MAIN GATE
            </text>
          </g>

          {/* Admin Building */}
          <g>
            <rect x="220" y="380" width="110" height="75" rx="8" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
            <text x="275" y="405" fill="#93c5fd" fontSize="11" fontWeight="bold" textAnchor="middle">
              ADMINISTRATION
            </text>
            <text x="275" y="420" fill="#cbd5e1" fontSize="9" textAnchor="middle">
              Disability Support / Registrar
            </text>
          </g>

          {/* Library */}
          <g>
            <rect x="270" y="170" width="130" height="95" rx="8" fill="#1e293b" stroke="#818cf8" strokeWidth="1.5" />
            <text x="335" y="200" fill="#a5b4fc" fontSize="11" fontWeight="bold" textAnchor="middle">
              LIBRARY
            </text>
            <text x="335" y="215" fill="#cbd5e1" fontSize="9" textAnchor="middle">
              Study Hub • Sensory Room Fl 2
            </text>
          </g>

          {/* Academic Hall */}
          <g>
            <rect x="490" y="170" width="125" height="95" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="552" y="200" fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle">
              ACADEMIC HALL
            </text>
            <text x="552" y="215" fill="#cbd5e1" fontSize="9" textAnchor="middle">
              Lecture Theatre Room 305
            </text>
          </g>

          {/* Science & Computer Complex */}
          <g>
            <rect x="630" y="260" width="125" height="135" rx="8" fill="#1e293b" stroke="#34d399" strokeWidth="1.5" />
            <text x="692" y="295" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle">
              SCIENCE COMPLEX
            </text>
            <text x="692" y="310" fill="#cbd5e1" fontSize="9" textAnchor="middle">
              Computer Lab 101 • Robotics
            </text>
          </g>

          {/* Student Activity Centre (SAC) */}
          <g>
            <rect x="440" y="480" width="110" height="75" rx="8" fill="#1e293b" stroke="#f472b6" strokeWidth="1.5" />
            <text x="495" y="510" fill="#fbcfe8" fontSize="11" fontWeight="bold" textAnchor="middle">
              STUDENT CENTRE
            </text>
            <text x="495" y="525" fill="#cbd5e1" fontSize="9" textAnchor="middle">
              Lounge & Chair Charger
            </text>
          </g>

          {/* Auditorium */}
          <g>
            <rect x="560" y="475" width="90" height="70" rx="8" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.5" />
            <text x="605" y="515" fill="#fde68a" fontSize="10" fontWeight="bold" textAnchor="middle">
              AUDITORIUM
            </text>
          </g>

          {/* Canteen */}
          <g>
            <rect x="310" y="515" width="100" height="60" rx="8" fill="#1e293b" stroke="#fb923c" strokeWidth="1.5" />
            <text x="360" y="545" fill="#fed7aa" fontSize="10" fontWeight="bold" textAnchor="middle">
              CANTEEN & CAFÉ
            </text>
          </g>

          {/* Normal Route (Comparison - dashed orange/red if toggled) */}
          {showComparisonPath && routeResult?.normalRoute && routeResult.normalRoute.stairsCount > 0 && (
            <polyline
              points={getPolylinePoints(routeResult.normalRoute.path)}
              fill="none"
              stroke="url(#stair-gradient)"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              opacity="0.7"
            />
          )}

          {/* ACTIVE ACCESSIBLE ROUTE HIGHLIGHT (Animated Glowing Polyline) */}
          {routeResult?.accessibleRoute && (
            <g filter="url(#accessible-glow)">
              <polyline
                points={getPolylinePoints(routeResult.accessibleRoute.path)}
                fill="none"
                stroke="url(#route-gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
              />
              <polyline
                points={getPolylinePoints(routeResult.accessibleRoute.path)}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 6"
              />
            </g>
          )}

          {/* Nodes / Markers Rendering */}
          {filteredNodes.map((node) => {
            const isStart = node.id === startLocationId;
            const isDest = node.id === destinationLocationId;
            const isBlocked = isNodeBlocked(node.id);
            const isHovered = hoveredNode?.id === node.id;

            // Marker visual properties by category
            let fill = '#3b82f6';
            let stroke = '#ffffff';
            let radius = 6;
            let iconText = '';

            if (node.category === 'ramp') {
              fill = '#10b981'; // emerald
              iconText = 'R';
              radius = 8;
            } else if (node.category === 'elevator') {
              fill = '#8b5cf6'; // purple
              iconText = 'E';
              radius = 8;
            } else if (node.category === 'stairs') {
              fill = '#ef4444'; // red
              iconText = 'S';
              radius = 7;
            } else if (node.category === 'washroom') {
              fill = '#06b6d4'; // cyan
              iconText = 'W';
              radius = 8;
            } else if (node.category === 'emergency') {
              fill = '#dc2626'; // crimson
              iconText = '!';
              radius = 8;
            } else if (node.category === 'parking') {
              fill = '#2563eb';
              iconText = 'P';
              radius = 8;
            }

            if (isBlocked) {
              fill = '#dc2626';
              stroke = '#facc15';
            }

            return (
              <g
                key={node.id}
                className="interactive-marker cursor-pointer transition-transform"
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Start Marker Pulsing Beacon */}
                {isStart && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 8}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    className="animate-ping origin-center"
                    opacity="0.8"
                  />
                )}

                {/* Destination Marker Pulsing Beacon */}
                {isDest && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 8}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    className="animate-ping origin-center"
                    opacity="0.8"
                  />
                )}

                {/* Outer halo on hover */}
                {isHovered && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 6}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    opacity="0.75"
                  />
                )}

                {/* Base circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isStart || isDest ? radius + 4 : radius}
                  fill={isStart ? '#10b981' : isDest ? '#ef4444' : fill}
                  stroke={stroke}
                  strokeWidth={isStart || isDest ? '3' : '2'}
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                />

                {/* Icon letter inside node if applicable */}
                {iconText && !isStart && !isDest && (
                  <text
                    x={node.x}
                    y={node.y + 3.5}
                    fill="#ffffff"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {iconText}
                  </text>
                )}

                {/* Start or Destination Pin Flag */}
                {isStart && (
                  <text
                    x={node.x}
                    y={node.y - 14}
                    fill="#34d399"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    START
                  </text>
                )}
                {isDest && (
                  <text
                    x={node.x}
                    y={node.y - 14}
                    fill="#f87171"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    DESTINATION
                  </text>
                )}

                {/* Node name label when hovered or primary landmark */}
                {(isHovered || isStart || isDest) && (
                  <g>
                    <rect
                      x={node.x - 60}
                      y={node.y + 14}
                      width="120"
                      height="20"
                      rx="4"
                      fill="#0f172a"
                      stroke="#475569"
                      strokeWidth="1"
                      opacity="0.9"
                    />
                    <text
                      x={node.x}
                      y={node.y + 27}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.name.length > 20 ? node.name.slice(0, 18) + '...' : node.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Modal / Popover on Node Click */}
      {activeNodeModal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveNodeModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-start gap-3">
              <div
                className={`p-3 rounded-xl ${
                  activeNodeModal.category === 'ramp'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : activeNodeModal.category === 'elevator'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    : activeNodeModal.category === 'washroom'
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300'
                    : activeNodeModal.category === 'stairs'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                }`}
              >
                <MapPin className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {activeNodeModal.category.replace('_', ' ')} • Floor {activeNodeModal.floor}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{activeNodeModal.name}</h3>
                {activeNodeModal.building && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activeNodeModal.building}</p>
                )}
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{activeNodeModal.description}</p>

            {/* Accessibility Badges */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {activeNodeModal.wheelchairAccessible ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="h-3 w-3" />
                  Wheelchair Accessible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-3 w-3" />
                  Barriers / Stairs Present
                </span>
              )}
              {activeNodeModal.features?.map((f, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Route Action Buttons */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setAsStart(activeNodeModal.id)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 transition-colors text-sm"
              >
                Set as Start
              </button>
              <button
                onClick={() => setAsDestination(activeNodeModal.id)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1.5"
              >
                <span>Navigate Here</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
