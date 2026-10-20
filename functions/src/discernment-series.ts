import { onSchedule } from "firebase-functions/v2/scheduler";

export async function runDiscernmentSeries() {}

export const deliverDiscernmentSeries = onSchedule({
  schedule: "every 15 minutes", timeZone: "America/New_York", region: "us-east4",
  maxInstances: 1, concurrency: 1, timeoutSeconds: 60,
  memory: "256MiB", retryCount: 0,
}, runDiscernmentSeries);
