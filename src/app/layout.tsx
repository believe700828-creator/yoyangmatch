import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

// 검색엔진 소유 확인 코드: 네이버 서치어드바이저 / 구글 서치콘솔에서 받은 content 값을 넣으세요
const NAVER_VERIFICATION = "d4e3c8a9124ea542f87ea7b7af3a5b383d3eca9b";
const GOOGLE_VERIFICATION = "";

export const metadata: Metadata = {
  title: "요양매칭 | 수도권 요양보호사 구인구직",
  description: "요양매칭은 서울·경기 방문요양, 주야간보호, 요양원 요양보호사 일자리와 인재 정보를 한곳에서 찾는 구인구직 사이트입니다.",
  applicationName: "요양매칭",
  keywords: ["요양매칭", "요양보호사 구인", "요양보호사 구직", "방문요양 구인", "주야간보호 구인", "요양원 구인", "경기 요양보호사", "서울 요양보호사"],
  alternates: { canonical: "/" },
  verification: {
    ...(GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : {}),
    ...(NAVER_VERIFICATION ? { other: { "naver-site-verification": NAVER_VERIFICATION } } : {}),
  },
  metadataBase: new URL("https://www.yoyangmatch.com"),
  openGraph: {
    title: "요양매칭 | 수도권 요양보호사 구인구직",
    description: "서울·경기 방문요양, 주야간보호, 요양원 일자리와 요양보호사 인재 정보",
    siteName: "요양매칭",
    url: "https://www.yoyangmatch.com",
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e5245",
  colorScheme: "light", // 휴대폰 다크 모드에서도 밝은 화면 유지
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
