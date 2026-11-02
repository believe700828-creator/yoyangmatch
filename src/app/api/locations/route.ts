import { NextResponse } from 'next/server';
import { initialLocations, LocationItem } from '@/data/locations';

let locationsStore: LocationItem[] = [...initialLocations];

export async function GET() {
  return NextResponse.json(locationsStore);
}

export async function POST(request: Request) {
  const { category, name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: '지역명을 입력해 주세요.' }, { status: 400 });
  }

  const newLocation: LocationItem = {
    id: Date.now().toString(),
    category: category || '기타',
    name: name.trim(),
  };

  locationsStore.push(newLocation);
  return NextResponse.json(newLocation, { status: 201 });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  locationsStore = locationsStore.filter((loc) => loc.id !== id);
  return NextResponse.json({ success: true });
}