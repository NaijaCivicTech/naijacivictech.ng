import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { jsonInternalError } from "@/lib/api-error-response";
import { checkRateLimit, clientIp } from "@/lib/rate-limit-ip";
import {
  parseProjectObjectId,
  toggleVoteForUser,
} from "@/lib/services/server/projects";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id: idParam } = await context.params;
  if (!parseProjectObjectId(idParam)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to vote" },
      { status: 401 },
    );
  }

  const ip = clientIp(request);
  const limited = checkRateLimit(`vote:${userId}:${ip}`, 90, 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many votes. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  try {
    const result = await toggleVoteForUser(idParam, userId);
    if (!result.ok) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({
      votes: result.votes,
      viewerHasVoted: result.viewerHasVoted,
    });
  } catch (e) {
    return jsonInternalError(e, "POST vote");
  }
}
