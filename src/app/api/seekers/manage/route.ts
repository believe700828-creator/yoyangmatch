import { NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { deleteOne, getAll, putOne } from "@/lib/db";
import { addDays, clean, daysLeft, fail, getSettings, handle, onlyDigits } from "@/lib/data";
import { FACILITIES, REGIONS, type Facility, type Region, type Seeker } from "@/lib/types";

export const dynamic = "force-dynamic";

// 요양보호사가 휴대폰 번호 + 비밀번호 4자리로 내 구직 글을 관리 (불러오기·수정·마감·다시 올리기·삭제)
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

    if (b.action === "password") {
      const next = String(b.newPassword ?? "");
      if (!/^\d{4}$/.test(next)) return fail("새 비밀번호는 숫자 4자리로 정해 주세요.");
      if (next === password) return fail("지금과 다른 번호로 정해 주세요.");
      // 이 번호로 등록한 내 글 전체의 비밀번호를 함께 바꿉니다
      const pwHash = hashPassword(next);
      await Promise.all(mine.map((s) => putOne("seekers", { ...s, pwHash })));
      return NextResponse.json({ ok: true, changed: mine.length });
    }

    const target = b.id ? mine.find((s) => s.id === b.id) : null;
    if (b.action && !target) return fail("해당 글을 찾을 수 없습니다.", 404);

    if (b.action === "update" && target) {
      const name = clean(b.name, 20);
      const region = b.region as Region;
      const area = clean(b.area, 40);
      const facilities = (Array.isArray(b.facilities) ? b.facilities : []).filter((f: string) =>
        FACILITIES.some((x) => x.key === f),
      ) as Facility[];
      if (!name) return fail("이름을 입력해 주세요.");
      if (!REGIONS.includes(region) || !area) return fail("희망 근무 지역을 선택해 주세요.");
      if (facilities.length === 0) return fail("희망 근무 형태를 하나 이상 골라 주세요.");
      // 휴대폰 번호와 비밀번호, 노출 기간은 그대로 둡니다
      await putOne("seekers", {
        ...target,
        name,
        region,
        area,
        facilities,
        hasLicense: Boolean(b.hasLicense),
        experience: clean(b.experience, 60),
        availableTime: clean(b.availableTime, 80),
        memo: clean(b.memo, 200),
      });
    }
    if (b.action === "alert" && target) {
      // 같은 번호로 등록한 글 모두 함께 켜고 끔
      const on = Boolean(b.on);
      const stamp = new Date().toISOString();
      await Promise.all(
        mine.map((s) => putOne("seekers", { ...s, alertOn: on, ...(on ? { alertAgreedAt: stamp } : {}) })),
      );
    }
    if (b.action === "close" && target) await putOne("seekers", { ...target, status: "closed" });
    if (b.action === "reopen" && target) {
      const settings = await getSettings();
      await putOne("seekers", { ...target, status: "active", expiresAt: addDays(settings.seekerDays) });
    }
    if (b.action === "delete" && target) await deleteOne("seekers", target.id);

    const fresh = (await getAll<Seeker>("seekers")).filter((s) => mine.some((m) => m.id === s.id));
    return NextResponse.json({
      posts: fresh
        .sort((a, c) => c.createdAt.localeCompare(a.createdAt))
        .map((s) => ({
          id: s.id,
          name: s.name,
          region: s.region,
          area: s.area,
          facilities: s.facilities,
          hasLicense: s.hasLicense,
          experience: s.experience,
          availableTime: s.availableTime,
          memo: s.memo,
          createdAt: s.createdAt,
          alertOn: Boolean(s.alertOn),
          live: s.status === "active" && daysLeft(s.expiresAt) > 0,
          daysLeft: s.status === "active" ? daysLeft(s.expiresAt) : 0,
        })),
    });
  });
}
