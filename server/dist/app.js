"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const stores_1 = require("./routes/stores");
const products_1 = require("./routes/products");
dotenv_1.default.config();
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.get("/health", (_req, res) => res.json({ ok: true }));
    app.use("/stores", stores_1.storesRouter);
    app.use("/products", products_1.productsRouter);
    // Not found
    app.use((_req, res) => {
        res.status(404).json({ error: "Not found" });
    });
    // Error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err, _req, res, _next) => {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    });
    return app;
}
