import { type SensorLatestMeasurement, type Sensor } from "./types";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function getLatestMeasurement(sensor: Sensor): Promise<number> {
  const url = `https://api.opensensemap.org/boxes/${sensor.boxId}/sensors/${sensor.sensorId}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });

  if (!res.ok) {
    throw new Error(`openSenseMap returned ${res.status} for ${url}`);
  }

  const json: SensorLatestMeasurement = await res.json();

  // checking time
  const ageMs = Date.now() - new Date(json.lastMeasurement.createdAt).getTime();
  if (ageMs > 1000 * 60 * 60) throw new Error(`stale measurement from ${url}`);

  // getting value
  const value = Number(json.lastMeasurement?.value);

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid measurement from ${url}`);
  }
  return value;
}

export async function getAvgTemp(sensors: Sensor[]): Promise<number> {
  const results = await Promise.allSettled(sensors.map(getLatestMeasurement));

  const values: number[] = [];
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
