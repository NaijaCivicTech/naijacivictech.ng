import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { jsonInternalError } from "@/lib/api-error-response";
import {
  clearUserCurrentResidence,
  getUserCurrentResidencePolitilog,
  setUserCurrentResidenceFromPolitilog,
} from "@/lib/services/server/user-residence";

type MeResidenceBody = { state: string; lga: string };

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const residence = await getUserCurrentResidencePolitilog(userId);
    return NextResponse.json({ residence });
  } catch (e) {
    return jsonInternalError(e, "GET /api/me/residence");
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as MeResidenceBody).state !== "string" ||
    typeof (body as MeResidenceBody).lga !== "string"
  ) {
    return NextResponse.json(
      { error: "Expected { state, lga }" },
      { status: 400 },
    );
  }

  const { state, lga } = body as MeResidenceBody;

  try {
    const result = await setUserCurrentResidenceFromPolitilog(userId, {
      state: state.trim(),
      lga: lga.trim(),
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const residence = await getUserCurrentResidencePolitilog(userId);
    return NextResponse.json({ residence });
  } catch (e) {
    return jsonInternalError(e, "POST /api/me/residence");
  }
}

export async function DELETE() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    await clearUserCurrentResidence(userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonInternalError(e, "DELETE /api/me/residence");
  }
}
