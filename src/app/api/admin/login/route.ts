import { NextResponse } from "next/server";
import { adminPasswordConfigured, checkAdminPassword, setAdminSession } from "@/lib/auth";
import { fail } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!adminPasswordConfigured()) {
    return fail("관리자 비밀번호가 아직 설정되지 않았습니다. Vercel 환경변수에 ADMIN_PASSWORD를 넣어 주세요.", 503);
  }
  const { password } = await req.json();
  if (!checkAdminPassword(String(password ?? ""))) return fail("관리자 비밀번호가 맞지 않습니다.", 401);
  await setAdminSession();
  return NextResponse.json({ ok: true });
}
