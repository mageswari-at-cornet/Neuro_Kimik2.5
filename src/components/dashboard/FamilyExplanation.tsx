"use client";

import { useState } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { cn } from "@/lib/utils";
import { Users, Copy, Check, RefreshCw, MessageCircle } from "lucide-react";

interface FamilyExplanationProps {
  className?: string;
}

export function FamilyExplanation({ className }: FamilyExplanationProps) {
  const { activeScenario, simulationParams, currentOutcomes } = useDashboardStore();
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const generateExplanation = () => {
    setIsGenerating(true);
    
    // Simulate LLM generation delay
    setTimeout(() => {
      const explanations: Record<string, string> = {
        routing: `Your loved one has had a stroke from a blocked brain blood vessel. We need to choose the fastest treatment path. Option 1 gives clot medicine first then transfers. Option 2 goes straight to the specialized hospital. Based on our analysis, ${simulationParams.routingStrategy === "drip-and-ship" ? "giving medicine first" : "going directly to the specialized hospital"} gives your loved one a ${currentOutcomes.mrs0to2Probability}% chance of good recovery. The medical team will monitor closely throughout.`,

        bridging: `Your loved one has a severe stroke from a large clot. The main treatment removes the clot through a small tube in the leg. We can give clot medicine first or proceed directly to the procedure. Our analysis suggests ${simulationParams.treatmentStrategy === "bridging" ? "giving medicine first" : "proceeding directly to the procedure"} offers the best balance of benefit and risk for your loved one's situation.`,

        imaging: `We need brain pictures to plan the best treatment. Standard approach gives complete information but takes 35 extra minutes. Quick approach starts treatment faster with less information. Given your loved one's condition, ${simulationParams.imagingPathway === "standard" ? "the detailed pictures will help us make the safest decision" : "starting treatment quickly is more important than extra pictures"}. Time is critical in stroke treatment and we're working as fast as possible.`,

        tandem: `Your loved one has a complex stroke with multiple vessel blockages. We can use a balloon to temporarily open vessels or place a permanent stent. The stent provides better long-term results but requires blood thinners that increase bleeding risk. The balloon avoids those risks but the vessel may close again. For your loved one, ${simulationParams.tandemApproach === "acute-stenting" ? "the permanent stent" : "the balloon approach"} appears to be the safer choice given their overall condition.`,

        "large-core": `Your loved one has a severe stroke with significant brain tissue already affected. We have two paths: conservative care with medications, or a procedure to remove the clot despite the large affected area. The procedure carries higher risks but may prevent the stroke from worsening. Our analysis shows ${simulationParams.largeCoreStrategy === "thrombectomy" ? "attempting the procedure" : "focusing on careful medical management"} gives the best chance of avoiding severe disability. We'll support you whatever you decide.`,

        "wake-up": `Your loved one woke up with stroke symptoms so we don't know exactly when it started. Brain scans show ${simulationParams.mismatchStrength} mismatch meaning there's still tissue we might save if we act quickly. We can remove the clot and may also give clot medicine if scans suggest it could help. The team believes ${simulationParams.wakeUpStrategy === "ivt-plus-evt" ? "using both treatments together" : "focusing on the clot removal procedure"} offers the best chance for recovery based on the scan results.`,
      };

      setExplanation(explanations[activeScenario] || explanations.routing);
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neuro-text-primary flex items-center gap-2">
          <Users className="w-4 h-4 text-neuro-salvaged" />
          Family Explanation
        </h3>
        {!explanation ? (
          <button
            onClick={generateExplanation}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-neuro-salvaged/20 text-neuro-salvaged hover:bg-neuro-salvaged/30 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <MessageCircle className="w-3 h-3" />
                Generate
              </>
            )}
          </button>
        ) : (
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-neuro-bg-tertiary text-neuro-text-secondary hover:text-neuro-text-primary transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {!explanation ? (
        <div className="p-6 rounded-lg bg-neuro-bg-secondary border border-neuro-border-subtle text-center">
          <MessageCircle className="w-8 h-8 text-neuro-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-neuro-text-secondary mb-2">
            Generate a plain-language explanation
          </p>
          <p className="text-xs text-neuro-text-tertiary">
            Suitable for sharing with patients and family members
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-neuro-bg-secondary border border-neuro-border-subtle">
          <div className="prose prose-invert prose-sm max-w-none">
            {explanation.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-sm text-neuro-text-secondary leading-relaxed mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-neuro-border-subtle flex items-center justify-between">
            <span className="text-xs text-neuro-text-tertiary">
              Generated by NeuroSim
            </span>
            <button
              onClick={generateExplanation}
              className="text-xs text-neuro-salvaged hover:underline"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-neuro-text-tertiary italic">
        Review and edit before sharing. This explanation is generated by AI and should be reviewed by a clinician.
      </p>
    </div>
  );
}
