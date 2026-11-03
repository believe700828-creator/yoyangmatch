"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AreaPicker, FacilityChips, facilityDot, facilityText } from "@/components/Pickers";
import { Notice, PageBody, SiteFooter, SiteHeader } from "@/components/Shell";
import { ago, api, useMeta, won } from "@/lib/client";
import { facilityLabel, type Facility, type PublicJob, type PublicSeeker, type Region } from "@/lib/types";

type Tab = "jobs" | "seekers";

export default function HomePage() {
  return (
    <Suspense>
      <Board />
    </Suspense>
  );
}

function Board() {
  const router = useRouter();
  const params = useSearchParams();
  const tab: Tab = params.get("tab") === "seekers" ? "seekers" : "jobs";
  const { meta, error: metaError } = useMeta();

  const [jobs, setJobs] = useState<PublicJob[] | null>(null);
  const [seekers, setSeekers] = useState<PublicSeeker[] | null>(null);
  const [canSeeContact, setCanSeeContact] = useState(false);
  const [error, setError] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [region, setRegion] = useState<Region | "">("");
  const [area, setArea] = useState("");

  useEffect(() => {
    api<{ jobs: PublicJob[] }>("/api/jobs")
      .then((r) => setJobs(r.jobs))
      .catch((e: Error) => setError(e.message));
    api<{ seekers: PublicSeeker[]; canSeeContact: boolean }>("/api/seekers")
      .then((r) => {
        setSeekers(r.seekers);
        setCanSeeContact(r.canSeeContact);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const matchPlace = (r: Region, a: string) => (!region || r === region) && (!area || a === area);

  const shownJobs = useMemo(
    () => (jobs ?? []).filter((j) => (facilities.length === 0 || facilities.includes(j.facility)) && matchPlace(j.region, j.area)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobs, facilities, region, area],
  );
  const shownSeekers = useMemo(
    () =>
      (seekers ?? []).filter(
        (s) => (facilities.length === 0 || s.facilities.some((f) => facilities.includes(f))) && matchPlace(s.region, s.area),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seekers, facilities, region, area],
  );

  const setTab = (t: Tab) => router.replace(t === "jobs" ? "/" : "/?tab=seekers", { scroll: false });
  const filtered = facilities.length > 0 || region !== "";
  const freeDays = meta?.settings.freeDays ?? 7;

  return (
    <>
      <SiteHeader
        right={
          meta?.org ? (
            <Link href="/org" className="block max-w-[11rem] truncate rounded-lg px-3 py-2 font-semibold text-pine hover:bg-sage">
              {meta.org.name}
            </Link>
          ) : (
            <Link href="/org" className="rounded-lg px-3 py-2 font-semibold text-pine hover:bg-sage">
              기관 로그인
            </Link>
          )
        }
      />

      <PageBody>
        {/* 핵심: 일자리 / 인재 두 갈래 선택 */}
        <div role="tablist" aria-label="보기 선택" className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-white">
          <TabButton
            active={tab === "jobs"}
            onClick={() => setTab("jobs")}
            title="일자리 찾기"
            sub={`구인공고 ${jobs ? jobs.length : "–"}건`}
            who="요양보호사님"
          />
          <TabButton
            active={tab === "seekers"}
            onClick={() => setTab("seekers")}
            title="요양보호사 찾기"
            sub={`인재정보 ${seekers ? seekers.length : "–"}명`}
            who="기관 담당자님"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-sage p-4 sm:flex-row sm:items-center sm:justify-between">
          {tab === "jobs" ? (
            <>
              <p className="text-[0.97rem] text-pine-deep">
                <b>요양기관이신가요?</b> 회원가입 후 공고를 올리면{" "}
                {meta?.settings.freeForAll ? "지금은 무료로 노출돼요." : `첫 공고는 ${freeDays}일간 무료로 노출돼요.`}
              </p>
              <Link href="/jobs/new" className="btn-primary shrink-0">
                구인공고 올리기
              </Link>
            </>
          ) : (
            <>
              <p className="text-[0.97rem] text-pine-deep">
                <b>요양보호사님이신가요?</b> 가입 없이 1분이면 구직 등록이 끝나요. 연락처는 기관 회원에게만 보여요.
              </p>
              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <Link href="/seekers/new" className="btn-primary">
                  구직 등록하기
                </Link>
                <Link href="/seekers/manage" className="text-center text-sm font-semibold text-pine underline underline-offset-2">
                  이미 등록했어요 (수정·마감)
                </Link>
              </div>
            </>
          )}
        </div>

        <section aria-label="검색 조건" className="mt-5 space-y-3">
          <FacilityChips value={facilities} onChange={setFacilities} withAll />
          <div className="max-w-md">
            <AreaPicker
              locations={meta?.locations ?? []}
              region={region}
              area={area}
              allowAll
              idPrefix="filter"
              onChange={(r, a) => {
                setRegion(r);
                setArea(a);
              }}
            />
          </div>
        </section>

        {(error || metaError) && (
          <div className="mt-5">
            <Notice tone="error">{error || metaError}</Notice>
          </div>
        )}

        <section className="mt-6" aria-live="polite">
          {tab === "jobs" ? (
            jobs === null && !error ? (
              <Loading />
            ) : shownJobs.length === 0 ? (
              <Empty
                text={filtered ? "선택한 조건에 맞는 공고가 아직 없어요." : "아직 올라온 공고가 없어요. 첫 공고의 주인공이 되어 주세요."}
                action={filtered ? undefined : { href: "/jobs/new", label: "구인공고 올리기" }}
              />
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {shownJobs.map((j) => (
                  <JobItem key={j.id} job={j} />
                ))}
              </ul>
            )
          ) : seekers === null && !error ? (
            <Loading />
          ) : shownSeekers.length === 0 ? (
            <Empty
              text={filtered ? "선택한 조건에 맞는 요양보호사가 아직 없어요." : "아직 등록된 구직 정보가 없어요."}
              action={filtered ? undefined : { href: "/seekers/new", label: "구직 등록하기" }}
            />
          ) : (
            <>
              {!canSeeContact && (
                <div className="mb-3">
                  <Notice>
                    요양보호사 연락처는 <b>기관 회원</b>에게만 보여요.{" "}
                    <Link href="/org" className="font-bold underline underline-offset-2">
                      기관 로그인
                    </Link>
                  </Notice>
                </div>
              )}
              <ul className="grid gap-3 md:grid-cols-2">
                {shownSeekers.map((s) => (
                  <SeekerItem key={s.id} s={s} />
                ))}
              </ul>
            </>
          )}
        </section>
      </PageBody>
      <SiteFooter />
    </>
  );
}

function TabButton({ active, onClick, title, sub, who }: { active: boolean; onClick: () => void; title: string; sub: string; who: string }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex flex-col items-start gap-0.5 px-4 py-4 text-left transition-colors sm:px-6 sm:py-5 ${
        active ? "bg-pine text-white" : "bg-white text-ink hover:bg-sage"
      }`}
    >
      <span className={`text-[0.82rem] ${active ? "text-white/75" : "text-muted"}`}>{who}</span>
      <span className="text-[1.3rem] font-extrabold leading-tight sm:text-[1.6rem]">{title}</span>
      <span className={`text-[0.9rem] font-semibold ${active ? "text-sun" : "text-pine"}`}>{sub}</span>
    </button>
  );
}

function JobItem({ job }: { job: PublicJob }) {
  return (
    <li className="relative overflow-hidden rounded-2xl border border-line bg-white">
      <span className={`absolute inset-y-0 left-0 w-1.5 ${facilityDot[job.facility]}`} aria-hidden="true" />
      <div className="space-y-2.5 py-4 pl-5 pr-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.88rem]">
          <span className={`font-bold ${facilityText[job.facility]}`}>{facilityLabel(job.facility)}</span>
          <span className="text-muted">{job.region} {job.area}</span>
          {job.urgent && <span className="rounded-md bg-sun px-2 py-0.5 text-[0.8rem] font-extrabold text-ink">급구</span>}
          <span className="ml-auto text-muted">{ago(job.createdAt)}</span>
        </div>
        <h3 className="text-[1.08rem] font-bold leading-snug">{job.orgName}</h3>
        <p className="text-[1.25rem] font-extrabold text-pine-deep">
          <span className="mr-1.5 text-[0.95rem] font-semibold text-muted">{job.payType}</span>
          {won(job.payAmount)}
        </p>
        <dl className="grid grid-cols-[4.2rem_1fr] gap-x-2 gap-y-1 text-[0.95rem]">
          <dt className="text-muted">근무</dt>
          <dd>{job.schedule}</dd>
          <dt className="text-muted">업무</dt>
          <dd className="whitespace-pre-line">{job.duties}</dd>
        </dl>
        <a href={`tel:${job.phone.replace(/\D/g, "")}`} className="btn-ghost w-full border-pine/40 text-pine">
          <PhoneIcon /> 전화 문의 {job.phone}
        </a>
      </div>
    </li>
  );
}

function SeekerItem({ s }: { s: PublicSeeker }) {
  return (
    <li className="rounded-2xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[1.08rem] font-bold">{s.name} 요양보호사</h3>
        {s.hasLicense && <span className="rounded-md bg-sage px-2 py-0.5 text-[0.8rem] font-bold text-pine">자격증 보유</span>}
        <span className="ml-auto text-[0.88rem] text-muted">{ago(s.createdAt)}</span>
      </div>
      <p className="mt-1 text-[0.95rem] text-muted">
        희망 지역 <b className="text-ink">{s.region} {s.area}</b>
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {s.facilities.map((f) => (
          <span key={f} className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-[0.85rem] font-semibold">
            <span className={`h-2 w-2 rounded-full ${facilityDot[f]}`} aria-hidden="true" />
            {facilityLabel(f)}
          </span>
        ))}
      </div>
      <dl className="mt-3 grid grid-cols-[4.2rem_1fr] gap-x-2 gap-y-1 text-[0.95rem]">
        {s.experience && (
          <>
            <dt className="text-muted">경력</dt>
            <dd>{s.experience}</dd>
          </>
        )}
        {s.availableTime && (
          <>
            <dt className="text-muted">가능 시간</dt>
            <dd>{s.availableTime}</dd>
          </>
        )}
      </dl>
      {s.memo && <p className="mt-2 rounded-xl bg-[#f6f8f6] px-3 py-2 text-[0.95rem]">{s.memo}</p>}
      <div className="mt-3">
        {s.phone ? (
          <a href={`tel:${s.phone.replace(/\D/g, "")}`} className="btn-primary w-full">
            <PhoneIcon /> {s.phone}
          </a>
        ) : (
          <Link href="/org" className="btn-ghost w-full text-muted">
            기관 로그인 후 연락처 보기
          </Link>
        )}
      </div>
    </li>
  );
}

function Loading() {
  return <p className="py-10 text-center text-muted">불러오는 중이에요…</p>;
}

function Empty({ text, action }: { text: string; action?: { href: string; label: string } }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-4 py-12 text-center">
      <p className="text-muted">{text}</p>
      {action && (
        <Link href={action.href} className="btn-primary mt-4">
          {action.label}
        </Link>
      )}
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}
