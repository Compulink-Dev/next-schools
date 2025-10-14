import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: isNaN(limit) ? 5 : limit,
      select: { id: true, title: true, content: true, senderId: true, receiverId: true, createdAt: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
