import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const ORG_COOKIE = "ym_org";
const ADMIN_COOKIE = "ym_admin";

function secret(): string {
  const s =
    process.env.SESSION_SECRET ||
    // 환경변수가 없을 때도 서버마다 고유한 값이 되도록 저장소 토큰/관리자 비밀번호로 만듭니다
    createHmac("sha256", "yoyangmatch")
      .update((process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "") + (process.env.ADMIN_PASSWORD || "local-dev"))
      .digest("hex");
  return s;
}

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(pw, salt, 32);
  const real = Buffer.from(hash, "hex");
  return real.length === test.length && timingSafeEqual(real, test);
}

function sign(value: string): string {
  const sig = createHmac("sha256", secret()).update(value).digest("base64url");
  return `${value}.${sig}`;
}

function unsign(token: string | undefined): string | null {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const value = token.slice(0, i);
  const expected = sign(value);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const [, exp] = value.split("|");
  if (!exp || Number(exp) < Date.now()) return null;
  return value.split("|")[0];
}

const cookieOpts = (days: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: days * 24 * 60 * 60,
});

export async function setOrgSession(orgId: string) {
  const days = 30;
  (await cookies()).set(ORG_COOKIE, sign(`${orgId}|${Date.now() + days * 864e5}`), cookieOpts(days));
}

export async function getOrgId(): Promise<string | null> {
  return unsign((await cookies()).get(ORG_COOKIE)?.value);
}

export async function clearOrgSession() {
  (await cookies()).delete(ORG_COOKIE);
}

export function adminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) || process.env.NODE_ENV !== "production";
}

export function checkAdminPassword(pw: string): boolean {
  // 내 컴퓨터 테스트용 기본 비밀번호: admin1234 (실제 사이트에서는 ADMIN_PASSWORD 환경변수 필수)
  // 앞뒤 공백은 무시 (복사·붙여넣기할 때 공백이 섞여 들어가는 경우가 많음)
  const real = (process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "admin1234" : "")).trim();
  if (!real) return false;
  const a = Buffer.from(pw.trim());
  const b = Buffer.from(real);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function setAdminSession() {
  const days = 7;
  (await cookies()).set(ADMIN_COOKIE, sign(`admin|${Date.now() + days * 864e5}`), cookieOpts(days));
}

export async function isAdmin(): Promise<boolean> {
  return (await unsign((await cookies()).get(ADMIN_COOKIE)?.value)) === "admin";
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
