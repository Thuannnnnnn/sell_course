"use client";
import React, { useState } from "react";
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
import {
  markAllNotificationsAsSent,
  updateUserNotificationStatus,
} from "@/app/api/notify/Notify";
import { useSocket } from "@/hook/useNotifySocket";
import { Notify } from "@/app/type/notify/Notify";
import "@/style/NotificationDropdown.css";

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const localActive = useLocale();
  const t = useTranslations("Header");
  const s = useTranslations("notifies");
  const router = useRouter();
  const { theme } = useTheme();
  const { socket, notifications } = useSocket(
    session?.user?.user_id,
    session?.user?.token
  );
  const [selectedNotification, setSelectedNotification] = useState<Notify | null>(null);

  const handleMarkAsRead = async (userNotifyId: string) => {
    if (socket && session?.user?.token) {
      try {
        await updateUserNotificationStatus(userNotifyId, session.user.token, {
          is_read: true,
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const handleMarkAllAsSent = async () => {
    if (session?.user?.token && session?.user?.user_id) {
      try {
        await markAllNotificationsAsSent(session.user.user_id, session.user.token);
        socket?.emit("markAllAsSent", { userId: session.user.user_id });
      } catch (error) {
        console.error("Error marking all notifications as sent:", error);
      }
    }
  };

  const handleClosePopup = () => {
    setSelectedNotification(null);
  };

  const displayedNotifications = [...notifications]
    .sort((a, b) => (a.is_sent === b.is_sent ? 0 : a.is_sent ? 1 : -1))
    .slice(0, 3);

  const unSentNotifications = notifications.filter((n) => !n.is_sent);

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
          {session?.user?.role === "ADMIN" || session?.user?.role === "STAFF" ? (
            <Link href={`/${localActive}/admin/dashboard`} className="nav-link me-4">
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
              <Link href={`/${localActive}/profile/myProfile`} className="nav-link">
                <FaRegUser />
              </Link>
              <Dropdown align="end" className="m-2" onToggle={handleMarkAllAsSent}>
                <Dropdown.Toggle
                  variant="link"
                  className="bell-container nav-link p-0"
                  bsPrefix="undropdown-toggle"
                >
                  <div className="bell-wrapper">
                    <FaRegBell className="notification-bell" />
                    {unSentNotifications.length > 0 && (
                      <Badge className="notification-badge" bg="danger">
                        {unSentNotifications.length}
                      </Badge>
                    )}
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="notification-dropdown">
                  <Dropdown.Header className="notification-header">
                    {s("notify")}
                  </Dropdown.Header>
                  {displayedNotifications.length > 0 ? (
                    displayedNotifications.map((notify) => (
                      <Dropdown.Item
                        key={notify.id}
                        className={`notification-item ${
                          notify.is_read ? "read-notification" : ""
                        }`}
                        onClick={() => {
                          handleMarkAsRead(notify.id);
                          setSelectedNotification(notify.notify);
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>{notify.notify.title}</span>
                          {!notify.is_read && (
                            <span className="unread-dot"></span>
                          )}
                        </div>
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item disabled>
                      {s("no_notification_found")}
                    </Dropdown.Item>
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

      <Modal show={!!selectedNotification} onHide={handleClosePopup} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedNotification?.title || s("notification_detail")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification ? (
            <div>
              <h5>{selectedNotification.title}</h5>
              <p>{selectedNotification.message}</p>
            </div>
          ) : (
            <p>{s("no_details_available")}</p>
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