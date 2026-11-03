import { NextResponse } from "next/server";
import { getOrgId } from "@/lib/auth";
import { deleteOne, getOne, putOne } from "@/lib/db";
import { fail, handle } from "@/lib/data";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

// 기관이 자기 공고를 마감하거나, 결제 전 공고를 삭제
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    const orgId = await getOrgId();
    const job = await getOne<Job>("jobs", id);
    if (!orgId || !job || job.orgId !== orgId) return fail("이 공고를 수정할 권한이 없습니다.", 403);
    const { action } = await req.json();
    if (action === "close") {
      await putOne("jobs", { ...job, status: "closed" });
      return NextResponse.json({ ok: true });
    }
    if (action === "delete" && job.status === "pending_payment") {
      await deleteOne("jobs", id);
      return NextResponse.json({ ok: true });
    }
    return fail("처리할 수 없는 요청입니다.");
  });
}
