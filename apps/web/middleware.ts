import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Proteger admin: solo si el email es el del owner
    if (pathname.startsWith('/_admin') && token?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/_admin/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Rutas públicas: login, registro y admin login
        if (
          pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/_admin/login') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/register')
        ) {
          return true
        }

        return !!token
      }
    }
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
