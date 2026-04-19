import { z } from "zod";

const calComEventTypesApiVersion = "2024-06-14";
const calComSlotsApiVersion = "2024-09-04";
const calComBookingsApiVersion = "2026-02-25";

type CalComResolvedDescriptor =
  | { eventTypeId: number }
  | {
      eventTypeSlug: string;
      username: string;
      teamSlug?: string;
      organizationSlug?: string;
    };

type CalComDescriptorInput = {
  eventTypeId?: number;
  eventTypeSlug?: string;
  username?: string;
  teamSlug?: string;
  organizationSlug?: string;
};

type CalComAvailabilityParams = {
  start: string;
  end: string;
  duration?: number;
  timeZone?: string;
  bookingUidToReschedule?: string;
  title?: string;
} & CalComDescriptorInput;

type CalComReservationParams = {
  slotStart: string;
  slotDuration?: number;
  reservationDuration?: number;
  title?: string;
} & CalComDescriptorInput;

type CalComBookingParams = {
  start: string;
  lengthInMinutes?: number;
  title?: string;
  attendee: {
    name: string;
    email: string;
    timeZone?: string;
  };
  bookingFieldsResponses?: Record<string, string>;
  metadata?: Record<string, string>;
} & CalComDescriptorInput;

type CalComBookingActionResponse = {
  uid?: string;
  bookingUid?: string;
  id?: string;
  rescheduledToUid?: string;
  rescheduledFromUid?: string;
};

type CalComSlotRange = {
  start: string;
  end: string;
};

const calComConfigSchema = z.object({
  apiKey: z.string().min(1),
  eventTypeId: z.coerce.number().int().positive().optional(),
  eventTypeSlug: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  teamSlug: z.string().min(1).optional(),
  organizationSlug: z.string().min(1).optional(),
});

const calComRangeSlotSchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
});

const calComSlotsResponseSchema = z.object({
  status: z.string().optional(),
  data: z.record(z.string(), z.array(calComRangeSlotSchema)).optional(),
});

const calComReservationResponseSchema = z.object({
  status: z.string().optional(),
  data: z
    .object({
      uid: z.string().optional(),
      id: z.string().optional(),
      reservationUid: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

const calComEventTypeSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string().min(1),
  slug: z.string().min(1),
  lengthInMinutes: z.coerce.number().int().positive(),
  hidden: z.boolean().optional(),
});

const calComEventTypesResponseSchema = z.object({
  status: z.string().optional(),
  data: z.array(calComEventTypeSchema).optional(),
});

const calComBookingResponseSchema = z.object({
  status: z.string().optional(),
  data: z
    .object({
      uid: z.string().optional(),
      id: z.string().optional(),
      bookingUid: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

const calComBookingActionResponseSchema = z.object({
  status: z.string().optional(),
  data: z
    .object({
      uid: z.string().optional(),
      bookingUid: z.string().optional(),
      id: z.string().optional(),
      rescheduledToUid: z.string().optional(),
      rescheduledFromUid: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export type CalComAvailabilitySlot = {
  start: string;
  end: string;
  available: boolean;
};

export type CalComEventTypeSummary = {
  id: number;
  title: string;
  slug: string;
  lengthInMinutes: number;
  hidden?: boolean;
};

function getCalComConfig() {
  // Strip zero-width characters (BOM, etc.) that Firebase sometimes injects into secret values
  const cleanUsername = (v?: string) =>
    v ? v.replace(/[\u200B-\u200D\uFEFF]/g, "") : undefined;

  const parsed = calComConfigSchema.safeParse({
    apiKey: process.env.CALCOM_API_KEY,
    eventTypeId: process.env.CALCOM_EVENT_TYPE_ID,
    eventTypeSlug: process.env.CALCOM_EVENT_TYPE_SLUG,
    username: cleanUsername(process.env.CALCOM_USERNAME),
    teamSlug: cleanUsername(process.env.CALCOM_TEAM_SLUG),
    organizationSlug: cleanUsername(process.env.CALCOM_ORGANIZATION_SLUG),
  });

  if (!parsed.success) {
    throw new Error("Missing Cal.com configuration");
  }

  return parsed.data;
}

function normalizeEventTypeTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/^(the|a|an)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildDescriptor(
  config: ReturnType<typeof getCalComConfig>,
  overrides?: CalComDescriptorInput
): CalComResolvedDescriptor {
  if (overrides?.eventTypeId) {
    return { eventTypeId: overrides.eventTypeId };
  }

  if (config.eventTypeId) {
    return { eventTypeId: config.eventTypeId };
  }

  return {
    eventTypeSlug: overrides?.eventTypeSlug ?? config.eventTypeSlug ?? "",
    username: overrides?.username ?? config.username ?? "",
    teamSlug: overrides?.teamSlug ?? config.teamSlug,
    organizationSlug: overrides?.organizationSlug ?? config.organizationSlug,
  };
}

async function calComFetch<T>(
  path: string,
  init?: RequestInit,
  apiVersion = calComSlotsApiVersion
): Promise<T> {
  const config = getCalComConfig();
  const response = await fetch(`https://api.cal.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "cal-api-version": apiVersion,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Cal.com request failed with status ${response.status}: ${errorText || response.statusText}`
    );
  }

  return (await response.json()) as T;
}

async function getCalComEventTypes() {
  const response = await calComFetch<unknown>(
    "/v2/event-types?sortCreatedAt=desc",
    undefined,
    calComEventTypesApiVersion
  );
  const parsed = calComEventTypesResponseSchema.safeParse(response);

  if (!parsed.success || !parsed.data.data) {
    throw new Error("Unexpected Cal.com event types response");
  }

  return parsed.data.data;
}

export async function listCalComEventTypes(): Promise<CalComEventTypeSummary[]> {
  const eventTypes = await getCalComEventTypes();

  return eventTypes.map((eventType) => ({
    id: eventType.id,
    title: eventType.title,
    slug: eventType.slug,
    lengthInMinutes: eventType.lengthInMinutes,
    hidden: eventType.hidden,
  }));
}

function normalizeRangeSlots(data: unknown): CalComAvailabilitySlot[] {
  const parsed = calComSlotsResponseSchema.safeParse(data);

  if (!parsed.success || !parsed.data.data) {
    throw new Error("Unexpected Cal.com availability response");
  }

  return Object.values(parsed.data.data)
    .flat()
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((slot) => ({
      start: slot.start,
      end: slot.end,
      available: true,
    }));
}

async function resolveCalComDescriptor(
  params:
    | CalComAvailabilityParams
    | CalComReservationParams
    | CalComBookingParams
): Promise<CalComResolvedDescriptor> {
  const config = getCalComConfig();
  const descriptor = buildDescriptor(config, params);

  if ("eventTypeId" in descriptor) {
    console.log("[resolveCalComDescriptor] returning config eventTypeId:", descriptor.eventTypeId, "type:", typeof descriptor.eventTypeId);
    return descriptor;
  }

  if (descriptor.eventTypeSlug && descriptor.username) {
    return descriptor;
  }

  const eventTypes = await getCalComEventTypes();
  console.log("[resolveCalComDescriptor] fetched event types:", eventTypes);
  const normalizedTitle = params.title ? normalizeEventTypeTitle(params.title) : "";

  if (normalizedTitle) {
    const titleMatch = eventTypes.find(
      (eventType) => normalizeEventTypeTitle(eventType.title) === normalizedTitle
    );

    if (titleMatch) {
      console.log("[resolveCalComDescriptor] found by title:", titleMatch.id, "type:", typeof titleMatch.id);
      return { eventTypeId: titleMatch.id };
    }
  }

  const duration =
    "lengthInMinutes" in params
      ? params.lengthInMinutes
      : "slotDuration" in params
        ? params.slotDuration
        : "duration" in params
          ? params.duration
          : undefined;

  if (typeof duration === "number") {
    const durationMatches = eventTypes.filter(
      (eventType) => eventType.lengthInMinutes === duration
    );

    if (durationMatches.length === 1) {
      console.log("[resolveCalComDescriptor] found by duration:", durationMatches[0].id, "type:", typeof durationMatches[0].id);
      return { eventTypeId: durationMatches[0].id };
    }

    if (durationMatches.length > 1) {
      throw new Error(
        `Multiple Cal.com event types match ${duration} minutes. Set CALCOM_EVENT_TYPE_ID or pass a unique title.`
      );
    }
  }

  throw new Error(
    "No Cal.com event type matched the current booking. Create matching event types in Cal.com or set CALCOM_EVENT_TYPE_ID."
  );
}

export async function getCalComAvailability(
  params: CalComAvailabilityParams
): Promise<CalComAvailabilitySlot[]> {
  const descriptor = await resolveCalComDescriptor(params);
  const searchParams = new URLSearchParams({
    start: params.start,
    end: params.end,
    format: "range",
    timeZone: params.timeZone ?? "UTC",
  });

  if ("eventTypeId" in descriptor) {
    searchParams.set("eventTypeId", String(descriptor.eventTypeId));
  } else {
    searchParams.set("eventTypeSlug", descriptor.eventTypeSlug);
    searchParams.set("username", descriptor.username);

    if (descriptor.teamSlug) {
      searchParams.set("teamSlug", descriptor.teamSlug);
    }

    if (descriptor.organizationSlug) {
      searchParams.set("organizationSlug", descriptor.organizationSlug);
    }
  }

  if (params.duration) {
    searchParams.set("duration", String(params.duration));
  }

  if (params.bookingUidToReschedule) {
    searchParams.set("bookingUidToReschedule", params.bookingUidToReschedule);
  }

  const response = await calComFetch<Record<string, CalComSlotRange[]>>(
    `/v2/slots?${searchParams.toString()}`,
    undefined,
    calComSlotsApiVersion
  );

  return normalizeRangeSlots(response);
}

export async function reserveCalComSlot(
  params: CalComReservationParams
): Promise<{ uid: string | null; raw: unknown }> {
  const descriptor = await resolveCalComDescriptor(params);
  const payload: Record<string, unknown> = {
    slotStart: params.slotStart,
  };

  if (params.reservationDuration) {
    payload.reservationDuration = params.reservationDuration;
  }

  // Ensure eventTypeId is always an integer number
  const body = {
    ...payload,
    ...descriptor,
  };
  
  if ("eventTypeId" in body && typeof body.eventTypeId === "string") {
    body.eventTypeId = parseInt(body.eventTypeId, 10);
  }

  // Verify eventTypeId exists before sending
  if (!("eventTypeId" in body)) {
    throw new Error(
      "Cal.com slot reservation requires eventTypeId. Set CALCOM_EVENT_TYPE_ID or ensure event type matching works."
    );
  }

  console.log("[reserveCalComSlot] descriptor:", descriptor);
  console.log("[reserveCalComSlot] body before stringify:", body);
  console.log("[reserveCalComSlot] body JSON:", JSON.stringify(body));

  const response = await calComFetch<unknown>(
    "/v2/slots/reservations",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    calComSlotsApiVersion
  );

  const parsed = calComReservationResponseSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Unexpected Cal.com reservation response");
  }

  return {
    uid:
      parsed.data.data?.uid ??
      parsed.data.data?.reservationUid ??
      parsed.data.data?.id ??
      null,
    raw: parsed.data.data ?? parsed.data,
  };
}

export async function createCalComBooking(
  params: CalComBookingParams
): Promise<{ uid: string | null; raw: unknown }> {
  const descriptor = await resolveCalComDescriptor(params);
  const payload: Record<string, unknown> = {
    start: params.start,
    attendee: params.attendee,
    bookingFieldsResponses: params.bookingFieldsResponses,
    metadata: params.metadata,
    ...descriptor,
  };

  if (typeof params.lengthInMinutes === "number") {
    payload.lengthInMinutes = params.lengthInMinutes;
  }

  // Ensure eventTypeId is always an integer number
  if ("eventTypeId" in payload && typeof payload.eventTypeId === "string") {
    payload.eventTypeId = parseInt(payload.eventTypeId, 10);
  }

  const response = await calComFetch<unknown>(
    "/v2/bookings",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    calComBookingsApiVersion
  );

  const parsed = calComBookingResponseSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error("Unexpected Cal.com booking response");
  }

  return {
    uid:
      parsed.data.data?.uid ??
      parsed.data.data?.bookingUid ??
      parsed.data.data?.id ??
      null,
    raw: parsed.data.data ?? parsed.data,
  };
}

export async function deleteCalComReservation(uid: string): Promise<void> {
  await calComFetch(
    `/v2/slots/reservations/${uid}`,
    {
      method: "DELETE",
    },
    calComSlotsApiVersion
  );
}

async function parseCalComBookingActionResponse(
  response: unknown,
  fallbackMessage: string
): Promise<{ uid: string | null; raw: CalComBookingActionResponse }> {
  const parsed = calComBookingActionResponseSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(fallbackMessage);
  }

  const data = parsed.data.data ?? {};

  return {
    uid: data.rescheduledToUid ?? data.uid ?? data.bookingUid ?? data.id ?? null,
    raw: data,
  };
}

export async function cancelCalComBooking(
  bookingUid: string,
  cancellationReason: string
): Promise<{ uid: string | null; raw: CalComBookingActionResponse }> {
  const response = await calComFetch<unknown>(
    `/v2/bookings/${bookingUid}/cancel`,
    {
      method: "POST",
      body: JSON.stringify({
        cancellationReason,
        cancelSubsequentBookings: true,
      }),
    },
    calComBookingsApiVersion
  );

  return parseCalComBookingActionResponse(response, "Unexpected Cal.com cancellation response");
}

export async function rescheduleCalComBooking(
  bookingUid: string,
  params: {
    start: string;
    rescheduledBy: string;
    reschedulingReason: string;
    emailVerificationCode?: string;
  }
): Promise<{ uid: string | null; raw: CalComBookingActionResponse }> {
  const response = await calComFetch<unknown>(
    `/v2/bookings/${bookingUid}/reschedule`,
    {
      method: "POST",
      body: JSON.stringify(params),
    },
    calComBookingsApiVersion
  );

  return parseCalComBookingActionResponse(response, "Unexpected Cal.com reschedule response");
}
