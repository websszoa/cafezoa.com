import type { NextRequest } from "next/server";
import { handleOAuthCallback } from "@/lib/auth/handle-oauth-callback";

export async function GET(request: NextRequest) {
  return handleOAuthCallback(request, { providerLabel: "Google" });
}
