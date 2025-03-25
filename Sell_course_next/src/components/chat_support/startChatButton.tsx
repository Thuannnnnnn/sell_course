import { useSession } from "next-auth/react";
import {
  StartChat,
  StartChatResponse,
} from "../../app/api/support_chat/supportChat"; // Adjust path as needed
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";

export default function StartChatButton() {
  const router = useRouter();
  const { data: session } = useSession();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChat = async (): Promise<void> => {
    // Type guard for session and user_id
    if (!session?.user?.user_id) {
      console.log("User not authenticated or user_id missing");
      return;
    }

    setIsLoading(true);
    try {
      const response: StartChatResponse | undefined = await StartChat(
        session.user.user_id
      );

      if (response?.sessionId) {
        const sessionId: string = response.sessionId;
        console.log("Chat session started with ID:", sessionId);
        router.push(`/${locale}/chats/${sessionId}`); // Added leading slash for consistency
      } else {
        console.log("Failed to start chat: No response or invalid response");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={isLoading || !session?.user?.user_id}
    >
      {isLoading ? "Starting..." : "Start Chat"}
    </button>
  );
}
