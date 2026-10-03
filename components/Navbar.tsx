'use client';

import React, { useState } from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  Navigation,
  MapPin,
  Route,
  Layers,
  AlertTriangle,
  LifeBuoy,
  Sparkles,
  Settings,
  Eye,
  Volume2,
  VolumeX,
  Menu,
  X,
  Home,
  ShieldAlert,
} from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
}

interface NavItem {
  id: 'home' | 'map' | 'finder' | 'facilities' | 'report' | 'emergency' | 'assistant';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export default function Navbar({ onOpenSettings }: NavbarProps) {
  const {
    activeTab,
    setActiveTab,
    highContrast,
    setHighContrast,
    voiceGuidance,
    setVoiceGuidance,
  } = useAccessibility();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home, highlight: false },
    { id: 'map', label: 'Map', icon: MapPin, highlight: false },
    { id: 'finder', label: 'Find Route', icon: Route, highlight: false },
    { id: 'facilities', label: 'Facilities', icon: Layers, highlight: false },
    { id: 'report', label: 'Report Issue', icon: AlertTriangle, highlight: false },
    { id: 'emergency', label: 'Emergency', icon: ShieldAlert, highlight: true },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles, highlight: false },
  ];

  const handleNavClick = (tabId: NavItem['id']) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95">
      {/* Skip to Main Content Link for Keyboard / Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2.5 focus:text-white focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-18">
        {/* Brand / Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1 group"
          aria-label="Accessibility Navigator Home"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md group-hover:bg-blue-700 transition-colors">
            <Navigation className="h-6 w-6 transform -rotate-45" aria-hidden="true" />
          </div>
          <div>
            <span className="block text-lg font-black tracking-tight text-slate-900 dark:text-white">
              ACCESSIBILITY NAVIGATOR
            </span>
            <span className="block text-xs font-semibold text-blue-600 dark:text-blue-400">
              Navigate Campus Without Barriers
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? item.highlight
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold'
                    : item.highlight
                    ? 'text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? (item.highlight ? 'text-white' : 'text-blue-600') : item.highlight ? 'text-red-600' : 'text-slate-500'
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Accessibility Controls & Settings Button */}
        <div className="flex items-center gap-2">
          {/* High Contrast Mode Quick Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-500 shadow-sm'
                : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
            title="Toggle High Contrast Mode (WCAG AAA)"
            aria-pressed={highContrast}
            aria-label="Toggle High Contrast Mode"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            <span className="hidden md:inline">Contrast</span>
          </button>

          {/* Voice Guidance Quick Toggle */}
          <button
            onClick={() => setVoiceGuidance(!voiceGuidance)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
              voiceGuidance
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
            title="Toggle Voice Navigation Prompts"
            aria-pressed={voiceGuidance}
            aria-label="Toggle Voice Guidance"
          >
            {voiceGuidance ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden md:inline">Voice</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 transition-colors"
            aria-label="Open Accessibility & Display Settings"
          >
            <Settings className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden="true" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 dark:border-slate-800 dark:bg-slate-900 shadow-xl">
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold text-left transition-colors ${
                    isActive
                      ? item.highlight
                        ? 'bg-red-600 text-white'
                        : 'bg-blue-600 text-white'
                      : item.highlight
                      ? 'text-red-600 bg-red-50 dark:bg-red-950/40'
                      : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around gap-2">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold border ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-500'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-800 dark:text-slate-200'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>High Contrast</span>
            </button>
            <button
              onClick={() => setVoiceGuidance(!voiceGuidance)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold border ${
                voiceGuidance
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-800 dark:text-slate-200'
              }`}
            >
              {voiceGuidance ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span>Voice Readout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
