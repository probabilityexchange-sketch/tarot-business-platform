import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
export { deliverDiscernmentSeries } from "./discernment-series.js";

setGlobalOptions({ maxInstances: 10 });

export const onSubscriberCreated = onDocumentCreated("subscribers/{subscriberId}", async () => {});
export const processScheduledEmails = onDocumentCreated("scheduledEmails/{jobId}", async () => {});
export async function processAllPendingEmails() {}
