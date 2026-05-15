"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCategoryName = normalizeCategoryName;
function normalizeCategoryName(raw) {
    if (raw === undefined) {
        return undefined;
    }
    const trimmed = raw.trim().toLowerCase();
    return trimmed.length === 0 ? undefined : trimmed;
}
//# sourceMappingURL=normalize-category-name.js.map