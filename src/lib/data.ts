import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getAll, getOne, putOne, StoreNotConfiguredError } from "./db";
import { isPhonePublic, type Job, type Location, type PublicJob, type PublicSeeker, type Region, type Seeker, type Settings } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  id: "main",
  freeDays: 7,
  paidDays: 30,
  price: 30000,
  freeForAll: false,
  seekerDays: 60,
  minWage: 10320, // 2026년 최저임금
  jobInfoRegNo: "",
  bizNo: "",
  seeded: false,
};

const SEOUL = [
  "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구",
  "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구",
  "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구",
];
const GYEONGGI = [
  "수원시", "성남시", "의정부시", "안양시", "부천시", "광명시", "평택시", "동두천시", "안산시",
  "고양시", "과천시", "구리시", "남양주시", "오산시", "시흥시", "군포시", "의왕시", "하남시",
  "용인시 기흥구", "용인시 수지구", "용인시 처인구", "파주시", "이천시", "안성시", "김포시",
  "화성시", "광주시", "양주시", "포천시", "여주시", "연천군", "가평군", "양평군",
];

export function newId(prefix = ""): string {
  return prefix + Date.now().toString(36) + randomBytes(4).toString("hex");
}

export async function getSettings(): Promise<Settings> {
  let s = await getOne<Settings>("settings", "main");
  if (!s) s = { ...DEFAULT_SETTINGS };
  if (!s.seeded) {
    // 처음 한 번만 기본 지역 목록을 넣습니다 (이후에는 관리자가 추가·삭제)
    let n = 0;
    for (const [region, names] of [["서울", SEOUL], ["경기", GYEONGGI]] as [Region, string[]][]) {
      for (const name of names) {
        await putOne<Location>("locations", { id: `loc${String(n++).padStart(3, "0")}`, region, name });
      }
    }
    s = { ...s, seeded: true };
    await putOne("settings", s);
  }
  return { ...DEFAULT_SETTINGS, ...s };
}

export async function getLocations(): Promise<Location[]> {
  await getSettings();
  const list = await getAll<Location>("locations");
  return list.sort((a, b) => (a.region === b.region ? a.name.localeCompare(b.name, "ko") : a.region === "서울" ? -1 : 1));
}

export const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

export function formatPhone(s: string): string {
  const d = onlyDigits(s);
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return d.startsWith("02") ? `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}` : `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
  return s;
}

export function maskName(name: string): string {
  // 띄어쓰기·보이지 않는 문자는 빼고 글자 수를 셈 (예: "김 영윤" → 김○윤)
  const n = name.replace(/[\s\u200b-\u200d\ufeff]/g, "");
  if (n.length <= 1) return n + "○";
  if (n.length === 2) return n[0] + "○";
  return n[0] + "○".repeat(n.length - 2) + n[n.length - 1];
}

export const addDays = (days: number, from = new Date()) => new Date(from.getTime() + days * 864e5).toISOString();

export function daysLeft(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 864e5));
}

export const isLive = (j: { status: string; expiresAt: string | null }) =>
  j.status === "active" && !!j.expiresAt && new Date(j.expiresAt).getTime() > Date.now();

export function toPublicJob(j: Job): PublicJob {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { orgId, ...rest } = j;
  return { ...rest, daysLeft: daysLeft(j.expiresAt) };
}

export function toPublicSeeker(s: Seeker, showPhone: boolean): PublicSeeker {
  return {
    id: s.id,
    name: maskName(s.name),
    region: s.region,
    area: s.area,
    facilities: s.facilities,
    hasLicense: s.hasLicense,
    experience: s.experience,
    availableTime: s.availableTime,
    memo: s.memo,
    createdAt: s.createdAt,
    phone: showPhone && isPhonePublic(s) ? formatPhone(s.phone) : null,
    phonePublic: isPhonePublic(s),
  };
}

export const clean = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// 모든 API에서 공통으로 쓰는 오류 처리
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof StoreNotConfiguredError) return fail(e.message, 503);
    console.error(e);
    return fail("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", 500);
  }
}
