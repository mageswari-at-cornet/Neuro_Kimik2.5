"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { cn } from "@/lib/utils";
import { Brain, Clock, User, Activity, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { patientData } = useDashboardStore();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Calculate time since onset (mock)
  const timeSinceOnset = "02:14:33";
  const isTimeCritical = true;

  const getRiskLevel = (value: number, threshold: number) => {
    if (value >= threshold) return "critical";
    if (value >= threshold * 0.7) return "warning";
    return "neutral";
  };

  return (
    <header
      className={cn(
        "min-h-[80px] px-6 py-3 flex items-center justify-between border-b border-neuro-border-subtle bg-neuro-bg-secondary/80 backdrop-blur-glass",
        className
      )}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neuro-salvaged/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-neuro-salvaged" />
          </div>
          <span className="text-lg font-bold text-neuro-text-primary">
            NeuroSim
          </span>
        </div>

        <div className="h-8 w-px bg-neuro-border-subtle mx-2" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-neuro-text-tertiary">Patient ID:</span>
          <span className="text-sm font-semibold text-neuro-text-primary tabular-nums">
            #NS-2026-0042
          </span>
        </div>
      </div>

      {/* Center: Patient Phenotype Details - Neat Grid Layout */}
      <div className="flex-1 flex flex-col justify-center px-6">
        {/* Line 1: Demographics + Core + Collaterals + NIHSS + Time */}
        <div className="flex items-center justify-center gap-6 mb-2">
          {/* Demographics Group */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-neuro-bg-tertiary/50">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neuro-text-tertiary" />
              <span className="text-xs text-neuro-text-secondary">Age</span>
              <span className="text-sm font-semibold text-neuro-text-primary">{patientData.age}</span>
            </div>
            <div className="h-3 w-px bg-neuro-border-subtle" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neuro-text-secondary">Sex</span>
              <span className="text-sm font-semibold text-neuro-text-primary">{patientData.sex}</span>
            </div>
          </div>

          {/* Core Volume */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neuro-bg-tertiary/50">
            <Activity className="w-3.5 h-3.5 text-neuro-text-tertiary" />
            <span className="text-xs text-neuro-text-secondary">Core</span>
            <span className={cn(
              "text-sm font-semibold tabular-nums",
              getRiskLevel(patientData.initialCoreVolume, 70) === "critical" ? "text-neuro-core" : "text-neuro-text-primary"
            )}>
              {patientData.initialCoreVolume}cc
            </span>
          </div>

          {/* Collaterals */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neuro-bg-tertiary/50">
            <span className="text-xs text-neuro-text-secondary">Collaterals</span>
            <span className={cn(
              "text-sm font-semibold tabular-nums",
              patientData.collateralScore < 2 ? "text-neuro-penumbra" : "text-neuro-text-primary"
            )}>
              {patientData.collateralScore}
            </span>
          </div>

          {/* NIHSS Score */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neuro-bg-tertiary/50">
            <span className="text-xs text-neuro-text-secondary">NIHSS</span>
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                patientData.nihss >= 15
                  ? "text-neuro-core"
                  : patientData.nihss >= 8
                  ? "text-neuro-penumbra"
                  : "text-neuro-salvaged"
              )}
            >
              {patientData.nihss}
            </span>
            {patientData.nihss >= 15 && (
              <span className="text-[10px] text-neuro-core font-medium uppercase">Severe</span>
            )}
          </div>

          {/* Time Since Onset */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neuro-bg-tertiary/50">
            <Clock
              className={cn(
                "w-3.5 h-3.5",
                isTimeCritical ? "text-neuro-penumbra" : "text-neuro-text-secondary"
              )}
            />
            <span className="text-xs text-neuro-text-secondary">Time</span>
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                isTimeCritical ? "text-neuro-penumbra" : "text-neuro-text-primary"
              )}
            >
              {timeSinceOnset}
            </span>
          </div>
        </div>
        
        {/* Line 2: Clinical Parameters
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-neuro-bg-tertiary/30">
            <span className="text-neuro-text-tertiary">Occlusion:</span>
            <span className="font-medium text-neuro-text-primary">{patientData.occlusionLocation}</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-neuro-bg-tertiary/30">
            <span className="text-neuro-text-tertiary">Territory at Risk:</span>
            <span className="font-medium text-neuro-text-primary">{patientData.territoryAtRisk} cc</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-neuro-bg-tertiary/30">
            <span className="text-neuro-text-tertiary">Systolic BP:</span>
            <span className="font-medium text-neuro-text-primary">{patientData.systolicBP} mmHg</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-neuro-bg-tertiary/30">
            <span className="text-neuro-text-tertiary">Onset:</span>
            <span className="font-medium text-neuro-text-primary">{patientData.onsetTime}</span>
          </div>
        </div> */}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Light/Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 text-neuro-text-secondary hover:text-neuro-text-primary rounded-lg hover:bg-neuro-bg-tertiary transition-colors"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="h-8 w-8 rounded-full bg-neuro-salvaged/20 flex items-center justify-center ml-2">
          <span className="text-sm font-semibold text-neuro-salvaged">DR</span>
        </div>
      </div>
    </header>
  );
}
