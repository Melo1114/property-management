import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
  // Skip Next.js internal RSC (React Server Component) requests — redirecting
  // these breaks client-side navigation and causes "page can't reload" errors.
  if (request.headers.get('RSC') === '1') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  const token = request.cookies.get('pm_access')?.value
  const isPublic = PUBLIC_PATHS.some(path => pathname.startsWith(path))

  if (!isPublic && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
