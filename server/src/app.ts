import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { storesRouter } from "./routes/stores";
import { productsRouter } from "./routes/products";

dotenv.config();

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/stores", storesRouter);
  app.use("/products", productsRouter);

  // Not found
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
