"use client";

import { useState } from "react";
import { courses } from "../data/courses";

interface Course {
  id: number;
  name: string;
  price: number;
  seat: number;
  booked: number;
  date?: string;
  tags?: string[];
  badge?: string;
  description?: string;
  duration?: string;
  icon?: string;
}

export default function Home() {
  const [onlyOpen, setOnlyOpen] = useState(false);

  // 예약 모달 상태 관리
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [headcount, setHeadcount] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 예약 가능한 강좌 필터링
  const displayedCourses = courses.filter((course) => {
    if (!onlyOpen) return true;
    const remainingSeats = course.seat - course.booked;
    return remainingSeats > 0;
  });

  // 예약 모달 열기
  const handleOpenModal = (course: Course) => {
    const remainingSeats = course.seat - course.booked;
    if (remainingSeats <= 0) return; // 마감 강좌 차단

    setSelectedCourse(course);
    setApplicantName("");
    setApplicantPhone("");
    setHeadcount(1);
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(false);
  };

  // 예약 모달 닫기
  const handleCloseModal = () => {
    setSelectedCourse(null);
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(false);
  };

  // 예약 API 제출 핸들러
  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedCourse) return;

    // 클라이언트 1차 유효성 검사
    if (!applicantName.trim()) {
      setErrorMessage("신청자 이름을 입력해 주세요.");
      return;
    }
    if (!applicantPhone.trim()) {
      setErrorMessage("연락처를 입력해 주세요.");
      return;
    }
    const remainingSeats = selectedCourse.seat - selectedCourse.booked;
    if (headcount < 1) {
      setErrorMessage("신청 인원은 최소 1명 이상이어야 합니다.");
      return;
    }
    if (headcount > remainingSeats) {
      setErrorMessage(`남은 좌석(${remainingSeats}석) 이하로 인원을 선택해 주세요.`);
      return;
    }

    try {
      setIsSubmitting(true);

      // Next.js 서버의 /api/reserve 엔드포인트 호출
      const response = await fetch("/api/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedCourse.date,
          course: selectedCourse.name,
          courseId: selectedCourse.id,
          name: applicantName.trim(),
          phone: applicantPhone.trim(),
          people: headcount,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        // 서버에서 반환한 구체적인 오류 메시지 표시
        setErrorMessage(data?.error || "예약 신청 처리 중 오류가 발생했습니다.");
        return;
      }

      // Apps Script 저장까지 확실히 성공했을 때만 완료 메시지 표시
      setSuccessMessage("🎉 예약 신청이 구글 스프레드시트에 안전하게 등록되었습니다!");
      setTimeout(() => {
        handleCloseModal();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || "서버 통신 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] text-white flex flex-col justify-between selection:bg-amber-400 selection:text-slate-900">
      {/* 상단 네비게이션 헤더 */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-amber-500/10">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]"></span>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
            스킬투머니
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <a
            href="/lab04.html"
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 border border-amber-400/30 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-400/10 transition-colors"
          >
            🧪 4장 실습실
          </a>
          <a
            href="/lab05.html"
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 border border-amber-400/30 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-400/10 transition-colors"
          >
            🧪 5장 실습실
          </a>
          <a
            href="/lab06.html"
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 border border-amber-400/30 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-400/10 transition-colors"
          >
            🧪 6장 실습실
          </a>
          <span className="hidden sm:inline-block text-xs sm:text-sm font-semibold tracking-wider uppercase text-amber-400/90 border border-amber-400/30 px-3 py-1 rounded-full bg-amber-400/5">
            One-Day Class
          </span>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-7xl mx-auto w-full">
        {/* 상단 소개 문구 */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-semibold mb-5">
            ✨ 배운 기술이 돈이 되는 원데이 클래스
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 [word-break:keep-all]">
            지금 바로 신청 가능한 강좌 목록
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto [word-break:keep-all]">
            하루 만에 배우고 곧바로 실전에 활용해 수익을 창출해 보세요.
          </p>
        </div>

        {/* 예약 가능한 강좌만 보기 체크 상자 */}
        <div className="w-full flex items-center justify-end mb-6">
          <label className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#112240] border border-amber-500/20 hover:border-amber-400/50 cursor-pointer transition-all select-none shadow-md">
            <input
              type="checkbox"
              id="filter-only-open"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              className="w-4 h-4 rounded text-amber-400 bg-slate-900 border-slate-600 focus:ring-amber-400 focus:ring-2 accent-amber-400 cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-200">
              예약 가능한 강좌만 보기
            </span>
          </label>
        </div>

        {/* 강좌 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {displayedCourses.map((course) => {
            const remainingSeats = course.seat - course.booked;
            const isSoldOut = remainingSeats === 0;
            const isAlmostSoldOut = remainingSeats >= 1 && remainingSeats <= 2;

            return (
              <div
                key={course.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-[#112240] border border-amber-500/20 p-6 shadow-xl shadow-black/40 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* 상단 뱃지 및 아이콘 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-2 rounded-xl bg-slate-900/60 border border-white/5">
                      {course.icon || "📚"}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {isSoldOut && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-300 border border-slate-600">
                          마감
                        </span>
                      )}
                      {isAlmostSoldOut && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                          마감 임박
                        </span>
                      )}
                      {course.badge && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                          {course.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 강좌 이름 */}
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {course.name}
                    </h2>
                    {isSoldOut && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                        [마감]
                      </span>
                    )}
                    {isAlmostSoldOut && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-500/30">
                        [마감 임박]
                      </span>
                    )}
                  </div>

                  {/* 태그 배지 */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {course.tags &&
                      course.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>

                  {/* 소요 시간 및 일정 */}
                  {course.duration && (
                    <p className="text-xs font-medium text-amber-400/80 mb-1.5 flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{course.duration}</span>
                    </p>
                  )}
                  {course.date && (
                    <p className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1">
                      <span>📅</span>
                      <span>{course.date}</span>
                    </p>
                  )}

                  {/* 부가 설명 */}
                  {course.description && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed [word-break:keep-all] mb-5">
                      {course.description}
                    </p>
                  )}
                </div>

                {/* 정원 및 좌석 현황 정보 */}
                <div className="mb-5 rounded-xl bg-slate-900/50 border border-white/5 p-3.5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400 font-medium">좌석 현황</span>
                    <span className="font-semibold text-slate-200">
                      남은 좌석{" "}
                      <span
                        className={
                          isSoldOut
                            ? "text-slate-400 font-bold"
                            : isAlmostSoldOut
                            ? "text-red-400 font-bold"
                            : "text-amber-400 font-bold"
                        }
                      >
                        {remainingSeats}석
                      </span>{" "}
                      / {course.seat}명
                    </span>
                  </div>
                  {/* 좌석 진행도 바 */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSoldOut
                          ? "bg-slate-600"
                          : isAlmostSoldOut
                          ? "bg-red-500"
                          : "bg-amber-400"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((course.booked / course.seat) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 하단 가격 및 예약하기 버튼 */}
                <div className="pt-4 border-t border-slate-700/60 mt-auto">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-xs font-medium text-slate-400">수강료</span>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black text-amber-400">
                        {course.price.toLocaleString("ko-KR")}
                      </span>
                      <span className="text-xs font-semibold text-white ml-1">원</span>
                    </div>
                  </div>

                  {/* 예약하기 / 예약 마감 버튼 */}
                  <button
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => handleOpenModal(course)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                      isSoldOut
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
                    }`}
                  >
                    <span>{isSoldOut ? "예약 마감" : "예약하기"}</span>
                    {!isSoldOut && (
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 예약 신청 모달 창 */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0e1d38] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
            {/* 모달 닫기 버튼 */}
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-2xl font-bold cursor-pointer transition-colors disabled:opacity-50"
            >
              ✕
            </button>

            {/* 모달 헤더 */}
            <div className="mb-6">
              <span className="inline-block text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-md mb-2">
                강좌 예약 신청
              </span>
              <h3 className="text-2xl font-black text-white">
                {selectedCourse.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                일정: {selectedCourse.date || "일정 협의"} | 정원 {selectedCourse.seat}명 (남은 좌석 {selectedCourse.seat - selectedCourse.booked}석)
              </p>
            </div>

            {/* 입력 폼 */}
            <form onSubmit={handleSubmitReservation} className="space-y-4">
              {/* 강좌명 및 날짜 */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">강좌명</span>
                  <span className="font-semibold text-white">{selectedCourse.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">강좌 일정</span>
                  <span className="font-semibold text-amber-300">{selectedCourse.date || "2026-11-28"}</span>
                </div>
              </div>

              {/* 신청자 이름 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  신청자 이름 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  disabled={isSubmitting}
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-amber-400 focus:outline-none text-white text-sm disabled:opacity-60"
                />
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  연락처 <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="예: 010-1234-5678"
                  disabled={isSubmitting}
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-amber-400 focus:outline-none text-white text-sm disabled:opacity-60"
                />
              </div>

              {/* 신청 인원 */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    신청 인원 <span className="text-red-400">*</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    남은 좌석: {selectedCourse.seat - selectedCourse.booked}석
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedCourse.seat - selectedCourse.booked}
                  disabled={isSubmitting}
                  value={headcount}
                  onChange={(e) => setHeadcount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-amber-400 focus:outline-none text-white text-sm font-semibold disabled:opacity-60"
                />
              </div>

              {/* 총 결제 금액 계산 영역 */}
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">총 결제 금액</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">
                    {(selectedCourse.price * (headcount || 1)).toLocaleString("ko-KR")}
                  </span>
                  <span className="text-sm font-semibold text-white ml-1">원</span>
                </div>
              </div>

              {/* 오류 메시지 안내 */}
              {errorMessage && (
                <div className="p-3.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium leading-relaxed [word-break:keep-all]">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* 성공 메시지 안내 */}
              {successMessage && (
                <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium leading-relaxed [word-break:keep-all]">
                  {successMessage}
                </div>
              )}

              {/* 모달 하단 버튼 */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="w-1/3 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      <span>처리 중...</span>
                    </>
                  ) : (
                    <span>예약 신청 제출</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 하단 푸터 */}
      <footer className="w-full border-t border-amber-500/10 py-6 text-center text-xs text-slate-400">
        <p>© 2026 스킬투머니 (Skill to Money). All rights reserved.</p>
      </footer>
    </div>
  );
}
