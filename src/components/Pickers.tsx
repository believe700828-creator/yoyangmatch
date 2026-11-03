"use client";

import { FACILITIES, REGIONS, type Facility, type Location, type Region } from "@/lib/types";

// 지역 선택: 서울/경기 → 구·시
export function AreaPicker({
  locations,
  region,
  area,
  onChange,
  allowAll,
  idPrefix = "area",
}: {
  locations: Location[];
  region: Region | "";
  area: string;
  onChange: (region: Region | "", area: string) => void;
  allowAll?: boolean;
  idPrefix?: string;
}) {
  const areas = locations.filter((l) => l.region === region);
  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        id={`${idPrefix}-region`}
        aria-label="시·도"
        className="field"
        value={region}
        onChange={(e) => onChange(e.target.value as Region | "", "")}
      >
        {allowAll ? <option value="">서울·경기</option> : <option value="">시·도 선택</option>}
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {allowAll ? `${r} 전체` : r}
          </option>
        ))}
      </select>
      <select
        id={`${idPrefix}-area`}
        aria-label="구·시"
        className="field"
        value={area}
        disabled={!region}
        onChange={(e) => onChange(region, e.target.value)}
      >
        <option value="">{allowAll ? "전체 지역" : region ? "구·시 선택" : "시·도를 먼저 선택"}</option>
        {areas.map((l) => (
          <option key={l.id} value={l.name}>
            {l.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FacilityChips({
  value,
  onChange,
  multiple,
  withAll,
}: {
  value: Facility[];
  onChange: (v: Facility[]) => void;
  multiple?: boolean;
  withAll?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2" role="group">
      {withAll && (
        <button type="button" className="chip" aria-pressed={value.length === 0} onClick={() => onChange([])}>
          전체
        </button>
      )}
      {FACILITIES.map((f) => {
        const on = value.includes(f.key);
        return (
          <button
            key={f.key}
            type="button"
            className="chip"
            aria-pressed={on}
            onClick={() => {
              if (!multiple) return onChange(on && withAll ? [] : [f.key]);
              onChange(on ? value.filter((x) => x !== f.key) : [...value, f.key]);
            }}
          >
            {f.short}
          </button>
        );
      })}
    </div>
  );
}

export const facilityDot: Record<Facility, string> = {
  visit: "bg-visit",
  daycare: "bg-daycare",
  nursing: "bg-nursing",
};

export const facilityText: Record<Facility, string> = {
  visit: "text-visit",
  daycare: "text-daycare",
  nursing: "text-nursing",
};
