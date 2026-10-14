import express, { type NextFunction, type Request, type Response } from "express";
import morgan from "morgan";
import { config } from "./config";
import { getAvgTemp, HttpError } from "./utils";
import { OSEMTempSensors } from "./data";
import pkg from "../package.json" with { type: 'json' }

const app = express();
const ApiRouter = express.Router();

ApiRouter.get("/", (_req: Request, res: Response) => {
  res.json({ "message": "Hello to Hivebox" });
});

ApiRouter.get("/info", (_req: Request, res: Response) => {
  res.json({
    "app_name": config.appName,
    "version": pkg.version,
    "environment": config.env,
  });
});

ApiRouter.get("/version", (_req: Request, res: Response) => {
  res.json({ "version": pkg.version });
});

ApiRouter.get("/temperature", async (_req: Request, res: Response) => {
  const avg = await getAvgTemp(OSEMTempSensors);

  res.json({ "averageTemperature": avg });
})

app.use(morgan(config.env === "development" ? "dev" : "combined"));
app.use("/api", ApiRouter);

// catch all unmatched urls
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// Error-Handler must be last, and must have all 4 params
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (res.headersSent) return next(err);

  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof HttpError ? err.message : "Internal server error";
  res.status(status).json({ error: message });
});

export { app };
