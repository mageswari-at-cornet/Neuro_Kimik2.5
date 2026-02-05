import { create } from "zustand";

// Outcome calculation function based on simulation parameters
function calculateOutcomes(
  params: SimulationParams,
  patientData: PatientData
): OutcomeMetrics {
  // Base values
  let timeToReperfusion = 180;
  let finalCoreVolume = patientData.initialCoreVolume;
  let penumbraSalvaged = 45;
  let reperfusionProbability = 78;
  let sichRisk = 6;
  let mortalityRisk = 18;
  let mrs0to2Probability = 48;

  // Routing strategy effects
  if (params.routingStrategy === "drip-and-ship") {
    timeToReperfusion = params.transferDelay + params.doorToGroinTime + params.ivtWorkflowDelay;
  } else {
    // Direct mothership - faster but no IVT benefit
    timeToReperfusion = params.doorToGroinTime;
    reperfusionProbability -= 5; // Lower early recanalization
  }

  // Time effects on outcomes
  const timePenalty = Math.max(0, (timeToReperfusion - 120) / 60); // Penalty per hour over 2 hours
  
  // Core grows with time (2cc per hour of delay)
  finalCoreVolume = Math.min(patientData.territoryAtRisk, patientData.initialCoreVolume + timePenalty * 2);
  
  // Penumbra salvage decreases with time
  const maxSalvage = patientData.territoryAtRisk - patientData.initialCoreVolume;
  penumbraSalvaged = Math.max(0, maxSalvage - timePenalty * 15);
  
  // Reperfusion probability affected by time
  reperfusionProbability = Math.max(30, 85 - timePenalty * 10);
  
  // Treatment strategy effects
  if (params.treatmentStrategy === "bridging") {
    reperfusionProbability += 8; // Better recanalization
    sichRisk += 2; // Higher bleeding risk
    timeToReperfusion += params.ivtWorkflowDelay;
  }

  // Imaging pathway effects
  if (params.imagingPathway === "standard") {
    timeToReperfusion += 35; // Additional imaging time
  }

  // Large core strategy
  if (params.largeCoreStrategy === "thrombectomy") {
    reperfusionProbability -= 10; // Harder to treat
    sichRisk += 2;
  }

  // Calculate mortality and mRS based on other factors
  const coreGrowthFactor = finalCoreVolume / patientData.initialCoreVolume;
  mortalityRisk = Math.min(50, 15 + coreGrowthFactor * 5 + (sichRisk * 0.5));
  mrs0to2Probability = Math.max(10, 60 - coreGrowthFactor * 10 - (timePenalty * 5));

  // Collateral score benefit
  if (patientData.collateralScore >= 2) {
    penumbraSalvaged *= 1.2;
    mrs0to2Probability += 5;
  }

  // Clamp values to realistic ranges
  return {
    timeToReperfusion: Math.round(timeToReperfusion),
    finalCoreVolume: Math.round(finalCoreVolume),
    penumbraAtRisk: Math.round(patientData.territoryAtRisk - patientData.initialCoreVolume),
    penumbraSalvaged: Math.round(Math.max(0, penumbraSalvaged)),
    reperfusionProbability: Math.round(Math.max(0, Math.min(100, reperfusionProbability))),
    sichRisk: Math.round(Math.max(0, Math.min(30, sichRisk))),
    mortalityRisk: Math.round(Math.max(0, Math.min(100, mortalityRisk))),
    mrs0to2Probability: Math.round(Math.max(0, Math.min(100, mrs0to2Probability))),
  };
}

export type Scenario =
  | "routing"
  | "bridging"
  | "imaging"
  | "tandem"
  | "large-core"
  | "wake-up";

export interface PatientData {
  age: number;
  sex: "M" | "F" | "Other";
  nihss: number;
  occlusionLocation: string;
  collateralScore: number;
  initialCoreVolume: number;
  territoryAtRisk: number;
  systolicBP: number;
  onsetTime: string | "wake-up";
}

export interface SimulationParams {
  // Scenario 1: Routing
  routingStrategy: "drip-and-ship" | "direct-mothership";
  transferDelay: number;
  doorToGroinTime: number;
  ivtWorkflowDelay: number;

  // Scenario 2: Bridging
  treatmentStrategy: "evt-alone" | "bridging";

  // Scenario 3: Imaging
  imagingPathway: "standard" | "direct-to-angio";

  // Scenario 4: Tandem
  tandemApproach: "balloon-only" | "acute-stenting";

  // Scenario 5: Large Core
  largeCoreStrategy: "medical" | "thrombectomy";

  // Scenario 6: Wake-up
  mismatchStrength: "mild" | "moderate" | "strong";
  wakeUpStrategy: "evt-alone" | "ivt-plus-evt";

  // Shared
  sbpTarget: number;
}

export interface OutcomeMetrics {
  timeToReperfusion: number;
  finalCoreVolume: number;
  penumbraAtRisk: number;
  penumbraSalvaged: number;
  reperfusionProbability: number;
  sichRisk: number;
  mortalityRisk: number;
  mrs0to2Probability: number;
}

export interface UncertaintyOutcome {
  p05: number;  // 5th percentile
  mean: number; // mean/average
  p95: number;  // 95th percentile
}

export interface UncertaintyOutcomes {
  timeToReperfusion: UncertaintyOutcome;
  finalCoreVolume: UncertaintyOutcome;
  penumbraSalvaged: UncertaintyOutcome;
  reperfusionProbability: UncertaintyOutcome;
  sichRisk: UncertaintyOutcome;
  mortalityRisk: UncertaintyOutcome;
  mrs0to2Probability: UncertaintyOutcome;
}

interface DashboardState {
  // Current selections
  activeScenario: Scenario;
  patientData: PatientData;
  simulationParams: SimulationParams;
  baselineOutcomes: OutcomeMetrics;
  currentOutcomes: OutcomeMetrics;
  simulationMode: "deterministic" | "monte-carlo";
  uncertaintyOutcomes: UncertaintyOutcomes;
  baselineUncertainty: UncertaintyOutcomes;

  // Actions
  setActiveScenario: (scenario: Scenario) => void;
  updatePatientData: (data: Partial<PatientData>) => void;
  updateSimulationParams: (params: Partial<SimulationParams>) => void;
  setSimulationMode: (mode: "deterministic" | "monte-carlo") => void;
  resetToBaseline: () => void;
}

const defaultPatientData: PatientData = {
  age: 68,
  sex: "M",
  nihss: 18,
  occlusionLocation: "M1",
  collateralScore: 1.5,
  initialCoreVolume: 45,
  territoryAtRisk: 180,
  systolicBP: 165,
  onsetTime: "2h 14m ago",
};

const defaultSimulationParams: SimulationParams = {
  routingStrategy: "drip-and-ship",
  transferDelay: 45,
  doorToGroinTime: 60,
  ivtWorkflowDelay: 8,
  treatmentStrategy: "evt-alone",
  imagingPathway: "standard",
  tandemApproach: "balloon-only",
  largeCoreStrategy: "thrombectomy",
  mismatchStrength: "moderate",
  wakeUpStrategy: "evt-alone",
  sbpTarget: 140,
};

const defaultOutcomes: OutcomeMetrics = {
  timeToReperfusion: 180,
  finalCoreVolume: 68,
  penumbraAtRisk: 135,
  penumbraSalvaged: 45,
  reperfusionProbability: 78,
  sichRisk: 6,
  mortalityRisk: 18,
  mrs0to2Probability: 48,
};

const defaultUncertaintyOutcomes: UncertaintyOutcomes = {
  timeToReperfusion: { p05: 150, mean: 180, p95: 210 },
  finalCoreVolume: { p05: 55, mean: 68, p95: 82 },
  penumbraSalvaged: { p05: 35, mean: 45, p95: 55 },
  reperfusionProbability: { p05: 68, mean: 78, p95: 88 },
  sichRisk: { p05: 4, mean: 6, p95: 9 },
  mortalityRisk: { p05: 14, mean: 18, p95: 23 },
  mrs0to2Probability: { p05: 40, mean: 48, p95: 56 },
};

export const useDashboardStore = create<DashboardState>((set) => ({
  activeScenario: "routing",
  patientData: defaultPatientData,
  simulationParams: defaultSimulationParams,
  baselineOutcomes: defaultOutcomes,
  currentOutcomes: defaultOutcomes,
  simulationMode: "deterministic",
  uncertaintyOutcomes: defaultUncertaintyOutcomes,
  baselineUncertainty: defaultUncertaintyOutcomes,

  setActiveScenario: (scenario) =>
    set((state) => {
      // Recalculate outcomes when scenario changes
      const newOutcomes = calculateOutcomes(state.simulationParams, state.patientData);
      return {
        activeScenario: scenario,
        currentOutcomes: newOutcomes,
      };
    }),

  updatePatientData: (data) =>
    set((state) => ({
      patientData: { ...state.patientData, ...data },
    })),

  updateSimulationParams: (params) =>
    set((state) => {
      const newParams = { ...state.simulationParams, ...params };
      // Recalculate outcomes whenever parameters change
      const newOutcomes = calculateOutcomes(newParams, state.patientData);
      return {
        simulationParams: newParams,
        currentOutcomes: newOutcomes,
      };
    }),

  setSimulationMode: (mode) => set({ simulationMode: mode }),

  resetToBaseline: () =>
    set((state) => ({
      currentOutcomes: state.baselineOutcomes,
      uncertaintyOutcomes: state.baselineUncertainty,
      simulationParams: defaultSimulationParams,
    })),
}));
