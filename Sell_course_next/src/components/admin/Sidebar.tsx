"use client";
import { Nav } from "react-bootstrap";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

export default function Sidebar() {
  const locale = useLocale();
  const t = useTranslations("Admin");

  return (
    <Nav
      className="flex-column bg-dark text-white"
      style={{ minHeight: "100vh" }}
    >
      <div className="p-3">
        <h4 className="mb-4">{t("adminPanel")}</h4>
      </div>
      <Nav.Link
        as={Link}
        href={`/${locale}/admin/dashboard`}
        className="text-white"
      >
        {t("dashboard")}
      </Nav.Link>
      <Nav.Link
        as={Link}
        href={`/${locale}/admin/courses`}
        className="text-white"
      >
        {t("courses")}
      </Nav.Link>
      <Nav.Link
        as={Link}
        href={`/${locale}/admin/users`}
        className="text-white"
      >
        {t("users")}
      </Nav.Link>
      <Nav.Link
        as={Link}
        href={`/${locale}/admin/support`}
        className="text-white"
      >
        {t("support")}
      </Nav.Link>
      <Nav.Link
        as={Link}
        href={`/${locale}/admin/notifications`}
        className="text-white"
      >
        {t("notifications")}
      </Nav.Link>
    </Nav>
  );
}
