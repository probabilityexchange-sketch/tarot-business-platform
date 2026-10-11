import { initializeApp, getApps, cert, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App | undefined;
let adminDb: ReturnType<typeof getFirestore> | undefined;
let adminAuth: ReturnType<typeof getAuth> | undefined;

function getAdminApp(): App {
  if (!adminApp) {
    if (!getApps().length) {
      adminApp = initializeApp({
        credential: process.env.FIREBASE_SERVICE_ACCOUNT_KEY
          ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
          : applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      adminApp = getApps()[0];
    }
  }
  return adminApp;
}

function getAdminDb() {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp());
    adminDb.settings({ ignoreUndefinedProperties: true });
  }
  return adminDb;
}

function getAdminAuth() {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp());
  }
  return adminAuth;
}

export { getAdminDb, getAdminAuth };
