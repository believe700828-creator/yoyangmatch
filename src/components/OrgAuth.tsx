"use client";

import { useState } from "react";
import { FacilityChips } from "@/components/Pickers";
import { Notice } from "@/components/Shell";
import { api, formatPhoneInput } from "@/lib/client";
import { CONTACT_PHONE, telHref } from "@/lib/site";
import type { Facility } from "@/lib/types";

// 기관 로그인 / 회원가입 (전화번호 + 비밀번호)
export function OrgAuth({ onDone, intro }: { onDone: () => void; intro?: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [facility, setFacility] = useState<Facility[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await api("/api/org/login", { phone, password });
      else await api("/api/org/signup", { name, phone, password, facility: facility[0] });
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
        {mode === "login" && (
          <p className="text-sm text-muted">
            비밀번호를 잊으셨나요? <a href={telHref} className="font-semibold text-pine underline underline-offset-2">{CONTACT_PHONE}</a>로 연락 주시면 본인 확인 후 임시 비밀번호를 드려요.
          </p>
        )}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "확인 중…" : mode === "login" ? "로그인" : "가입하고 시작하기"}
        </button>
      </form>
    </div>
  );
}
