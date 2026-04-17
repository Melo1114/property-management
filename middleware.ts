import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

function isRscRequest(request: NextRequest): boolean {
  // Check for RSC headers and query params that indicate internal Next.js navigation
  const rscHeader = request.headers.get('rsc')
  const routerStateTree = request.headers.get('next-router-state-tree')
  const routerPrefetch = request.headers.get('next-router-prefetch')
  const rscQuery = request.nextUrl.searchParams.get('_rsc')

  return !!(rscHeader === '1' || routerStateTree || routerPrefetch || rscQuery)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  // Skip middleware for RSC requests — they shouldn't be redirected
  if (isRscRequest(request)) {
    return NextResponse.next()
  }

  const isPublic = PUBLIC_PATHS.some(path => pathname.startsWith(path))

  // Redirect unauthenticated users to login
  if (!isPublic && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login/register
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
