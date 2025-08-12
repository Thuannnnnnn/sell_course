import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register", 
    "/auth/forgot-password",
    "/auth/login-google",
    "/about",
    "/courses",
    "/blog",
    "/contact",
  ];

  // Routes that require authentication
  const authenticatedAuthRoutes = ["/auth/change-password"];

  const isPublicRoute = publicRoutes.includes(pathname) || 
    pathname.startsWith("/courses/") || // Allow course detail pages (/courses/[id] and /courses/[courseId]) 
    pathname.startsWith("/blog/") ||    // Allow blog detail pages  
    pathname.startsWith("/categories/"); // Allow category pages
  const isAuthRoute = pathname.startsWith("/auth");
  const isAuthenticatedAuthRoute = authenticatedAuthRoutes.includes(pathname);

  // ✅ Chưa login & vào private → redirect login
  if (!session?.accessToken && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("message", "Please login to access this page");
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Đã login nhưng vào auth (trừ các route cần authentication) → redirect về /
  if (session?.accessToken && isAuthRoute && !isAuthenticatedAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public/).*)"],
};
