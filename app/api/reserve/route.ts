import { NextResponse } from "next/server";
import { courses } from "@/data/courses";

export async function POST(request: Request) {
  try {
    const sheetUrl = process.env.SHEET_URL?.trim();

    // 1. SHEET_URL 환경변수 검증
    if (!sheetUrl) {
      return NextResponse.json(
        { success: false, error: "구글 시트 연결이 아직 설정되지 않았습니다." },
        { status: 400 }
      );
    }

    // 2. 요청 본문 파싱
    const body = await request.json();
    const { date, course, name, phone, people } = body;

    // 3. 필수 입력값 검증
    if (!name || !phone || !course || !people) {
      return NextResponse.json(
        { success: false, error: "필수 입력 항목이 누락되었습니다." },
        { status: 400 }
      );
    }

    const headcount = Number(people);
    if (isNaN(headcount) || headcount < 1) {
      return NextResponse.json(
        { success: false, error: "신청 인원은 1명 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 4. 강좌 정보 및 가격 확인
    const matchedCourse = courses.find((c) => c.name === course || String(c.id) === String(body.courseId));
    if (!matchedCourse) {
      return NextResponse.json(
        { success: false, error: "존재하지 않는 강좌입니다." },
        { status: 404 }
      );
    }

    // 남은 좌석 검증
    const remainingSeats = matchedCourse.seat - matchedCourse.booked;
    if (headcount > remainingSeats) {
      return NextResponse.json(
        { success: false, error: `남은 좌석(${remainingSeats}석)을 초과하여 신청할 수 없습니다.` },
        { status: 400 }
      );
    }

    // 5. 총 결제 금액 서버 계산 (인원 × 강좌 가격)
    const total = matchedCourse.price * headcount;

    // 6. Google Apps Script로 전송할 페이로드 구성
    const payload = {
      date: date || matchedCourse.date,
      course: matchedCourse.name,
      name: String(name).trim(),
      phone: String(phone).trim(),
      people: headcount,
      total: total,
    };

    // 7. SHEET_URL의 Apps Script로 JSON 전송
    const response = await fetch(sheetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `시트 서버 응답 오류 (HTTP ${response.status})` },
        { status: 502 }
      );
    }

    const result = await response.json().catch(() => null);

    // 8. Apps Script가 성공 응답을 반환했을 때만 예약 성공으로 처리
    if (result && result.result === "ok") {
      return NextResponse.json({
        success: true,
        message: "예약이 성공적으로 완료되었습니다.",
        data: payload,
      });
    } else {
      const errorMsg = result?.message || "구글 시트 저장 처리에 실패했습니다.";
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Reservation API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "예약 처리 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

