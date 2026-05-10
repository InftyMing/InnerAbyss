import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ errorCode: "paramsMissing" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ errorCode: "passwordTooShort" }, { status: 400 });
    }

    const existing = db.user.findUnique(email);
    if (existing) {
      return NextResponse.json({ errorCode: "emailExists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = db.user.create({ id: generateId(), name, email, password: hashed });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ errorCode: "registerFailed" }, { status: 500 });
  }
}
