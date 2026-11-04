export type Facility = "visit" | "daycare" | "nursing";

export const FACILITIES: { key: Facility; label: string; short: string }[] = [
  { key: "visit", label: "방문요양센터", short: "방문요양" },
  { key: "daycare", label: "주야간보호센터", short: "주야간보호" },
  { key: "nursing", label: "요양원", short: "요양원" },
];

export const facilityLabel = (f: Facility) => FACILITIES.find((x) => x.key === f)?.short ?? f;

export type Region = "서울" | "경기";
export const REGIONS: Region[] = ["서울", "경기"];

export const PAY_TYPES = ["시급", "일급", "월급", "건별"] as const;
export type PayType = (typeof PAY_TYPES)[number];

export interface Location {
  id: string;
  region: Region;
  name: string; // 예: 용인시 기흥구
}

export interface Settings {
  id: "main";
  freeDays: number; // 기관 첫 공고 무료 노출 일수
  paidDays: number; // 유료 결제 1회당 노출 일수
  price: number; // 유료 결제 금액(원)
  freeForAll: boolean; // 무료 이벤트: 켜면 모든 공고 무료
  seekerDays: number; // 구직 글 노출 일수
  minWage: number; // 최저임금(시급, 원). 해마다 관리자 화면에서 바꿈
  jobInfoRegNo: string; // 직업정보제공사업 신고번호 (사이트 하단 표시)
  bizNo: string; // 운영자 사업자등록번호 (사이트 하단 표시)
  seeded: boolean;
}

export interface Org {
  id: string;
  name: string;
  phone: string; // 로그인 아이디(숫자만)
  pwHash: string;
  facility: Facility;
  freeUsed: boolean;
  createdAt: string;
  certNo?: string; // 사업자등록번호 또는 장기요양기관기호 (숫자만)
  address?: string; // 기관 주소 (공고 등록 시 자동으로 채움)
  verified?: boolean; // 관리자 확인 여부. 값이 없으면(예전 가입 기관) 확인된 것으로 봄
}

export const isVerified = (o: Pick<Org, "verified">) => o.verified !== false;

export type JobStatus = "active" | "pending_payment" | "closed" | "hidden";

export interface Job {
  id: string;
  orgId: string;
  orgName: string;
  facility: Facility;
  region: Region;
  area: string;
  address?: string; // 근무지(기관) 주소 — 직업정보제공사업자 준수사항
  payType: PayType;
  payAmount: number;
  schedule: string;
  duties: string;
  phone: string;
  urgent: boolean;
  status: JobStatus;
  createdAt: string;
  expiresAt: string | null;
}

export interface Seeker {
  id: string;
  name: string;
  phone: string;
  pwHash: string;
  region: Region;
  area: string;
  facilities: Facility[];
  hasLicense: boolean;
  experience: string;
  availableTime: string;
  memo: string;
  status: "active" | "closed" | "hidden";
  createdAt: string;
  expiresAt: string;
}

// 화면에 보내는 구직 정보 (비밀번호·연락처 보호)
export interface PublicSeeker {
  id: string;
  name: string; // 가려진 이름
  region: Region;
  area: string;
  facilities: Facility[];
  hasLicense: boolean;
  experience: string;
  availableTime: string;
  memo: string;
  createdAt: string;
  phone: string | null; // 로그인한 기관에게만
}

export interface PublicJob extends Omit<Job, "orgId"> {
  daysLeft: number;
}

export interface Order {
  id: string; // 토스 주문번호(orderId)
  orgId: string;
  jobId: string;
  amount: number;
  days: number;
  status: "ready" | "paid" | "failed";
  paymentKey?: string;
  method?: string;
  createdAt: string;
  paidAt?: string;
}
