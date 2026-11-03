"use client";

import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { api } from "./client";

interface OrderRes {
  activated?: boolean;
  orderId: string;
  amount: number;
  orderName: string;
  customerKey: string;
  customerName: string;
  clientKey: string;
}

// 공고 결제 시작: 서버에 주문을 만들고 토스페이먼츠 결제창을 엽니다.
// 무료 이벤트 기간이면 결제 없이 바로 노출되고 "activated"를 돌려줍니다.
export async function startJobPayment(jobId: string): Promise<"activated" | "redirected"> {
  const order = await api<OrderRes>("/api/orders", { jobId });
  if (order.activated) return "activated";

  const toss = await loadTossPayments(order.clientKey);
  const payment = toss.payment({ customerKey: order.customerKey });
  await payment.requestPayment({
    method: "CARD", // 카드·간편결제(토스페이, 카카오페이 등은 계약에 따라 표시)
    amount: { currency: "KRW", value: order.amount },
    orderId: order.orderId,
    orderName: order.orderName,
    customerName: order.customerName,
    successUrl: `${window.location.origin}/pay/success`,
    failUrl: `${window.location.origin}/pay/fail`,
  });
  return "redirected";
}
