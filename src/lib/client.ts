"use client";

import { useCallback, useEffect, useState } from "react";
import type { Facility, Location } from "./types";

export async function api<T = Record<string, unknown>>(url: string, body?: unknown, method?: string): Promise<T> {
  const res = await fetch(url, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error || "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  return json as T;
}

export interface Meta {
  locations: Location[];
  settings: { freeDays: number; paidDays: number; price: number; freeForAll: boolean; seekerDays: number };
  org: { id: string; name: string; facility: Facility; freeUsed: boolean } | null;
}

export function useMeta() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState("");
  const reload = useCallback(() => {
    api<Meta>("/api/meta")
      .then((m) => {
        setMeta(m);
        setError("");
      })
      .catch((e: Error) => setError(e.message));
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { meta, error, reload };
}

export const won = (n: number) => n.toLocaleString("ko-KR") + "원";

export function formatPhoneInput(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  }
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export function ago(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const day = Math.floor(diff / 864e5);
  if (day <= 0) {
    const h = Math.floor(diff / 36e5);
    return h <= 0 ? "방금 등록" : `${h}시간 전`;
  }
  if (day < 7) return `${day}일 전`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export const shortDate = (iso: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};
