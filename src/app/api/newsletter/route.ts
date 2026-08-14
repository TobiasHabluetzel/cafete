import { NextResponse } from "next/server";

import { isValidEmail, sendNotification } from "@/lib/email";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { email } = (payload ?? {}) as { email?: unknown };
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid-email" }, { status: 422 });
  }

  const result = await sendNotification({
    subject: "CAFÉTÉ — neue Newsletter-Anmeldung",
    text: `Neue Newsletter-Anmeldung: ${email}`,
    replyTo: email,
  });

  if (!result.ok) {
    // 503 keeps the client honest: the form shows the "email us directly"
    // fallback instead of claiming success.
    console.error("[newsletter] not delivered:", result.reason, result.detail ?? "");
    return NextResponse.json({ error: result.reason }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
