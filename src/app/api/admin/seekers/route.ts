import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteOne, getOne, putOne } from "@/lib/db";
import { fail, handle } from "@/lib/data";
import type { Seeker } from "@/lib/types";

export const dynamic = "force-dynamic";

// 관리자: 구직 글 숨김/다시 보이기/삭제
export async function POST(req: Request) {
  return handle(async () => {
    if (!(await isAdmin())) return fail("관리자 로그인이 필요합니다.", 401);
    const { id, action } = await req.json();
    const s = await getOne<Seeker>("seekers", String(id));
    if (!s) return fail("구직 글을 찾을 수 없습니다.", 404);
    if (action === "hide") await putOne("seekers", { ...s, status: "hidden" });
    else if (action === "show") await putOne("seekers", { ...s, status: "active" });
    else if (action === "delete") await deleteOne("seekers", s.id);
    else return fail("처리할 수 없는 요청입니다.");
    return NextResponse.json({ ok: true });
  });
}
