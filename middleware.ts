import { clerkMiddleware } from '@clerk/nextjs/server'

import { NextRequest, NextResponse, type NextFetchEvent } from "next/server";

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  // пропуск публичныех маршрутов
  if (req.nextUrl.pathname.startsWith("/api/public")) {
    return NextResponse.next();
  }

  return clerkMiddleware(req, ev);
}


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}