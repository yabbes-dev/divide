import { NextResponse } from "next/server";

import { profileErrorResponse } from "@/lib/profile/http";
import { createGroup } from "@/lib/profile/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; members?: string[] };
    const group = await createGroup(body.name ?? "", body.members ?? []);
    return NextResponse.json({ group });
  } catch (error) {
    return profileErrorResponse(error);
  }
}
