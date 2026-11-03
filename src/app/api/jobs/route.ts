import { NextResponse } from "next/server";
import { getOrgId } from "@/lib/auth";
import { getAll, getOne, putOne } from "@/lib/db";
import { addDays, clean, fail, formatPhone, getSettings, handle, isLive, newId, onlyDigits, toPublicJob } from "@/lib/data";
import { FACILITIES, PAY_TYPES, REGIONS, type Facility, type Job, type Org, type PayType, type Region } from "@/lib/types";

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

    const b = await req.json();
    const facility = b.facility as Facility;
    const region = b.region as Region;
    const payType = b.payType as PayType;
    const payAmount = Number(onlyDigits(String(b.payAmount ?? "")));
    const area = clean(b.area, 40);
    const schedule = clean(b.schedule, 100);
    const duties = clean(b.duties, 300);
    const phone = onlyDigits(b.phone);

    if (!FACILITIES.some((f) => f.key === facility)) return fail("기관 유형을 선택해 주세요.");
    if (!REGIONS.includes(region) || !area) return fail("근무 지역을 선택해 주세요.");
    if (!PAY_TYPES.includes(payType) || !payAmount) return fail("급여 금액을 숫자로 입력해 주세요.");
    if (!schedule) return fail("근무 요일과 시간을 입력해 주세요.");
    if (!duties) return fail("담당 업무를 입력해 주세요.");
    if (phone.length < 9) return fail("문의 전화번호를 정확히 입력해 주세요.");

    const settings = await getSettings();
    const free = settings.freeForAll || !org.freeUsed;
    const job: Job = {
      id: newId("j"),
      orgId: org.id,
      orgName: org.name,
      facility,
      region,
      area,
      payType,
      payAmount,
      schedule,
      duties,
      phone: formatPhone(phone),
      urgent: Boolean(b.urgent),
      status: free ? "active" : "pending_payment",
      createdAt: new Date().toISOString(),
      expiresAt: free ? addDays(settings.freeForAll ? settings.paidDays : settings.freeDays) : null,
    };
    await putOne("jobs", job);
    if (free && !settings.freeForAll && !org.freeUsed) await putOne("orgs", { ...org, freeUsed: true });
    return NextResponse.json({ job, needsPayment: !free }, { status: 201 });
  });
}
