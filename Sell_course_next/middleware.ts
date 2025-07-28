
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Danh sách các route cần đăng nhập (protected routes)
const protectedRoutes = [
  "/profile",
  "/checkout",
  "/enrolled",
  "/quiz",
  "/exam",
  "/quiz-results",
  "/auth/change-password",
  "/auth/reset-password",
  "/auth/verify-email",
];

// Danh sách các route chỉ dành cho người dùng chưa đăng nhập
const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy token từ NextAuth session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Kiểm tra xem route hiện tại có cần bảo vệ không
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Kiểm tra xem route hiện tại có phải là route auth không
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Nếu là protected route nhưng không có token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("message", "Please login to access this page");
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Nếu đã đăng nhập và truy cập trang auth, chuyển hướng về dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Cho phép truy cập các route khác
  return NextResponse.next();
}

// Cấu hình matcher để middleware chỉ chạy trên các route cần thiết
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
