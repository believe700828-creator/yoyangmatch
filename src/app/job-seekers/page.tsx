'use client';

import { useState, useEffect } from 'react';
import { getJobSeekers, addJobSeeker, JobSeeker } from '@/data/jobSeekers';

export default function JobSeekersPage() {
  const [seekers, setSeekers] = useState<JobSeeker[]>([]);
  
  // 입력 폼 상태
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [certifications, setCertifications] = useState('요양보호사 1급');
  const [experience, setExperience] = useState('');
  const [workType, setWorkType] = useState('방문요양');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    setSeekers(getJobSeekers());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !location) {
      alert('성함, 연락처, 희망 지역은 필수 입력 항목입니다.');
      return;
    }

    const updated = addJobSeeker({
      name,
      phone,
      location,
      certifications,
      experience: experience || '신입',
      workType,
      memo,
    });

    setSeekers(updated);
    alert('구직 프로필이 성공적으로 등록되었습니다!');
    
    // 폼 초기화
    setName('');
    setPhone('');
    setLocation('');
    setExperience('');
    setMemo('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#0070f3' }}>🤝 요양보호사 구직 등록 및 인재 정보</h1>
      <p style={{ color: '#666' }}>일자리를 찾으시는 요양보호사 선생님은 아래 프로필을 등록해 주세요.</p>

      {/* 구직 등록 폼 */}
      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3>📝 구직 프로필 등록하기</h3>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="성함 *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="연락처 (예: 010-0000-0000) *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="희망 근무 지역 (예: 용인시 기흥구 영덕동) *"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <select 
            value={workType} 
            onChange={(e) => setWorkType(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="방문요양">방문요양</option>
            <option value="주야간보호">주야간보호</option>
            <option value="입소시설">입소시설</option>
            <option value="병원간병">병원간병</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="보유 자격증 (예: 요양보호사 1급, 운전면허)"
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="경력 (예: 방문요양 2년 또는 신입)"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <textarea
          placeholder="한줄 자기소개 및 희망 근무시간 (예: 오전 9시 ~ 12시 희망합니다)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
        />

        <button 
          type="submit" 
          style={{ padding: '12px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          구직 프로필 무료 등록하기
        </button>
      </form>

      {/* 등록된 구직자 목록 */}
      <h2>📋 등록된 인재 프로필 목록</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {seekers.map((item) => (
          <div key={item.id} style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '8px', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                {item.name} 선생님 <span style={{ fontSize: '14px', color: '#0070f3', fontWeight: 'normal' }}>[{item.workType}]</span>
              </span>
              <span style={{ color: '#888', fontSize: '13px' }}>{item.createdAt}</span>
            </div>
            <p style={{ margin: '4px 0', color: '#555' }}>📍 <strong>희망지역:</strong> {item.location}</p>
            <p style={{ margin: '4px 0', color: '#555' }}>🎖️ <strong>자격증/경력:</strong> {item.certifications} | {item.experience}</p>
            <p style={{ margin: '4px 0', color: '#555' }}>📞 <strong>연락처:</strong> {item.phone}</p>
            {item.memo && <p style={{ margin: '8px 0 0 0', padding: '8px', background: '#f5f5f5', borderRadius: '4px', color: '#444' }}>💬 {item.memo}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}