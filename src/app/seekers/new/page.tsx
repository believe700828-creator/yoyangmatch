"use client";

import Link from "next/link";
import { useState } from "react";
import { AreaPicker, FacilityChips } from "@/components/Pickers";
import { BackLink, Notice, PageBody, SiteHeader } from "@/components/Shell";
import { api, formatPhoneInput, useMeta } from "@/lib/client";
import type { Facility, Region } from "@/lib/types";

export default function NewSeekerPage() {
  const { meta, error: metaError } = useMeta();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState<Region | "">("");
  const [area, setArea] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [hasLicense, setHasLicense] = useState(true);
  const [experience, setExperience] = useState("");
  const [availableTime, setAvailableTime] = useState("");
  const [memo, setMemo] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/api/seekers", { name, phone, password, region, area, facilities, hasLicense, experience, availableTime, memo, agree });
      setDone(true);
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
        <BackLink href="/?tab=seekers" />
        <h1 className="text-[1.6rem] font-extrabold">구직 등록</h1>
        <p className="mt-1 text-muted">가입 없이 등록해요. 기관에서 보고 직접 연락드려요.</p>

        {metaError && <div className="mt-4"><Notice tone="error">{metaError}</Notice></div>}

        {done ? (
          <div className="mt-5 space-y-4">
            <Notice tone="ok">
              등록됐어요. {meta?.settings.seekerDays ?? 60}일 동안 기관에 보여요. 일을 구하시면 <b>내 구직 글 관리</b>에서 마감해 주세요.
            </Notice>
            <Link href="/?tab=seekers" className="btn-primary w-full">등록된 목록 보기</Link>
            <Link href="/seekers/manage" className="btn-ghost w-full">내 구직 글 관리</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="sk-name">이름</label>
                <input id="sk-name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길순" autoComplete="name" required maxLength={20} />
                <p className="mt-1 text-sm text-muted">목록에는 홍○순처럼 가려서 보여요.</p>
              </div>
              <div>
                <label className="field-label" htmlFor="sk-phone">휴대폰 번호</label>
                <input id="sk-phone" className="field" inputMode="tel" value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} placeholder="010-0000-0000" autoComplete="tel" required />
                <p className="mt-1 text-sm text-muted">기관 회원에게만 보여요.</p>
              </div>
            </div>

            <div>
              <span className="field-label">희망 근무 지역</span>
              <AreaPicker locations={meta?.locations ?? []} region={region} area={area} onChange={(r, a) => { setRegion(r); setArea(a); }} idPrefix="sk" />
            </div>

            <div>
              <span className="field-label">희망 근무 형태 <span className="font-normal text-muted">(여러 개 선택 가능)</span></span>
              <FacilityChips value={facilities} onChange={setFacilities} multiple />
            </div>

            <div>
              <span className="field-label">요양보호사 자격증</span>
              <div className="flex gap-2" role="radiogroup" aria-label="자격증 보유 여부">
                <button type="button" role="radio" aria-checked={hasLicense} className="chip" onClick={() => setHasLicense(true)}>있어요</button>
                <button type="button" role="radio" aria-checked={!hasLicense} className="chip" onClick={() => setHasLicense(false)}>취득 준비 중</button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="sk-exp">경력 <span className="font-normal text-muted">(선택)</span></label>
                <input id="sk-exp" className="field" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="예: 방문요양 3년" maxLength={60} />
              </div>
              <div>
                <label className="field-label" htmlFor="sk-time">가능한 시간 <span className="font-normal text-muted">(선택)</span></label>
                <input id="sk-time" className="field" value={availableTime} onChange={(e) => setAvailableTime(e.target.value)} placeholder="예: 평일 오전, 주 5일" maxLength={80} />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="sk-memo">하고 싶은 말 <span className="font-normal text-muted">(선택)</span></label>
              <textarea id="sk-memo" className="field min-h-24" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 운전 가능합니다. 치매 어르신 경험 있어요." maxLength={200} />
            </div>

            <div>
              <label className="field-label" htmlFor="sk-pw">관리용 비밀번호 <span className="font-normal text-muted">(숫자 4자리)</span></label>
              <input id="sk-pw" className="field max-w-40 tracking-[0.4em]" type="password" inputMode="numeric" maxLength={4} value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, ""))} required />
              <p className="mt-1 text-sm text-muted">나중에 글을 마감하거나 지울 때 써요.</p>
            </div>

            <div className="rounded-xl border border-line bg-white p-4 text-[0.92rem]">
              <p className="font-semibold">개인정보 수집·이용 안내</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted">
                <li>수집 항목: 이름, 휴대폰 번호, 희망 지역·근무 형태, 경력 등 입력하신 내용</li>
                <li>목적: 요양기관에 구직 정보 제공 및 채용 연락</li>
                <li>제공받는 자: 사이트에 로그인한 요양기관 회원 (연락처·구직 정보)</li>
                <li>보관: 노출 기간 종료 후 30일 뒤 자동 삭제, 그 전에도 언제든 삭제 가능</li>
                <li>동의하지 않으실 수 있으며, 이 경우 등록할 수 없어요.</li>
              </ul>
              <p className="mt-2 text-muted">
                자세한 내용은{" "}
                <Link href="/privacy" target="_blank" className="font-semibold text-pine underline underline-offset-2">개인정보 처리방침</Link>
                을 확인해 주세요.
              </p>
              <label className="mt-3 flex cursor-pointer items-center gap-3">
                <input type="checkbox" className="h-5 w-5 accent-[#1e5245]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span className="font-semibold">위 내용에 동의합니다</span>
              </label>
            </div>

            {error && <Notice tone="error">{error}</Notice>}
            <button className="btn-primary w-full py-4 text-[1.05rem]" disabled={busy}>
              {busy ? "등록하는 중…" : "구직 등록하기"}
            </button>
          </form>
        )}
      </PageBody>
    </>
  );
}
