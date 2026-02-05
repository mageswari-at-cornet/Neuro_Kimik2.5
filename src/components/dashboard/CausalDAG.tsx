"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { cn } from "@/lib/utils";
// Icons available for future use

interface CausalDAGProps {
  className?: string;
}

export function CausalDAG({ className }: CausalDAGProps) {
  const { activeScenario, simulationParams } = useDashboardStore();

  const getScenarioNarrative = () => {
    switch (activeScenario) {
      case "routing":
        return simulationParams.routingStrategy === "drip-and-ship"
          ? "Drip-and-ship provides early IVT but adds transfer time. The benefit depends on collateral status and transfer delay."
          : "Direct mothership minimizes time-to-EVT but misses potential early recanalization from IVT.";
      case "bridging":
        return simulationParams.treatmentStrategy === "bridging"
          ? "Bridging increases early recanalization probability by 15% but adds 8-minute workflow delay and increases sICH risk."
          : "EVT alone avoids IVT-related delays and bleeding risks but misses potential early recanalization.";
      case "imaging":
        return simulationParams.imagingPathway === "standard"
          ? "Standard imaging provides complete assessment but adds ~35 minutes. Best when collaterals are good."
          : "Direct-to-angio saves 35 minutes but may miss critical perfusion information.";
      case "tandem":
        return simulationParams.tandemApproach === "acute-stenting"
          ? "Acute stenting provides durable reperfusion but requires DAPT, increasing hemorrhage risk."
          : "Balloon-only avoids DAPT-related bleeding but carries higher re-occlusion risk.";
      case "large-core":
        return simulationParams.largeCoreStrategy === "thrombectomy"
          ? "Thrombectomy in large core reduces severe disability/death by 15% despite lower salvage potential."
          : "Medical management avoids procedure risks but has higher mortality in large core strokes.";
      case "wake-up":
        return simulationParams.wakeUpStrategy === "ivt-plus-evt"
          ? "Mismatch-guided thrombolysis can improve outcomes when MRI shows strong mismatch."
          : "EVT alone avoids thrombolysis uncertainty but may miss additional benefit from IVT.";
      default:
        return "";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-semibold text-neuro-text-primary">
        Causal Pathway
      </h3>

      {/* Mechanism Narrative */}
      <div className="p-3 rounded-lg bg-neuro-bg-tertiary/50 border border-neuro-border-subtle">
        <p className="text-xs text-neuro-text-secondary leading-relaxed">
          {getScenarioNarrative()}
        </p>
      </div>

      {/* Factor Contributions */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-neuro-text-tertiary uppercase tracking-wider">
          Factor Contributions
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-neuro-text-secondary">Time Delay</span>
            <span className="text-neuro-negative">-4%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neuro-text-secondary">Core Growth</span>
            <span className="text-neuro-negative">-2%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neuro-text-secondary">Reperfusion</span>
            <span className="text-neuro-positive">+8%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neuro-text-secondary">sICH Risk</span>
            <span className="text-neuro-negative">-1%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
