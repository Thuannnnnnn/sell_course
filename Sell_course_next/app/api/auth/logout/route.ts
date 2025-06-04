import { NextResponse } from "next/server";
import { signOut } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await signOut({ redirect: false });
  return NextResponse.redirect(
    new URL("/auth/login", process.env.NEXTAUTH_URL!)
  );
}
