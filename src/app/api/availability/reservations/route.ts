import { randomBytes, createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { reserveCalComSlot } from "@/lib/calcom";
import { getAdminDb } from "@/lib/firebase-admin";
import { getOfferingById } from "@/lib/offerings";
import { allowPublicRequest } from "@/lib/request-limit";
import { bookingCollections } from "@/lib/booking";

const reservationSchema = z.object({
  offeringId: z.string().min(1),
  slotStart: z.string().datetime().refine((value) => Date.parse(value) > Date.now()),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = reservationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Choose an available future time." }, { status: 400 });
    const offering = getOfferingById(parsed.data.offeringId);
    if (!offering) return NextResponse.json({ error: "Unknown offering" }, { status: 400 });
    if (!(await allowPublicRequest("reservation"))) return NextResponse.json({ error: "Booking is busy. Please try again later or contact Kali." }, { status: 429 });
    const slotDuration = Number.parseInt(offering.duration, 10);
    const reservation = await reserveCalComSlot({
      slotStart: parsed.data.slotStart,
      slotDuration,
      reservationDuration: 45,
      title: offering.title,
    });
    if (!reservation.uid) throw new Error("Missing reservation reference");
    const reservationToken = randomBytes(32).toString("hex");
    await getAdminDb().collection(bookingCollections.slots).doc(reservation.uid).create({
      offeringId: offering.id,
      slotStart: parsed.data.slotStart,
      slotDuration,
      tokenHash: createHash("sha256").update(reservationToken).digest("hex"),
      expiresAt: Timestamp.fromMillis(Date.now() + 45 * 60 * 1000),
      createdAt: Timestamp.now(),
    });
    return NextResponse.json({ reservationUid: reservation.uid, reservationToken });
  } catch (error) {
    console.error("Reservation failed", error);
    return NextResponse.json({ error: "Unable to reserve that time. Please choose another or contact Kali." }, { status: 503 });
  }
}
