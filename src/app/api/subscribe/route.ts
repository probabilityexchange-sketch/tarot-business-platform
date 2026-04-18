import { NextResponse } from "next/server";

function getFirestore() {
  const { initializeApp, getApps, cert } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  return getFirestore();
}

export async function POST(request: Request) {
  try {
    const { email, source = "homepage" } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const db = getFirestore();

    // Check for existing subscriber
    const existing = await db.collection("subscribers").where("email", "==", email).limit(1).get();
    
    if (!existing.empty) {
      // Already subscribed - just trigger the sequence again
      const doc = existing.docs[0];
      await doc.ref.update({
        resubscribedAt: new Date(),
        source,
        status: "active",
      });
      
      return NextResponse.json({ 
        message: "Welcome back! Check your inbox.",
        alreadySubscribed: true 
      });
    }

    // Create new subscriber
    const subscriberData = {
      email,
      source,
      status: "active",
      subscribedAt: new Date(),
      emailSequence: "welcome",
      sequenceStep: 0,
    };

    await db.collection("subscribers").add(subscriberData);

    return NextResponse.json({ 
      message: "Guide sent! Check your inbox.",
      success: true 
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}