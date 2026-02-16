import { NextRequest, NextResponse } from 'next/server';

const MBTA_API_URL = process.env.MBTA_API_URL || '';
const MBTA_API_KEY = process.env.MBTA_API_KEY || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const endpoint = `/${path.join('/')}`;
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${MBTA_API_URL}${endpoint}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(MBTA_API_KEY ? { 'x-api-key': MBTA_API_KEY } : {}),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('MBTA API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from MBTA API' },
      { status: 500 },
    );
  }
}
