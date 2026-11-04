import { NextResponse } from "next/server";
import { getOrgId } from "@/lib/auth";
import { getOne, putOne } from "@/lib/db";
import { addDays, fail, getSettings, handle, isLive, newId } from "@/lib/data";
import { tossClientKey } from "@/lib/toss";
import type { Job, Order, Org } from "@/lib/types";

export const dynamic = "force-dynamic";

// 결제 준비: 서버에 주문(금액)을 먼저 저장해 두고, 승인 때 금액이 같은지 확인합니다
export async function POST(req: Request) {
  return handle(async () => {
    const orgId = await getOrgId();
    const org = orgId ? await getOne<Org>("orgs", orgId) : null;
    if (!org) return fail("기관 로그인이 필요합니다.", 401);
    const { jobId } = await req.json();
    const job = await getOne<Job>("jobs", String(jobId));
    if (!job || job.orgId !== org.id || job.status === "hidden") return fail("공고를 찾을 수 없습니다.", 404);

    const settings = await getSettings();

    // 무료 이벤트 기간에는 결제 없이 바로 노출
    if (settings.freeForAll) {
      const base = isLive(job) && job.expiresAt ? new Date(job.expiresAt) : new Date();
      await putOne("jobs", { ...job, status: "active", expiresAt: addDays(settings.paidDays, base) });
      return NextResponse.json({ activated: true });
    }

    const order: Order = {
      id: newId("ym"),
      orgId: org.id,
      jobId: job.id,
      amount: settings.price,
      days: settings.paidDays,
      status: "ready",
      createdAt: new Date().toISOString(),
    };
    await putOne("orders", order);
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      orderName: `구인공고 ${order.days}일 노출`,
      customerKey: `cust_${org.id}`,
      customerName: org.name,
      clientKey: tossClientKey(),
    });
  });
}
