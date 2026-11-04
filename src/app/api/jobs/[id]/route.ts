import { NextResponse } from "next/server";
import { getOrgId } from "@/lib/auth";
import { deleteOne, getOne, putOne } from "@/lib/db";
import { fail, getSettings, handle } from "@/lib/data";
import { parseJobInput } from "@/lib/jobInput";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

// 기관이 자기 공고를 수정·마감하거나, 결제 전 공고를 삭제
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    const orgId = await getOrgId();
    const job = await getOne<Job>("jobs", id);
    if (!orgId || !job || job.orgId !== orgId) return fail("이 공고를 수정할 권한이 없습니다.", 403);
    const body = await req.json();
    const { action } = body;
    if (action === "update") {
      // 내용만 바꾸고, 노출 상태·기간·결제는 그대로 둡니다
      if (job.status === "hidden") return fail("관리자가 내린 공고는 수정할 수 없습니다. 문의해 주세요.", 403);
      const parsed = parseJobInput(body, (await getSettings()).minWage);
      if ("error" in parsed) return fail(parsed.error);
      await putOne("jobs", { ...job, ...parsed.fields });
      return NextResponse.json({ ok: true });
    }
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
