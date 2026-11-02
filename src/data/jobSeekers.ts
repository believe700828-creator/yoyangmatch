export interface JobSeeker {
    id: string;
    name: string;          // 성함 (예: 홍길동)
    phone: string;         // 연락처
    location: string;      // 희망 근무 지역 (예: 용인시 기흥구)
    certifications: string;// 보유 자격증 (예: 요양보호사 1급, 치매교육 이수)
    experience: string;    // 경력 (예: 방문요양 3년)
    workType: string;      // 근무 형태 (예: 방문요양, 주야간보호, 입소시설)
    memo: string;          // 한줄 자기소개 / 희망사항
    createdAt: string;     // 등록일자
  }
  
  const STORAGE_KEY = 'yoyang_job_seekers';
  
  // 기본 초기 구직자 데이터
  const initialJobSeekers: JobSeeker[] = [
    {
      id: '1',
      name: '김보호',
      phone: '010-1234-5678',
      location: '용인시 기흥구',
      certifications: '요양보호사 1급, 운전면허',
      experience: '방문요양 2년',
      workType: '방문요양',
      memo: '오전 시간대 방문요양 선호합니다.',
      createdAt: '2026-11-02',
    },
  ];
  
  // 구직자 목록 가져오기
  export function getJobSeekers(): JobSeeker[] {
    if (typeof window === 'undefined') return initialJobSeekers;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialJobSeekers));
      return initialJobSeekers;
    }
    return JSON.parse(saved);
  }
  
  // 새 구직자 등록하기
  export function addJobSeeker(seeker: Omit<JobSeeker, 'id' | 'createdAt'>): JobSeeker[] {
    const current = getJobSeekers();
    const newSeeker: JobSeeker = {
      ...seeker,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newSeeker, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }