import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

async function withAuthRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<Response>,
) {
  const ip = clientIp(req);
  const result = rateLimit(`auth:${ip}`, 30, 60_000);
  if (!result.ok) return rateLimitResponse(result.retryAfterSec);
  return handler(req);
}

export async function GET(req: NextRequest) {
  return withAuthRateLimit(req, handlers.GET);
}

export async function POST(req: NextRequest) {
  return withAuthRateLimit(req, handlers.POST);
}
