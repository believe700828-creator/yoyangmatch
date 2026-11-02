'use client';

import { useState, useEffect } from 'react';
import { getLocations, addLocation, deleteLocation, LocationItem } from '@/data/locations';

export default function AdminLocationPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [category, setCategory] = useState<'서울' | '경기' | '인천' | '기타'>('서울');
  const [name, setName] = useState('');

  // 페이지가 열릴 때 브라우저 저장소(localStorage)에서 지역 목록 불러오기
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = () => {
    const data = getLocations();
    setLocations(data);
  };

  // 지역 추가 함수 (localStorage에 즉시 저장 및 반영)
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('지역 이름을 입력해주세요.');
      return;
    }

    addLocation(category, name.trim());
    setName('');
    fetchLocations();
    alert('지역이 성공적으로 추가되었습니다!');
  };

  // 지역 삭제 함수
  const handleDelete = (id: string) => {
    if (confirm('정말 이 지역을 삭제하시겠습니까?')) {
      deleteLocation(id);
      fetchLocations();
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>⚙️ 관리자 지역 목록·설정</h2>

      {/* 지역 추가 폼 */}
      <form onSubmit={handleAddLocation} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value as any)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="서울">서울</option>
          <option value="경기">경기</option>
          <option value="인천">인천</option>
          <option value="기타">기타</option>
        </select>
        
        <input
          type="text"
          placeholder="추가할 지역명 (예: 수원시 영통구)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <button 
          type="submit" 
          style={{ padding: '8px 16px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          추가
        </button>
      </form>

      {/* 등록된 지역 목록 */}
      <h3>등록된 지역 리스트</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {locations.map((loc) => (
          <li key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee', alignItems: 'center' }}>
            <span>[{loc.category}] <strong>{loc.name}</strong></span>
            <button 
              onClick={() => handleDelete(loc.id)}
              style={{ padding: '4px 8px', backgroundColor: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}