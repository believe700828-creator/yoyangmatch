import Link from "next/link";

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="요양매칭 처음으로">
          <Mark />
          <span className="text-[1.15rem] font-extrabold tracking-tight text-pine-deep">요양매칭</span>
          <span className="hidden text-sm text-muted sm:inline">서울·경기 요양 구인구직</span>
        </Link>
        <nav className="flex items-center gap-1 text-[0.94rem]">{right}</nav>
      </div>
    </header>
  );
}

// 두 사람이 손을 맞잡은 모양을 단순화한 로고
export function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="#1e5245" />
      <circle cx="10" cy="10" r="3" fill="#f4b52f" />
      <circle cx="18" cy="10" r="3" fill="#fff" />
      <path d="M5.5 21c0-3.6 2-5.6 4.5-5.6S14 17 14 19.2c0-2.2 1.5-3.8 4-3.8s4.5 2 4.5 5.6" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function PageBody({ children, narrow }: { children: React.ReactNode; narrow?: boolean }) {
  return <main className={`mx-auto w-full flex-1 px-4 pb-16 pt-5 ${narrow ? "max-w-xl" : "max-w-5xl"}`}>{children}</main>;
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-5xl space-y-1 px-4 py-6 text-sm text-muted">
        <p className="font-semibold text-ink">요양매칭 · yoyangmatch.com</p>
        <p>운영: 서연컴퍼니 · 문의 0504-007-8909</p>
        <p>방문요양·주야간보호·요양원과 요양보호사를 잇는 수도권 구인구직 서비스</p>
        <p className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          <Link href="/privacy" className="font-bold text-ink underline underline-offset-2">개인정보 처리방침</Link>
          <Link href="/seekers/manage" className="underline underline-offset-2">내 구직 글 관리</Link>
          <Link href="/org" className="underline underline-offset-2">기관 페이지</Link>
          <Link href="/admin" className="underline underline-offset-2">관리자</Link>
        </p>
      </div>
    </footer>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "ok"; children: React.ReactNode }) {
  const cls =
    tone === "error"
      ? "border-alert/30 bg-[#fdf0ea] text-alert"
      : tone === "ok"
        ? "border-pine/25 bg-sage text-pine-deep"
        : "border-sun/40 bg-sun-soft text-ink";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-[0.94rem] ${cls}`}>
      {children}
    </div>
  );
}

export function BackLink({ href = "/", label = "목록으로" }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="mb-3 inline-flex items-center gap-1 text-[0.94rem] font-semibold text-muted hover:text-ink">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      {label}
    </Link>
  );
}
