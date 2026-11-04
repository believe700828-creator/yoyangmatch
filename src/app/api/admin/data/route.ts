import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getAll, hasRemoteStore } from "@/lib/db";
import { daysLeft, fail, formatPhone, getLocations, getSettings, handle, isLive } from "@/lib/data";
import { isTestMode } from "@/lib/toss";
import { isVerified, type Job, type Order, type Org, type Seeker } from "@/lib/types";

export const dynamic = "force-dynamic";

// 관리자 화면에 필요한 모든 데이터
export async function GET() {
  return handle(async () => {
    if (!(await isAdmin())) return fail("관리자 로그인이 필요합니다.", 401);
    const [settings, locations, jobs, seekers, orgs, orders] = await Promise.all([
      getSettings(),
      getLocations(),
      getAll<Job>("jobs"),
      getAll<Seeker>("seekers"),
      getAll<Org>("orgs"),
      getAll<Order>("orders"),
    ]);
    const byNew = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);
    return NextResponse.json({
      settings,
      locations,
      jobs: jobs.sort(byNew).map((j) => ({ ...j, live: isLive(j), daysLeft: daysLeft(j.expiresAt) })),
      seekers: seekers.sort(byNew).map((s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pwHash, ...rest } = s;
        return { ...rest, phone: formatPhone(s.phone), daysLeft: daysLeft(s.expiresAt) };
      }),
      orgs: orgs.sort(byNew).map((o) => ({
        id: o.id,
        name: o.name,
        phone: formatPhone(o.phone),
        facility: o.facility,
        freeUsed: o.freeUsed,
        createdAt: o.createdAt,
        certNo: o.certNo ?? "",
        address: o.address ?? "",
        verified: isVerified(o),
      })),
      orders: orders.filter((o) => o.status === "paid").sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? "")),
      system: { storeConnected: hasRemoteStore, paymentTestMode: isTestMode() },
    });
  });
}
