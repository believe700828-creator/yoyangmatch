import type { Metadata } from "next";
import { BackLink, PageBody, SiteFooter, SiteHeader } from "@/components/Shell";
import { CONTACT_EMAIL, CONTACT_PHONE, OPERATOR } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보 처리방침 | 요양매칭",
  description: "요양매칭(yoyangmatch.com) 개인정보 처리방침",
};

// 운영자·연락처는 src/lib/site.ts 에서 바꿉니다. 내용이 바뀌면 시행일도 새 날짜로 바꾸세요
const OFFICER = "요양매칭 운영팀";
const PHONE = CONTACT_PHONE;
const EMAIL = CONTACT_EMAIL;
const EFFECTIVE = "2026년 11월 3일";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="pt-4 text-[1.15rem] font-extrabold text-pine-deep">{title}</h2>
      <div className="space-y-2 text-[0.97rem] leading-relaxed text-ink">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[34rem] border-collapse text-left text-[0.92rem]">
        <thead>
          <tr className="bg-sage">
            {head.map((h) => (
              <th key={h} className="border-b border-line px-3 py-2 font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="align-top">
              {r.map((c, j) => (
                <td key={j} className="whitespace-pre-line border-b border-line px-3 py-2">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <PageBody narrow>
        <BackLink />
        <h1 className="text-[1.6rem] font-extrabold">개인정보 처리방침</h1>
        <p className="mt-2 text-[0.97rem] text-muted">
          {OPERATOR}(이하 &ldquo;회사&rdquo;)는 요양매칭(yoyangmatch.com, 이하 &ldquo;사이트&rdquo;)을 운영하며, 「개인정보 보호법」에 따라
          이용자의 개인정보를 보호하고 관련 고충을 신속하게 처리하기 위해 다음과 같이 개인정보 처리방침을 둡니다.
        </p>

        <Section title="1. 개인정보의 처리 목적">
          <ul className="list-disc space-y-1 pl-5">
            <li>요양보호사 구직 정보 게시 및 요양기관과의 채용 연락 연결</li>
            <li>요양기관 회원 가입, 로그인, 구인공고 등록·관리</li>
            <li>유료 공고 결제, 결제 확인 및 환불 처리</li>
            <li>허위 공고·부정 이용 방지, 문의 응대</li>
          </ul>
        </Section>

        <Section title="2. 처리하는 개인정보 항목">
          <Table
            head={["구분", "항목"]}
            rows={[
              ["요양보호사(구직 등록)", "필수: 이름, 휴대폰 번호, 희망 근무 지역, 희망 근무 형태, 자격증 보유 여부, 관리용 비밀번호(암호화 저장)\n선택: 경력, 가능한 시간, 하고 싶은 말"],
              ["요양기관(회원)", "기관명, 기관 유형, 기관 전화번호(아이디), 비밀번호(암호화 저장), 구인공고 내용(문의 전화번호 포함)"],
              ["결제", "주문번호, 결제 금액, 결제 수단 종류, 결제 일시 (카드번호 등 결제 정보는 회사가 저장하지 않고 결제대행사가 처리)"],
              ["자동 수집", "로그인 유지를 위한 쿠키, 서비스 이용 과정에서 생성되는 접속 기록(IP 주소, 접속 일시 등)"],
            ]}
          />
        </Section>

        <Section title="3. 개인정보의 처리 및 보유 기간">
          <Table
            head={["구분", "보유 기간"]}
            rows={[
              ["구직 등록 정보", "노출 기간(기본 60일)이 끝난 뒤 30일이 지나면 자동 삭제. 그 전에도 '내 구직 글 관리'에서 언제든 즉시 삭제 가능"],
              ["요양기관 회원 정보", "회원 탈퇴 요청 시까지 (탈퇴는 아래 연락처로 요청)"],
              ["결제·환불 기록", "5년 (전자상거래 등에서의 소비자보호에 관한 법률)"],
              ["소비자 불만·분쟁 처리 기록", "3년 (전자상거래 등에서의 소비자보호에 관한 법률)"],
              ["접속 기록", "3개월 (통신비밀보호법)"],
            ]}
          />
        </Section>

        <Section title="4. 개인정보의 제3자 제공">
          <p>
            회사는 이용자의 개인정보를 처리 목적 범위 안에서만 이용합니다. 다만 요양보호사가 구직 등록 시 동의한 경우, 채용 연락을 위해
            <b> 로그인한 요양기관 회원</b>에게 휴대폰 번호와 구직 정보를 공개합니다. 이름은 &ldquo;김○순&rdquo;처럼 일부를 가려 보여줍니다.
          </p>
          <p>그 밖에는 법령에 근거가 있거나 수사기관의 적법한 요청이 있는 경우를 제외하고 제3자에게 제공하지 않습니다.</p>
        </Section>

        <Section title="5. 개인정보 처리의 위탁 및 국외 이전">
          <p>회사는 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
          <Table
            head={["수탁자", "위탁 업무", "이전 국가"]}
            rows={[
              ["Vercel Inc.", "웹사이트 호스팅 및 운영", "미국"],
              ["Upstash Inc.", "사이트 데이터 저장(데이터베이스)", "미국"],
              ["(주)토스페이먼츠", "유료 공고 결제 처리", "대한민국"],
            ]}
          />
          <p className="text-[0.92rem] text-muted">
            국외 이전 항목은 위 2번의 항목이며, 서비스 이용 시 네트워크를 통해 전송·보관되고 위 3번의 보유 기간 동안 보관됩니다.
            국외 이전을 원하지 않으시면 서비스 이용(구직 등록·회원 가입)을 하지 않거나 삭제를 요청하실 수 있으며, 이 경우 서비스 이용이 제한됩니다.
          </p>
        </Section>

        <Section title="6. 개인정보의 파기 절차 및 방법">
          <p>보유 기간이 끝나거나 처리 목적이 달성되면 지체 없이 파기합니다. 전자 파일 형태의 정보는 복구할 수 없는 방법으로 삭제합니다.</p>
        </Section>

        <Section title="7. 이용자의 권리와 행사 방법">
          <p>이용자는 언제든지 자신의 개인정보 열람, 정정, 삭제, 처리 정지를 요구할 수 있습니다.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>요양보호사: 사이트 하단 &lsquo;내 구직 글 관리&rsquo;에서 직접 마감·삭제</li>
            <li>비밀번호를 잊은 경우: 아래 연락처로 문의하시면 등록된 전화번호로 본인 확인 후 임시 비밀번호를 발급합니다.</li>
            <li>그 밖의 요청: 아래 개인정보 보호책임자 연락처로 요청하시면 지체 없이 처리합니다.</li>
          </ul>
        </Section>

        <Section title="8. 개인정보의 안전성 확보 조치">
          <ul className="list-disc space-y-1 pl-5">
            <li>비밀번호는 복원할 수 없는 방식으로 암호화하여 저장</li>
            <li>모든 통신은 보안 연결(HTTPS)로 암호화</li>
            <li>요양보호사 연락처는 로그인한 기관 회원에게만 공개, 이름 일부 가림</li>
            <li>관리자 화면은 별도 비밀번호로 접근 제한</li>
          </ul>
        </Section>

        <Section title="9. 쿠키의 사용">
          <p>
            사이트는 로그인 상태를 유지하기 위한 쿠키만 사용하며, 광고·추적용 쿠키는 사용하지 않습니다. 브라우저 설정에서 쿠키를 거부할 수
            있으나, 이 경우 기관 로그인 등 일부 기능을 이용할 수 없습니다.
          </p>
        </Section>

        <Section title="10. 개인정보 보호책임자">
          <div className="rounded-xl border border-line bg-white p-4">
            <p><b>담당:</b> {OFFICER}</p>
            <p><b>전화:</b> <a href={`tel:${PHONE.replace(/\D/g, "")}`} className="underline underline-offset-2">{PHONE}</a></p>
            <p><b>이메일:</b> <a href={`mailto:${EMAIL}`} className="underline underline-offset-2">{EMAIL}</a></p>
          </div>
        </Section>

        <Section title="11. 권익 침해 구제 방법">
          <p>개인정보 침해에 대한 신고나 상담이 필요하시면 아래 기관에 문의하실 수 있습니다.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>개인정보침해신고센터: 국번 없이 118 (privacy.kisa.or.kr)</li>
            <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
            <li>대검찰청: 국번 없이 1301 (www.spo.go.kr)</li>
            <li>경찰청: 국번 없이 182 (ecrm.police.go.kr)</li>
          </ul>
        </Section>

        <Section title="12. 처리방침의 변경">
          <p>이 개인정보 처리방침은 {EFFECTIVE}부터 시행합니다. 내용이 바뀌면 사이트를 통해 알려드립니다.</p>
        </Section>
      </PageBody>
      <SiteFooter />
    </>
  );
}
