import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "요양웹 | 수도권 요양보호사 구인구직",
  description: "서울·경기 방문요양, 주야간보호, 요양원 요양보호사 일자리와 인재 정보를 한곳에서.",
  metadataBase: new URL("https://www.yoyangmatch.com"),
  openGraph: {
    title: "요양웹 | 수도권 요양보호사 구인구직",
    description: "서울·경기 방문요양, 주야간보호, 요양원 일자리와 요양보호사 인재 정보",
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e5245",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
