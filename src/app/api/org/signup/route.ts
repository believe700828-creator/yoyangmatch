import { NextResponse } from "next/server";
import { hashPassword, setOrgSession } from "@/lib/auth";
import { getOne, putOne } from "@/lib/db";
import { clean, fail, handle, onlyDigits } from "@/lib/data";
import { FACILITIES, type Facility, type Org } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handle(async () => {
    const b = await req.json();
    const name = clean(b.name, 40);
    const phone = onlyDigits(b.phone);
    const password = String(b.password ?? "");
    const facility = b.facility as Facility;
    const certNo = onlyDigits(b.certNo);
    const address = clean(b.address, 80);

    if (!name) return fail("기관명을 입력해 주세요.");
    if (phone.length < 9) return fail("전화번호를 정확히 입력해 주세요.");
    if (password.length < 6) return fail("비밀번호는 6자리 이상으로 정해 주세요.");
    if (!FACILITIES.some((f) => f.key === facility)) return fail("기관 유형을 선택해 주세요.");
    if (address.length < 5) return fail("기관 주소를 입력해 주세요. (예: 용인시 기흥구 ○○로 12)");
    if (certNo.length !== 10 && certNo.length !== 11) {
      return fail("사업자등록번호(10자리) 또는 장기요양기관기호(11자리)를 정확히 입력해 주세요.");
    }

    // 전화번호를 아이디로 사용하므로 중복 확인
    if (await getOne<Org>("orgs", `o${phone}`)) return fail("이미 가입된 전화번호입니다. 로그인해 주세요.", 409);

    const org: Org = {
      id: `o${phone}`,
      name,
      phone,
      pwHash: hashPassword(password),
      facility,
      freeUsed: false,
      createdAt: new Date().toISOString(),
      certNo,
      address,
      verified: false, // 관리자가 확인하면 공고가 공개되고 요양보호사 연락처를 볼 수 있음
    };
    await putOne("orgs", org);
    await setOrgSession(org.id);
    return NextResponse.json({ ok: true }, { status: 201 });
  });
}
