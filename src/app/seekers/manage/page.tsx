"use client";

import { useState } from "react";
import { BackLink, Notice, PageBody, SiteHeader } from "@/components/Shell";
import { api, formatPhoneInput, shortDate } from "@/lib/client";

interface Post {
  id: string;
  area: string;
  createdAt: string;
  live: boolean;
  daysLeft: number;
}

export default function ManageSeekerPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function call(action?: string, id?: string) {
    if (action === "delete" && !confirm("이 구직 글을 완전히 지울까요? 되돌릴 수 없어요.")) return;
    setBusy(true);
    setError("");
    try {
      const r = await api<{ posts: Post[] }>("/api/seekers/manage", { phone, password, action, id });
      setPosts(r.posts);
    } catch (err) {
      setError((err as Error).message);
      if (!action) setPosts(null);
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
        <p className="mt-1 text-muted">등록할 때 쓴 휴대폰 번호와 비밀번호 4자리를 넣어 주세요.</p>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
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
          {error && <Notice tone="error">{error}</Notice>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? "확인 중…" : "내 글 불러오기"}</button>
        </form>

        {posts && (
          <ul className="mt-6 space-y-3">
            {posts.map((p) => (
              <li key={p.id} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <b>{p.area}</b>
                  <span className={`rounded-md px-2 py-0.5 text-sm font-bold ${p.live ? "bg-sage text-pine" : "bg-[#eef0ef] text-muted"}`}>
                    {p.live ? `노출 중 · ${p.daysLeft}일 남음` : "마감됨"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">등록일 {shortDate(p.createdAt)}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {p.live ? (
                    <button className="btn-ghost" disabled={busy} onClick={() => call("close", p.id)}>일 구했어요 (마감)</button>
                  ) : (
                    <button className="btn-ghost" disabled={busy} onClick={() => call("reopen", p.id)}>다시 올리기</button>
                  )}
                  <button className="btn-ghost text-alert" disabled={busy} onClick={() => call("delete", p.id)}>삭제</button>
                </div>
              </li>
            ))}
            {posts.length === 0 && <Notice>남아 있는 구직 글이 없어요.</Notice>}
          </ul>
        )}
      </PageBody>
    </>
  );
}
