"use client";

import { useCallback, useEffect, useState } from "react";
import { Notice, PageBody, SiteHeader } from "@/components/Shell";
import { api, shortDate, won } from "@/lib/client";
import { facilityLabel, REGIONS, type Facility, type Job, type Location, type Order, type Region, type Settings } from "@/lib/types";

type AdminJob = Job & { live: boolean; daysLeft: number };
interface AdminSeeker {
  id: string;
  name: string;
  phone: string;
  region: Region;
  area: string;
  facilities: Facility[];
  status: string;
  createdAt: string;
  daysLeft: number;
}
interface AdminOrg {
  id: string;
  name: string;
  phone: string;
  facility: Facility;
  freeUsed: boolean;
  createdAt: string;
  certNo: string;
  verified: boolean;
}
interface AdminData {
  settings: Settings;
  locations: Location[];
  jobs: AdminJob[];
  seekers: AdminSeeker[];
  orgs: AdminOrg[];
  orders: Order[];
  system: { storeConnected: boolean; paymentTestMode: boolean; alimtalkReady: boolean; alertSubscribers: number };
}

const TABS = [
  { key: "jobs", label: "구인공고" },
  { key: "seekers", label: "구직" },
  { key: "locations", label: "지역" },
  { key: "orgs", label: `기관·결제` },
  { key: "settings", label: "요금·기간" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<TabKey>("jobs");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<AdminData>("/api/admin/data")
      .then((d) => {
        setData(d);
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

  async function run(url: string, body: unknown, method?: string, okMsg?: OkMsg): Promise<boolean> {
    setBusy(true);
    setError("");
    setOk("");
    try {
      const res = await api<Record<string, unknown>>(url, body, method);
      if (okMsg) {
        setOk(typeof okMsg === "function" ? okMsg(res) : okMsg);
        setTimeout(() => document.getElementById("admin-msg")?.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
      }
      load();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (needLogin || !data) {
    return (
      <>
        <SiteHeader />
        <PageBody narrow>
          <h1 className="mb-4 text-[1.6rem] font-extrabold">관리자</h1>
          {!needLogin && !error ? (
            <p className="py-8 text-center text-muted">불러오는 중이에요…</p>
          ) : (
            <form
              className="space-y-4 rounded-2xl border border-line bg-white p-5"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                try {
                  await api("/api/admin/login", { password });
                  setPassword("");
                  load();
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
            >
              <div>
                <label className="field-label" htmlFor="admin-pw">관리자 비밀번호</label>
                <input id="admin-pw" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              </div>
              {error && <Notice tone="error">{error}</Notice>}
              <button className="btn-primary w-full">로그인</button>
            </form>
          )}
        </PageBody>
      </>
    );
  }

  return (
    <>
      <SiteHeader
        right={
          <button className="rounded-lg px-3 py-2 font-semibold text-muted hover:bg-sage" onClick={async () => { await api("/api/admin/logout", {}); setData(null); setNeedLogin(true); }}>
            로그아웃
          </button>
        }
      />
      <PageBody>
        <h1 className="text-[1.6rem] font-extrabold">관리자</h1>

        <div className="mt-3 space-y-2">
          {!data.system.storeConnected && (
            <Notice tone="error">데이터 저장소(Upstash Redis)가 연결되지 않았어요. 지금은 테스트용 임시 저장소를 쓰고 있어요.</Notice>
          )}
          {!data.system.alimtalkReady && (
            <Notice>
              카카오 알림톡이 아직 <b>설정 전</b>이에요. 알림 신청자 {data.system.alertSubscribers}명에게는 설정이 끝난 뒤 올라오는 공고부터 알림이 가요.
            </Notice>
          )}
          {data.system.alimtalkReady && (
            <Notice tone="ok">카카오 알림톡 켜짐 · 알림 신청자 {data.system.alertSubscribers}명</Notice>
          )}
          {data.system.paymentTestMode && (
            <Notice>결제가 <b>테스트 모드</b>예요. 실제 돈은 빠져나가지 않아요. 토스페이먼츠 가맹 후 실제 키로 바꿔 주세요.</Notice>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="노출 중 공고" value={data.jobs.filter((j) => j.live).length} />
          <Stat label="결제 대기 공고" value={data.jobs.filter((j) => j.status === "pending_payment").length} />
          <Stat label="노출 중 구직" value={data.seekers.filter((s) => s.status === "active" && s.daysLeft > 0).length} />
          <Stat label="확인 대기 기관" value={data.orgs.filter((o) => !o.verified).length} />
        </div>

        <div className="mt-5 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 border-b-[3px] px-4 py-2.5 font-bold ${tab === t.key ? "border-pine text-pine-deep" : "border-transparent text-muted"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {ok && <div id="admin-msg"><Notice tone="ok">{ok}</Notice></div>}
          {error && <Notice tone="error">{error}</Notice>}
        </div>

        {tab === "jobs" && (
          <ul className="mt-3 space-y-2">
            {data.jobs.length === 0 && <EmptyRow text="등록된 공고가 없어요." />}
            {data.jobs.map((j) => (
              <li key={j.id} className="rounded-xl border border-line bg-white p-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <b className="text-[1rem]">{j.orgName}</b>
                  <span className="text-muted">{facilityLabel(j.facility)} · {j.region} {j.area}</span>
                  <JobBadge j={j} />
                </div>
                <p className="mt-1 text-[0.95rem]">{j.payType} {won(j.payAmount)} · {j.schedule} · {j.phone}</p>
                <p className="text-sm text-muted">주소: {j.address || "없음 (주소 입력 전 공고)"}</p>
                {j.alertedAt && <p className="text-sm text-muted">지역 알림 {j.alertCount ?? 0}명에게 발송 ({shortDate(j.alertedAt)})</p>}
                <p className="text-sm text-muted">등록 {shortDate(j.createdAt)} · 종료 {shortDate(j.expiresAt)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="btn-ghost px-3 py-1.5 text-sm" disabled={busy} onClick={() => run("/api/admin/jobs", { id: j.id, action: "extend", days: 7 }, undefined, "7일 연장했어요.")}>7일 연장</button>
                  {j.status === "hidden" ? (
                    <button className="btn-ghost px-3 py-1.5 text-sm" disabled={busy} onClick={() => run("/api/admin/jobs", { id: j.id, action: "show" })}>다시 보이기</button>
                  ) : (
                    <button className="btn-ghost px-3 py-1.5 text-sm" disabled={busy} onClick={() => run("/api/admin/jobs", { id: j.id, action: "hide" }, undefined, "숨겼어요.")}>숨기기</button>
                  )}
                  <button className="btn-ghost px-3 py-1.5 text-sm text-alert" disabled={busy} onClick={() => confirm("이 공고를 완전히 지울까요?") && run("/api/admin/jobs", { id: j.id, action: "delete" }, undefined, "삭제했어요.")}>삭제</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === "seekers" && (
          <ul className="mt-3 space-y-2">
            {data.seekers.length === 0 && <EmptyRow text="등록된 구직 글이 없어요." />}
            {data.seekers.map((s) => (
              <li key={s.id} className="rounded-xl border border-line bg-white p-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <b className="text-[1rem]">{s.name}</b>
                  <span>{s.phone}</span>
                  <span className="text-muted">{s.region} {s.area} · {s.facilities.map(facilityLabel).join(", ")}</span>
                  <span className={`rounded-md px-2 py-0.5 font-bold ${s.status === "active" && s.daysLeft > 0 ? "bg-sage text-pine" : "bg-[#eef0ef] text-muted"}`}>
                    {s.status === "hidden" ? "숨김" : s.status === "closed" ? "마감" : s.daysLeft > 0 ? `노출 ${s.daysLeft}일 남음` : "기간 끝남"}
                  </span>
                </div>
                <p className="text-sm text-muted">등록 {shortDate(s.createdAt)}</p>
                <div className="mt-2 flex gap-2">
                  {s.status === "hidden" ? (
                    <button className="btn-ghost px-3 py-1.5 text-sm" disabled={busy} onClick={() => run("/api/admin/seekers", { id: s.id, action: "show" })}>다시 보이기</button>
                  ) : (
                    <button className="btn-ghost px-3 py-1.5 text-sm" disabled={busy} onClick={() => run("/api/admin/seekers", { id: s.id, action: "hide" }, undefined, "숨겼어요.")}>숨기기</button>
                  )}
                  <button className="btn-ghost px-3 py-1.5 text-sm text-alert" disabled={busy} onClick={() => confirm("이 구직 글을 완전히 지울까요?") && run("/api/admin/seekers", { id: s.id, action: "delete" }, undefined, "삭제했어요.")}>삭제</button>
                  <button
                    className="btn-ghost px-3 py-1.5 text-sm"
                    disabled={busy}
                    onClick={() =>
                      confirm(`${s.name}님(${s.phone})에게 등록된 번호로 전화해 본인 확인을 하셨나요?\n확인을 누르면 새 비밀번호 4자리를 만들어요.`) &&
                      run("/api/admin/reset", { kind: "seeker", id: s.id }, undefined, (r) => `${r.who}님 새 비밀번호: ${r.temp} — 본인에게 알려주세요. (이 번호로 등록한 글 ${r.count}개 모두 적용)`)
                    }
                  >
                    비밀번호 재설정
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === "locations" && <LocationsPanel locations={data.locations} busy={busy} run={run} />}

        {tab === "orgs" && (
          <div className="mt-3 grid gap-6 md:grid-cols-2">
            <section>
              <h2 className="mb-2 font-extrabold">가입 기관 {data.orgs.length}곳</h2>
              <ul className="divide-y divide-line rounded-xl border border-line bg-white">
                {data.orgs.length === 0 && <li className="p-4 text-muted">아직 없어요.</li>}
                {data.orgs.map((o) => (
                  <li key={o.id} className="px-3 py-2.5 text-[0.95rem]">
                    <div className="flex flex-wrap items-center gap-2">
                      <b>{o.name}</b> <span className="text-muted">{facilityLabel(o.facility)}</span>
                      <span className={`rounded-md px-2 py-0.5 text-sm font-bold ${o.verified ? "bg-sage text-pine" : "bg-sun-soft text-ink"}`}>
                        {o.verified ? "확인됨" : "확인 대기"}
                      </span>
                    </div>
                    <div className="text-sm text-muted">{o.phone} · 가입 {shortDate(o.createdAt)} · 무료공고 {o.freeUsed ? "사용함" : "남음"}</div>
                    <div className="text-sm">
                      사업자·기관기호: <b>{o.certNo || "입력 안 함 (예전 가입)"}</b>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                    {o.verified ? (
                      <button
                        className="btn-ghost px-3 py-1 text-sm"
                        disabled={busy}
                        onClick={() =>
                          confirm(`${o.name} 확인을 취소할까요? 공고가 목록에서 내려가고 요양보호사 연락처를 볼 수 없게 돼요.`) &&
                          run("/api/admin/orgs", { id: o.id, action: "unapprove" }, undefined, `${o.name} 확인을 취소했어요.`)
                        }
                      >
                        확인 취소
                      </button>
                    ) : (
                      <button
                        className="btn-primary px-3 py-1 text-sm"
                        disabled={busy}
                        onClick={() =>
                          confirm(`${o.name}의 번호(${o.certNo || "없음"})를 확인하셨나요?\n승인하면 공고가 공개되고 요양보호사 연락처를 볼 수 있어요.`) &&
                          run("/api/admin/orgs", { id: o.id, action: "approve" }, undefined, `${o.name}을(를) 승인했어요. 공고가 공개돼요.`)
                        }
                      >
                        승인
                      </button>
                    )}
                    <button
                      className="btn-ghost px-3 py-1 text-sm"
                      disabled={busy}
                      onClick={() =>
                        confirm(`${o.name}(${o.phone})에 등록된 번호로 전화해 본인 확인을 하셨나요?\n확인을 누르면 임시 비밀번호를 만들어요.`) &&
                        run("/api/admin/reset", { kind: "org", id: o.id }, undefined, (r) => `${r.who} 임시 비밀번호: ${r.temp} — 기관에 알려주고, 로그인 후 '비밀번호 변경'에서 바꾸도록 안내해 주세요.`)
                      }
                    >
                      임시 비밀번호 발급
                    </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="mb-2 font-extrabold">
                결제 {data.orders.length}건 · 합계 {won(data.orders.reduce((a, o) => a + o.amount, 0))}
              </h2>
              <ul className="divide-y divide-line rounded-xl border border-line bg-white">
                {data.orders.length === 0 && <li className="p-4 text-muted">아직 없어요.</li>}
                {data.orders.map((o) => (
                  <li key={o.id} className="flex justify-between px-3 py-2.5 text-[0.95rem]">
                    <span>
                      {shortDate(o.paidAt ?? o.createdAt)} · {data.orgs.find((g) => g.id === o.orgId)?.name ?? "삭제된 기관"}
                      <span className="block text-sm text-muted">{o.method ?? ""} · 주문번호 {o.id}</span>
                    </span>
                    <b>{won(o.amount)}</b>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {tab === "settings" && <SettingsPanel settings={data.settings} busy={busy} run={run} />}
      </PageBody>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2.5">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-[1.4rem] font-extrabold text-pine-deep">{value}</p>
    </div>
  );
}

function JobBadge({ j }: { j: AdminJob }) {
  const [text, cls] =
    j.status === "hidden"
      ? ["숨김", "bg-[#eef0ef] text-muted"]
      : j.status === "closed"
        ? ["마감", "bg-[#eef0ef] text-muted"]
        : j.status === "pending_payment"
          ? ["결제 대기", "bg-sun-soft text-ink"]
          : j.live
            ? [`노출 ${j.daysLeft}일 남음`, "bg-sage text-pine"]
            : ["기간 끝남", "bg-[#eef0ef] text-muted"];
  return <span className={`rounded-md px-2 py-0.5 font-bold ${cls}`}>{text}</span>;
}

function EmptyRow({ text }: { text: string }) {
  return <li className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-muted">{text}</li>;
}

type OkMsg = string | ((res: Record<string, unknown>) => string);
type Run = (url: string, body: unknown, method?: string, okMsg?: OkMsg) => Promise<boolean>;

function LocationsPanel({ locations, busy, run }: { locations: Location[]; busy: boolean; run: Run }) {
  const [region, setRegion] = useState<Region>("경기");
  const [text, setText] = useState("");
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <div className="mt-3 space-y-5">
      <form
        className="space-y-3 rounded-xl border border-line bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const done = await run("/api/admin/locations", { region, names: lines }, undefined, (res) => {
            const added = (res.added as string[]) ?? [];
            const skipped = (res.skipped as string[]) ?? [];
            return `${added.length}곳을 추가했어요.` + (skipped.length ? ` 이미 있던 ${skipped.length}곳(${skipped.join(", ")})은 건너뛰었어요.` : "");
          });
          if (done) setText("");
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="field-label mb-0">기본 시·도</span>
          <select className="field w-28" value={region} onChange={(e) => setRegion(e.target.value as Region)} aria-label="기본 시·도">
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <textarea
          className="field min-h-36 font-[inherit]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"한 줄에 하나씩 적거나 붙여넣으세요\n수원시 장안구\n수원시 권선구\n수원시 팔달구\n수원시 영통구"}
          aria-label="추가할 지역 (한 줄에 하나씩)"
          required
        />
        <p className="text-sm text-muted">
          줄 앞에 &ldquo;서울&rdquo; 또는 &ldquo;경기&rdquo;를 붙이면 그 시·도로 들어가요. 예: <b>서울 강남구</b>. 이미 있는 지역은 자동으로 건너뛰어요.
        </p>
        <button className="btn-primary w-full sm:w-auto" disabled={busy || lines.length === 0}>
          {lines.length > 1 ? `${lines.length}곳 한꺼번에 추가` : "지역 추가"}
        </button>
      </form>
      {REGIONS.map((r) => (
        <section key={r}>
          <h2 className="mb-2 font-extrabold">{r} <span className="font-normal text-muted">{locations.filter((l) => l.region === r).length}곳</span></h2>
          <ul className="flex flex-wrap gap-2">
            {locations.filter((l) => l.region === r).map((l) => (
              <li key={l.id} className="flex items-center gap-1 rounded-full border border-line bg-white py-1 pl-3 pr-1 text-[0.95rem]">
                {l.name}
                <button
                  className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-[#fdf0ea] hover:text-alert"
                  aria-label={`${l.name} 삭제`}
                  disabled={busy}
                  onClick={() => confirm(`${r} ${l.name} 지역을 목록에서 뺄까요? 이미 올라온 글은 그대로 남아요.`) && run(`/api/admin/locations?id=${l.id}`, undefined, "DELETE", "지역을 뺐어요.")}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function SettingsPanel({ settings, busy, run }: { settings: Settings; busy: boolean; run: Run }) {
  const [f, setF] = useState({
    freeDays: String(settings.freeDays),
    paidDays: String(settings.paidDays),
    price: String(settings.price),
    seekerDays: String(settings.seekerDays),
    minWage: String(settings.minWage ?? 10320),
    jobInfoRegNo: settings.jobInfoRegNo ?? "",
    bizNo: settings.bizNo ?? "",
    freeForAll: settings.freeForAll,
  });
  const num = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value.replace(/\D/g, "") });
  return (
    <form
      className="mt-3 max-w-xl space-y-4 rounded-xl border border-line bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        run("/api/admin/settings", f, "PUT", "저장했어요. 새로 올라오는 공고부터 적용돼요.");
      }}
    >
      <Row label="기관 첫 공고 무료 기간" unit="일"><input className="field text-right" inputMode="numeric" value={f.freeDays} onChange={num("freeDays")} /></Row>
      <Row label="유료 결제 금액" unit="원"><input className="field text-right" inputMode="numeric" value={f.price} onChange={num("price")} /></Row>
      <Row label="결제 1회당 노출 기간" unit="일"><input className="field text-right" inputMode="numeric" value={f.paidDays} onChange={num("paidDays")} /></Row>
      <Row label="구직 글 노출 기간" unit="일"><input className="field text-right" inputMode="numeric" value={f.seekerDays} onChange={num("seekerDays")} /></Row>
      <Row label="최저임금 (시급)" unit="원"><input className="field text-right" inputMode="numeric" value={f.minWage} onChange={num("minWage")} /></Row>
      <p className="-mt-2 text-sm text-muted">시급 공고가 이 금액보다 낮으면 등록되지 않아요. 해마다 1월에 새 최저임금으로 바꿔 주세요.</p>
      <div className="space-y-3 border-t border-line pt-4">
        <p className="font-bold">사이트 하단 표시 정보</p>
        <label className="block">
          <span className="field-label">직업정보제공사업 신고번호</span>
          <input className="field" value={f.jobInfoRegNo} onChange={(e) => setF({ ...f, jobInfoRegNo: e.target.value })} placeholder="신고 후 받은 번호" maxLength={40} />
        </label>
        <label className="block">
          <span className="field-label">사업자등록번호 (서연컴퍼니)</span>
          <input className="field" value={f.bizNo} onChange={(e) => setF({ ...f, bizNo: e.target.value })} placeholder="000-00-00000" maxLength={20} />
        </label>
        <p className="text-sm text-muted">비워 두면 하단에 나오지 않아요. 입력하고 저장하면 모든 페이지 하단에 바로 표시돼요.</p>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-sun-soft p-3">
        <input type="checkbox" className="mt-1 h-5 w-5 accent-[#1e5245]" checked={f.freeForAll} onChange={(e) => setF({ ...f, freeForAll: e.target.checked })} />
        <span>
          <b>무료 이벤트 켜기</b>
          <span className="block text-sm text-muted">켜면 모든 기관이 결제 없이 공고를 올리고 연장할 수 있어요. 오픈 초기 홍보용으로 쓰세요.</span>
        </span>
      </label>
      <button className="btn-primary w-full" disabled={busy}>저장</button>
    </form>
  );
}

function Row({ label, unit, children }: { label: string; unit: string; children: React.ReactNode }) {
  return (
    <label className="grid grid-cols-[1fr_8rem_1.5rem] items-center gap-2">
      <span className="font-semibold">{label}</span>
      {children}
      <span className="text-muted">{unit}</span>
    </label>
  );
}
