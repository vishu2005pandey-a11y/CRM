import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export default withAuth(
  function middleware(req) {
    // Basic Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 min
    const maxRequests = 100; // 100 reqs / min

    const rateData = rateLimitMap.get(ip);
    if (rateData) {
      if (now > rateData.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      } else {
        rateData.count++;
        if (rateData.count > maxRequests) {
          return new NextResponse("Too Many Requests - Rate Limit Exceeded", { status: 429 });
        }
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    }

    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");
    const role = token?.role;

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }


  },
  {
    callbacks: {
      authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
