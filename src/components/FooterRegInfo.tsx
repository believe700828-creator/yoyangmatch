"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";

// 사이트 하단: 사업자등록번호·직업정보제공사업 신고번호 (관리자 화면 '요금·기간'에서 입력)
export function FooterRegInfo() {
  const [info, setInfo] = useState<{ bizNo: string; jobInfoRegNo: string } | null>(null);
  useEffect(() => {
    api<{ settings: { bizNo: string; jobInfoRegNo: string } }>("/api/meta")
      .then((m) => setInfo(m.settings))
      .catch(() => setInfo(null));
  }, []);
  if (!info || (!info.bizNo && !info.jobInfoRegNo)) return null;
  return (
    <p>
      {[info.bizNo && `사업자등록번호 ${info.bizNo}`, info.jobInfoRegNo && `직업정보제공사업 신고번호 ${info.jobInfoRegNo}`]
        .filter(Boolean)
        .join(" · ")}
    </p>
  );
}
