"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatZodError = formatZodError;
function normalizePath(path) {
    const out = [];
    for (const k of path) {
        if (typeof k === "string" || typeof k === "number")
            out.push(k);
        // ignore symbols (not relevant for JSON payload validation)
    }
    return out;
}
function isMissingValue(payload, path) {
    const keys = normalizePath(path);
    let cur = payload;
    for (const key of keys) {
        if (cur == null)
            return true;
        if (typeof cur !== "object")
            return true;
        if (!(key in cur))
            return true;
        cur = cur[key];
    }
    return cur === undefined;
}
function formatZodError(err, payload) {
    const fieldErrors = {};
    for (const issue of err.issues) {
        const field = issue.path.join(".") || "body";
        let message = issue.message;
        if (issue.code === "invalid_type") {
            if (isMissingValue(payload, issue.path)) {
                message = `${field} is required`;
            }
            else {
                const expected = issue.expected;
                message = expected ? `${field} must be a ${expected}` : `"${field}" has an invalid type`;
            }
        }
        if (!fieldErrors[field])
            fieldErrors[field] = [];
        fieldErrors[field].push(message);
    }
    return {
        error: {
            type: "VALIDATION_ERROR",
            message: "Request validation failed",
            fieldErrors,
        },
    };
}
