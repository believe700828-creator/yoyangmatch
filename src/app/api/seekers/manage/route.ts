import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";
import { deleteOne, getAll, putOne } from "@/lib/db";
import { addDays, daysLeft, fail, getSettings, handle, onlyDigits } from "@/lib/data";
import type { Seeker } from "@/lib/types";

export const dynamic = "force-dynamic";

// 요양보호사가 휴대폰 번호 + 비밀번호 4자리로 내 구직 글을 관리
export async function POST(req: Request) {
  return handle(async () => {
    const b = await req.json();
    const phone = onlyDigits(b.phone);
    const password = String(b.password ?? "");
    if (phone.length < 10 || !password) return fail("휴대폰 번호와 비밀번호를 입력해 주세요.");

    const mine = (await getAll<Seeker>("seekers")).filter(
      (s) => s.phone === phone && s.status !== "hidden" && verifyPassword(password, s.pwHash),
    );
    if (mine.length === 0) return fail("일치하는 구직 글이 없습니다. 번호와 비밀번호를 확인해 주세요.", 404);

    const target = b.id ? mine.find((s) => s.id === b.id) : null;
    if (b.action && !target) return fail("해당 글을 찾을 수 없습니다.", 404);

    if (b.action === "close" && target) await putOne("seekers", { ...target, status: "closed" });
    if (b.action === "reopen" && target) {
      const settings = await getSettings();
      await putOne("seekers", { ...target, status: "active", expiresAt: addDays(settings.seekerDays) });
    }
    if (b.action === "delete" && target) await deleteOne("seekers", target.id);

    const fresh = (await getAll<Seeker>("seekers")).filter((s) => mine.some((m) => m.id === s.id));
    return NextResponse.json({
      posts: fresh.map((s) => ({
        id: s.id,
        area: `${s.region} ${s.area}`,
        createdAt: s.createdAt,
        live: s.status === "active" && daysLeft(s.expiresAt) > 0,
        daysLeft: s.status === "active" ? daysLeft(s.expiresAt) : 0,
      })),
    });
  });
}
