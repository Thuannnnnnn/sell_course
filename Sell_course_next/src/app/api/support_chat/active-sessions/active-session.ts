import { NextResponse } from "next/server";
import axios from "axios";

export async function getChatActiveSessions() {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/active-sessions`
    );
    const sessions = Array.isArray(response.data) ? response.data : [];

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    return NextResponse.json([], { status: 500 });
  }
}
