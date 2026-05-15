"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEARCH_PREVIEW_MAX_CHARS = void 0;
exports.buildSearchPreview = buildSearchPreview;
exports.SEARCH_PREVIEW_MAX_CHARS = 180;
function buildSearchPreview(content, maxChars) {
    const normalized = content.replace(/\s+/gu, ' ').trim();
    if (normalized.length === 0) {
        return '';
    }
    if (normalized.length <= maxChars) {
        return normalized;
    }
    return `${normalized.slice(0, maxChars)}…`;
}
//# sourceMappingURL=search-preview.js.map