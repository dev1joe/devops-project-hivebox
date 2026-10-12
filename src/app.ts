import express, { type Request, type Response } from "express";
import { config } from "./config.js";

const app = express();
const ApiRouter = express.Router();

ApiRouter.get("/", (req: Request, res: Response) => {
  res.json({ "message": "Hello World" });
});

ApiRouter.get("/info", (req: Request, res: Response) => {
  res.json({
    "app_name": config.appName,
    "version": config.version,
    "environment": config.env,
  });
});

ApiRouter.get("/version", (req: Request, res: Response) => {
  res.json({ "version": config.version });
});

app.use("/api", ApiRouter);

// catch all unmatched urls
app.use((req: Request, res: Response) => {
  res.status(400).json({ error: "Not Found" });
});

export { app };
