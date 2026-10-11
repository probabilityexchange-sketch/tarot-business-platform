import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCalComAvailability } from "@/lib/calcom";

const availabilityQuerySchema = z.object({
  start: z.string().min(1).optional(),
  end: z.string().min(1).optional(),
  duration: z.coerce.number().int().positive().optional(),
  timeZone: z.string().min(1).optional(),
  bookingUidToReschedule: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
});

function getDefaultWindow() {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 14);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = availabilityQuerySchema.parse(searchParams);
    const defaults = getDefaultWindow();

    const slots = await getCalComAvailability({
      start: query.start ?? defaults.start,
      end: query.end ?? defaults.end,
      duration: query.duration,
      timeZone: query.timeZone,
      bookingUidToReschedule: query.bookingUidToReschedule,
      title: query.title,
    });

    return NextResponse.json({
      source: "cal.com",
      slots,
      count: slots.length,
    });
  } catch (error) {
    console.error("Availability failed", error);
    return NextResponse.json({ error: "Availability is temporarily unavailable. Please try again or contact Kali." }, { status: 503 });
  }
}
