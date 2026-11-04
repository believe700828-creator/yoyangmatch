import { NextResponse } from "next/server";
import { notifyNewJob } from "@/lib/alimtalk";
import { getOne, putOne } from "@/lib/db";
import { addDays, fail, handle, isLive } from "@/lib/data";
import { confirmTossPayment } from "@/lib/toss";
import type { Job, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

// 결제 성공 화면에서 호출: 금액 확인 → 토스 승인 → 공고 노출 기간 연장
export async function POST(req: Request) {
  return handle(async () => {
    const { paymentKey, orderId, amount } = await req.json();
    const order = await getOne<Order>("orders", String(orderId));
    if (!order) return fail("주문 정보를 찾을 수 없습니다.", 404);
    if (order.status === "paid") return NextResponse.json({ ok: true, already: true, jobId: order.jobId });
    if (Number(amount) !== order.amount) return fail("결제 금액이 주문 금액과 다릅니다. 결제가 진행되지 않았습니다.");

    const result = await confirmTossPayment(String(paymentKey), order.id, order.amount);
    if (!result.ok) {
      // 같은 결제가 동시에 두 번 확인된 경우(새로고침 등) 먼저 끝난 쪽을 존중
      const latest = await getOne<Order>("orders", order.id);
      if (latest?.status === "paid") return NextResponse.json({ ok: true, already: true, jobId: order.jobId });
      await putOne("orders", { ...order, status: "failed" });
      return fail(result.message || "결제 승인에 실패했습니다.");
    }

    const now = new Date().toISOString();
    await putOne("orders", { ...order, status: "paid", paymentKey: String(paymentKey), method: result.method, paidAt: now });

    const job = await getOne<Job>("jobs", order.jobId);
    if (job) {
      const base = isLive(job) && job.expiresAt ? new Date(job.expiresAt) : new Date();
      await putOne("jobs", { ...job, status: "active", expiresAt: addDays(order.days, base) });
      await notifyNewJob(job.id); // 결제로 처음 공개된 경우에만 실제 발송됨
    }
    return NextResponse.json({ ok: true, jobId: order.jobId });
  });
}
