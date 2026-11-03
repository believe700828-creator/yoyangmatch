"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OrgAuth } from "@/components/OrgAuth";
import { AreaPicker, FacilityChips } from "@/components/Pickers";
import { BackLink, Notice, PageBody, SiteHeader } from "@/components/Shell";
import { api, formatPhoneInput, useMeta, won } from "@/lib/client";
import { PAY_TYPES, type Facility, type PayType, type Region } from "@/lib/types";

export default function NewJobPage() {
  const router = useRouter();
  const { meta, error: metaError, reload } = useMeta();

  const [facilityPick, setFacility] = useState<Facility[] | null>(null);
  const [region, setRegion] = useState<Region | "">("");
  const [area, setArea] = useState("");
  const [payType, setPayType] = useState<PayType>("시급");
  const [payAmount, setPayAmount] = useState("");
  const [schedule, setSchedule] = useState("");
  const [duties, setDuties] = useState("");
  const [phonePick, setPhone] = useState<string | null>(null);
  const [urgent, setUrgent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { needsPayment: boolean; jobId: string }>(null);

  // 직접 고르기 전에는 로그인한 기관 정보로 기본값 사용
  const facility = facilityPick ?? (meta?.org ? [meta.org.facility] : []);
  const phone = phonePick ?? (meta?.org ? formatPhoneInput(meta.org.id.slice(1)) : "");

  const s = meta?.settings;
  const isFree = s ? s.freeForAll || !meta?.org?.freeUsed : true;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!facility[0]) return setError("기관 유형을 선택해 주세요.");
    if (!region || !area) return setError("근무 지역을 선택해 주세요.");
    setBusy(true);
    try {
      const r = await api<{ job: { id: string }; needsPayment: boolean }>("/api/jobs", {
        facility: facility[0],
        region,
        area,
        payType,
        payAmount,
        schedule,
        duties,
        phone,
        urgent,
      });
      setDone({ needsPayment: r.needsPayment, jobId: r.job.id });
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

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
              <>
                <Notice tone="ok">
                  공고가 올라갔어요. 지금부터 목록에 보여요.
                </Notice>
                <Link href="/" className="btn-primary w-full">공고 목록 보기</Link>
              </>
            )}
            <Link href="/org" className="btn-ghost w-full">내 공고 관리</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-5">
            <p className="text-[0.95rem] text-muted">
              <b className="text-ink">{meta.org.name}</b> 이름으로 올라가요.
            </p>
            {isFree ? (
              <Notice tone="ok">
                {s!.freeForAll ? `무료 이벤트 기간이라 ${s!.paidDays}일간 무료로 노출돼요.` : `첫 공고라서 ${s!.freeDays}일간 무료로 노출돼요.`}
              </Notice>
            ) : (
              <Notice>
                무료 공고를 이미 사용했어요. 이 공고는 결제 후 <b>{s!.paidDays}일간</b> 노출돼요. ({won(s!.price)})
              </Notice>
            )}

            <div>
              <span className="field-label">기관 유형</span>
              <FacilityChips value={facility} onChange={setFacility} />
            </div>

            <div>
              <span className="field-label">근무 지역</span>
              <AreaPicker locations={meta.locations} region={region} area={area} onChange={(r, a) => { setRegion(r); setArea(a); }} idPrefix="job" />
            </div>

            <div>
              <span className="field-label">급여</span>
              <div className="mb-2 flex flex-wrap gap-2" role="radiogroup" aria-label="급여 방식">
                {PAY_TYPES.map((p) => (
                  <button key={p} type="button" role="radio" aria-checked={payType === p} className="chip" onClick={() => setPayType(p)}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  className="field pr-10 text-right text-[1.1rem] font-bold"
                  inputMode="numeric"
                  aria-label="급여 금액"
                  placeholder={payType === "월급" ? "2,200,000" : "13,000"}
                  value={payAmount}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(0, 9);
                    setPayAmount(d ? Number(d).toLocaleString("ko-KR") : "");
                  }}
                  required
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">원</span>
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="job-schedule">근무 요일·시간</label>
              <input id="job-schedule" className="field" value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="예: 월~금 09:00~12:00 (주 5일, 하루 3시간)" required maxLength={100} />
            </div>

            <div>
              <label className="field-label" htmlFor="job-duties">어르신 상태·담당 업무</label>
              <textarea id="job-duties" className="field min-h-28" value={duties} onChange={(e) => setDuties(e.target.value)} placeholder={"예: 3등급 여자 어르신, 거동 가능\n식사 준비, 청소, 병원 동행"} required maxLength={300} />
            </div>

            <div>
              <label className="field-label" htmlFor="job-phone">문의 전화번호</label>
              <input id="job-phone" className="field" inputMode="tel" value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} required />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
              <input type="checkbox" className="h-5 w-5 accent-[#1e5245]" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
              <span>
                <b>급구</b>로 표시하기 <span className="text-muted">(목록 위쪽에 보여요)</span>
              </span>
            </label>

            {error && <Notice tone="error">{error}</Notice>}
            <button className="btn-primary w-full py-4 text-[1.05rem]" disabled={busy}>
              {busy ? "올리는 중…" : isFree ? "공고 올리기" : "공고 저장하고 결제하기"}
            </button>
            <p className="text-center text-sm text-muted">
              허위·과장 공고나 연락처가 다른 공고는 관리자가 내릴 수 있어요.
            </p>
          </form>
        )}
      </PageBody>
    </>
  );
}
