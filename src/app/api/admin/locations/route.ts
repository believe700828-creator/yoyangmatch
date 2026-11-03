import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteOne, putOne } from "@/lib/db";
import { clean, fail, getLocations, handle, newId } from "@/lib/data";
import { REGIONS, type Location, type Region } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    if (!(await isAdmin())) return fail("관리자 로그인이 필요합니다.", 401);
    const b = await req.json();
    const region = b.region as Region;
    const name = clean(b.name, 40);
    if (!REGIONS.includes(region)) return fail("서울 또는 경기를 선택해 주세요.");
    if (!name) return fail("지역 이름을 입력해 주세요.");
    const list = await getLocations();
    if (list.some((l) => l.region === region && l.name === name)) return fail("이미 있는 지역입니다.");
    await putOne<Location>("locations", { id: newId("loc"), region, name });
    return NextResponse.json({ ok: true }, { status: 201 });
  });
}

export async function DELETE(req: Request) {
  return handle(async () => {
    if (!(await isAdmin())) return fail("관리자 로그인이 필요합니다.", 401);
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return fail("삭제할 지역을 골라 주세요.");
    await deleteOne("locations", id);
    return NextResponse.json({ ok: true });
  });
}
