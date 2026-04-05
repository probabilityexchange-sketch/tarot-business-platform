import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { reserveCalComSlot } from "@/lib/calcom";

const reservationSchema = z.object({
  slotStart: z.string().datetime(),
  slotDuration: z.coerce.number().int().positive().optional(),
  reservationDuration: z.coerce.number().int().positive().optional(),
  title: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = reservationSchema.parse(await request.json());
    const reservation = await reserveCalComSlot(body);

    return NextResponse.json({
      status: "success",
      reservationUid: reservation.uid,
      raw: reservation.raw,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reserve slot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
