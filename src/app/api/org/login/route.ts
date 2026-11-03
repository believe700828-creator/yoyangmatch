import { NextResponse } from "next/server";
import { setOrgSession, verifyPassword } from "@/lib/auth";
import { getOne } from "@/lib/db";
import { fail, handle, onlyDigits } from "@/lib/data";
import type { Org } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const b = await req.json();
    const phone = onlyDigits(b.phone);
    const org = phone ? await getOne<Org>("orgs", `o${phone}`) : null;
    if (!org || !verifyPassword(String(b.password ?? ""), org.pwHash)) {
      return fail("전화번호 또는 비밀번호가 맞지 않습니다.", 401);
    }
    await setOrgSession(org.id);
    return NextResponse.json({ ok: true });
  });
}
