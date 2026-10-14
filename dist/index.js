// src/app.ts
import express from "express";
import morgan from "morgan";

// src/config.ts
var config = {
  appName: process.env.APP_NAME ?? "Hivebox",
  version: process.env.VERSION ?? "0.0.1",
  env: process.env.ENV ?? "development",
  port: Number(process.env.PORT ?? 3e3)
};

// src/utils.ts
var HttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
  status;
};
async function getLatestMeasurement(sensor) {
  const url = `https://api.opensensemap.org/boxes/${sensor.boxId}/sensors/${sensor.sensorId}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(1e4) });
  if (!res.ok) {
    throw new Error(`openSenseMap returned ${res.status} for ${url}`);
  }
  const json = await res.json();
  const ageMs = Date.now() - new Date(json.lastMeasurement.createdAt).getTime();
  if (ageMs > 1e3 * 60 * 60) throw new Error(`stale measurement from ${url}`);
  const value = Number(json.lastMeasurement?.value);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid measurement from ${url}`);
  }
  return value;
}
async function getAvgTemp(sensors) {
  const results = await Promise.allSettled(sensors.map(getLatestMeasurement));
  const values = [];
  for (const r of results) {
    if (r.status === "fulfilled") values.push(r.value);
    else console.warn(r.reason);
  }
  if (values.length === 0) {
    throw new HttpError(502, "No valid sensor data available");
  }
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Number(avg.toFixed(2));
}

// src/data.ts
var OSEMTempSensors = [
  {
    "boxId": "5eba5fbad46fb8001b799786",
    "sensorId": "5eba5fbad46fb8001b799789"
  },
  {
    "boxId": "5c21ff8f919bf8001adf2488",
    "sensorId": "5c21ff8f919bf8001adf248d"
  },
  {
    "boxId": "5ade1acf223bd80019a1011c",
    "sensorId": "5ade1acf223bd80019a1011e"
  }
];

// package.json
var package_default = {
  name: "hivebox",
  version: "0.1.1",
  description: "",
  homepage: "https://github.com/dev1joe/devops-project-hivebox#readme",
  bugs: {
    url: "https://github.com/dev1joe/devops-project-hivebox/issues"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/dev1joe/devops-project-hivebox.git"
  },
  type: "module",
  scripts: {
    dev: "tsx watch --env-file=.env src/index.ts",
    build: "esbuild src/index.ts --bundle --platform=node --format=esm --packages=external --outfile=dist/index.js",
    typecheck: "tsc --noEmit",
    start: "node dist/index.js",
    lint: "eslint .",
    test: "vitest run"
  },
  dependencies: {
    express: "^5.3.0",
    morgan: "^1.12.1"
  },
  devDependencies: {
    "@eslint/js": "^10.0.1",
    "@types/express": "^5.0.6",
    "@types/morgan": "^1.9.10",
    "@types/node": "^26.6.5",
    "@types/supertest": "^7.2.1",
    esbuild: "^0.28.2",
    eslint: "^10.12.0",
    globals: "^17.13.0",
    supertest: "^7.3.1",
    tsx: "^4.23.15",
    typescript: "^6.0.3",
    "typescript-eslint": "^8.71.2",
    vitest: "^5.0.4"
  },
  allowScripts: {
    "esbuild@0.28.2": true
  }
};

// src/app.ts
var app = express();
var ApiRouter = express.Router();
ApiRouter.get("/", (_req, res) => {
  res.json({ "message": "Hello to Hivebox" });
});
ApiRouter.get("/info", (_req, res) => {
  res.json({
    "app_name": config.appName,
    "version": package_default.version,
    "environment": config.env
  });
});
ApiRouter.get("/version", (_req, res) => {
  res.json({ "version": package_default.version });
});
ApiRouter.get("/temperature", async (_req, res) => {
  const avg = await getAvgTemp(OSEMTempSensors);
  res.json({ "averageTemperature": avg });
});
app.use(morgan(config.env === "development" ? "dev" : "combined"));
app.use("/api", ApiRouter);
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});
app.use((err, _req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof HttpError ? err.message : "Internal server error";
  res.status(status).json({ error: message });
});

// src/index.ts
app.listen(config.port, () => console.log(`listening on port ${config.port}`));
