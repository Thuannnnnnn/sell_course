"use client";

import React, { useEffect, useState } from "react";
import {
  GetChatHistory,
  ChatHistoryResponse,
} from "@/app/api/support_chat/supportChat";
import { Container, Table, Spinner, Alert } from "react-bootstrap";
import { useSession } from "next-auth/react";

const ChatHistoryPage = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryResponse[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        if (!session?.user?.user_id && !session?.user?.token) return;
        const history = await GetChatHistory(
          session?.user?.user_id,
          session?.user?.token
        );
        if (history) {
          setChatHistory(history);
        } else {
          setError("Không tìm thấy lịch sử chat.");
        }
      } catch {
        setError("Đã xảy ra lỗi khi tải lịch sử chat.");
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [session]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Lịch sử Chat</h1>
      {chatHistory && chatHistory.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Session ID</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Messages</th>
            </tr>
          </thead>
          <tbody>
            {chatHistory.map((history, index) => (
              <tr key={history.session.id}>
                <td>{index + 1}</td>
                <td>{history.session.id}</td>
                <td>{new Date(history.session.startTime).toLocaleString()}</td>
                <td>
                  {history.session.endTime
                    ? new Date(history.session.endTime).toLocaleString()
                    : "Đang hoạt động"}
                </td>
                <td>
                  <ul>
                    {history.messages.map((message) => (
                      <li key={message.id}>
                        <strong>{message.sender}:</strong> {message.messageText}{" "}
                        <em>
                          ({new Date(message.timestamp).toLocaleString()})
                        </em>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">Không có lịch sử chat nào.</Alert>
      )}
    </Container>
  );
};

export default ChatHistoryPage;
