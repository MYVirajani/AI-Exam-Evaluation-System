// src/app/api/admin/users/[userId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { userId: string } }) {
  try {
    const data = await request.json();

    const updatedUser = await prisma.user.update({
      where: { user_id: params.userId },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        title: data.title,
        email: data.email,
        phone_number: data.phone_number,
        address: data.address,
        country: data.country,
        city: data.city,
        profile_image_url: data.profile_image_url,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err: any) {
    console.error("Error updating user:");
    if (err instanceof Error) {
      console.error("Message:", err.message);
      console.error("Stack:", err.stack);
    }
    if (err.code) {
      console.error("Prisma error code:", err.code);
    }
    console.error("Full error object:", JSON.stringify(err, null, 2));
    return NextResponse.json({ error: "Failed to update user", details: err.message || err }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { userId: string } }) {
  try {
    // Delete related educator if exists
    await prisma.educator.deleteMany({
      where: { user_id: params.userId },
    });

    // Delete related student if exists
    await prisma.student.deleteMany({
      where: { user_id: params.userId },
    });

    // Then delete the user
    await prisma.user.delete({
      where: { user_id: params.userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting user:");
    if (err instanceof Error) {
      console.error("Message:", err.message);
      console.error("Stack:", err.stack);
    }
    if (err.code) {
      console.error("Prisma error code:", err.code);
    }
    console.error("Full error object:", JSON.stringify(err, null, 2));
    return NextResponse.json({ error: "Failed to delete user", details: err.message || err }, { status: 500 });
  }
}
