// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs";


export async function POST(request: Request) {
  try {
    const {
      first_name,
      last_name,
      title,
      role,
      username,
      password,
      email,
      address,
      phone_number,
      country,
      city,
      profile_image_url,
      official_email,
      education_institute,
      registration_number,
    } = await request.json();

    // Basic validation
    if (
      !first_name ||
      !last_name ||
      !title ||
      !role ||
      !username ||
      !password ||
      !email ||
      !phone_number
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // See if they already exist by username OR email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        title: true,
        role: true,
        username: true,
        email: true,
        address: true,
        phone_number: true,
        country: true,
        city: true,
        profile_image_url: true,
      },
    });

    if (existing) {
      // idempotent — return the existing user without creating a new one
      return NextResponse.json(
        { user: existing, existing: true },
        { status: 200 }
      );
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create the User (and associated educator/student record, if needed)
    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        title,
        role: role,
        username,
        password: hashed,
        email,
        address,
        phone_number,
        country,
        city,
        profile_image_url,
        educator:
          role === "educator"
            ? {
                create: {
                  official_email: official_email || email,
                  education_institute: education_institute || "",
                },
              }
            : undefined,
        student:
          role === "student"
            ? {
                create: {
                  registration_number: registration_number || "",
                  education_institute: education_institute || "",
                },
              }
            : undefined,
      },
      select: {
        user_id: true,
        first_name: true,
        last_name: true,
        title: true,
        role: true,
        username: true,
        email: true,
        address: true,
        phone_number: true,
        country: true,
        city: true,
        profile_image_url: true,
      },
    });

    return NextResponse.json(
      { user, existing: false },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to sign up user" },
      { status: 500 }
    );
  }
}
