"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStoreSchema = exports.createStoreSchema = void 0;
const zod_1 = require("zod");
const requiredString = (field, max) => zod_1.z.preprocess((val) => (typeof val === "string" ? val.trim() : val), zod_1.z
    .string()
    .min(1, `${field} is required`)
    .max(max, `${field} must be at most ${max} characters`));
const optionalString = (field, max) => zod_1.z.preprocess((val) => (typeof val === "string" ? val.trim() : val), zod_1.z.string().max(max, `"${field}" must be at most ${max} characters`).optional());
exports.createStoreSchema = zod_1.z.object({
    name: requiredString("name", 120),
    location: optionalString("location", 200),
});
exports.updateStoreSchema = exports.createStoreSchema.partial();
