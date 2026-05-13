"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechKeywordExtractor = void 0;
const common_1 = require("@nestjs/common");
const tech_keywords_constant_1 = require("./tech-keywords.constant");
let TechKeywordExtractor = class TechKeywordExtractor {
    extractFrom(text) {
        const safeText = this.normalizeInput(text);
        if (safeText.length === 0) {
            return [];
        }
        const matched = [];
        const seen = new Set();
        for (const keyword of tech_keywords_constant_1.TECH_KEYWORDS) {
            if (matched.length >= tech_keywords_constant_1.AUTO_TAG_MAX_TAG_COUNT) {
                break;
            }
            if (seen.has(keyword)) {
                continue;
            }
            if (!safeText.includes(keyword)) {
                continue;
            }
            matched.push(keyword);
            seen.add(keyword);
        }
        return matched;
    }
    normalizeInput(text) {
        const trimmed = text.trim();
        if (trimmed.length === 0) {
            return '';
        }
        const sliced = trimmed.length > tech_keywords_constant_1.AUTO_TAG_MAX_TEXT_LENGTH
            ? trimmed.slice(0, tech_keywords_constant_1.AUTO_TAG_MAX_TEXT_LENGTH)
            : trimmed;
        return sliced.toLowerCase();
    }
};
exports.TechKeywordExtractor = TechKeywordExtractor;
exports.TechKeywordExtractor = TechKeywordExtractor = __decorate([
    (0, common_1.Injectable)()
], TechKeywordExtractor);
//# sourceMappingURL=tech-keyword-extractor.js.map