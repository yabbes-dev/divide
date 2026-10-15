import { NextResponse } from "next/server";

import { profileErrorResponse } from "@/lib/profile/http";
import { deleteGroup } from "@/lib/profile/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await deleteGroup(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return profileErrorResponse(error);
  }
}
