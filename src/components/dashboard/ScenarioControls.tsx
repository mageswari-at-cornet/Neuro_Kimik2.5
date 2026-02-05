"use client";

import { useDashboardStore, type Scenario } from "@/store/dashboardStore";
import { ScenarioRadioGroup } from "@/components/ui/ScenarioRadioGroup";
import { InterventionSlider } from "@/components/ui/InterventionSlider";
import { cn } from "@/lib/utils";
import {
  Navigation,
  Pill,
  Scan,
  GitBranch,
  AlertCircle,
  Clock,
  Activity,
  Target,
  Sparkles,
} from "lucide-react";

interface ScenarioControlsProps {
  className?: string;
}

const scenarios: { value: Scenario; label: string; icon: React.ReactNode }[] = [
  { value: "routing", label: "Patient Routing", icon: <Navigation className="w-4 h-4" /> },
  { value: "bridging", label: "Bridging Therapy", icon: <Pill className="w-4 h-4" /> },
  { value: "imaging", label: "Imaging Pathway", icon: <Scan className="w-4 h-4" /> },
  { value: "tandem", label: "Tandem Lesion", icon: <GitBranch className="w-4 h-4" /> },
  { value: "large-core", label: "Large Core", icon: <AlertCircle className="w-4 h-4" /> },
  { value: "wake-up", label: "Wake-Up Stroke", icon: <Clock className="w-4 h-4" /> },
];

export function ScenarioControls({ className }: ScenarioControlsProps) {
  const {
    activeScenario,
    setActiveScenario,
    simulationParams,
    updateSimulationParams,
    patientData,
    simulationMode,
    setSimulationMode,
  } = useDashboardStore();

  const renderScenarioControls = () => {
    switch (activeScenario) {
      case "routing":
        return (
          <div className="space-y-6">
            <ScenarioRadioGroup
              options={[
                {
                  value: "drip-and-ship",
                  label: "Drip-and-Ship",
                  description: "IVT locally, then transfer to EVT center",
                },
                {
                  value: "direct-mothership",
                  label: "Direct Mothership",
                  description: "Bypass local IVT, direct to EVT center",
                },
              ]}
              value={simulationParams.routingStrategy}
              onChange={(v) =>
                updateSimulationParams({
                  routingStrategy: v as "drip-and-ship" | "direct-mothership",
                })
              }
            />
            <InterventionSlider
              label="Transfer Delay"
              value={simulationParams.transferDelay}
              min={0}
              max={120}
              step={5}
              unit="min"
              warning={
                simulationParams.transferDelay > 60 && patientData.collateralScore < 2
                  ? "Long delay with poor collaterals may worsen outcome"
                  : undefined
              }
              onChange={(v) => updateSimulationParams({ transferDelay: v })}
            />
            <InterventionSlider
              label="Door-to-Groin Time"
              value={simulationParams.doorToGroinTime}
              min={25}
              max={120}
              step={5}
              unit="min"
              onChange={(v) => updateSimulationParams({ doorToGroinTime: v })}
            />
            <InterventionSlider
              label="IVT Workflow Delay"
              value={simulationParams.ivtWorkflowDelay}
              min={0}
              max={20}
              step={1}
              unit="min"
              onChange={(v) => updateSimulationParams({ ivtWorkflowDelay: v })}
            />
          </div>
        );

      case "bridging":
        return (
          <div className="space-y-6">
            <ScenarioRadioGroup
              options={[
                {
                  value: "evt-alone",
                  label: "EVT Alone",
                  description: "Proceed directly to thrombectomy",
                },
                {
                  value: "bridging",
                  label: "Bridging (IVT + EVT)",
                  description: "IVT before thrombectomy",
                },
              ]}
              value={simulationParams.treatmentStrategy}
              onChange={(v) =>
                updateSimulationParams({
                  treatmentStrategy: v as "evt-alone" | "bridging",
                })
              }
            />
            {simulationParams.treatmentStrategy === "bridging" && (
              <InterventionSlider
                label="IVT Workflow Delay"
                value={simulationParams.ivtWorkflowDelay}
                min={0}
                max={20}
                step={1}
                unit="min"
                warning={
                  patientData.initialCoreVolume > 70
                    ? "Large core with IVT increases hemorrhage risk"
                    : undefined
                }
                onChange={(v) => updateSimulationParams({ ivtWorkflowDelay: v })}
              />
            )}
          </div>
        );

      case "imaging":
        return (
          <div className="space-y-6">
            <ScenarioRadioGroup
              options={[
                {
                  value: "standard",
                  label: "Standard (CTA + Perfusion)",
                  description: "Complete imaging workup (~35 min)",
                },
                {
                  value: "direct-to-angio",
                  label: "Direct-to-Angio",
                  description: "Skip perfusion, faster treatment",
                },
              ]}
              value={simulationParams.imagingPathway}
              onChange={(v) =>
                updateSimulationParams({
                  imagingPathway: v as "standard" | "direct-to-angio",
                })
              }
            />
            {simulationParams.imagingPathway === "standard" &&
              patientData.collateralScore < 2 && (
                <div className="p-3 rounded-lg bg-neuro-penumbra/10 border border-neuro-penumbra/20">
                  <p className="text-xs text-neuro-penumbra">
                    <strong>Warning:</strong> Poor collaterals with standard imaging may cause
                    harmful delay. Consider direct-to-angio.
                  </p>
                </div>
              )}
          </div>
        );

      case "tandem":
        return (
          <div className="space-y-6">
            <ScenarioRadioGroup
              options={[
                {
                  value: "balloon-only",
                  label: "Balloon Only",
                  description: "Temporary angioplasty without stent",
                },
                {
                  value: "acute-stenting",
                  label: "Acute Stenting + DAPT",
                  description: "Stent placement with dual antiplatelet",
                },
              ]}
              value={simulationParams.tandemApproach}
              onChange={(v) =>
                updateSimulationParams({
                  tandemApproach: v as "balloon-only" | "acute-stenting",
                })
              }
            />
            {simulationParams.tandemApproach === "acute-stenting" && (
              <div className="p-3 rounded-lg bg-neuro-penumbra/10 border border-neuro-penumbra/20">
                <p className="text-xs text-neuro-penumbra">
                  <strong>Note:</strong> DAPT increases hemorrhage risk. Ensure no large core.
                </p>
              </div>
            )}
          </div>
        );

      case "large-core":
        return (
          <div className="space-y-6">
            <div className="p-3 rounded-lg bg-neuro-core/10 border border-neuro-core/20">
              <p className="text-xs text-neuro-core">
                <strong>Large Core Phenotype:</strong> Core volume {patientData.initialCoreVolume}cc
                {' (>70cc threshold). Reduced salvage potential, increased hemorrhage risk.'}
              </p>
            </div>
            <ScenarioRadioGroup
              options={[
                {
                  value: "medical",
                  label: "Medical Management",
                  description: "Conservative treatment, no thrombectomy",
                },
                {
                  value: "thrombectomy",
                  label: "Thrombectomy",
                  description: "Mechanical clot retrieval (SELECT-2 paradigm)",
                },
              ]}
              value={simulationParams.largeCoreStrategy}
              onChange={(v) =>
                updateSimulationParams({
                  largeCoreStrategy: v as "medical" | "thrombectomy",
                })
              }
            />
          </div>
        );

      case "wake-up":
        return (
          <div className="space-y-6">
            <ScenarioRadioGroup
              options={[
                { value: "mild", label: "Mild Mismatch", description: "Small salvageable tissue" },
                { value: "moderate", label: "Moderate Mismatch", description: "Moderate penumbra" },
                { value: "strong", label: "Strong Mismatch", description: "Large salvageable tissue" },
              ]}
              value={simulationParams.mismatchStrength}
              onChange={(v) =>
                updateSimulationParams({
                  mismatchStrength: v as "mild" | "moderate" | "strong",
                })
              }
            />
            <ScenarioRadioGroup
              options={[
                {
                  value: "evt-alone",
                  label: "EVT Alone",
                  description: "Thrombectomy without thrombolysis",
                },
                {
                  value: "ivt-plus-evt",
                  label: "IV tPA + EVT",
                  description: "Mismatch-guided thrombolysis + thrombectomy",
                },
              ]}
              value={simulationParams.wakeUpStrategy}
              onChange={(v) =>
                updateSimulationParams({
                  wakeUpStrategy: v as "evt-alone" | "ivt-plus-evt",
                })
              }
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Scenario Selector */}
      <div>
        <h3 className="text-sm font-semibold text-neuro-text-primary mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-neuro-salvaged" />
          Clinical Scenario
        </h3>
        <div className="space-y-1">
          {scenarios.map((scenario) => (
            <button
              key={scenario.value}
              onClick={() => setActiveScenario(scenario.value)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                activeScenario === scenario.value
                  ? "bg-neuro-salvaged/20 text-neuro-salvaged border border-neuro-salvaged/30"
                  : "text-neuro-text-secondary hover:bg-neuro-bg-tertiary hover:text-neuro-text-primary"
              )}
            >
              {scenario.icon}
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-neuro-border-subtle" />

      {/* Simulation Mode Toggle */}
      <div>
        <h3 className="text-sm font-semibold text-neuro-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neuro-salvaged" />
          Simulation Mode
        </h3>
        <div className="flex flex-col gap-2 p-1 bg-neuro-bg-tertiary rounded-lg">
          <button
            onClick={() => setSimulationMode("deterministic")}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
              simulationMode === "deterministic"
                ? "bg-neuro-salvaged/20 text-neuro-salvaged"
                : "text-neuro-text-secondary hover:text-neuro-text-primary"
            )}
          >
            <Target className="w-4 h-4 flex-shrink-0" />
            <span>Deterministic</span>
          </button>
          <button
            onClick={() => setSimulationMode("monte-carlo")}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
              simulationMode === "monte-carlo"
                ? "bg-neuro-salvaged/20 text-neuro-salvaged"
                : "text-neuro-text-secondary hover:text-neuro-text-primary"
            )}
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>Uncertainty</span>
          </button>
        </div>
        <p className="text-xs text-neuro-text-tertiary mt-2">
          {simulationMode === "deterministic"
            ? "Single-point outcome estimates"
            : "Monte Carlo simulation with probability distributions (200+ runs)"}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-neuro-border-subtle" />

      {/* Scenario-specific controls */}
      <div>
        <h3 className="text-sm font-semibold text-neuro-text-primary mb-4">
          Intervention Controls
        </h3>
        {renderScenarioControls()}
      </div>

      {/* Shared physiology controls */}
      <div>
        <h3 className="text-sm font-semibold text-neuro-text-primary mb-4">
          Shared Physiology
        </h3>
        <InterventionSlider
          label="SBP Target"
          value={simulationParams.sbpTarget}
          min={100}
          max={200}
          step={5}
          unit="mmHg"
          warning={
            simulationParams.sbpTarget < 120 && patientData.collateralScore < 2
              ? "Low SBP with poor collaterals → hypoperfusion risk"
              : simulationParams.sbpTarget > 180
              ? "High SBP increases hemorrhage risk"
              : undefined
          }
          onChange={(v) => updateSimulationParams({ sbpTarget: v })}
        />
      </div>
    </div>
  );
}
