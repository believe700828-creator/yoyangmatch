import { NextResponse } from "next/server";
import { getOrgId } from "@/lib/auth";
import { getOne } from "@/lib/db";
import { getLocations, getSettings, handle } from "@/lib/data";
import { isVerified, type Org } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const [settings, orgId] = await Promise.all([getSettings(), getOrgId()]);
    const locations = await getLocations();
    const org = orgId ? await getOne<Org>("orgs", orgId) : null;
    return NextResponse.json({
      locations,
      settings: {
        freeDays: settings.freeDays,
        paidDays: settings.paidDays,
        price: settings.price,
        freeForAll: settings.freeForAll,
        seekerDays: settings.seekerDays,
        minWage: settings.minWage,
        jobInfoRegNo: settings.jobInfoRegNo,
        bizNo: settings.bizNo,
      },
      org: org
        ? { id: org.id, name: org.name, facility: org.facility, freeUsed: org.freeUsed, verified: isVerified(org) }
        : null,
    });
  });
}
