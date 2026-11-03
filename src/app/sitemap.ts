import type { MetadataRoute } from "next";

// 검색엔진에 제출하는 사이트 지도 (https://www.yoyangmatch.com/sitemap.xml)
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.yoyangmatch.com";
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/seekers/new`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/jobs/new`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
