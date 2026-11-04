import { NextResponse } from "next/server";
import { notifyNewJob } from "@/lib/alimtalk";
import { isAdmin } from "@/lib/auth";
import { getAll, getOne, putOne } from "@/lib/db";
import { fail, handle } from "@/lib/data";
import type { Job, Org } from "@/lib/types";

export const dynamic = "force-dynamic";

// 관리자: 기관 확인(승인) / 확인 취소
export async function POST(req: Request) {
  return handle(async () => {
    if (!(await isAdmin())) return fail("관리자 로그인이 필요합니다.", 401);
    const { id, action } = await req.json();
    const org = await getOne<Org>("orgs", String(id));
    if (!org) return fail("기관을 찾을 수 없습니다.", 404);

    if (action === "approve") {
      await putOne("orgs", { ...org, verified: true });
      // 확인을 기다리는 동안 노출 기간이 줄지 않도록, 지금부터 원래 기간만큼 다시 계산
      const jobs = (await getAll<Job>("jobs")).filter((j) => j.orgId === org.id && j.status === "active" && j.expiresAt);
      if (org.verified === false) {
        const now = Date.now();
        await Promise.all(
          jobs.map((j) => {
            const span = new Date(j.expiresAt!).getTime() - new Date(j.createdAt).getTime();
            return putOne("jobs", { ...j, expiresAt: new Date(now + Math.max(span, 0)).toISOString() });
          }),
        );
      }
      // 승인으로 공개된 공고의 지역 알림
      for (const j of jobs) await notifyNewJob(j.id);
      return NextResponse.json({ ok: true });
    }
    if (action === "unapprove") {
      await putOne("orgs", { ...org, verified: false });
      return NextResponse.json({ ok: true });
    }
    return fail("처리할 수 없는 요청입니다.");
  });
}
