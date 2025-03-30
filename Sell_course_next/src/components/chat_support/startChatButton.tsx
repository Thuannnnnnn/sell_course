import { useSession } from "next-auth/react";
import {
  StartChat,
  StartChatResponse,
} from "../../app/api/support_chat/supportChat"; // Adjust path as needed
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";
import styles from "../../style/StartChatButton.module.css"; // Import CSS module

export default function StartChatButton() {
  const router = useRouter();
  const { data: session } = useSession();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleStartChat = async () => {
    if (!session?.user?.user_id || !session?.user?.token) {
      // Đổi từ && thành ||
      console.log("User not authenticated or user_id/token missing");
      return;
    }

    setIsLoading(true);
    try {
      const response: StartChatResponse | undefined = await StartChat(
        session.user.user_id,
        session.user.token
      );

      if (response?.sessionId) {
        console.log("Chat session started with ID:", response.sessionId);
        router.push(`/${locale}/chats/${response.sessionId}`);
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
      disabled={isLoading || !session?.user?.user_id} // Đảm bảo chỉ bật khi có user_id
      className={`${styles.startChatButton} ${
        isLoading ? styles.loadingButton : ""
      } ${
        isHovered && !isLoading && session?.user?.user_id
          ? styles.hoveredButton
          : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isLoading && <span className={styles.buttonLoader}></span>}
      {isLoading ? "Starting..." : "Start Chat"}
    </button>
  );
}
