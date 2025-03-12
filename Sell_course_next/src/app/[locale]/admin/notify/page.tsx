"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "react-bootstrap";
import NotifyList from "@/components/notifty/notifyComponents";
import { useSession } from "next-auth/react";
import { Notify } from "@/app/type/notify/Notify";
import Sidebar from "@/components/SideBar";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import { fetchNotifications } from "@/app/api/notify/Notify";
import NotifyCreateModal from "@/components/notifty/NotifyCreateModal";

const NotifyPage: React.FC = () => {
  const [notifies, setNotifies] = useState<Notify[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editNotify, setEditNotify] = useState<Notify | null>(null);
  const { data: session } = useSession();
  const t = useTranslations("notifies");
  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const token = session?.user.token;
        if (!token) {
          return;
        }
        const data = await fetchNotifications(token);
        setNotifies(data);
      } catch (error) {
        console.log("Loaded notifications error:", error);
      }
    };

    fetchNotification();
  }, [session]);

  useEffect(() => {
    const successMessage = localStorage.getItem("notifySuccess");
    if (successMessage) {
      createNotification("success", "Thao tác thành công!")();
      localStorage.removeItem("notifySuccess");
    }
  }, []);

  const createNotification = (
    type: "info" | "success" | "warning" | "error",
    message: string
  ) => {
    return () => {
      switch (type) {
        case "info":
          NotificationManager.info(message || "Info message");
          break;
        case "success":
          NotificationManager.success(message || "Success!");
          break;
        case "warning":
          NotificationManager.warning(message || "Warning!", 3000);
          break;
        case "error":
          NotificationManager.error(message || "Error occurred", 5000);
          break;
      }
    };
  };

  const handleEditNotify = (notify: Notify) => {
    setEditNotify(notify);
    setShowModal(true);
  };

  const handleUpdateNotify = (updatedNotify: Notify) => {
    setNotifies((prev) =>
      prev.map((notify) =>
        notify.notifyId === updatedNotify.notifyId ? updatedNotify : notify
      )
    );
    setShowModal(false);
    setEditNotify(null);
  };

  return (
    <div className="d-flex">
      <div className="sidebar-page">
        <Sidebar />
      </div>
      <div className="layout-right">
        <div className="layout-rightHeader">
          <h3>{t("notify")}</h3>
          <Button
            className="button-create"
            onClick={() => {
              setEditNotify(null);
              setShowModal(true);
            }}
          >
            <span className="icon">+</span>
            {t("createNotification")}
          </Button>
        </div>
        <NotifyList
          notifies={notifies}
          setNotifies={setNotifies}
          onEdit={handleEditNotify}
        />
      </div>
      <NotificationContainer />
      <NotifyCreateModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        addNotify={(newNotify) => setNotifies((prev) => [...prev, newNotify])}
        editNotify={editNotify}
        updateNotify={handleUpdateNotify}
      />
    </div>
  );
};

export default NotifyPage;
