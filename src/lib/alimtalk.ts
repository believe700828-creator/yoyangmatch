// 카카오 알림톡 (솔라피 발송 대행)
// Vercel 환경변수 5개가 모두 있어야 발송됩니다. 하나라도 없으면 발송하지 않고 조용히 넘어갑니다.
//   SOLAPI_API_KEY, SOLAPI_API_SECRET  : 솔라피 > 개발/연동 > API Key
//   SOLAPI_PFID                        : 솔라피에 연동한 카카오톡 채널의 pfId (KA01PF로 시작)
//   SOLAPI_TEMPLATE_ID                 : 카카오 심사를 통과한 알림톡 템플릿 ID (KA01TP로 시작)
//   SOLAPI_SENDER                      : 솔라피에 등록한 발신번호 (숫자만)
import { createHmac, randomBytes } from "crypto";
import { getAll, getOne, putOne } from "./db";
import { daysLeft, isLive } from "./data";
import { facilityLabel, isVerified, type Job, type Org, type Seeker } from "./types";

const API_URL = process.env.SOLAPI_API_URL || "https://api.solapi.com/messages/v4/send-many/detail";
const DAILY_LIMIT = 5; // 한 사람에게 하루 최대 알림 수 (과다 발송·비용 방지)
const PER_JOB_LIMIT = 300; // 공고 하나로 보내는 최대 인원

export function alimtalkReady(): boolean {
  return Boolean(
    process.env.SOLAPI_API_KEY &&
      process.env.SOLAPI_API_SECRET &&
      process.env.SOLAPI_PFID &&
      process.env.SOLAPI_TEMPLATE_ID &&
      process.env.SOLAPI_SENDER,
  );
}

function authHeader(): string {
  const apiKey = process.env.SOLAPI_API_KEY!;
  const date = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", process.env.SOLAPI_API_SECRET!).update(date + salt).digest("hex");
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

// 템플릿 변수: 카카오에 심사 올린 템플릿 문안의 #{변수} 이름과 똑같아야 합니다
function variablesFor(job: Job, seeker: Seeker): Record<string, string> {
  return {
    "#{이름}": seeker.name,
    "#{지역}": `${job.region} ${job.area}`,
    "#{기관명}": job.orgName,
    "#{기관유형}": facilityLabel(job.facility),
    "#{급여}": `${job.payType} ${job.payAmount.toLocaleString("ko-KR")}원`,
    "#{근무}": job.schedule.slice(0, 40),
  };
}

async function sendBatch(messages: { to: string; variables: Record<string, string> }[]): Promise<number> {
  if (messages.length === 0) return 0;
  const body = {
    messages: messages.map((m) => ({
      to: m.to,
      from: process.env.SOLAPI_SENDER,
      kakaoOptions: {
        pfId: process.env.SOLAPI_PFID,
        templateId: process.env.SOLAPI_TEMPLATE_ID,
        variables: m.variables,
        disableSms: true, // 알림톡 실패 시 문자로 대신 보내지 않음 (문자 비용·광고 규정 방지)
      },
    })),
  };
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as {
    groupInfo?: { count?: { registeredSuccess?: number } };
    errorMessage?: string;
  };
  if (!res.ok) throw new Error(json.errorMessage || `알림톡 발송 실패 (${res.status})`);
  return json.groupInfo?.count?.registeredSuccess ?? messages.length;
}

// 공고가 목록에 공개되는 순간 호출. 같은 지역·기관 유형을 원하는 요양보호사에게 한 번만 알림.
// 실패해도 공고 등록에는 영향이 없도록 오류를 밖으로 던지지 않습니다.
export async function notifyNewJob(jobId: string): Promise<{ sent: number; skipped?: string }> {
  try {
    if (!alimtalkReady()) return { sent: 0, skipped: "알림톡 설정 전" };
    const job = await getOne<Job>("jobs", jobId);
    if (!job || job.alertedAt || !isLive(job)) return { sent: 0, skipped: "이미 보냈거나 공개 전" };
    const org = await getOne<Org>("orgs", job.orgId);
    if (!org || !isVerified(org)) return { sent: 0, skipped: "기관 확인 전" };

    // 먼저 표시해서, 동시에 여러 번 불려도 중복 발송되지 않게 함
    await putOne("jobs", { ...job, alertedAt: new Date().toISOString(), alertCount: 0 });

    const now = Date.now();
    const dayAgo = now - 864e5;
    const seekers = (await getAll<Seeker>("seekers")).filter(
      (s) =>
        s.alertOn &&
        s.status === "active" &&
        daysLeft(s.expiresAt) > 0 &&
        s.region === job.region &&
        s.area === job.area &&
        s.facilities.includes(job.facility),
    );

    // 같은 사람이 글을 여러 개 올렸어도 한 번만
    const byPhone = new Map<string, Seeker>();
    for (const s of seekers) if (!byPhone.has(s.phone)) byPhone.set(s.phone, s);

    const targets = [...byPhone.values()]
      .filter((s) => (s.alertLog ?? []).filter((t) => new Date(t).getTime() > dayAgo).length < DAILY_LIMIT)
      .slice(0, PER_JOB_LIMIT);

    const sent = await sendBatch(targets.map((s) => ({ to: s.phone, variables: variablesFor(job, s) })));

    const stamp = new Date().toISOString();
    await Promise.all(
      targets.map((s) =>
        putOne("seekers", {
          ...s,
          alertLog: [...(s.alertLog ?? []).filter((t) => new Date(t).getTime() > dayAgo), stamp],
        }),
      ),
    );
    const latest = await getOne<Job>("jobs", jobId);
    if (latest) await putOne("jobs", { ...latest, alertCount: sent });
    return { sent };
  } catch (e) {
    console.error("[알림톡]", e);
    return { sent: 0, skipped: "발송 오류" };
  }
}
