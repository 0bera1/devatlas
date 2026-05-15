"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOfUtcDay = startOfUtcDay;
function startOfUtcDay(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
//# sourceMappingURL=utc-date-bucket.js.map