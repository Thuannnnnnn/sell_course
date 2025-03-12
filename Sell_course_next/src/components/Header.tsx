"use client";
import React, { useEffect, useState } from "react";
import {
  Navbar,
  Container,
  Nav,
  Image,
  Button,
  Dropdown,
  Badge,
  Modal,
} from "react-bootstrap";
import { useSession, signOut } from "next-auth/react";
import "../style/header.css";
import Link from "next/link";
import LocalSwitcher from "./local-switcher";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { IoIosLogOut } from "react-icons/io";
import { FaRegBell, FaRegUser } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";
import { UserNotify } from "@/app/type/notify/User_notify";
import {
  fetchUserNotifications,
  markAllNotificationsAsSent,
  updateUserNotificationStatus,
} from "@/app/api/notify/Notify";

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const localActive = useLocale();
  const t = useTranslations("Header"); // Bản dịch cho Header
  const s = useTranslations("notifies"); // Bản dịch cho thông báo
  const router = useRouter();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<UserNotify[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<UserNotify | null>(null);

  useEffect(() => {
    const fetchUserNotificationsData = async () => {
      if (session?.user?.token && session?.user?.user_id) {
        console.log("User ID:", session.user.user_id);
        console.log("Token:", session.user.token);
        try {
          setLoading(true);
          const data = await fetchUserNotifications(
            session.user.token,
            session.user.user_id
          );
          console.log("User Notifications:", data);
          setNotifications(data);
        } catch (error) {
          console.error("Error fetching user notifications:", error);
          setError(s("error")); // Sử dụng bản dịch cho lỗi
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchUserNotificationsData();
  }, [session, s]);

  const handleMarkAllAsSent = async () => {
    if (session?.user?.token && session?.user?.user_id) {
      try {
        await markAllNotificationsAsSent(
          session.user.user_id,
          session.user.token
        );
        const updatedData = await fetchUserNotifications(
          session.user.token,
          session.user.user_id
        );
        setNotifications(updatedData);
      } catch (error) {
        console.error("Error marking all notifications as sent:", error);
      }
    }
  };

  const handleMarkAsRead = async (userNotifyId: string) => {
    if (session?.user?.token) {
      try {
        const notificationToUpdate = notifications.find(
          (n) => n.id === userNotifyId
        );
        if (notificationToUpdate) {
          console.log("Updating UserNotify with ID:", userNotifyId);
          await updateUserNotificationStatus(userNotifyId, session.user.token, {
            is_read: true,
          });
          const updatedData = await fetchUserNotifications(
            session.user.token,
            session.user.user_id
          );
          console.log("Updated User Notifications:", updatedData);
          setNotifications(updatedData);
          setSelectedNotification(notificationToUpdate);
        } else {
          console.log("Notification not found with ID:", userNotifyId);
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

  const displayedNotifications = [...notifications]
    .sort((a, b) => (a.is_read === b.is_read ? 0 : a.is_read ? 1 : -1))
    .slice(0, 3);

  const unreadNotifications = notifications.filter((n) => !n.is_read);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <Navbar
      expand="lg"
      bg={theme}
      className="sticky-header"
      data-bs-theme={theme}
    >
      <Container
        fluid
        className="d-flex justify-content-between align-items-center"
      >
        <div className="d-flex align-items-center">
          <Link href={`/${localActive}`}>
            <Image
              src="/RedFlag_GoldenStar.png"
              alt="logo"
              rounded
              className="me-2"
              width={80}
            />
          </Link>
          <Navbar.Brand href={`/${localActive}`} className="title-custom">
            <span className="red-flag">RedFlag</span>{" "}
            <span className="golden-star">GoldenStar</span>
          </Navbar.Brand>
        </div>

        <Nav className="d-flex align-items-center flex-nowrap">
          {session?.user?.role === "ADMIN" ||
          session?.user?.role === "STAFF" ? (
            <Link
              href={`/${localActive}/admin/dashboard`}
              className="nav-link me-4"
            >
              {t("manage")}
            </Link>
          ) : null}
          <Link href={`/${localActive}/showCourse`} className="nav-link me-4">
            {t("course")}
          </Link>
          <Link href={`/${localActive}/cart`} className="nav-link me-4">
            {t("cart")}
          </Link>
          <Link href={`/${localActive}/forum`} className="nav-link me-4">
            {t("forum")}
          </Link>
          <LocalSwitcher />
          {status === "loading" ? (
            <span className="nav-link mx-4">{s("loading")}</span>
          ) : session ? (
            <>
              <Link
                href={`/${localActive}/profile/myProfile`}
                className="nav-link"
              >
                <FaRegUser />
              </Link>
              <Dropdown
                align="end"
                className="m-2"
                onToggle={handleMarkAllAsSent}
              >
                <Dropdown.Toggle
                  bsPrefix="dropdown-toggle"
                  variant="link"
                  className="bell-container nav-link p-0"
                  id="dropdown-no-caret"
                >
                  <div className="bell-wrapper">
                    <FaRegBell className="notification-bell" />
                    {unreadNotifications.length > 0 && (
                      <Badge bg="danger" className="notification-badge">
                        {unreadNotifications.length}
                      </Badge>
                    )}
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="notification-dropdown">
                  <Dropdown.Header className="notification-header">
                    {s("notify")}
                  </Dropdown.Header>
                  {loading ? (
                    <Dropdown.Item disabled>{s("loading")}</Dropdown.Item>
                  ) : error ? (
                    <Dropdown.Item disabled>{error}</Dropdown.Item>
                  ) : displayedNotifications.length > 0 ? (
                    displayedNotifications.map((notify) => (
                      <Dropdown.Item
                        key={notify.id}
                        className={`notification-item ${
                          notify.is_read ? "read-notification" : ""
                        }`}
                        onClick={() => handleMarkAsRead(notify.id)}
                      >
                        {truncateText(notify.notify.message, 50)}
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item disabled className="notification-empty">
                      {s("no_notification_found")}
                    </Dropdown.Item>
                  )}
                  {notifications.length > 3 && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        as={Link}
                        href={`/${localActive}/notifications`}
                      >
                        {s("view_all")}
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              <Button
                variant={theme}
                onClick={() => signOut()}
                className="btn btn-link nav-link mx-4"
              >
                <IoIosLogOut />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={theme}
                onClick={() => router.push(`/${localActive}/auth/signUp`)}
                className={`btn-signup mx-3 ${theme}`}
              >
                {t("signup")}
              </Button>
              <Button
                variant="light"
                onClick={() => router.push(`/${localActive}/auth/login`)}
                className="btn-login"
              >
                {t("login")}
              </Button>
            </>
          )}
        </Nav>
      </Container>

      {/* Popup Modal */}
      <Modal show={!!selectedNotification} onHide={handleClosePopup} centered>
        <Modal.Header closeButton>
          <Modal.Title>{s("notification_detail")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <div className="notification-modal-content">
              <h4 className="notification-title">
                {truncateText(selectedNotification.notify.title, 50)}
              </h4>
              <div className="notification-details">
                <p className="notification-description">
                  {selectedNotification.notify.message}
                </p>
                <div className="notification-meta">
                  <p>
                    <strong>{s("dateCreated")}:</strong>{" "}
                    {new Date(
                      selectedNotification.notify.createdAt || Date.now()
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePopup}>
            {s("close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Navbar>
  );
};

export default Header;
