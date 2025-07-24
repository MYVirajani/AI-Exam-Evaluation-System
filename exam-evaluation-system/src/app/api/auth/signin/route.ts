// src/app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    console.log("Signin attempt with username:", username);

    if (!username || !password) {
      console.log("Signin failed: Missing username or password");
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.log("Signin failed: User not found for username:", username);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log("Signin failed: Invalid password for username:", username);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // scrub the password before returning
    const { password: _, ...safeUser } = user;
    console.log("Signin successful for username:", username);
    return NextResponse.json({ user: safeUser }, { status: 200 });
  } catch (err) {
    console.error("Signin error:", err);
    return NextResponse.json(
      { error: "Failed to sign in" },
      { status: 500 }
    );
  }
}
