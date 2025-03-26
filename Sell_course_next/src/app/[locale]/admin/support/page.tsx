"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getChatActiveSessions } from "@/app/api/support_chat/active-sessions/route";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import Sidebar from "@/components/SideBar";

interface ChatSession {
  id: string;
  userId: string;
  startTime: string;
  isActive: boolean;
  endTime: string | null;
}

export default function SupportPage() {
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations("Support");

  useEffect(() => {
    if (!session?.user) {
      window.location.href = `/${locale}/login`;
      return;
    }
    const fetchActiveSessions = async () => {
      try {
        const response = await getChatActiveSessions();
        const data = await response.json();
        setActiveSessions(data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải các phiên hỗ trợ:", err);
        setError(t("errorLoadingSessions"));
        setLoading(false);
      }
    };

    fetchActiveSessions();
  }, [locale, session?.user, t]);

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t("loading")}</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="d-flex">
      <div>
        <Sidebar />
      </div>
      <Container>
        <div className="p-4">
          <h1 className="mb-4">{t("title")}</h1>

          <Card className="mb-4">
            <Card.Header>
              <h2 className="h4 mb-0">{t("activeSessions")}</h2>
            </Card.Header>
            <Card.Body>
              {activeSessions.length === 0 ? (
                <p className="text-muted">{t("noActiveSessions")}</p>
              ) : (
                <Row className="g-4">
                  {activeSessions.map((chatSession) => (
                    <Col key={chatSession.id} xs={12} md={6} lg={4}>
                      <Card className="h-100">
                        <Card.Body>
                          <div className="d-flex flex-column h-100">
                            <div className="mb-3">
                              <p className="mb-0">
                                <strong>{t("startTime")}:</strong>{" "}
                                {new Date(
                                  chatSession.startTime
                                ).toLocaleString()}
                              </p>
                            </div>
                            <div className="mt-auto d-flex gap-2">
                              <Link
                                href={`/${locale}/chats/${chatSession.id}`}
                                className="flex-grow-1"
                              >
                                <Button variant="primary" className="w-100">
                                  {t("joinSupport")}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
}
