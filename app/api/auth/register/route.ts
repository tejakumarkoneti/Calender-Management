import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, timezone } = body;

    // 1️⃣ Basic validation
    if (!email || !password || !timezone) {
      return NextResponse.json(
        { error: "Email, password and timezone are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // 2️⃣ Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 } // Conflict
      );
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create user + calendar (single transaction)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        timezone,
        calendars: {
          create: {}
        }
      },
      select: {
        id: true,
        email: true,
        timezone: true,
        createdAt: true
      }
    });

    // 5️⃣ Success response
    return NextResponse.json(
      {
        success: true,
        user
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

