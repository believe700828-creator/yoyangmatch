export interface LocationItem {
    id: string;
    category: string;
    name: string;
  }
  
  export let initialLocations: LocationItem[] = [
    { id: '1', category: '경기', name: '경기 용인시 기흥구' },
    { id: '2', category: '경기', name: '경기 수원시 영통구' },
    { id: '3', category: '서울', name: '서울 강남구' },
  ];