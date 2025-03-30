import { useSession } from "next-auth/react";
import {
  StartChat,
  StartChatResponse,
} from "../../app/api/support_chat/supportChat"; // Adjust path as needed
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";

// Inline styles object
const styles = {
  button: {
    backgroundColor: "#4a86e8",
    color: "white",
    fontWeight: 600,
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "120px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    position: "relative" as "relative",
  },
  buttonHover: {
    "&:hover": {
      backgroundColor: "#3a76d8",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
  },
  buttonDisabled: {
    backgroundColor: "#b3c7e6",
    cursor: "not-allowed",
    opacity: 0.7,
    boxShadow: "none",
  },
  loadingButton: {
    opacity: 0.8,
  },
  loadingIndicator: {
    display: "inline-block",
    marginLeft: "8px",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    borderTopColor: "white",
    animation: "spin 0.8s linear infinite",
  },
  "@keyframes spin": {
    to: { transform: "rotate(360deg)" },
  },
};

export default function StartChatButton() {
  const router = useRouter();
  const { data: session } = useSession();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleStartChat = async (): Promise<void> => {
    // Type guard for session and user_id
    if (!session?.user?.user_id && !session?.user?.token) {
      console.log("User not authenticated or user_id missing");
      return;
    }

    setIsLoading(true);
    try {
      const response: StartChatResponse | undefined = await StartChat(
        session.user.user_id,
        session?.user?.token
      );

      if (response?.sessionId) {
        const sessionId: string = response.sessionId;
        console.log("Chat session started with ID:", sessionId);
        router.push(`/${locale}/chats/${sessionId}`);
      } else {
        console.log("Failed to start chat: No response or invalid response");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a style tag for keyframes animation
  const keyframesStyle = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  // Combine styles based on state
  const buttonStyle = {
    ...styles.button,
    ...(isHovered && !isLoading && !(!session?.user?.user_id) ? {
      backgroundColor: "#3a76d8",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    } : {}),
    ...(isLoading || !session?.user?.user_id ? styles.buttonDisabled : {}),
    ...(isLoading ? styles.loadingButton : {}),
  };

  return (
    <>
      <style>{keyframesStyle}</style>
      <button
        onClick={handleStartChat}
        disabled={isLoading || !session?.user?.user_id}
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isLoading ? (
          <>
            Starting...
            <span
              style={{
                display: "inline-block",
                marginLeft: "8px",
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                borderTopColor: "white",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </>
        ) : (
          "Start Chat"
        )}
      </button>
    </>
  );
}