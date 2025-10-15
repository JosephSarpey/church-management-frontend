import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the auth cookies directly
    const response = NextResponse.json(
      { success: true, redirectUrl: '/sign-in' },
      { status: 200 }
    );
    
    // Clear the Clerk session cookie
    response.cookies.set('__session', '', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Expire the cookie immediately
    });
    
    return response;
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
