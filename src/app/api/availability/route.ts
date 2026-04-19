import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCalComAvailability, listCalComEventTypes } from "@/lib/calcom";

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
    const message = error instanceof Error ? error.message : "Failed to load availability";

    if (
      error instanceof Error &&
      (message.includes("No Cal.com event type matched") ||
        message.includes("Multiple Cal.com event types match"))
    ) {
      try {
        const eventTypes = await listCalComEventTypes();

        return NextResponse.json(
          {
            error: message,
            calComEventTypes: eventTypes,
          },
          { status: 500 }
        );
      } catch {
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
