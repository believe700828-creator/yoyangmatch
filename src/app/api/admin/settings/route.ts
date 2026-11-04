import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { putOne } from "@/lib/db";
import { clean, fail, getSettings, handle } from "@/lib/data";

export const dynamic = "force-dynamic";

const int = (v: unknown, min: number, max: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

export async function PUT(req: Request) {
  return handle(async () => {
    if (!(await isAdmin())) return fail("관리자 로그인이 필요합니다.", 401);
    const b = await req.json();
    const freeDays = int(b.freeDays, 0, 365);
    const paidDays = int(b.paidDays, 1, 365);
    const price = int(b.price, 100, 10_000_000);
    const seekerDays = int(b.seekerDays, 1, 365);
    const minWage = int(b.minWage, 0, 1_000_000);
    if (minWage === null) return fail("최저임금은 숫자(원)로 입력해 주세요.");
    if (freeDays === null || paidDays === null || seekerDays === null) return fail("기간은 숫자(일)로 입력해 주세요.");
    if (price === null) return fail("결제 금액은 100원 이상 숫자로 입력해 주세요.");
    const current = await getSettings();
    const next = {
      ...current,
      freeDays,
      paidDays,
      price,
      seekerDays,
      minWage,
      jobInfoRegNo: clean(b.jobInfoRegNo, 40),
      bizNo: clean(b.bizNo, 20),
      freeForAll: Boolean(b.freeForAll),
    };
    await putOne("settings", next);
    return NextResponse.json({ ok: true, settings: next });
  });
}
