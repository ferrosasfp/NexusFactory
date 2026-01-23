import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname
    const isProtectedRoute = pathname.startsWith('/dashboard')
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')

    if (isProtectedRoute && !user) {
        const redirectUrl = new URL('/login', request.url)
        const redirectResponse = NextResponse.redirect(redirectUrl)

        // Copia cookies acumuladas al redirect (importante)
        response.cookies.getAll().forEach((c) => {
            redirectResponse.cookies.set(c.name, c.value, c)
        })

        return redirectResponse
    }

    if (isAuthRoute && user) {
        const redirectUrl = new URL('/dashboard', request.url)
        const redirectResponse = NextResponse.redirect(redirectUrl)

        response.cookies.getAll().forEach((c) => {
            redirectResponse.cookies.set(c.name, c.value, c)
        })

        return redirectResponse
    }

    return response
}
