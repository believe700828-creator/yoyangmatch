"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { JobForm } from "@/components/JobForm";
import { OrgAuth } from "@/components/OrgAuth";
import { BackLink, Notice, PageBody, SiteHeader } from "@/components/Shell";
import { api, formatPhoneInput, useMeta, won } from "@/lib/client";

export default function NewJobPage() {
  const router = useRouter();
  const { meta, error: metaError, reload } = useMeta();
  const [done, setDone] = useState<null | { needsPayment: boolean; jobId: string; pendingReview: boolean }>(null);

  const s = meta?.settings;
  const isFree = s ? s.freeForAll || !meta?.org?.freeUsed : true;

  return (
    <>
      <SiteHeader />
      <PageBody narrow>
        <BackLink />
        <h1 className="text-[1.6rem] font-extrabold">구인공고 올리기</h1>

        {metaError && <div className="mt-4"><Notice tone="error">{metaError}</Notice></div>}

        {!meta ? (
          <p className="py-10 text-center text-muted">불러오는 중이에요…</p>
        ) : !meta.org ? (
          <div className="mt-4">
            <OrgAuth
              onDone={reload}
              intro={`공고는 기관 회원만 올릴 수 있어요. 가입은 전화번호와 비밀번호만 있으면 돼요. ${
                meta.settings.freeForAll ? "지금은 무료 이벤트 기간이에요." : `첫 공고는 ${meta.settings.freeDays}일간 무료예요.`
              }`}
            />
          </div>
        ) : done ? (
          <div className="mt-5 space-y-4">
            {done.needsPayment ? (
              <>
                <Notice>
                  공고가 저장됐어요. <b>결제를 마치면 바로 노출</b>돼요. ({s!.paidDays}일 {won(s!.price)})
                </Notice>
                <button className="btn-primary w-full" onClick={() => router.push(`/org?pay=${done.jobId}`)}>
                  결제하고 공고 노출하기
                </button>
              </>
            ) : (
              done.pendingReview ? (
                <Notice>
                  공고가 저장됐어요. <b>관리자가 기관 확인을 마치면 목록에 공개</b>돼요. 노출 기간은 공개되는 날부터 계산돼요.
                </Notice>
              ) : (
                <>
                  <Notice tone="ok">공고가 올라갔어요. 지금부터 목록에 보여요. 내용은 &lsquo;내 공고 관리&rsquo;에서 언제든 수정할 수 있어요.</Notice>
                  <Link href="/" className="btn-primary w-full">공고 목록 보기</Link>
                </>
              )
            )}
            <Link href="/org" className="btn-ghost w-full">내 공고 관리</Link>
          </div>
        ) : (
          <JobForm
            locations={meta.locations}
            minWage={meta.settings.minWage}
            initial={{
              facility: [meta.org.facility],
              region: "",
              area: "",
              address: "",
              payType: "시급",
              payAmount: "",
              schedule: "",
              duties: "",
              phone: formatPhoneInput(meta.org.id.slice(1)),
              urgent: false,
            }}
            intro={
              <>
                <p className="text-[0.95rem] text-muted">
                  <b className="text-ink">{meta.org.name}</b> 이름으로 올라가요.
                </p>
                {!meta.org.verified && (
                  <Notice>지금은 기관 확인을 기다리는 중이에요. 공고는 미리 올려 두시면 확인 후 바로 공개돼요.</Notice>
                )}
                {isFree ? (
                  <Notice tone="ok">
                    {s!.freeForAll ? `무료 이벤트 기간이라 ${s!.paidDays}일간 무료로 노출돼요.` : `첫 공고라서 ${s!.freeDays}일간 무료로 노출돼요.`}
                  </Notice>
                ) : (
                  <Notice>
                    무료 공고를 이미 사용했어요. 이 공고는 결제 후 <b>{s!.paidDays}일간</b> 노출돼요. ({won(s!.price)})
                  </Notice>
                )}
              </>
            }
            submitLabel={isFree ? "공고 올리기" : "공고 저장하고 결제하기"}
            onSubmit={async (v) => {
              const r = await api<{ job: { id: string }; needsPayment: boolean; pendingReview: boolean }>("/api/jobs", {
                ...v,
                facility: v.facility[0],
              });
              setDone({ needsPayment: r.needsPayment, jobId: r.job.id, pendingReview: r.pendingReview });
              window.scrollTo({ top: 0 });
            }}
          />
        )}
      </PageBody>
    </>
  );
}
