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
    const defaultRegion = b.region as Region;
    if (!REGIONS.includes(defaultRegion)) return fail("서울 또는 경기를 선택해 주세요.");

    // 한 줄에 하나씩. 줄 앞에 "서울 " 또는 "경기 "를 붙이면 그 지역으로 들어갑니다.
    const raw: string[] = Array.isArray(b.names) ? b.names : [b.name];
    const items: { region: Region; name: string }[] = [];
    for (const line of raw) {
      let text = clean(line, 60).replace(/\s+/g, " ");
      let region = defaultRegion;
      const prefix = REGIONS.find((r) => text.startsWith(r + " "));
      if (prefix) {
        region = prefix;
        text = text.slice(prefix.length + 1).trim();
      }
      const name = text.slice(0, 40);
      if (name && !items.some((i) => i.region === region && i.name === name)) items.push({ region, name });
    }
    if (items.length === 0) return fail("지역 이름을 입력해 주세요.");
    if (items.length > 100) return fail("한 번에 100개까지 추가할 수 있어요.");

    const list = await getLocations();
    const added: string[] = [];
    const skipped: string[] = [];
    for (const it of items) {
      if (list.some((l) => l.region === it.region && l.name === it.name)) {
        skipped.push(`${it.region} ${it.name}`);
        continue;
      }
      await putOne<Location>("locations", { id: newId("loc"), region: it.region, name: it.name });
      added.push(`${it.region} ${it.name}`);
    }
    if (added.length === 0 && items.length === 1) return fail("이미 있는 지역입니다.");
    return NextResponse.json({ ok: true, added, skipped }, { status: 201 });
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
