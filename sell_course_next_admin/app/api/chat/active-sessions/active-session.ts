import axios from "axios";

export async function getChatActiveSessions() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  console.log("Backend URL:", backendUrl);
  try {
    const response = await axios.get(
      `${backendUrl}/chats/active-sessions`
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    return [];
  }
}