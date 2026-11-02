'use client';

import { useState, useEffect } from 'react';

interface JobSeeker {
  id: string;
  name: string;
  phone: string;
  region: string;
  serviceType: string;
  license: string;
  experience: string;
  introduction: string;
  date: string;
}

export default function JobSeekersPage() {
  const [seekers, Seekers] = useState<JobSeeker[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [serviceType, setServiceType] = useState('방문요양');
  const [license, setLicense] = useState('요양보호사 1급');
  const [experience, setExperience] = useState('');
  const [introduction, setIntroduction] = useState('');

  // 목록 불러오기 (임시 로컬스토리지 또는 API 연동)
  useEffect(() => {
    const saved = localStorage.getItem('yoyang_job_seekers');
    if (saved) {
      try {
        Seekers(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 등록 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !region) {
      alert('성함, 연락처, 희망 근무 지역은 필수 입력 항목입니다.');
      return;
    }

    const newSeeker: JobSeeker = {
      id: Date.now().toString(),
      name,
      phone,
      region,
      serviceType,
      license,
      experience: experience || '신입 / 경력 무관',
      introduction: introduction || '성실하게 어르신을 케어하겠습니다.',
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [newSeeker, ...seekers];
    Seekers(updated);
    localStorage.setItem('yoyang_job_seekers', JSON.stringify(updated));

    // 폼 초기화
    setName('');
    setPhone('');
    setRegion('');
    setExperience('');
    setIntroduction('');
    alert('구직 프로필이 성공적으로 등록되었습니다!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* 상단 타이틀 섹션 */}
        <div className="text-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            💛 베스트시니어 요양보호사 구직 등록
          </h1>
          <p className="text-gray-600 text-sm">
            일자리를 찾으시는 요양보호사 선생님께서는 아래 프로필을 등록해 주세요. 우수 센터와 실시간으로 연결됩니다.
          </p>
        </div>

        {/* 구직 등록 폼 */}
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-3">
            <span>📝</span> 구직 프로필 등록하기
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">성함 *</label>
              <input
                type="text"
                placeholder="예: 김보호"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">연락처 *</label>
              <input
                type="text"
                placeholder="예: 010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">희망 근무 지역 *</label>
              <input
                type="text"
                placeholder="예: 용인시 기흥구 영덕동"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">서비스 종류</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="방문요양">방문요양</option>
                <option value="방문목욕">방문목욕</option>
                <option value="동거가족요양">동거가족요양</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">자격증 종류</label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="요양보호사 1급">요양보호사 1급</option>
                <option value="간호조무사 / 사회복지사">간호조무사 / 사회복지사</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">경력 사항</label>
              <input
                type="text"
                placeholder="예: 방문요양 2년 또는 신입"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">한줄 자기소개 및 희망 근무시간</label>
            <textarea
              rows={3}
              placeholder="예: 오전 9시 ~ 12시 희망합니다. 정성을 다해 모십니다."
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition shadow-md text-sm"
          >
            구직 프로필 무료 등록하기
          </button>
        </form>

        {/* 등록된 인재 목록 섹션 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span>📋</span> 등록된 인재 프로필 목록
          </h2>

          {seekers.length > 0 ? (
            seekers.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-base">{item.name} 선생님</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {item.serviceType}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📍 <b>희망지역:</b> {item.region}</p>
                  <p>📜 <b>자격증/경력:</b> {item.license} | {item.experience}</p>
                  <p>📞 <b>연락처:</b> {item.phone}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-700 border border-gray-100 mt-2">
                  💬 {item.introduction}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center text-gray-400 border border-gray-100 text-sm">
              아직 등록된 구직 프로필이 없습니다. 첫 번째 주인공이 되어보세요!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}