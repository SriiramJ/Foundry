import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSettingsSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  notifications: z.object({
    newSolutions: z.boolean(),
    mentorResponses: z.boolean(),
    weeklyDigest: z.boolean(),
  }).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateSettingsSchema.parse(body);

    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.notifications) {
      updateData.notifyNewSolutions = validatedData.notifications.newSolutions;
      updateData.notifyMentorResponses = validatedData.notifications.mentorResponses;
      updateData.notifyWeeklyDigest = validatedData.notifications.weeklyDigest;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Nothing to update" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Settings update error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}