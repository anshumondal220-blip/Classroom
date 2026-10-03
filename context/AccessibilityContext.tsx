'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CampusNode,
  CampusEdge,
  Facility,
  AccessibilityIssue,
  INITIAL_ISSUES,
  CAMPUS_FACILITIES,
  CAMPUS_NODES,
} from '@/lib/campus-data';
import { RoutePreferences, RouteComparisonResult, calculateRouteComparison } from '@/lib/route-algorithm';

interface AccessibilityContextType {
  // Accessibility Preferences
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  voiceGuidance: boolean;
  setVoiceGuidance: (val: boolean) => void;

  // Screen Reader Live Region
  srAnnouncement: string;
  announce: (message: string) => void;

  // Active Tab Navigation
  activeTab: 'home' | 'map' | 'finder' | 'facilities' | 'report' | 'emergency' | 'assistant';
  setActiveTab: (tab: 'home' | 'map' | 'finder' | 'facilities' | 'report' | 'emergency' | 'assistant') => void;

  // Route Finder State
  startLocationId: string;
  setStartLocationId: (id: string) => void;
  destinationLocationId: string;
  setDestinationLocationId: (id: string) => void;
  preferences: RoutePreferences;
  setPreferences: React.Dispatch<React.SetStateAction<RoutePreferences>>;
  routeResult: RouteComparisonResult | null;
  setRouteResult: (result: RouteComparisonResult | null) => void;
  runRouteCalculation: (startId?: string, destId?: string, prefs?: RoutePreferences) => void;
  swapLocations: () => void;

  // Selection & Details Modal
  selectedFacility: Facility | null;
  setSelectedFacility: (fac: Facility | null) => void;
  selectedNode: CampusNode | null;
  setSelectedNode: (node: CampusNode | null) => void;

  // Community Accessibility Issues
  issues: AccessibilityIssue[];
  addIssue: (issue: Omit<AccessibilityIssue, 'id' | 'reportedAt' | 'upvotes'>) => void;
  upvoteIssue: (id: string) => void;
  resolveIssue: (id: string) => void;

  // Demo Scenarios Runner
  loadDemoScenario: (scenarioKey: 'room305' | 'computerLab' | 'washroom' | 'hazard') => void;

  // Speech guidance
  speak: (text: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  // Settings with lazy initializers
  const [fontSize, setFontSizeState] = useState<'normal' | 'large' | 'xlarge'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('access_fontSize');
        if (stored) return stored as 'normal' | 'large' | 'xlarge';
      } catch {}
    }
    return 'normal';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('access_highContrast') === 'true';
      } catch {}
    }
    return false;
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('access_reducedMotion') === 'true';
      } catch {}
    }
    return false;
  });

  const [voiceGuidance, setVoiceGuidanceState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('access_voiceGuidance') === 'true';
      } catch {}
    }
    return false;
  });

  const [srAnnouncement, setSrAnnouncement] = useState<string>('');

  // Tab State
  const [activeTab, setActiveTabState] = useState<'home' | 'map' | 'finder' | 'facilities' | 'report' | 'emergency' | 'assistant'>('home');

  // Routing State
  const [startLocationId, setStartLocationId] = useState<string>('main-gate');
  const [destinationLocationId, setDestinationLocationId] = useState<string>('academic-room-305');
  const [preferences, setPreferences] = useState<RoutePreferences>({
    avoidStairs: true,
    wheelchairAccessible: true,
    preferRamps: true,
    elevatorRequired: true,
    accessibleWashroomRequired: false,
    avoidReportedHazards: true,
  });

  // Pre-calculate initial route synchronously
  const [routeResult, setRouteResult] = useState<RouteComparisonResult | null>(() => {
    return calculateRouteComparison('main-gate', 'academic-room-305', {
      avoidStairs: true,
      wheelchairAccessible: true,
      preferRamps: true,
      elevatorRequired: true,
      accessibleWashroomRequired: false,
      avoidReportedHazards: true,
    }, INITIAL_ISSUES);
  });

  // Modals & Details
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedNode, setSelectedNode] = useState<CampusNode | null>(null);

  // Issues List with localStorage persistence
  const [issues, setIssues] = useState<AccessibilityIssue[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('access_issues');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_ISSUES;
  });

  // Update HTML body classes on settings change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('font-size-large', 'font-size-xlarge');
      if (fontSize === 'large') root.classList.add('font-size-large');
      if (fontSize === 'xlarge') root.classList.add('font-size-xlarge');

      if (highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }

      if (reducedMotion) {
        root.classList.add('reduced-motion');
      } else {
        root.classList.remove('reduced-motion');
      }
    }
  }, [fontSize, highContrast, reducedMotion]);

  const setFontSize = (size: 'normal' | 'large' | 'xlarge') => {
    setFontSizeState(size);
    try {
      localStorage.setItem('access_fontSize', size);
    } catch {}
    announce(`Font size set to ${size}`);
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    try {
      localStorage.setItem('access_highContrast', String(val));
    } catch {}
    announce(val ? 'High contrast mode enabled' : 'High contrast mode disabled');
  };

  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    try {
      localStorage.setItem('access_reducedMotion', String(val));
    } catch {}
    announce(val ? 'Reduced motion enabled' : 'Reduced motion disabled');
  };

  const setVoiceGuidance = (val: boolean) => {
    setVoiceGuidanceState(val);
    try {
      localStorage.setItem('access_voiceGuidance', String(val));
    } catch {}
    announce(val ? 'Voice navigation speech enabled' : 'Voice navigation speech disabled');
    if (val) {
      speak('Voice navigation guidance is now turned on.');
    }
  };

  const setActiveTab = (tab: typeof activeTab) => {
    setActiveTabState(tab);
    announce(`Navigated to ${tab} view`);
  };

  const announce = (message: string) => {
    setSrAnnouncement(message);
  };

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*#_~]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
      }
    }
  };

  // Route calculation execution
  const runRouteCalculation = (
    startId: string = startLocationId,
    destId: string = destinationLocationId,
    prefs: RoutePreferences = preferences
  ) => {
    const result = calculateRouteComparison(startId, destId, prefs, issues);
    setRouteResult(result);

    if (result.accessibleRoute) {
      announce(
        `Accessible route found: ${result.accessibleRoute.totalDistance} meters, approximately ${result.accessibleRoute.estimatedMinutes} minutes.`
      );
      if (voiceGuidance) {
        speak(
          `Accessible route found to ${result.accessibleRoute.path[result.accessibleRoute.path.length - 1].name}. Distance is ${result.accessibleRoute.totalDistance} meters. No stairs along this path.`
        );
      }
    } else if (result.errorMessage) {
      announce(result.errorMessage);
      if (voiceGuidance) {
        speak(result.errorMessage);
      }
    }
  };

  const swapLocations = () => {
    const prevStart = startLocationId;
    setStartLocationId(destinationLocationId);
    setDestinationLocationId(prevStart);
    runRouteCalculation(destinationLocationId, prevStart, preferences);
    announce('Swapped starting location and destination.');
  };

  const addIssue = (newIssueData: Omit<AccessibilityIssue, 'id' | 'reportedAt' | 'upvotes'>) => {
    const newIssue: AccessibilityIssue = {
      ...newIssueData,
      id: `rep-${Date.now().toString().slice(-4)}`,
      reportedAt: new Date().toISOString(),
      upvotes: 1,
    };
    const updated = [newIssue, ...issues];
    setIssues(updated);
    try {
      localStorage.setItem('access_issues', JSON.stringify(updated));
    } catch {}
    announce('Thank you. Your accessibility report has been submitted.');
  };

  const upvoteIssue = (id: string) => {
    const updated = issues.map((iss) => (iss.id === id ? { ...iss, upvotes: iss.upvotes + 1 } : iss));
    setIssues(updated);
    try {
      localStorage.setItem('access_issues', JSON.stringify(updated));
    } catch {}
    announce('Issue upvoted to raise campus maintenance priority.');
  };

  const resolveIssue = (id: string) => {
    const updated = issues.map((iss) => (iss.id === id ? { ...iss, status: 'resolved' as const } : iss));
    setIssues(updated);
    try {
      localStorage.setItem('access_issues', JSON.stringify(updated));
    } catch {}
    announce('Issue marked as resolved.');
  };

  // Demo Scenarios Loader
  const loadDemoScenario = (scenarioKey: 'room305' | 'computerLab' | 'washroom' | 'hazard') => {
    let sId = 'main-gate';
    let dId = 'academic-room-305';
    let prefs: RoutePreferences = {
      avoidStairs: true,
      wheelchairAccessible: true,
      preferRamps: true,
      elevatorRequired: true,
      avoidReportedHazards: true,
    };

    if (scenarioKey === 'room305') {
      sId = 'main-gate';
      dId = 'academic-room-305';
      prefs = {
        avoidStairs: true,
        wheelchairAccessible: true,
        preferRamps: true,
        elevatorRequired: true,
        avoidReportedHazards: true,
      };
    } else if (scenarioKey === 'computerLab') {
      sId = 'main-gate';
      dId = 'computer-lab';
      prefs = {
        avoidStairs: true,
        wheelchairAccessible: true,
        preferRamps: true,
        elevatorRequired: false,
        avoidReportedHazards: true,
      };
    } else if (scenarioKey === 'washroom') {
      sId = 'parking-a';
      dId = 'accessible-washroom-quad';
      prefs = {
        avoidStairs: true,
        wheelchairAccessible: true,
        preferRamps: true,
        elevatorRequired: false,
        avoidReportedHazards: true,
      };
    } else if (scenarioKey === 'hazard') {
      sId = 'library-entrance';
      dId = 'academic-room-305';
      prefs = {
        avoidStairs: true,
        wheelchairAccessible: true,
        preferRamps: true,
        elevatorRequired: true,
        avoidReportedHazards: true,
      };
    }

    setStartLocationId(sId);
    setDestinationLocationId(dId);
    setPreferences(prefs);
    runRouteCalculation(sId, dId, prefs);
    setActiveTabState('finder');
    announce(`Loaded demo scenario for ${dId}. Route calculated.`);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        reducedMotion,
        setReducedMotion,
        voiceGuidance,
        setVoiceGuidance,
        srAnnouncement,
        announce,
        activeTab,
        setActiveTab,
        startLocationId,
        setStartLocationId,
        destinationLocationId,
        setDestinationLocationId,
        preferences,
        setPreferences,
        routeResult,
        setRouteResult,
        runRouteCalculation,
        swapLocations,
        selectedFacility,
        setSelectedFacility,
        selectedNode,
        setSelectedNode,
        issues,
        addIssue,
        upvoteIssue,
        resolveIssue,
        loadDemoScenario,
        speak,
      }}
    >
      {/* Invisible screen reader announcer */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)' }}
      >
        {srAnnouncement}
      </div>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
