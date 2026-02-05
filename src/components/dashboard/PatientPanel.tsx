"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface PatientPanelProps {
  className?: string;
}

export function PatientPanel({ className }: PatientPanelProps) {
  const { patientData, activeScenario } = useDashboardStore();

  const getScenarioWarning = () => {
    switch (activeScenario) {
      case "large-core":
        return patientData.initialCoreVolume > 70
          ? "Large core phenotype: Reduced salvage potential, increased hemorrhage risk"
          : null;
      case "routing":
        return patientData.collateralScore < 2
          ? "Poor collaterals: Time-sensitive, minimize delays"
          : null;
      default:
        return null;
    }
  };

  const scenarioWarning = getScenarioWarning();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Clinical Parameters - Now First */}
      <div>
        <h3 className="text-sm font-semibold text-neuro-text-primary mb-3">
          Clinical Parameters
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-neuro-text-tertiary block text-xs">Occlusion</span>
            <span className="text-neuro-text-primary font-medium">{patientData.occlusionLocation}</span>
          </div>
          <div>
            <span className="text-neuro-text-tertiary block text-xs">Territory at Risk</span>
            <span className="text-neuro-text-primary font-medium">{patientData.territoryAtRisk} cc</span>
          </div>
          <div>
            <span className="text-neuro-text-tertiary block text-xs">Systolic BP</span>
            <span className="text-neuro-text-primary font-medium">{patientData.systolicBP} mmHg</span>
          </div>
          <div>
            <span className="text-neuro-text-tertiary block text-xs">Onset</span>
            <span className="text-neuro-text-primary font-medium">{patientData.onsetTime}</span>
          </div>
        </div>
      </div>

      {/* Scenario-specific warning */}
      {scenarioWarning && (
        <div className="p-3 rounded-lg bg-neuro-penumbra/10 border border-neuro-penumbra/30 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-neuro-penumbra flex-shrink-0 mt-0.5" />
          <p className="text-xs text-neuro-penumbra">{scenarioWarning}</p>
        </div>
      )}

      {/* Risk Modifiers - Now Below Clinical Parameters */}
      <div className="pt-4 border-t border-neuro-border-subtle">
        <h3 className="text-sm font-semibold text-neuro-text-primary mb-3">
          Risk Modifiers
        </h3>
        <div className="space-y-4">
          <RiskGauge
            label="Core Growth Speed"
            value={3}
            max={5}
          />
          <RiskGauge
            label="Reperfusion Difficulty"
            value={4}
            max={5}
          />
          <RiskGauge
            label="Hemorrhage Vulnerability"
            value={2}
            max={5}
          />
        </div>
      </div>
    </div>
  );
}
