import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messages/[userId] - fetch conversation with a specific user
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: otherId } = await params;
    const myId = session.user.id;

    const [messages, otherUser] = await Promise.all([
      prisma.directMessage.findMany({
        where: {
          OR: [
            { senderId: myId, receiverId: otherId },
            { senderId: otherId, receiverId: myId }
          ]
        },
        include: {
          sender: { select: { id: true, name: true, role: true } }
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.user.findUnique({
        where: { id: otherId },
        select: { id: true, name: true, role: true }
      })
    ]);

    // Mark unread messages as read
    await prisma.directMessage.updateMany({
      where: { senderId: otherId, receiverId: myId, isRead: false },
      data: { isRead: true }
    });

    return NextResponse.json({ messages, otherUser });
  } catch (error) {
    console.error("Conversation fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
  }
}
