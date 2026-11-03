"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Notice, PageBody, SiteHeader } from "@/components/Shell";
import { api } from "@/lib/client";

export default function PaySuccessPage() {
  return (
    <Suspense>
      <Confirm />
    </Suspense>
  );
}

function Confirm() {
  const params = useSearchParams();
  const paymentKey = params.get("paymentKey");
  const orderId = params.get("orderId");
  const amount = params.get("amount");
  const valid = Boolean(paymentKey && orderId && amount);
  const [state, setState] = useState<"working" | "ok" | "error">(valid ? "working" : "error");
  const [message, setMessage] = useState(valid ? "" : "결제 정보가 올바르지 않습니다. 기관 페이지에서 다시 시도해 주세요.");
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !valid) return;
    sent.current = true;
    api("/api/payments/confirm", { paymentKey, orderId, amount: Number(amount) })
      .then(() => setState("ok"))
      .catch((e: Error) => {
        setState("error");
        setMessage(e.message);
      });
  }, [valid, paymentKey, orderId, amount]);

  return (
    <>
      <SiteHeader />
      <PageBody narrow>
        <h1 className="mb-4 text-[1.6rem] font-extrabold">결제 확인</h1>
        {state === "working" && <p className="py-8 text-center text-muted">결제를 확인하고 있어요. 이 화면을 닫지 마세요…</p>}
        {state === "ok" && (
          <div className="space-y-4">
            <Notice tone="ok">결제가 완료됐어요. 공고가 지금부터 목록에 보여요.</Notice>
            <Link href="/" className="btn-primary w-full">공고 목록 보기</Link>
            <Link href="/org" className="btn-ghost w-full">내 공고 관리</Link>
          </div>
        )}
        {state === "error" && (
          <div className="space-y-4">
            <Notice tone="error">{message}</Notice>
            <Link href="/org" className="btn-primary w-full">기관 페이지로 돌아가기</Link>
          </div>
        )}
      </PageBody>
    </>
  );
}
