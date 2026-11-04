import { NextResponse } from "next/server";
import { notifyNewJob } from "@/lib/alimtalk";
import { isAdmin } from "@/lib/auth";
import { deleteOne, getOne, putOne } from "@/lib/db";
import { addDays, fail, handle, isLive } from "@/lib/data";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

// 관리자: 공고 숨김/다시 보이기/기간 연장/삭제
export async function POST(req: Request) {
  return handle(async () => {
    if (!(await isAdmin())) return fail("관리자 로그인이 필요합니다.", 401);
    const { id, action, days } = await req.json();
    const job = await getOne<Job>("jobs", String(id));
    if (!job) return fail("공고를 찾을 수 없습니다.", 404);
    if (action === "hide") await putOne("jobs", { ...job, status: "hidden" });
    else if (action === "show") await putOne("jobs", { ...job, status: job.expiresAt ? "active" : "pending_payment" });
    else if (action === "extend") {
      const d = Math.max(1, Math.min(365, Math.round(Number(days) || 7)));
      const base = isLive(job) && job.expiresAt ? new Date(job.expiresAt) : new Date();
      await putOne("jobs", { ...job, status: "active", expiresAt: addDays(d, base) });
    } else if (action === "delete") await deleteOne("jobs", job.id);
    else return fail("처리할 수 없는 요청입니다.");
    if (action === "show" || action === "extend") await notifyNewJob(job.id); // 아직 알림을 안 보낸 공고만 발송
    return NextResponse.json({ ok: true });
  });
}
