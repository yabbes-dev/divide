import { profileErrorResponse, profileResponse } from "@/lib/profile/http";
import { getProfileSnapshot } from "@/lib/profile/store";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return profileResponse({ configured: false, profile: null, groups: [] });
  }

  try {
    return profileResponse(await getProfileSnapshot());
  } catch (error) {
    return profileErrorResponse(error);
  }
}
