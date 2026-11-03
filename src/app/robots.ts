import type { MetadataRoute } from "next";

// 검색엔진(네이버·구글)에게 어떤 페이지를 읽어도 되는지 알려주는 파일
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/org", "/pay/"] },
    sitemap: "https://www.yoyangmatch.com/sitemap.xml",
  };
}
