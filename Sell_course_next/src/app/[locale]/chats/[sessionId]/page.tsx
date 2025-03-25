"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useSocket from "../../../../hook/useChatSupportSocket";
import { Container, Row, Col, Form, Button, ListGroup } from "react-bootstrap";

interface ChatMessage {
  sessionId: string;
  sender: string;
  messageText: string;
  timestamp: string;
}

export default function Chat() {
  const router = useRouter();
  const { sessionId } = useParams();

  // Gọi tất cả hooks trước bất kỳ return nào
  const { messages, sendMessage } = useSocket(sessionId || "");
  const [inputValue, setInputValue] = useState<string>("");

  // Sử dụng useEffect để xử lý chuyển hướng
  useEffect(() => {
    if (!sessionId || typeof sessionId !== "string") {
      router.push("/");
    }
  }, [sessionId, router]);

  // Nếu sessionId không hợp lệ, trả về một UI tạm thời
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

      {/* Khu vực hiển thị tin nhắn */}
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
                msg.sender === "CUSTOMER" ? "text-end" : "text-start"
              }`}
            >
              <div
                className={`d-inline-block p-2 rounded ${
                  msg.sender === "CUSTOMER"
                    ? "bg-primary text-white"
                    : "bg-light text-dark"
                }`}
                style={{ maxWidth: "70%" }}
              >
                <small className="d-block text-muted">
                  {msg.sender === "CUSTOMER" ? "You" : "Support"}
                </small>
                {msg.messageText}
                <small className="d-block text-muted mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      {/* Form nhập tin nhắn */}
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
