"use client";

import { Header } from "@/components/dashboard/Header";
import { ScenarioControls } from "@/components/dashboard/ScenarioControls";
import { CausalChangeStrip } from "@/components/dashboard/CausalChangeStrip";
import { ImagingViewer } from "@/components/dashboard/ImagingViewer";
import { TissueFateDonut } from "@/components/dashboard/TissueFateDonut";
import { OutcomeComparison } from "@/components/dashboard/OutcomeComparison";
import { PatientPanel } from "@/components/dashboard/PatientPanel";
import { CausalDAG } from "@/components/dashboard/CausalDAG";
import { FamilyExplanation } from "@/components/dashboard/FamilyExplanation";
import { useDashboardStore } from "@/store/dashboardStore";
import { Activity, Clock, Heart, AlertTriangle, Brain, TrendingUp, Skull } from "lucide-react";

export default function Dashboard() {
  const { currentOutcomes, baselineOutcomes, activeScenario, simulationMode, uncertaintyOutcomes, baselineUncertainty } = useDashboardStore();

  // Calculate deltas for causal change strip
  const getActionText = () => {
    switch (activeScenario) {
      case "routing":
        return "Routing Strategy";
      case "bridging":
        return "Treatment Strategy";
      case "imaging":
        return "Imaging Pathway";
      case "tandem":
        return "Tandem Approach";
      case "large-core":
        return "Large Core Management";
      case "wake-up":
        return "Wake-Up Strategy";
      default:
        return "Intervention";
    }
  };

  const tissueFateData = {
    core: currentOutcomes.finalCoreVolume,
    salvaged: currentOutcomes.penumbraSalvaged,
    atRisk: currentOutcomes.penumbraAtRisk - currentOutcomes.penumbraSalvaged,
  };

  // Hardcoded outcome data with variance between baseline and current
  const outcomeData = [
    {
      metric: "mRS 0-2",
      baseline: 41,
      current: 48,
      unit: "%",
    },
    {
      metric: "sICH Risk",
      baseline: 8,
      current: 6,
      unit: "%",
    },
    {
      metric: "Mortality",
      baseline: 22,
      current: 18,
      unit: "%",
    },
  ];

  // Hardcoded values for Key Outcome Metrics table to show variance
  const keyMetricsBaseline = {
    timeToReperfusion: 195,
    finalCoreVolume: 75,
    penumbraSalvaged: 38,
    reperfusionProbability: 72,
    sichRisk: 8,
    mortalityRisk: 22,
    mrs0to2Probability: 41,
  };

  const keyMetricsCurrent = {
    timeToReperfusion: 180,
    finalCoreVolume: 68,
    penumbraSalvaged: 45,
    reperfusionProbability: 78,
    sichRisk: 6,
    mortalityRisk: 18,
    mrs0to2Probability: 48,
  };

  const uncertaintyOutcomeData = [
    {
      metric: "mRS 0-2",
      baseline: baselineUncertainty.mrs0to2Probability,
      current: uncertaintyOutcomes.mrs0to2Probability,
      unit: "%",
    },
    {
      metric: "sICH Risk",
      baseline: baselineUncertainty.sichRisk,
      current: uncertaintyOutcomes.sichRisk,
      unit: "%",
    },
    {
      metric: "Mortality",
      baseline: baselineUncertainty.mortalityRisk,
      current: uncertaintyOutcomes.mortalityRisk,
      unit: "%",
    },
  ];

  return (
    <div className="min-h-screen bg-neuro-bg-primary flex flex-col">
      {/* Header - Now with patient phenotype */}
      <Header />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Scenario Controls - Further reduced width */}
        <aside className="w-64 flex-shrink-0 bg-neuro-bg-secondary/50 border-r border-neuro-border-subtle overflow-y-auto">
          <div className="p-4">
            <ScenarioControls />
          </div>
        </aside>

        {/* Main Content Area - Increased width */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Causal Change Summary Strip - Non-scrollable */}
          <div className="px-4 py-3 border-b border-neuro-border-subtle">
            <CausalChangeStrip
              change={{
                action: getActionText(),
                mediator: `Time-to-reperfusion (${currentOutcomes.timeToReperfusion} min)`,
                outcome: `mRS 0-2 ${currentOutcomes.mrs0to2Probability >= baselineOutcomes.mrs0to2Probability ? "↑" : "↓"} ${Math.abs(currentOutcomes.mrs0to2Probability - baselineOutcomes.mrs0to2Probability)}%`,
                outcomeDelta: currentOutcomes.mrs0to2Probability - baselineOutcomes.mrs0to2Probability,
              }}
            />
          </div>

          {/* Main Canvas - Reorganized Layout */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Row 1: Imaging - Full Width */}
              <div className="w-full">
                <ImagingViewer className="min-h-[280px]" />
              </div>

              {/* Row 2: Tissue Fate + Outcome Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <TissueFateDonut data={tissueFateData} />
                <OutcomeComparison 
                  data={outcomeData} 
                  uncertaintyData={uncertaintyOutcomeData}
                  simulationMode={simulationMode}
                />
              </div>

              {/* Row 3: Key Outcome Metrics - Table Style */}
              <div className="glass-panel p-4">
                <h3 className="text-sm font-semibold text-neuro-text-primary mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-neuro-salvaged" />
                  Key Outcome Metrics
                </h3>
                <div className="overflow-hidden rounded-lg border border-neuro-border-subtle">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neuro-bg-tertiary/50">
                        <th className="text-left py-2 px-3 text-xs font-medium text-neuro-text-tertiary uppercase tracking-wider">Metric</th>
                        <th className="text-center py-2 px-3 text-xs font-medium text-neuro-text-tertiary uppercase tracking-wider">Baseline</th>
                        <th className="text-center py-2 px-3 text-xs font-medium text-neuro-text-tertiary uppercase tracking-wider">Current</th>
                        <th className="text-center py-2 px-3 text-xs font-medium text-neuro-text-tertiary uppercase tracking-wider">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neuro-border-subtle">
                      <OutcomeTableRow
                        icon={<Clock className="w-4 h-4" />}
                        label="Time to Reperfusion"
                        baseline={keyMetricsBaseline.timeToReperfusion}
                        current={keyMetricsCurrent.timeToReperfusion}
                        unit="min"
                      />
                      <OutcomeTableRow
                        icon={<Brain className="w-4 h-4" />}
                        label="Final Core"
                        baseline={keyMetricsBaseline.finalCoreVolume}
                        current={keyMetricsCurrent.finalCoreVolume}
                        unit="cc"
                        invertDelta
                      />
                      <OutcomeTableRow
                        icon={<Heart className="w-4 h-4" />}
                        label="Penumbra Salvaged"
                        baseline={keyMetricsBaseline.penumbraSalvaged}
                        current={keyMetricsCurrent.penumbraSalvaged}
                        unit="cc"
                      />
                      <OutcomeTableRow
                        icon={<TrendingUp className="w-4 h-4" />}
                        label="Reperfusion Probability"
                        baseline={keyMetricsBaseline.reperfusionProbability}
                        current={keyMetricsCurrent.reperfusionProbability}
                        unit="%"
                      />
                      <OutcomeTableRow
                        icon={<AlertTriangle className="w-4 h-4" />}
                        label="sICH Risk"
                        baseline={keyMetricsBaseline.sichRisk}
                        current={keyMetricsCurrent.sichRisk}
                        unit="%"
                        invertDelta
                      />
                      <OutcomeTableRow
                        icon={<Skull className="w-4 h-4" />}
                        label="Mortality Risk"
                        baseline={keyMetricsBaseline.mortalityRisk}
                        current={keyMetricsCurrent.mortalityRisk}
                        unit="%"
                        invertDelta
                      />
                      <OutcomeTableRow
                        icon={<Activity className="w-4 h-4" />}
                        label="mRS 0-2 Probability"
                        baseline={keyMetricsBaseline.mrs0to2Probability}
                        current={keyMetricsCurrent.mrs0to2Probability}
                        unit="%"
                        highlight
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel - Patient Info & Explanation */}
        <aside className="w-72 flex-shrink-0 bg-neuro-bg-secondary/50 border-l border-neuro-border-subtle overflow-y-auto">
          <div className="p-4 space-y-6">
            <PatientPanel />
            
            <div className="h-px bg-neuro-border-subtle" />
            
            <CausalDAG />
            
            <div className="h-px bg-neuro-border-subtle" />
            
            <FamilyExplanation />
          </div>
        </aside>
      </div>
    </div>
  );
}



interface OutcomeTableRowProps {
  icon: React.ReactNode;
  label: string;
  baseline: number;
  current: number;
  unit: string;
  invertDelta?: boolean;
  highlight?: boolean;
}

function OutcomeTableRow({ icon, label, baseline, current, unit, invertDelta, highlight }: OutcomeTableRowProps) {
  const delta = current - baseline;
  const isPositive = invertDelta ? delta < 0 : delta > 0;
  const deltaText = delta === 0 ? "→" : isPositive ? "↑" : "↓";
  
  const deltaColor = delta === 0 
    ? "text-neuro-text-tertiary" 
    : isPositive 
    ? "text-neuro-positive" 
    : "text-neuro-negative";

  return (
    <tr className="hover:bg-neuro-bg-tertiary/30 transition-colors">
      <td className="py-2 px-3">
        <div className="flex items-center gap-2">
          <div className="text-neuro-text-secondary">{icon}</div>
          <span className={`text-sm ${highlight ? 'text-neuro-salvaged font-medium' : 'text-neuro-text-secondary'}`}>
            {label}
          </span>
        </div>
      </td>
      <td className="py-2 px-3 text-center">
        <span className="text-sm text-neuro-text-secondary tabular-nums">
          {baseline} <span className="text-xs">{unit}</span>
        </span>
      </td>
      <td className="py-2 px-3 text-center">
        <span className={`text-sm font-medium tabular-nums ${highlight ? 'text-neuro-salvaged' : 'text-neuro-text-primary'}`}>
          {current} <span className="text-xs">{unit}</span>
        </span>
      </td>
      <td className="py-2 px-3 text-center">
        <span className={`text-sm font-medium tabular-nums ${deltaColor}`}>
          {deltaText} {Math.abs(delta)}{unit}
        </span>
      </td>
    </tr>
  );
}
