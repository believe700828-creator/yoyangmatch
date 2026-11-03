"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { OrgAuth } from "@/components/OrgAuth";
import { facilityText } from "@/components/Pickers";
import { Notice, PageBody, SiteFooter, SiteHeader } from "@/components/Shell";
import { api, formatPhoneInput, shortDate, won } from "@/lib/client";
import { startJobPayment } from "@/lib/pay";
import { facilityLabel, type Facility, type Job, type Order } from "@/lib/types";

type MyJob = Job & { live: boolean; daysLeft: number };
interface MeRes {
  org: { name: string; phone: string; facility: Facility; freeUsed: boolean };
  jobs: MyJob[];
  orders: Order[];
  settings: { price: number; paidDays: number; freeForAll: boolean };
}

export default function OrgPage() {
  return (
    <Suspense>
      <OrgDashboard />
    </Suspense>
  );
}

function OrgDashboard() {
  const params = useSearchParams();
  const focusJob = params.get("pay");
  const [me, setMe] = useState<MeRes | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(() => {
    api<MeRes>("/api/org/me")
      .then((r) => {
        setMe(r);
        setNeedLogin(false);
      })
      .catch((e: Error) => {
        if (e.message.includes("로그인")) setNeedLogin(true);
        else setError(e.message);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (focusJob && me) document.getElementById(`job-${focusJob}`)?.scrollIntoView({ block: "center" });
  }, [focusJob, me]);

  async function pay(jobId: string) {
    setBusyId(jobId);
    setError("");
    try {
      const r = await startJobPayment(jobId);
      if (r === "activated") {
        setNotice("무료 이벤트 기간이라 결제 없이 노출 기간이 늘어났어요.");
        load();
      }
    } catch (e) {
      const msg = (e as Error).message || "";
      // 사용자가 결제창을 닫은 경우는 오류로 보이지 않게
      if (!/취소|cancel/i.test(msg)) setError(msg || "결제를 시작하지 못했습니다.");
    } finally {
      setBusyId("");
    }
  }

  async function act(jobId: string, action: "close" | "delete") {
    const q = action === "close" ? "이 공고를 마감할까요? 목록에서 바로 내려가요." : "결제 전 공고를 지울까요?";
    if (!confirm(q)) return;
    setBusyId(jobId);
    try {
      await api(`/api/jobs/${jobId}`, { action }, "PATCH");
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId("");
    }
  }

  async function logout() {
    await api("/api/org/logout", {});
    setMe(null);
    setNeedLogin(true);
  }

  return (
    <>
      <SiteHeader
        right={
          me ? (
            <button onClick={logout} className="rounded-lg px-3 py-2 font-semibold text-muted hover:bg-sage">
              로그아웃
            </button>
          ) : null
        }
      />
      <PageBody narrow>
        {needLogin ? (
          <>
            <h1 className="mb-4 text-[1.6rem] font-extrabold">기관 페이지</h1>
            <OrgAuth onDone={load} intro="로그인하면 공고를 올리고, 요양보호사 연락처를 볼 수 있어요." />
          </>
        ) : !me ? (
          error ? <Notice tone="error">{error}</Notice> : <p className="py-10 text-center text-muted">불러오는 중이에요…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className={`text-sm font-bold ${facilityText[me.org.facility]}`}>{facilityLabel(me.org.facility)}</p>
                <h1 className="text-[1.6rem] font-extrabold leading-tight">{me.org.name}</h1>
                <p className="text-sm text-muted">{formatPhoneInput(me.org.phone)}</p>
              </div>
              <Link href="/jobs/new" className="btn-primary">새 공고 올리기</Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href="/?tab=seekers" className="btn-ghost">요양보호사 찾기</Link>
              <Link href="/" className="btn-ghost">전체 공고 보기</Link>
            </div>

            {notice && <div className="mt-4"><Notice tone="ok">{notice}</Notice></div>}
            {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}

            <h2 className="mt-8 text-[1.2rem] font-extrabold">내 공고</h2>
            <p className="text-sm text-muted">
              {me.settings.freeForAll
                ? "지금은 무료 이벤트 기간이에요. 연장도 무료예요."
                : `노출 연장은 ${me.settings.paidDays}일에 ${won(me.settings.price)}이에요.`}
            </p>

            {me.jobs.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-line bg-white px-4 py-10 text-center text-muted">
                아직 올린 공고가 없어요.
              </div>
            ) : (
              <ul className="mt-3 space-y-3">
                {me.jobs.map((j) => {
                  const pending = j.status === "pending_payment";
                  const closed = j.status === "closed";
                  const status = closed ? "마감" : pending ? "결제 전 (노출 안 됨)" : j.live ? `노출 중 · ${j.daysLeft}일 남음` : "기간 끝남";
                  return (
                    <li
                      key={j.id}
                      id={`job-${j.id}`}
                      className={`rounded-2xl border bg-white p-4 ${focusJob === j.id ? "border-sun ring-2 ring-sun/40" : "border-line"}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[0.92rem] text-muted">{j.region} {j.area}</span>
                        <span className={`rounded-md px-2 py-0.5 text-sm font-bold ${j.live ? "bg-sage text-pine" : pending ? "bg-sun-soft text-ink" : "bg-[#eef0ef] text-muted"}`}>
                          {status}
                        </span>
                      </div>
                      <p className="mt-1 text-[1.1rem] font-extrabold">{j.payType} {won(j.payAmount)}</p>
                      <p className="text-[0.95rem]">{j.schedule}</p>
                      <p className="mt-1 text-sm text-muted">
                        등록 {shortDate(j.createdAt)}{j.expiresAt ? ` · 노출 종료 ${shortDate(j.expiresAt)}` : ""}
                      </p>
                      {!closed && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button className={pending ? "btn-sun" : "btn-ghost"} disabled={busyId === j.id} onClick={() => pay(j.id)}>
                            {busyId === j.id ? "여는 중…" : pending ? "결제하고 노출" : `${me.settings.paidDays}일 연장`}
                          </button>
                          {pending ? (
                            <button className="btn-ghost text-alert" disabled={busyId === j.id} onClick={() => act(j.id, "delete")}>삭제</button>
                          ) : (
                            <button className="btn-ghost" disabled={busyId === j.id} onClick={() => act(j.id, "close")}>채용 완료 (마감)</button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {me.orders.length > 0 && (
              <>
                <h2 className="mt-8 text-[1.2rem] font-extrabold">결제 내역</h2>
                <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
                  {me.orders.map((o) => (
                    <li key={o.id} className="flex items-center justify-between px-4 py-3 text-[0.95rem]">
                      <span>{shortDate(o.paidAt ?? o.createdAt)} · {o.days}일 노출</span>
                      <b>{won(o.amount)}</b>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </PageBody>
      <SiteFooter />
    </>
  );
}
