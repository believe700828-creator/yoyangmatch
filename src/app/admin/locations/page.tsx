'use client';

import { useState, useEffect } from 'react';

interface LocationItem {
  id: string;
  category: string;
  name: string;
}

export default function AdminLocationPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [category, setCategory] = useState('경기');
  const [name, setName] = useState('');

  const fetchLocations = async () => {
    const res = await fetch('/api/locations');
    const data = await res.json();
    setLocations(data);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('지역 이름을 입력하세요!');

    const res = await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, name }),
    });

    if (res.ok) {
      setName('');
      fetchLocations();
      alert('새 지역이 추가되었습니다!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 지역을 삭제하시겠습니까?')) return;

    const res = await fetch('/api/locations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      fetchLocations();
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>⚙️ 관리자 지역 목록 설정</h2>
      
      <form onSubmit={handleAddLocation} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '8px' }}>
          <option value="서울">서울</option>
          <option value="경기">경기</option>
          <option value="인천">인천</option>
          <option value="기타">기타</option>
        </select>
        <input
          type="text"
          placeholder="예: 경기 용인시 수지구"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          추가하기
        </button>
      </form>

      <h3>현재 등록된 지역 ({locations.length}개)</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {locations.map((loc) => (
          <li key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <span><strong>[{loc.category}]</strong> {loc.name}</span>
            <button onClick={() => handleDelete(loc.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}