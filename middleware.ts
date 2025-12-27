import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/project/:path*",
    "/scenic-insights/:path*",
    "/about",
    "/portfolio",
  ],
};

export default function middleware(req: NextRequest) {
  const userAgent = req.headers.get("user-agent") || "";
  const isBot =
    /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|linkedinbot|twitterbot|slackbot|whatsapp|telegram/i
      .test(userAgent);

  if (isBot) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/social-card";
    url.searchParams.set("path", req.nextUrl.pathname);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
