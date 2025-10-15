import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { clerkId, email, firstName, lastName } = await req.json();
    
    // Call your backend API to sync user
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await (await auth()).getToken()}`
      },
      body: JSON.stringify({
        clerkId,
        email,
        firstName,
        lastName,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Backend sync error:', error);
      return new NextResponse('Failed to sync with backend', { status: response.status });
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error in sync route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
