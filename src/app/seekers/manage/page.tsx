"use client";

import { useState } from "react";
import { AreaPicker, FacilityChips, facilityDot } from "@/components/Pickers";
import { BackLink, Notice, PageBody, SiteHeader } from "@/components/Shell";
import { api, formatPhoneInput, shortDate, useMeta } from "@/lib/client";
import { CONTACT_PHONE, telHref } from "@/lib/site";
import { facilityLabel, type Facility, type Location, type Region } from "@/lib/types";

interface Post {
  id: string;
  name: string;
  region: Region;
  area: string;
  facilities: Facility[];
  hasLicense: boolean;
  experience: string;
  availableTime: string;
  memo: string;
  createdAt: string;
  live: boolean;
  daysLeft: number;
}

type Edits = Pick<Post, "name" | "region" | "area" | "facilities" | "hasLicense" | "experience" | "availableTime" | "memo">;

export default function ManageSeekerPage() {
  const { meta } = useMeta();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function call(action?: string, id?: string, extra?: Partial<Edits>) {
    if (action === "delete" && !confirm("이 구직 글을 완전히 지울까요? 되돌릴 수 없어요.")) return false;
    setBusy(true);
    setError("");
    setOk("");
    try {
      const r = await api<{ posts: Post[] }>("/api/seekers/manage", { phone, password, action, id, ...extra });
      setPosts(r.posts);
      if (action === "update") setOk("수정한 내용을 저장했어요. 목록에도 바로 반영돼요.");
      return true;
    } catch (err) {
      setError((err as Error).message);
      if (!action) setPosts(null);
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <PageBody narrow>
        <BackLink href="/?tab=seekers" />
        <h1 className="text-[1.6rem] font-extrabold">내 구직 글 관리</h1>
        <p className="mt-1 text-muted">등록할 때 쓴 휴대폰 번호와 비밀번호 4자리를 넣어 주세요. 내용 수정, 마감, 삭제를 할 수 있어요.</p>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setEditing(null);
            call();
          }}
        >
          <div>
            <label className="field-label" htmlFor="m-phone">휴대폰 번호</label>
            <input id="m-phone" className="field" inputMode="tel" value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} placeholder="010-0000-0000" required />
          </div>
          <div>
            <label className="field-label" htmlFor="m-pw">비밀번호 4자리</label>
            <input id="m-pw" className="field max-w-40 tracking-[0.4em]" type="password" inputMode="numeric" maxLength={4} value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, ""))} required />
          </div>
          {!posts && error && <Notice tone="error">{error}</Notice>}
          <p className="text-sm text-muted">
            비밀번호를 잊으셨나요? <a href={telHref} className="font-semibold text-pine underline underline-offset-2">{CONTACT_PHONE}</a>로 연락 주시면 본인 확인 후 새 번호를 알려드려요.
          </p>
          <button className="btn-primary w-full" disabled={busy}>{busy && !posts ? "확인 중…" : "내 글 불러오기"}</button>
        </form>

        {posts && (
          <div className="mt-6 space-y-3">
            {ok && <Notice tone="ok">{ok}</Notice>}
            {error && <Notice tone="error">{error}</Notice>}
            <ul className="space-y-3">
              {posts.map((p) =>
                editing === p.id ? (
                  <li key={p.id} className="rounded-2xl border border-pine/40 bg-white p-4">
                    <SeekerEditForm
                      post={p}
                      locations={meta?.locations ?? []}
                      busy={busy}
                      onCancel={() => setEditing(null)}
                      onSave={async (v) => {
                        if (await call("update", p.id, v)) setEditing(null);
                      }}
                    />
                  </li>
                ) : (
                  <li key={p.id} className="rounded-2xl border border-line bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <b>{p.region} {p.area}</b>
                      <span className={`rounded-md px-2 py-0.5 text-sm font-bold ${p.live ? "bg-sage text-pine" : "bg-[#eef0ef] text-muted"}`}>
                        {p.live ? `노출 중 · ${p.daysLeft}일 남음` : "마감됨"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.facilities.map((f) => (
                        <span key={f} className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-[0.85rem] font-semibold">
                          <span className={`h-2 w-2 rounded-full ${facilityDot[f]}`} aria-hidden="true" />
                          {facilityLabel(f)}
                        </span>
                      ))}
                    </div>
                    {(p.experience || p.availableTime) && (
                      <p className="mt-2 text-[0.95rem] text-muted">{[p.experience, p.availableTime].filter(Boolean).join(" · ")}</p>
                    )}
                    <p className="mt-1 text-sm text-muted">등록일 {shortDate(p.createdAt)}</p>
                    <button className="btn-ghost mt-3 w-full" disabled={busy} onClick={() => { setOk(""); setEditing(p.id); }}>
                      내용 수정
                    </button>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {p.live ? (
                        <button className="btn-ghost" disabled={busy} onClick={() => call("close", p.id)}>일 구했어요 (마감)</button>
                      ) : (
                        <button className="btn-ghost" disabled={busy} onClick={() => call("reopen", p.id)}>다시 올리기</button>
                      )}
                      <button className="btn-ghost text-alert" disabled={busy} onClick={() => call("delete", p.id)}>삭제</button>
                    </div>
                  </li>
                ),
              )}
              {posts.length === 0 && <Notice>남아 있는 구직 글이 없어요.</Notice>}
            </ul>
            {posts.length > 0 && (
              <SeekerPinForm
                phone={phone}
                password={password}
                onChanged={(pin) => {
                  setPassword(pin);
                  setError("");
                  setOk("비밀번호 4자리를 바꿨어요. 다음부터 새 번호로 불러오세요.");
                }}
              />
            )}
          </div>
        )}
      </PageBody>
    </>
  );
}

function SeekerEditForm({
  post,
  locations,
  busy,
  onCancel,
  onSave,
}: {
  post: Post;
  locations: Location[];
  busy: boolean;
  onCancel: () => void;
  onSave: (v: Edits) => void;
}) {
  const [v, setV] = useState<Edits>({
    name: post.name,
    region: post.region,
    area: post.area,
    facilities: post.facilities,
    hasLicense: post.hasLicense,
    experience: post.experience,
    availableTime: post.availableTime,
    memo: post.memo,
  });
  const [error, setError] = useState("");
  const set = <K extends keyof Edits>(k: K, val: Edits[K]) => setV((prev) => ({ ...prev, [k]: val }));
  const shownLocations =
    v.region && v.area && !locations.some((l) => l.region === v.region && l.name === v.area)
      ? [...locations, { id: "current", region: v.region, name: v.area }]
      : locations;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!v.region || !v.area) return setError("희망 근무 지역을 선택해 주세요.");
        if (v.facilities.length === 0) return setError("희망 근무 형태를 하나 이상 골라 주세요.");
        setError("");
        onSave(v);
      }}
    >
      <p className="font-bold">구직 글 수정</p>
      <div>
        <label className="field-label" htmlFor={`e-name-${post.id}`}>이름</label>
        <input id={`e-name-${post.id}`} className="field" value={v.name} onChange={(e) => set("name", e.target.value)} maxLength={20} required />
      </div>
      <div>
        <span className="field-label">희망 근무 지역</span>
        <AreaPicker
          locations={shownLocations}
          region={v.region}
          area={v.area}
          onChange={(r, a) => setV((prev) => ({ ...prev, region: r as Region, area: a }))}
          idPrefix={`e-${post.id}`}
        />
      </div>
      <div>
        <span className="field-label">희망 근무 형태</span>
        <FacilityChips value={v.facilities} onChange={(f) => set("facilities", f)} multiple />
      </div>
      <div>
        <span className="field-label">요양보호사 자격증</span>
        <div className="flex gap-2" role="radiogroup" aria-label="자격증 보유 여부">
          <button type="button" role="radio" aria-checked={v.hasLicense} className="chip" onClick={() => set("hasLicense", true)}>있어요</button>
          <button type="button" role="radio" aria-checked={!v.hasLicense} className="chip" onClick={() => set("hasLicense", false)}>취득 준비 중</button>
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor={`e-exp-${post.id}`}>경력</label>
        <input id={`e-exp-${post.id}`} className="field" value={v.experience} onChange={(e) => set("experience", e.target.value)} placeholder="예: 방문요양 3년" maxLength={60} />
      </div>
      <div>
        <label className="field-label" htmlFor={`e-time-${post.id}`}>가능한 시간</label>
        <input id={`e-time-${post.id}`} className="field" value={v.availableTime} onChange={(e) => set("availableTime", e.target.value)} placeholder="예: 평일 오전, 주 5일" maxLength={80} />
      </div>
      <div>
        <label className="field-label" htmlFor={`e-memo-${post.id}`}>하고 싶은 말</label>
        <textarea id={`e-memo-${post.id}`} className="field min-h-24" value={v.memo} onChange={(e) => set("memo", e.target.value)} maxLength={200} />
      </div>
      <p className="text-sm text-muted">휴대폰 번호와 비밀번호는 바꿀 수 없어요. 번호가 바뀌었다면 이 글을 삭제하고 새로 등록해 주세요.</p>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>취소</button>
        <button className="btn-primary" disabled={busy}>{busy ? "저장하는 중…" : "수정 내용 저장"}</button>
      </div>
    </form>
  );
}

// 요양보호사가 비밀번호 4자리를 직접 변경 (지금 번호로 불러온 상태에서)
function SeekerPinForm({ phone, password, onChanged }: { phone: string; password: string; onChanged: (pin: string) => void }) {
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return (
      <button className="btn-ghost w-full" onClick={() => setOpen(true)}>
        비밀번호 4자리 바꾸기
      </button>
    );
  }
  return (
    <form
      className="space-y-4 rounded-2xl border border-line bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        if (!/^\d{4}$/.test(next)) return setError("새 비밀번호는 숫자 4자리로 정해 주세요.");
        if (next !== again) return setError("두 칸의 번호가 서로 달라요. 다시 확인해 주세요.");
        setBusy(true);
        try {
          await api("/api/seekers/manage", { phone, password, action: "password", newPassword: next });
          onChanged(next);
          setNext(""); setAgain("");
          setOpen(false);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="font-bold">비밀번호 4자리 바꾸기</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="pin-new">새 번호</label>
          <input id="pin-new" className="field tracking-[0.4em]" type="password" inputMode="numeric" maxLength={4} value={next} onChange={(e) => setNext(e.target.value.replace(/\D/g, ""))} required />
        </div>
        <div>
          <label className="field-label" htmlFor="pin-again">한 번 더</label>
          <input id="pin-again" className="field tracking-[0.4em]" type="password" inputMode="numeric" maxLength={4} value={again} onChange={(e) => setAgain(e.target.value.replace(/\D/g, ""))} required />
        </div>
      </div>
      <p className="text-sm text-muted">이 휴대폰 번호로 등록한 구직 글 모두 새 번호로 바뀌어요.</p>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="btn-ghost" onClick={() => { setOpen(false); setError(""); }} disabled={busy}>취소</button>
        <button className="btn-primary" disabled={busy}>{busy ? "바꾸는 중…" : "변경하기"}</button>
      </div>
    </form>
  );
}
