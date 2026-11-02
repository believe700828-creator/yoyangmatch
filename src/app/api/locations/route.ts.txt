import { NextResponse } from 'next/server';

// 임시 메모리 저장소 (필요 시 파일이나 DB 연동 가능)
let locationsData = [
  { id: '1', name: '수원시 영통구', region: '경기', active: true },
  { id: '2', name: '용인시 기흥구', region: '경기', active: true },
];

// GET: 지역 목록 조회
export async function GET() {
  return NextResponse.json(locationsData);
}

// POST: 지역 추가
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, region } = body;

    if (!name || !region) {
      return NextResponse.json({ error: '이름과 권역은 필수입니다.' }, { status: 400 });
    }

    const newItem = {
      id: Date.now().toString(),
      name,
      region,
      active: true,
    };

    locationsData.push(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE: 지역 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '삭제할 ID가 필요합니다.' }, { status: 400 });
    }

    locationsData = locationsData.filter((item) => item.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}