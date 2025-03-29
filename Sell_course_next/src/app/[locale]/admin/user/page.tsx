"use client";
import Sidebar from "@/components/SideBar";
import UserTable from "@/components/UserTable";
import "@/style/User.css";
import { useTranslations } from "next-intl";

const UsersPage = () => {
  const t = useTranslations("user");
  return (
    <div className="page-container">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="content-container">
        <h3 className="page-title">{t("title")}</h3>
        <UserTable />
      </div>
    </div>
  );
};
export default UsersPage;
