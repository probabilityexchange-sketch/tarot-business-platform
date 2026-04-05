import { NextRequest, NextResponse } from "next/server";
import { deleteCalComReservation } from "@/lib/calcom";

export async function DELETE(request: NextRequest) {
  try {
    const uid = request.nextUrl.pathname.split("/").pop() ?? "";

    if (!uid) {
      return NextResponse.json({ error: "Missing reservation uid" }, { status: 400 });
    }

    await deleteCalComReservation(uid);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete reservation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
