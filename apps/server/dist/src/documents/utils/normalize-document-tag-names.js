"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDocumentTagNames = normalizeDocumentTagNames;
function normalizeDocumentTagNames(tags) {
    if (tags === undefined || tags.length === 0) {
        return undefined;
    }
    const seen = new Set();
    const out = [];
    for (const raw of tags) {
        const normalized = raw.trim().toLowerCase();
        if (normalized.length === 0) {
            continue;
        }
        if (seen.has(normalized)) {
            continue;
        }
        seen.add(normalized);
        out.push(normalized);
    }
    return out.length === 0 ? undefined : out;
}
//# sourceMappingURL=normalize-document-tag-names.js.map