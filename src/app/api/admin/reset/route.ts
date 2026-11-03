import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { hashPassword, isAdmin } from "@/lib/auth";
import { getAll, getOne, putOne } from "@/lib/db";
import { fail, handle } from "@/lib/data";
import type { Org, Seeker } from "@/lib/types";

export const dynamic = "force-dynamic";

// 헷갈리는 글자(0/O, 1/l/I)를 뺀 임시 비밀번호
function tempOrgPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[randomInt(chars.length)];
  return out;
}

// 관리자: 비밀번호를 잊은 기관·요양보호사에게 임시 비밀번호 발급
// (관리자가 등록된 번호로 본인 확인을 한 뒤 사용)
export async function POST(req: Request) {
  return handle(async () => {
    if (!(await isAdmin())) return fail("관리자 로그인이 필요합니다.", 401);
    const { kind, id } = await req.json();

    if (kind === "org") {
      const org = await getOne<Org>("orgs", String(id));
      if (!org) return fail("기관을 찾을 수 없습니다.", 404);
      const temp = tempOrgPassword();
      await putOne("orgs", { ...org, pwHash: hashPassword(temp) });
      return NextResponse.json({ ok: true, temp, who: org.name });
    }

    if (kind === "seeker") {
      const s = await getOne<Seeker>("seekers", String(id));
      if (!s) return fail("구직 글을 찾을 수 없습니다.", 404);
      const temp = String(randomInt(10000)).padStart(4, "0");
      const pwHash = hashPassword(temp);
      // 같은 휴대폰 번호로 등록한 글은 모두 같은 번호로 맞춤
      const same = (await getAll<Seeker>("seekers")).filter((x) => x.phone === s.phone);
      await Promise.all(same.map((x) => putOne("seekers", { ...x, pwHash })));
      return NextResponse.json({ ok: true, temp, who: s.name, count: same.length });
    }

    return fail("처리할 수 없는 요청입니다.");
  });
}
