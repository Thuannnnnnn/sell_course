import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const roleRoutesMap: Record<string, string[]> = {
  ADMIN: ["/", "/users", "/settings", "/promotion", "/categories", "/course", "/chat-support"],
  CONTENTMANAGER: ["/categories"],
  COURSEREVIEWER: ["/course", "/course/review/"],
  MARKETINGMANAGER: ["/settings", "/promotion"],
  SUPPORT: ["/chat-support"],
  INSTRUCTOR: ["/course"], // Instructors can only access course listing, not review
};

const publicRoutes = ["/auth/login", "/auth/register", "/auth/error"];

function isAuthorized(pathname: string, role?: string): boolean {
  if (!role) return false;
  
  // Special case: Block INSTRUCTOR from accessing review routes
  if (role === 'INSTRUCTOR' && pathname.includes('/review/')) {
    return false;
  }
  
  // Special case: Block COURSEREVIEWER from CRUD operations (add, edit, create)
  if (role === 'COURSEREVIEWER' && (
    pathname.includes('/course/add') || 
    pathname.includes('/course/edit/') || 
    pathname.includes('/course/create') ||
    (pathname.match(/\/course\/[^\/]+\/[^\/]+/) && !pathname.includes('/course/review/')) // Block lesson management and content management but allow review
  )) {
    return false;
  }
  
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
  if (session?.accessToken && !isPublicRoute && !isAuthorized(pathname, session.role)) {
    const userRole = session.role as string;
    const allowedRoutes = roleRoutesMap[userRole] || [];
    const defaultRoute = allowedRoutes[0] || "/"; // Fallback to root
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public/).*)"],
};
