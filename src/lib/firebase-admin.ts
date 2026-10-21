import { initializeApp, getApps, cert, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App | undefined;
const shared = globalThis as typeof globalThis & { kaliAdminDb?: ReturnType<typeof getFirestore> };
let adminAuth: ReturnType<typeof getAuth> | undefined;

function getAdminApp(): App {
  if (!adminApp) {
    if (!getApps().length) {
      adminApp = initializeApp({
        credential: !process.env.K_SERVICE && process.env.FIREBASE_SERVICE_ACCOUNT_KEY
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
  if (!shared.kaliAdminDb) {
    shared.kaliAdminDb = getFirestore(getAdminApp());
    shared.kaliAdminDb.settings({ ignoreUndefinedProperties: true });
  }
  return shared.kaliAdminDb;
}

function getAdminAuth() {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp());
  }
  return adminAuth;
}

export { getAdminDb, getAdminAuth };
