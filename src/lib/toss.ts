// 토스페이먼츠 (결제창 / API 개별 연동 키)
// 환경변수가 없으면 토스페이먼츠 공식 샘플에 공개된 "테스트 키"를 사용합니다.
// 테스트 키로는 실제 돈이 빠져나가지 않습니다. 가맹 심사 후 Vercel 환경변수에 실제 키(live_ck_, live_sk_)를 넣으면 실결제로 바뀝니다.
const SAMPLE_CLIENT_KEY = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const SAMPLE_SECRET_KEY = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";

export const tossClientKey = () => process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || SAMPLE_CLIENT_KEY;
const tossSecretKey = () => process.env.TOSS_SECRET_KEY || SAMPLE_SECRET_KEY;

export const isTestMode = () => tossClientKey().startsWith("test_");

export interface TossConfirmResult {
  ok: boolean;
  method?: string;
  message?: string;
}

export async function confirmTossPayment(paymentKey: string, orderId: string, amount: number): Promise<TossConfirmResult> {
  const auth = Buffer.from(`${tossSecretKey()}:`).toString("base64");
  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ paymentKey, orderId, amount }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { method?: string; message?: string; code?: string };
  if (!res.ok) return { ok: false, message: json.message || "결제 승인에 실패했습니다." };
  return { ok: true, method: json.method };
}
