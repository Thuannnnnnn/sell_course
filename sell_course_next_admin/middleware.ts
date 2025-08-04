import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const roleRoutesMap: Record<string, string[]> = {
  ADMIN: ["/", "/users"],
  CONTENTMANAGER: ["/categories"],
  COURSEREVIEWER: ["/course", "/course/review/"],
  MARKETINGMANAGER: ["/settings", "/promotion"],
  SUPPORT: ["/chat-support"],
  INSTRUCTOR: ["/course"],
};

const publicRoutes = ["/auth/login", "/"];

function isAuthorized(pathname: string, role?: string): boolean {
  if (!role) return false;
  const allowedRoutes = roleRoutesMap[role] || [];
  return allowedRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isPublicRoute = publicRoutes.includes(pathname);

  // ⛔ Chưa đăng nhập → không cho vào private route
  if (!session?.accessToken && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Đã đăng nhập nhưng không có quyền truy cập route → redirect về trang chính theo role
  if (session?.accessToken && !isAuthorized(pathname, session.role)) {
    const defaultRoute = roleRoutesMap[session.role || ""]?.[0] || "/";
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public/).*)"],
};
