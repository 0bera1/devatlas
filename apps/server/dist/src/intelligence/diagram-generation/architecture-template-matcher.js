"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchitectureTemplateMatcher = void 0;
const common_1 = require("@nestjs/common");
const architecture_templates_constant_1 = require("./architecture-templates.constant");
let ArchitectureTemplateMatcher = class ArchitectureTemplateMatcher {
    match(prompt) {
        const normalized = this.normalizePrompt(prompt);
        if (normalized.length === 0) {
            return this.toFallbackResult();
        }
        let bestTemplate = null;
        let bestMatches = [];
        for (const template of architecture_templates_constant_1.ARCHITECTURE_TEMPLATES) {
            const matched = this.collectMatchedKeywords(template.keywords, normalized);
            if (matched.length === 0) {
                continue;
            }
            if (matched.length > bestMatches.length) {
                bestTemplate = template;
                bestMatches = matched;
            }
        }
        if (bestTemplate === null) {
            return this.toFallbackResult();
        }
        return {
            template: bestTemplate,
            matchedKeywords: bestMatches,
            score: bestMatches.length,
        };
    }
    normalizePrompt(prompt) {
        const trimmed = prompt.trim();
        if (trimmed.length === 0) {
            return '';
        }
        const sliced = trimmed.length > architecture_templates_constant_1.ARCHITECTURE_TEMPLATE_MAX_PROMPT_LENGTH
            ? trimmed.slice(0, architecture_templates_constant_1.ARCHITECTURE_TEMPLATE_MAX_PROMPT_LENGTH)
            : trimmed;
        return sliced.toLowerCase();
    }
    collectMatchedKeywords(keywords, normalizedPrompt) {
        const matched = [];
        for (const keyword of keywords) {
            if (normalizedPrompt.includes(keyword)) {
                matched.push(keyword);
            }
        }
        return matched;
    }
    toFallbackResult() {
        const fallback = architecture_templates_constant_1.ARCHITECTURE_TEMPLATES.find((candidate) => candidate.id === architecture_templates_constant_1.ARCHITECTURE_TEMPLATE_FALLBACK_ID);
        if (fallback === undefined) {
            throw new Error(`Fallback architecture template "${architecture_templates_constant_1.ARCHITECTURE_TEMPLATE_FALLBACK_ID}" not found`);
        }
        return { template: fallback, matchedKeywords: [], score: 0 };
    }
};
exports.ArchitectureTemplateMatcher = ArchitectureTemplateMatcher;
exports.ArchitectureTemplateMatcher = ArchitectureTemplateMatcher = __decorate([
    (0, common_1.Injectable)()
], ArchitectureTemplateMatcher);
//# sourceMappingURL=architecture-template-matcher.js.map