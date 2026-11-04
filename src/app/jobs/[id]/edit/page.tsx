"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { JobForm, toPayInput } from "@/components/JobForm";
import { BackLink, Notice, PageBody, SiteHeader } from "@/components/Shell";
import { api, formatPhoneInput, useMeta } from "@/lib/client";
import type { Job } from "@/lib/types";

// 기관이 자기 구인공고 내용을 수정 (노출 기간·결제는 그대로)
export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const { meta } = useMeta();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<{ jobs: Job[] }>("/api/org/me")
      .then((r) => {
        const found = r.jobs.find((j) => j.id === id);
        if (found) setJob(found);
        else setError("수정할 공고를 찾을 수 없어요. 내 공고 관리에서 다시 선택해 주세요.");
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  return (
    <>
      <SiteHeader />
      <PageBody narrow>
        <BackLink href="/org" label="내 공고 관리" />
        <h1 className="text-[1.6rem] font-extrabold">구인공고 수정</h1>

        {error ? (
          <div className="mt-4 space-y-4">
            <Notice tone="error">{error}</Notice>
            <Link href="/org" className="btn-primary w-full">내 공고 관리로 가기</Link>
          </div>
        ) : saved ? (
          <div className="mt-5 space-y-4">
            <Notice tone="ok">수정한 내용을 저장했어요. 목록에도 바로 반영돼요.</Notice>
            <Link href="/org" className="btn-primary w-full">내 공고 관리</Link>
            <Link href="/" className="btn-ghost w-full">공고 목록 보기</Link>
          </div>
        ) : !job || !meta ? (
          <p className="py-10 text-center text-muted">불러오는 중이에요…</p>
        ) : (
          <JobForm
            locations={meta.locations}
            minWage={meta.settings.minWage}
            initial={{
              facility: [job.facility],
              region: job.region,
              area: job.area,
              address: job.address ?? "",
              payType: job.payType,
              payAmount: toPayInput(job.payAmount),
              schedule: job.schedule,
              duties: job.duties,
              phone: formatPhoneInput(job.phone),
              urgent: job.urgent,
            }}
            intro={<Notice>내용만 바뀌고, 노출 기간과 결제 상태는 그대로 유지돼요.</Notice>}
            submitLabel="수정 내용 저장"
            onSubmit={async (v) => {
              await api(`/api/jobs/${job.id}`, { action: "update", ...v, facility: v.facility[0] }, "PATCH");
              setSaved(true);
              window.scrollTo({ top: 0 });
            }}
          />
        )}
      </PageBody>
    </>
  );
}
