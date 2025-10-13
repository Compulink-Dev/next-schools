import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    const items = await prisma.announcement.findMany({
      orderBy: { date: "desc" },
      take: isNaN(limit) ? 5 : limit,
      select: { id: true, title: true, date: true },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}
