"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Modal,
  Button,
  Dropdown,
} from "react-bootstrap";
import { useSession } from "next-auth/react";
import {
  fetchUserNotifications,
  updateUserNotificationStatus,
} from "@/app/api/notify/Notify";
import { useTranslations } from "next-intl";
import { UserNotify } from "@/app/type/notify/User_notify";
const truncateText = (text: string, maxLength: number) =>
  text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

const NotificationsPage: React.FC = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<UserNotify[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<UserNotify | null>(null);
  const [language, setLanguage] = useState<"en" | "vi">("en");

  const t = useTranslations("notifies");

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.token && session?.user?.user_id) {
        try {
          setLoading(true);
          const data = await fetchUserNotifications(
            session.user.token,
            session.user.user_id
          );
          setNotifications(data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
          setError(t("error"));
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, t]);

  const handleMarkAsRead = async (userNotifyId: string) => {
    if (session?.user?.token) {
      try {
        const notificationToUpdate = notifications.find(
          (n) => n.id === userNotifyId
        );
        if (notificationToUpdate) {
          await updateUserNotificationStatus(userNotifyId, session.user.token, {
            is_read: true,
          });
          const updatedData = await fetchUserNotifications(
            session.user.token,
            session.user.user_id
          );
          setNotifications(updatedData);
          setSelectedNotification(notificationToUpdate);
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const handleClosePopup = async () => {
    if (selectedNotification && session?.user?.token) {
      try {
        await updateUserNotificationStatus(
          selectedNotification.id,
          session.user.token,
          { is_read: true }
        );
        const updatedData = await fetchUserNotifications(
          session.user.token,
          session.user.user_id
        );
        setNotifications(updatedData);
      } catch (error) {
        console.error("Error updating notification status:", error);
      }
    }
    setSelectedNotification(null);
  };

  return (
    <Container className="py-4">
      {/* Language Switcher */}
      <div className="d-flex justify-content-end mb-3">
        <Dropdown>
          <Dropdown.Toggle variant="outline-primary" id="dropdown-language">
            {language === "en" ? "English" : "Tiếng Việt"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setLanguage("en")}>
              English
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setLanguage("vi")}>
              Tiếng Việt
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {loading ? (
        <p className="text-center text-muted">{t("loading")}</p>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : (
        <Row>
          <Col md={8} className="mx-auto">
            <Card className="shadow-sm border-0">
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h5 className="mb-0">
                  <i className="bi bi-bell me-2" />
                  {t("notify")}
                </h5>
              </div>

              <Card.Body>
                <ListGroup variant="flush">
                  {notifications.length > 0 ? (
                    notifications.map((userNotify) => (
                      <ListGroup.Item
                        key={userNotify.id}
                        className={`p-0 w-100 ${
                          userNotify.is_read ? "bg-light" : ""
                        }`}
                        onClick={() => handleMarkAsRead(userNotify.id)}
                        style={{
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            userNotify.is_read ? "#f8f9fa" : "transparent")
                        }
                      >
                        <div className="p-3">
                          <h6 className="mb-1 fw-bold">
                            {truncateText(userNotify.notify.title, 50)}
                          </h6>
                          <p className="mb-1 text-muted">
                            {truncateText(userNotify.notify.message, 100)}
                          </p>
                          <small className="text-muted">
                            {new Date(
                              userNotify.notify.createdAt ?? Date.now()
                            ).toLocaleString()}
                          </small>
                        </div>
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item className="text-center text-muted">
                      {t("no_notification_found")}
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Modal show={!!selectedNotification} onHide={handleClosePopup} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("notification_detail")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <div className="py-2">
              <div className="mb-3">
                <h5 className="fw-bold mb-1">{t("title")}:</h5>
                <p className="mb-0">{selectedNotification.notify.title}</p>
              </div>
              <div className="mb-3">
                <h5 className="fw-bold mb-1">{t("message")}:</h5>
                <p className="mb-0">{selectedNotification.notify.message}</p>
              </div>
              <div className="mb-3">
                <h5 className="fw-bold mb-1">{t("dateCreated")}:</h5>
                <p className="mb-0">
                  {new Date(
                    selectedNotification.notify.createdAt || Date.now()
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePopup}>
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NotificationsPage;
