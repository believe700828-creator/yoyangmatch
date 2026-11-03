import { NextResponse } from "next/server";
import { getOrgId } from "@/lib/auth";
import { getAll, getOne } from "@/lib/db";
import { daysLeft, fail, getSettings, handle, isLive } from "@/lib/data";
import type { Job, Order, Org } from "@/lib/types";

export const dynamic = "force-dynamic";

// 기관 마이페이지: 내 공고 + 결제 내역
export async function GET() {
  return handle(async () => {
    const orgId = await getOrgId();
    const org = orgId ? await getOne<Org>("orgs", orgId) : null;
    if (!org) return fail("기관 로그인이 필요합니다.", 401);
    const [jobs, orders, settings] = await Promise.all([getAll<Job>("jobs"), getAll<Order>("orders"), getSettings()]);
    const mine = jobs
      .filter((j) => j.orgId === org.id && j.status !== "hidden")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((j) => ({
        ...j,
        live: isLive(j),
        daysLeft: daysLeft(j.expiresAt),
      }));
    const paid = orders
      .filter((o) => o.orgId === org.id && o.status === "paid")
      .sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? ""));
    return NextResponse.json({
      org: { name: org.name, phone: org.phone, facility: org.facility, freeUsed: org.freeUsed },
      jobs: mine,
      orders: paid,
      settings: { price: settings.price, paidDays: settings.paidDays, freeForAll: settings.freeForAll },
    });
  });
}
