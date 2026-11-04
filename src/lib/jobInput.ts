import { clean, formatPhone, onlyDigits } from "./data";
import { FACILITIES, PAY_TYPES, REGIONS, type Facility, type Job, type PayType, type Region } from "./types";

export type JobFields = Pick<
  Job,
  "facility" | "region" | "area" | "address" | "payType" | "payAmount" | "schedule" | "duties" | "phone" | "urgent"
>;

// 공고 등록·수정에서 같이 쓰는 입력 검사. 문제가 있으면 오류 문장을, 없으면 정리된 값을 돌려줍니다.
// minWage: 최저임금(시급). 직업정보제공사업자 준수사항에 따라 미달 구인정보는 받지 않습니다.
export function parseJobInput(b: Record<string, unknown>, minWage: number): { error: string } | { fields: JobFields } {
  const facility = b.facility as Facility;
  const region = b.region as Region;
  const payType = b.payType as PayType;
  const payAmount = Number(onlyDigits(String(b.payAmount ?? "")));
  const area = clean(b.area, 40);
  const address = clean(b.address, 80);
  const schedule = clean(b.schedule, 100);
  const duties = clean(b.duties, 300);
  const phone = onlyDigits(String(b.phone ?? ""));

  if (!FACILITIES.some((f) => f.key === facility)) return { error: "기관 유형을 선택해 주세요." };
  if (!REGIONS.includes(region) || !area) return { error: "근무 지역을 선택해 주세요." };
  if (address.length < 5) return { error: "기관 주소를 입력해 주세요. (예: 용인시 기흥구 ○○로 12)" };
  if (!PAY_TYPES.includes(payType) || !payAmount) return { error: "급여 금액을 숫자로 입력해 주세요." };
  if (payType === "시급" && minWage > 0 && payAmount < minWage) {
    return { error: `시급은 최저임금(${minWage.toLocaleString("ko-KR")}원) 이상이어야 올릴 수 있어요.` };
  }
  if (!schedule) return { error: "근무 요일과 시간을 입력해 주세요." };
  if (!duties) return { error: "담당 업무를 입력해 주세요." };
  if (phone.length < 9) return { error: "문의 전화번호를 정확히 입력해 주세요." };

  return {
    fields: {
      facility,
      region,
      area,
      address,
      payType,
      payAmount,
      schedule,
      duties,
      phone: formatPhone(phone),
      urgent: Boolean(b.urgent),
    },
  };
}
