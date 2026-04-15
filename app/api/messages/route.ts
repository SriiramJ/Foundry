import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewMessageEmail } from "@/lib/email";

// GET /api/messages - fetch all conversations for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all messages involving the current user
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    // Group into conversations keyed by the other user's id
    const conversationsMap: Record<string, any> = {};
    for (const msg of messages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationsMap[otherId]) {
        conversationsMap[otherId] = { user: otherUser, messages: [], unreadCount: 0 };
      }
      conversationsMap[otherId].messages.push(msg);
      if (!msg.isRead && msg.receiverId === userId) {
        conversationsMap[otherId].unreadCount++;
      }
    }

    return NextResponse.json(Object.values(conversationsMap));
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST /api/messages - send a message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content } = await request.json();

    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: "receiverId and content are required" }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, name: true, email: true } });
    if (!receiver) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true }
    });

    const message = await prisma.directMessage.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        receiverId
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } }
      }
    });

    // Notify receiver — fire and forget
    sendNewMessageEmail(receiver.email!, receiver.name || 'there', sender?.name || 'Someone')
      .catch(err => console.error('New message email error:', err));

    return NextResponse.json(message);
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
