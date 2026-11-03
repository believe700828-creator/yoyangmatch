import { NextResponse } from "next/server";
import { clearOrgSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearOrgSession();
  return NextResponse.json({ ok: true });
}
