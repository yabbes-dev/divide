import { NextResponse } from "next/server";

import { ProfileError } from "@/lib/profile/errors";
import type { ProfileSnapshot } from "@/types/profile";

export function profileResponse(snapshot: ProfileSnapshot) {
  return NextResponse.json(snapshot);
}

export function profileErrorResponse(error: unknown) {
  if (error instanceof ProfileError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
