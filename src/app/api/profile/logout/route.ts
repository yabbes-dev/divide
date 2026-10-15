import { NextResponse } from "next/server";

import { profileErrorResponse } from "@/lib/profile/http";
import { signOut } from "@/lib/profile/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return profileErrorResponse(error);
  }
}
