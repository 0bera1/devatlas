"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bilingualSection = bilingualSection;
function bilingualSection(enTitle, enBody, trTitle, trBody) {
    return `## ${enTitle} (EN)

${enBody}

---

## ${trTitle} (TR)

${trBody}`;
}
//# sourceMappingURL=bilingual.js.map