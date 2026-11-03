import { NextResponse } from "next/server";
import { getOrgId, hashPassword, verifyPassword } from "@/lib/auth";
import { getOne, putOne } from "@/lib/db";
import { fail, handle } from "@/lib/data";
import type { Org } from "@/lib/types";

export const dynamic = "force-dynamic";

// 로그인한 기관이 현재 비밀번호를 확인한 뒤 새 비밀번호로 변경
export async function POST(req: Request) {
  return handle(async () => {
    const orgId = await getOrgId();
    const org = orgId ? await getOne<Org>("orgs", orgId) : null;
    if (!org) return fail("기관 로그인이 필요합니다.", 401);
    const { current, next } = await req.json();
    if (!verifyPassword(String(current ?? ""), org.pwHash)) return fail("현재 비밀번호가 맞지 않습니다.", 401);
    const pw = String(next ?? "");
    if (pw.length < 6) return fail("새 비밀번호는 6자리 이상으로 정해 주세요.");
    if (pw === String(current)) return fail("지금과 다른 비밀번호로 정해 주세요.");
    await putOne("orgs", { ...org, pwHash: hashPassword(pw) });
    return NextResponse.json({ ok: true });
  });
}
