"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useSocket from "../../../../hook/useChatSupportSocket";
import { Container, Row, Col, Form, Button, ListGroup } from "react-bootstrap";
import { useSession } from "next-auth/react";

// Updated ChatMessage interface to match the structure from useChatSupportSocket.ts
interface ChatMessage {
  sessionId: string;
  sender: {
    user_id: string;
    username: string;
    avatarImg: string;
    email: string;
    role: string;
    isBan: boolean;
    isOAuth: boolean;
    phoneNumber: string | null;
    birthDay: string | null;
    gender: string | null;
    createdAt: string;
    updatedAt: string;
  };
  messageText: string;
  timestamp: string;
}

export default function Chat() {
  const router = useRouter();
  const { sessionId } = useParams();
  const { data: session } = useSession();
  const { messages, sendMessage, socket } = useSocket(sessionId || "");
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket) {
        socket.disconnect();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket]);

  useEffect(() => {
    if (!sessionId || typeof sessionId !== "string") {
      router.push("/");
    }
  }, [sessionId, router]);

  if (!sessionId || typeof sessionId !== "string") {
    return <div>Redirecting...</div>;
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: "800px" }}>
      <h3 className="mb-4 text-center">Chat Support</h3>

      {/* Message display area */}
      <div
        style={{
          height: "400px",
          overflowY: "auto",
          border: "1px solid #dee2e6",
          borderRadius: "5px",
          padding: "10px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <ListGroup>
          {messages.map((msg: ChatMessage, index: number) => (
            <ListGroup.Item
              key={index}
              className={`border-0 p-2 ${
                msg.sender.user_id === session?.user.user_id
                  ? "text-end"
                  : "text-start"
              }`}
            >
              <div
                className={`d-inline-block p-2 rounded ${
                  msg.sender.user_id === session?.user.user_id
                    ? "bg-primary text-white"
                    : "bg-light text-dark"
                }`}
                style={{ maxWidth: "70%" }}
              >
                <strong>{msg.sender.username}</strong>
                <p className="mb-1">{msg.messageText}</p>
                <small className="d-block text-muted mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      {/* Message input form */}
      <Form onSubmit={handleSendMessage} className="mt-3">
        <Row className="align-items-center">
          <Col xs={9} md={10}>
            <Form.Control
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="rounded-pill"
            />
          </Col>
          <Col xs={3} md={2} className="text-end">
            <Button
              variant="primary"
              type="submit"
              className="rounded-pill w-100"
            >
              Send
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
