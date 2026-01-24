import { NextResponse } from "next/server";

const RESUME_URL =
  "https://zuycsuajiuqsvopiioer.supabase.co/storage/v1/object/public/portfolio/resume.pdf";

export async function GET() {
  const response = await fetch(RESUME_URL, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return new NextResponse("Resume not available", { status: 404 });
  }

  const contentType = response.headers.get("content-type") || "application/pdf";
  const data = await response.arrayBuffer();

  return new NextResponse(data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
