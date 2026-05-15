import { diagramNarrativesEn, flowNarrativesEn } from './narratives-en.data';
import { diagramNarrativesTr, flowNarrativesTr } from './narratives-tr.data';
import { seedFlows } from './flows.data';
import type { SeedFlowInput } from '../types';

export function getDiagramNarrativeTrEn(
  slug: string,
): { readonly narrativeTr: string | null; readonly narrativeEn: string | null } {
  const narrativeTr: string | undefined = diagramNarrativesTr[slug];
  const narrativeEn: string | undefined =
    diagramNarrativesEn[slug] ?? narrativeTr;
  return {
    narrativeTr: narrativeTr ?? null,
    narrativeEn: narrativeEn ?? null,
  };
}

export function resolveFlowSeedInputs(): SeedFlowInput[] {
  return seedFlows.map((flow: SeedFlowInput): SeedFlowInput => {
    const trExtra = flowNarrativesTr.find((n) => n.slug === flow.slug);
    const enExtra = flowNarrativesEn.find((n) => n.slug === flow.slug);
    if (trExtra === undefined && enExtra === undefined) {
      return flow;
    }
    const trFlow = trExtra;
    const enFlow = enExtra ?? trFlow;
    if (trFlow === undefined) {
      return flow;
    }
    return {
      ...flow,
      narrativeTr: trFlow.narrative,
      narrativeEn: enFlow?.narrative ?? trFlow.narrative,
      steps: flow.steps.map((step) => {
        const trStep = trFlow.steps.find(
          (s) => s.diagramSlug === step.diagramSlug,
        );
        const enStep = enFlow?.steps.find(
          (s) => s.diagramSlug === step.diagramSlug,
        );
        return {
          ...step,
          label: trStep?.label ?? step.label,
          narrativeTr: trStep?.narrative ?? null,
          narrativeEn: enStep?.narrative ?? trStep?.narrative ?? null,
        };
      }),
    };
  });
}
