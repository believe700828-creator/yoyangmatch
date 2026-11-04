import { NextResponse } from "next/server";
import { getOrgId, hashPassword } from "@/lib/auth";
import { deleteOne, getAll, getOne, putOne } from "@/lib/db";
import { addDays, clean, fail, getSettings, handle, newId, onlyDigits, toPublicSeeker } from "@/lib/data";
import { FACILITIES, REGIONS, isVerified, type Facility, type Org, type Region, type Seeker } from "@/lib/types";

export const dynamic = "force-dynamic";

// 구직 목록: 연락처는 로그인한 기관에게만 보여줍니다
export async function GET() {
  return handle(async () => {
    const orgId = await getOrgId();
    const found = orgId ? await getOne<Org>("orgs", orgId) : null;
    // 요양보호사 연락처는 관리자가 확인한 기관에게만 공개
    const org = found && isVerified(found) ? found : null;
    const now = Date.now();
    const all = await getAll<Seeker>("seekers");
    // 개인정보 처리방침: 노출 기간이 끝나고 30일이 지난 구직 글은 자동 삭제
    const stale = all.filter((s) => new Date(s.expiresAt).getTime() + 30 * 864e5 < now);
    await Promise.all(stale.map((s) => deleteOne("seekers", s.id)));
    const list = all
      .filter((s) => s.status === "active" && new Date(s.expiresAt).getTime() > now)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ seekers: list.map((s) => toPublicSeeker(s, Boolean(org))), canSeeContact: Boolean(org) });
  });
}

// 요양보호사 구직 등록 (회원가입 없이, 비밀번호로 관리)
export async function POST(req: Request) {
  return handle(async () => {
    const b = await req.json();
    const name = clean(b.name, 20);
    const phone = onlyDigits(b.phone);
    const password = String(b.password ?? "");
    const region = b.region as Region;
    const area = clean(b.area, 40);
    const facilities = (Array.isArray(b.facilities) ? b.facilities : []).filter((f: string) =>
      FACILITIES.some((x) => x.key === f),
    ) as Facility[];

    if (!name) return fail("이름을 입력해 주세요.");
    if (phone.length < 10) return fail("휴대폰 번호를 정확히 입력해 주세요.");
    if (!/^\d{4}$/.test(password)) return fail("관리용 비밀번호는 숫자 4자리로 정해 주세요.");
    if (!REGIONS.includes(region) || !area) return fail("희망 근무 지역을 선택해 주세요.");
    if (facilities.length === 0) return fail("희망 근무 형태를 하나 이상 골라 주세요.");
    if (!b.agree) return fail("개인정보 수집·이용에 동의해 주셔야 등록할 수 있습니다.");

    const settings = await getSettings();
    const seeker: Seeker = {
      id: newId("s"),
      name,
      phone,
      pwHash: hashPassword(password),
      region,
      area,
      facilities,
      hasLicense: Boolean(b.hasLicense),
      experience: clean(b.experience, 60),
      availableTime: clean(b.availableTime, 80),
      memo: clean(b.memo, 200),
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: addDays(settings.seekerDays),
      ...(b.alertOn ? { alertOn: true, alertAgreedAt: new Date().toISOString() } : {}),
    };
    await putOne("seekers", seeker);
    return NextResponse.json({ ok: true, id: seeker.id }, { status: 201 });
  });
}
