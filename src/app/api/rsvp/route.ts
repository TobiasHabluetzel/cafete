import { NextResponse } from "next/server";

import { launchEvent } from "@/config/site";
import { isValidEmail, sendNotification } from "@/lib/email";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { name, email, guests, message } = (payload ?? {}) as {
    name?: unknown;
    email?: unknown;
    guests?: unknown;
    message?: unknown;
  };

  if (typeof name !== "string" || name.trim().length < 2 || name.length > 120) {
    return NextResponse.json({ error: "invalid-name" }, { status: 422 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid-email" }, { status: 422 });
  }

  const guestCount = Number(guests);
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
    return NextResponse.json({ error: "invalid-guests" }, { status: 422 });
  }

  const note =
    typeof message === "string" && message.trim().length > 0
      ? message.trim().slice(0, 2000)
      : "—";

  const result = await sendNotification({
    subject: `CAFÉTÉ Launch Event — Anmeldung von ${name.trim()}`,
    text: [
      `Name:      ${name.trim()}`,
      `E-Mail:    ${email}`,
      `Personen:  ${guestCount}`,
      `Nachricht: ${note}`,
      "",
      `Event: ${launchEvent.venue}, ${launchEvent.street}, ${launchEvent.city}`,
      `Datum: ${launchEvent.start}`,
    ].join("\n"),
    replyTo: email,
  });

  if (!result.ok) {
    console.error("[rsvp] not delivered:", result.reason, result.detail ?? "");
    return NextResponse.json({ error: result.reason }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
