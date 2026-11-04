"use client";

import { useState } from "react";
import { FacilityChips } from "@/components/Pickers";
import { Notice } from "@/components/Shell";
import { api, formatPhoneInput } from "@/lib/client";
import type { Facility } from "@/lib/types";

// 기관 로그인 / 회원가입 (전화번호 + 비밀번호)
export function OrgAuth({ onDone, intro }: { onDone: () => void; intro?: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [facility, setFacility] = useState<Facility[]>([]);
  const [certNo, setCertNo] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await api("/api/org/login", { phone, password });
      else await api("/api/org/signup", { name, phone, password, facility: facility[0], certNo, address });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="mb-4 grid grid-cols-2 rounded-xl bg-sage p-1" role="tablist">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError("");
            }}
            className={`rounded-lg py-2.5 font-bold ${mode === m ? "bg-white text-pine-deep shadow-sm" : "text-muted"}`}
          >
            {m === "login" ? "기관 로그인" : "처음이에요 (가입)"}
          </button>
        ))}
      </div>
      {intro && <p className="mb-4 text-[0.95rem] text-muted">{intro}</p>}
      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <>
            <div>
              <label className="field-label" htmlFor="org-name">기관명</label>
              <input id="org-name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 행복방문요양센터" autoComplete="organization" required />
            </div>
            <div>
              <span className="field-label">기관 유형</span>
              <FacilityChips value={facility} onChange={setFacility} />
            </div>
            <div>
              <label className="field-label" htmlFor="org-cert">사업자등록번호 또는 장기요양기관기호</label>
              <input
                id="org-cert"
                className="field"
                inputMode="numeric"
                value={certNo}
                onChange={(e) => setCertNo(e.target.value.replace(/[^\d-]/g, "").slice(0, 14))}
                placeholder="숫자 10자리 또는 11자리"
                required
              />
              <p className="mt-1 text-sm text-muted">실제 운영 중인 기관인지 확인하는 데만 써요. 확인이 끝나면 공고가 공개돼요.</p>
            </div>
            <div>
              <label className="field-label" htmlFor="org-address">기관 주소</label>
              <input
                id="org-address"
                className="field"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="예: 용인시 기흥구 ○○로 12, 3층"
                autoComplete="street-address"
                maxLength={80}
                required
              />
              <p className="mt-1 text-sm text-muted">공고를 올릴 때 자동으로 채워져요.</p>
            </div>
          </>
        )}
        <div>
          <label className="field-label" htmlFor="org-phone">기관 전화번호 <span className="font-normal text-muted">(아이디로 사용)</span></label>
          <input id="org-phone" className="field" inputMode="tel" value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} placeholder="031-000-0000 또는 010-0000-0000" autoComplete="tel" required />
        </div>
        <div>
          <label className="field-label" htmlFor="org-pw">비밀번호 {mode === "signup" && <span className="font-normal text-muted">(6자리 이상)</span>}</label>
          <input id="org-pw" className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "signup" ? 6 : 1} />
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "확인 중…" : mode === "login" ? "로그인" : "가입하고 시작하기"}
        </button>
      </form>
    </div>
  );
}
