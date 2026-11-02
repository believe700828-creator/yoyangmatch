"use client";

import React, { useState } from "react";
import {
  Shield,
  Phone,
  Building2,
  Search,
  PlusCircle,
  Trash2,
} from "lucide-react";

type CenterType = "방문요양센터" | "주야간보호센터" | "요양원";

interface JobPost {
  id: number;
  centerName: string;
  centerType: CenterType;
  region: string;
  pay: string;
  workTime: string;
  elderState: string;
  phone: string;
  isUrgent: boolean;
}

export default function EldercareJobPlatform() {
  const [posts, setPosts] = useState<JobPost[]>([
    {
      id: 1,
      centerName: "베스트시니어방문요양센터",
      centerType: "방문요양센터",
      region: "경기 용인시 기흥구",
      pay: "시급 14,500원",
      workTime: "월~금 (09:00 ~ 12:00)",
      elderState: "3등급 어르신 (거동가능, 가사지원)",
      phone: "010-0000-0000",
      isUrgent: true,
    },
    {
      id: 2,
      centerName: "수원행복 주야간보호센터",
      centerType: "주야간보호센터",
      region: "경기 수원시 영통구",
      pay: "월급 2,200,000원",
      workTime: "월~금 (08:30 ~ 17:30)",
      elderState: "송영 서비스 및 송영 보조",
      phone: "010-0000-0000",
      isUrgent: false,
    },
    {
      id: 3,
      centerName: "서울케어 요양원",
      centerType: "요양원",
      region: "서울 강남구",
      pay: "월급 2,400,000원",
      workTime: "3교대 근무",
      elderState: "입소 어르신 신체 수발 및 생활 지원",
      phone: "010-0000-0000",
      isUrgent: true,
    },
  ]);
  const [selectedType, setSelectedType] = useState<string>("전체");
  const [selectedRegion, setSelectedRegion] = useState<string>("전체");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [newPost, setNewPost] = useState({
    centerName: "",
    centerType: "방문요양센터" as CenterType,
    region: "경기 수원시",
    pay: "",
    workTime: "",
    elderState: "",
    phone: "",
    isUrgent: false,
  });

  const filteredPosts = posts.filter((post) => {
    const matchType = selectedType === "전체" || post.centerType === selectedType;
    const matchRegion =
      selectedRegion === "전체" || post.region.includes(selectedRegion);
    return matchType && matchRegion;
  });

  const handleAdminLogin = () => {
    if (adminPasswordInput === "1234") {
      setIsAdmin(true);
      setShowAdminLoginModal(false);
      setAdminPasswordInput("");
      alert("관리자 권한으로 로그인되었습니다.");
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleDeletePost = (id: number) => {
    if (confirm("이 공고를 정말 삭제하시겠습니까?")) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.centerName || !newPost.phone) {
      alert("기관명과 연락처는 필수 항목입니다.");
      return;
    }
    const created: JobPost = {
      ...newPost,
      id: Date.now(),
    };
    setPosts([created, ...posts]);
    setShowRegisterModal(false);
    setNewPost({
      centerName: "",
      centerType: "방문요양센터",
      region: "경기 수원시",
      pay: "",
      workTime: "",
      elderState: "",
      phone: "",
      isUrgent: false,
    });
    alert("새 구인 공고가 등록되었습니다.");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-blue-600 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              요양웹 (수도권 구인구직)
            </h1>
            <p className="text-xs text-blue-100">
              방문요양 / 주야간보호 / 요양원 통합 플랫폼
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-3 py-2 rounded-lg text-sm flex items-center gap-1 shadow"
            >
              <PlusCircle className="w-4 h-4" /> 공고 등록
            </button>
            {isAdmin ? (
              <button
                onClick={() => setIsAdmin(false)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1 shadow"
              >
                <Shield className="w-4 h-4" /> 관리자 로그아웃
              </button>
            ) : (
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="bg-blue-700 hover:bg-blue-800 text-blue-100 px-3 py-2 rounded-lg text-xs flex items-center gap-1"
              >
                <Shield className="w-4 h-4" /> 관리자
              </button>
            )}
          </div>
        </div>
      </header>

      {isAdmin && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 px-4 py-2 text-center text-sm font-semibold flex justify-center items-center gap-2">
          <Shield className="w-4 h-4 text-amber-700" />
          현재 대표님 전용 관리자 모드입니다. 공고 삭제 및 모니터링이 가능합니다.
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
          <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-1">
            <Search className="w-4 h-4 text-blue-600" /> 맞춤 일자리 검색
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                기관 유형
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="전체">전체 기관 (방문요양/주야간/요양원)</option>
                <option value="방문요양센터">방문요양센터</option>
                <option value="주야간보호센터">주야간보호센터</option>
                <option value="요양원">요양원</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                지역 선택
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="전체">서울 / 경기 전체</option>
                <option value="서울">서울 전체</option>
                <option value="수원">경기 수원시</option>
                <option value="용인">경기 용인시</option>
                <option value="성남">경기 성남시</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">
              구인 공고 <span className="text-blue-600">{filteredPosts.length}</span>
              건
            </h3>
          </div>
          {filteredPosts.length === 0 && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
              조건에 맞는 구인 공고가 없습니다.
            </div>
          )}
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`bg-white p-5 rounded-xl border ${
                post.isUrgent
                  ? "border-amber-400 ring-1 ring-amber-300"
                  : "border-slate-200"
              } shadow-sm hover:shadow-md transition-shadow relative`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {post.isUrgent && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">
                    급구
                  </span>
                )}
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {post.centerType}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {post.region}
                </span>
              </div>
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-bold text-slate-900">
                  {post.centerName}
                </h4>
                <span className="text-base font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                  {post.pay}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 space-y-1 mb-4">
                <p>
                  <span className="font-semibold text-slate-500">근무 시간:</span>{" "}
                  {post.workTime}
                </p>
                <p>
                  <span className="font-semibold text-slate-500">담당 업무:</span>{" "}
                  {post.elderState}
                </p>
              </div>
              <div className="flex justify-between items-center">
                {isAdmin ? (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> 관리자 삭제
                  </button>
                ) : (
                  <div></div>
                )}
                <a
                  href={`tel:${post.phone}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-sm"
                >
                  <Phone className="w-4 h-4" /> 전화 문의하기
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showAdminLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-xs w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" /> 관리자 비밀번호
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              대표님 전용 관리 화면 접근용 (테스트 비번: 1234)
            </p>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdminLogin();
              }}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAdminLoginModal(false)}
                className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleAdminLogin}
                className="px-4 py-2 text-xs bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              새 구인 공고 등록
            </h3>
            <form onSubmit={handleCreatePost} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">기관 이름</label>
                <input
                  type="text"
                  required
                  placeholder="예: 베스트시니어방문요양센터"
                  value={newPost.centerName}
                  onChange={(e) =>
                    setNewPost({ ...newPost, centerName: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">기관 유형</label>
                <select
                  value={newPost.centerType}
                  onChange={(e) =>
                    setNewPost({
                      ...newPost,
                      centerType: e.target.value as CenterType,
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                >
                  <option value="방문요양센터">방문요양센터</option>
                  <option value="주야간보호센터">주야간보호센터</option>
                  <option value="요양원">요양원</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">지역 (시/군/구)</label>
                <input
                  type="text"
                  required
                  placeholder="예: 경기 용인시 기흥구"
                  value={newPost.region}
                  onChange={(e) =>
                    setNewPost({ ...newPost, region: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">급여 조건</label>
                <input
                  type="text"
                  required
                  placeholder="예: 시급 14,500원 / 월급 230만원"
                  value={newPost.pay}
                  onChange={(e) =>
                    setNewPost({ ...newPost, pay: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">근무 시간</label>
                <input
                  type="text"
                  required
                  placeholder="예: 월~금 09:00 ~ 12:00"
                  value={newPost.workTime}
                  onChange={(e) =>
                    setNewPost({ ...newPost, workTime: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  담당 업무 / 어르신 상태
                </label>
                <textarea
                  required
                  placeholder="예: 4등급 어르신 가사지원 및 신체 수발"
                  value={newPost.elderState}
                  onChange={(e) =>
                    setNewPost({ ...newPost, elderState: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg h-20"
                ></textarea>
              </div>
              <div>
                <label className="block font-semibold mb-1">연락처</label>
                <input
                  type="text"
                  required
                  placeholder="예: 010-1234-5678"
                  value={newPost.phone}
                  onChange={(e) =>
                    setNewPost({ ...newPost, phone: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
              <label className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  checked={newPost.isUrgent}
                  onChange={(e) =>
                    setNewPost({ ...newPost, isUrgent: e.target.checked })
                  }
                />
                급구 공고로 표시
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  공고 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
