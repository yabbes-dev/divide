import { profileErrorResponse, profileResponse } from "@/lib/profile/http";
import { signUp } from "@/lib/profile/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; code?: string };
    const snapshot = await signUp(body.username ?? "", body.code ?? "");
    return profileResponse(snapshot);
  } catch (error) {
    return profileErrorResponse(error);
  }
}
