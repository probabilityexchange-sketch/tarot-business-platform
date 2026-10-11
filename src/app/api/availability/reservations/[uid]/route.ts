import { createHash } from "node:crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import { bookingCollections } from "@/lib/booking";
import { NextRequest, NextResponse } from "next/server";
import { deleteCalComReservation } from "@/lib/calcom";

export async function DELETE(request: NextRequest) {
  try {
    const uid = request.nextUrl.pathname.split("/").pop() ?? "";

    if (!uid) {
      return NextResponse.json({ error: "Missing reservation uid" }, { status: 400 });
    }

    const { reservationToken } = await request.json();
    const ref = getAdminDb().collection(bookingCollections.slots).doc(uid);
    const hold = (await ref.get()).data();
    if (typeof reservationToken !== "string" || !hold || hold.checkoutFingerprint ||
        hold.tokenHash !== createHash("sha256").update(reservationToken).digest("hex")) {
      return NextResponse.json({ error: "Reservation cannot be released" }, { status: 403 });
    }
    await deleteCalComReservation(uid);
    await ref.delete();

    return NextResponse.json({ status: "success" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete reservation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
