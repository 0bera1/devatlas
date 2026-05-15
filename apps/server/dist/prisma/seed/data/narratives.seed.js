"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiagramNarrativeTrEn = getDiagramNarrativeTrEn;
exports.resolveFlowSeedInputs = resolveFlowSeedInputs;
const narratives_en_data_1 = require("./narratives-en.data");
const narratives_tr_data_1 = require("./narratives-tr.data");
const flows_data_1 = require("./flows.data");
function getDiagramNarrativeTrEn(slug) {
    const narrativeTr = narratives_tr_data_1.diagramNarrativesTr[slug];
    const narrativeEn = narratives_en_data_1.diagramNarrativesEn[slug] ?? narrativeTr;
    return {
        narrativeTr: narrativeTr ?? null,
        narrativeEn: narrativeEn ?? null,
    };
}
function resolveFlowSeedInputs() {
    return flows_data_1.seedFlows.map((flow) => {
        const trExtra = narratives_tr_data_1.flowNarrativesTr.find((n) => n.slug === flow.slug);
        const enExtra = narratives_en_data_1.flowNarrativesEn.find((n) => n.slug === flow.slug);
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
                const trStep = trFlow.steps.find((s) => s.diagramSlug === step.diagramSlug);
                const enStep = enFlow?.steps.find((s) => s.diagramSlug === step.diagramSlug);
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
//# sourceMappingURL=narratives.seed.js.map