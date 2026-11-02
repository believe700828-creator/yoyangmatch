export interface LocationItem {
    id: string;
    category: string;
    name: string;
}

export const initialLocations: LocationItem[] = [
    { id: '1', category: '경기', name: '경기 용인시 기흥구' },
    { id: '2', category: '경기', name: '경기 수원시 영통구' },
    { id: '3', category: '서울', name: '서울 강남구' },
];

// 브라우저 환경에서 저장된 지역까지 불러오는 함수
export function getLocations(): LocationItem[] {
    if (typeof window === 'undefined') return initialLocations;
    try {
        const saved = localStorage.getItem('yoyang_custom_locations');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error(e);
    }
    return initialLocations;
}

// 새로운 지역을 추가하고 저장하는 함수
export function addLocation(category: string, name: string): LocationItem[] {
    const current = getLocations();
    const newItem: LocationItem = {
        id: Date.now().toString(),
        category,
        name,
    };
    const updated = [newItem, ...current];
    if (typeof window !== 'undefined') {
        localStorage.setItem('yoyang_custom_locations', JSON.stringify(updated));
    }
    return updated;
}
// 지역 삭제 함수 수정
export function deleteLocation(id: string) {
    if (typeof window === 'undefined') return;
    const locations = getLocations();
    const filtered = locations.filter((item) => item.id !== id);
    localStorage.setItem('yoyang_locations', JSON.stringify(filtered));
    return filtered;
  }