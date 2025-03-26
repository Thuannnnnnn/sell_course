"use client";
import React, { useState, useEffect } from "react";
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
  const [selectedNotification, setSelectedNotification] =
    useState<Notify | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isResponsive, setIsResponsive] = useState(false);

  // Kiểm tra kích thước màn hình để xác định chế độ responsive
  useEffect(() => {
    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 991.98);
    };

    handleResize(); // Kiểm tra ngay khi component mount
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
        await markAllNotificationsAsSent(
          session.user.user_id,
          session.user.token
        );
        socket?.emit("markAllAsSent", { userId: session.user.user_id });
      } catch (error) {
        console.error("Error marking all notifications as sent:", error);
      }
    }
  };

  const handleClosePopup = () => {
    setSelectedNotification(null);
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown) {
      handleMarkAllAsSent();
    }
  };

  const displayedNotifications = [...notifications]
    .sort((a, b) => (a.is_sent === b.is_sent ? 0 : a.is_sent ? 1 : -1))
    .slice(0, 3);

  const unSentNotifications = notifications.filter((n) => !n.is_sent);

  // Component chuông và Dropdown để tái sử dụng
  const NotificationBell = () => (
    <Dropdown
      align="end"
      className="m-2"
      show={showDropdown}
      onToggle={toggleDropdown}
    >
      <Dropdown.Toggle
        variant="link"
        className={
          isResponsive ? "responsive-bell" : "bell-container nav-link p-0"
        }
        bsPrefix="undropdown-toggle"
      >
        <div className={isResponsive ? "" : "bell-wrapper"}>
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
                setShowDropdown(false);
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
                {!notify.is_read && <span className="unread-dot"></span>}
              </div>
            </Dropdown.Item>
          ))
        ) : (
          <Dropdown.Item disabled>{s("no_notification_found")}</Dropdown.Item>
        )}
        <Dropdown.Divider />
        <Dropdown.Item>
          <Link
            href={`/${localActive}/notifications`}
            onClick={() => setShowDropdown(false)}
          >
            {t("viewMore")}
          </Link>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <Navbar
      expand="lg"
      bg={theme}
      className="header-main"
      data-bs-theme={theme}
    >
      <Container fluid>
        <div className="header-brand">
          <Link href={`/${localActive}`} className="brand-link">
            <Image
              src="/RedFlag_GoldenStar.png"
              alt="logo"
              className="brand-logo"
              width={80}
              height={80}
            />
            <span className="brand-text">
              <span className="brand-text-red">RedFlag</span>{" "}
              <span className="brand-text-gold">GoldenStar</span>
            </span>
          </Link>
        </div>

        <div className="d-flex align-items-center">
          {session && isResponsive && <NotificationBell />}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </div>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="nav-links ms-auto align-items-center">
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
                {session && !isResponsive && <NotificationBell />}
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
        </Navbar.Collapse>
      </Container>

      <Modal show={!!selectedNotification} onHide={handleClosePopup} centered>
        <Modal.Header closeButton>
          <Modal.Title>{s("notification_detail")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <div className="py-2">
              <div className="mb-3">
                <h5 className="fw-bold mb-1">{s("title")}:</h5>
                <p className="mb-0">{selectedNotification.title}</p>
              </div>
              <div className="mb-3">
                <h5 className="fw-bold mb-1">{s("message")}:</h5>
                <p className="mb-0">{selectedNotification.message}</p>
              </div>
              <div className="mb-3">
                <h5 className="fw-bold mb-1">{s("dateCreated")}:</h5>
                <p className="mb-0">
                  {new Date(
                    selectedNotification.createdAt || Date.now()
                  ).toLocaleString()}
                </p>
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
