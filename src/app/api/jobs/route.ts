import { NextResponse } from "next/server";
import { getOrgId } from "@/lib/auth";
import { getAll, getOne, putOne } from "@/lib/db";
import { addDays, fail, getSettings, handle, isLive, newId, toPublicJob } from "@/lib/data";
import { parseJobInput } from "@/lib/jobInput";
import type { Job, Org } from "@/lib/types";

export const dynamic = "force-dynamic";

// 공개된(노출 중인) 구인공고 목록
export async function GET() {
  return handle(async () => {
    const jobs = (await getAll<Job>("jobs")).filter(isLive);
    jobs.sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ jobs: jobs.map(toPublicJob) });
  });
}

// 기관이 공고 등록
export async function POST(req: Request) {
  return handle(async () => {
    const orgId = await getOrgId();
    if (!orgId) return fail("기관 로그인이 필요합니다.", 401);
    const org = await getOne<Org>("orgs", orgId);
    if (!org) return fail("기관 정보를 찾을 수 없습니다. 다시 로그인해 주세요.", 401);

    const parsed = parseJobInput(await req.json());
    if ("error" in parsed) return fail(parsed.error);

    const settings = await getSettings();
    const free = settings.freeForAll || !org.freeUsed;
    const job: Job = {
      id: newId("j"),
      orgId: org.id,
      orgName: org.name,
      ...parsed.fields,
      status: free ? "active" : "pending_payment",
      createdAt: new Date().toISOString(),
      expiresAt: free ? addDays(settings.freeForAll ? settings.paidDays : settings.freeDays) : null,
    };
    await putOne("jobs", job);
    if (free && !settings.freeForAll && !org.freeUsed) await putOne("orgs", { ...org, freeUsed: true });
    return NextResponse.json({ job, needsPayment: !free }, { status: 201 });
  });
}
