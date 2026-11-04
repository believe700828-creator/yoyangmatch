"use client";

import { useState } from "react";
import { AreaPicker, FacilityChips } from "@/components/Pickers";
import { Notice } from "@/components/Shell";
import { formatPhoneInput } from "@/lib/client";
import { PAY_TYPES, type Facility, type Location, type PayType, type Region } from "@/lib/types";

export interface JobFormValues {
  facility: Facility[];
  region: Region | "";
  area: string;
  address: string;
  payType: PayType;
  payAmount: string; // 화면용: 쉼표 들어간 금액
  schedule: string;
  duties: string;
  phone: string;
  urgent: boolean;
}

export const toPayInput = (n: number) => (n ? n.toLocaleString("ko-KR") : "");

// 구인공고 등록·수정에서 같이 쓰는 입력 화면
export function JobForm({
  locations,
  minWage,
  initial,
  intro,
  submitLabel,
  onSubmit,
}: {
  locations: Location[];
  minWage: number;
  initial: JobFormValues;
  intro?: React.ReactNode;
  submitLabel: string;
  onSubmit: (values: JobFormValues) => Promise<void>;
}) {
  const [v, setV] = useState<JobFormValues>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof JobFormValues>(k: K, val: JobFormValues[K]) => setV((prev) => ({ ...prev, [k]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!v.facility[0]) return setError("기관 유형을 선택해 주세요.");
    if (!v.region || !v.area) return setError("근무 지역을 선택해 주세요.");
    if (v.address.trim().length < 5) return setError("기관 주소를 입력해 주세요.");
    const pay = Number(v.payAmount.replace(/\D/g, ""));
    if (v.payType === "시급" && minWage > 0 && pay < minWage) {
      return setError(`시급은 최저임금(${minWage.toLocaleString("ko-KR")}원) 이상이어야 올릴 수 있어요.`);
    }
    setBusy(true);
    try {
      await onSubmit(v);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // 관리자가 목록에서 뺀 지역으로 올라간 공고도 수정할 수 있게, 현재 값을 목록에 잠시 포함
  const shownLocations =
    v.region && v.area && !locations.some((l) => l.region === v.region && l.name === v.area)
      ? [...locations, { id: "current", region: v.region, name: v.area }]
      : locations;

  return (
    <form onSubmit={submit} className="mt-4 space-y-5">
      {intro}

      <div>
        <span className="field-label">기관 유형</span>
        <FacilityChips value={v.facility} onChange={(f) => set("facility", f)} />
      </div>

      <div>
        <span className="field-label">근무 지역</span>
        <AreaPicker
          locations={shownLocations}
          region={v.region}
          area={v.area}
          onChange={(r, a) => setV((prev) => ({ ...prev, region: r, area: a }))}
          idPrefix="job"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="job-address">기관 주소</label>
        <input
          id="job-address"
          className="field"
          value={v.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="예: 용인시 기흥구 ○○로 12, 3층"
          autoComplete="street-address"
          maxLength={80}
          required
        />
        <p className="mt-1 text-sm text-muted">구인공고에는 기관 이름·주소·전화번호를 함께 적어야 해요.</p>
      </div>

      <div>
        <span className="field-label">급여</span>
        <div className="mb-2 flex flex-wrap gap-2" role="radiogroup" aria-label="급여 방식">
          {PAY_TYPES.map((p) => (
            <button key={p} type="button" role="radio" aria-checked={v.payType === p} className="chip" onClick={() => set("payType", p)}>
              {p}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            className="field pr-10 text-right text-[1.1rem] font-bold"
            inputMode="numeric"
            aria-label="급여 금액"
            placeholder={v.payType === "월급" ? "2,200,000" : "13,000"}
            value={v.payAmount}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, 9);
              set("payAmount", d ? Number(d).toLocaleString("ko-KR") : "");
            }}
            required
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">원</span>
        </div>
        {minWage > 0 && (
          <p className="mt-1 text-sm text-muted">
            최저임금 시급 {minWage.toLocaleString("ko-KR")}원 이상으로 적어 주세요. 일급·월급도 근무시간으로 나눈 금액이 이보다 낮으면 안 돼요.
          </p>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor="job-schedule">근무 요일·시간</label>
        <input id="job-schedule" className="field" value={v.schedule} onChange={(e) => set("schedule", e.target.value)} placeholder="예: 월~금 09:00~12:00 (주 5일, 하루 3시간)" required maxLength={100} />
      </div>

      <div>
        <label className="field-label" htmlFor="job-duties">어르신 상태·담당 업무</label>
        <textarea id="job-duties" className="field min-h-28" value={v.duties} onChange={(e) => set("duties", e.target.value)} placeholder={"예: 3등급 여자 어르신, 거동 가능\n식사 준비, 청소, 병원 동행"} required maxLength={300} />
      </div>

      <div>
        <label className="field-label" htmlFor="job-phone">문의 전화번호</label>
        <input id="job-phone" className="field" inputMode="tel" value={v.phone} onChange={(e) => set("phone", formatPhoneInput(e.target.value))} required />
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
        <input type="checkbox" className="h-5 w-5 accent-[#1e5245]" checked={v.urgent} onChange={(e) => set("urgent", e.target.checked)} />
        <span>
          <b>급구</b>로 표시하기 <span className="text-muted">(목록 위쪽에 보여요)</span>
        </span>
      </label>

      {error && <Notice tone="error">{error}</Notice>}
      <button className="btn-primary w-full py-4 text-[1.05rem]" disabled={busy}>
        {busy ? "저장하는 중…" : submitLabel}
      </button>
      <p className="text-center text-sm text-muted">허위·과장 공고나 연락처가 다른 공고는 관리자가 내릴 수 있어요.</p>
    </form>
  );
}
