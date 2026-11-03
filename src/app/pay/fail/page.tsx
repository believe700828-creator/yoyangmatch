"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Notice, PageBody, SiteHeader } from "@/components/Shell";

export default function PayFailPage() {
  return (
    <Suspense>
      <Fail />
    </Suspense>
  );
}

function Fail() {
  const params = useSearchParams();
  const code = params.get("code") ?? "";
  const canceled = code === "PAY_PROCESS_CANCELED";
  return (
    <>
      <SiteHeader />
      <PageBody narrow>
        <h1 className="mb-4 text-[1.6rem] font-extrabold">{canceled ? "결제를 취소했어요" : "결제가 완료되지 않았어요"}</h1>
        <div className="space-y-4">
          <Notice tone={canceled ? "info" : "error"}>
            {canceled ? "결제창을 닫아서 결제가 진행되지 않았어요. 돈은 빠져나가지 않았어요." : params.get("message") || "결제 중 문제가 생겼어요. 카드사 문자로 결제 여부를 확인해 주세요."}
          </Notice>
          <Link href="/org" className="btn-primary w-full">기관 페이지에서 다시 결제하기</Link>
        </div>
      </PageBody>
    </>
  );
}
