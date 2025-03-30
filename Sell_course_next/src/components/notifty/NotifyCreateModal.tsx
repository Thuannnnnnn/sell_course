"use client";
import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { addNotification, updateNotification } from "@/app/api/notify/Notify";
import { useSession } from "next-auth/react";
import { Notify } from "@/app/type/notify/Notify";
import { Course } from "@/app/type/course/Course";
import { User } from "@/app/type/user/User";
import { fetchUsers } from "@/app/api/user/User";
import { fetchCourses } from "@/app/api/course/CourseAPI";
import { useTranslations } from "next-intl";
import Select from "react-select";
import "@/style/NotifyModal.css";
import { StylesConfig } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface NotifyCreateModalProps {
  show: boolean;
  handleClose: () => void;
  addNotify: (notify: Notify) => void;
  editNotify?: Notify | null;
  updateNotify: (notify: Notify) => void;
}

const NotifyCreateModal: React.FC<NotifyCreateModalProps> = ({
  show,
  handleClose,
  addNotify,
  editNotify,
  updateNotify,
}) => {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"GLOBAL" | "USER" | "COURSE" | "ADMIN">(
    "GLOBAL"
  );
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const t = useTranslations("notifies");

  const typeOptions: Option[] = [
    { value: "GLOBAL", label: "🌐 " + t("global") },
    { value: "COURSE", label: "📚 " + t("course") },
    { value: "USER", label: "👥 " + t("user") },
    { value: "ADMIN", label: "🛡️ " + t("adminss") },
  ];

  const courseOptions: Option[] = courses.map((course) => ({
    value: course.courseId,
    label: course.title,
  }));

  const userOptions: Option[] = users.map((user) => ({
    value: user.user_id,
    label: user.email ?? "No Email",
  }));

  useEffect(() => {
    if (editNotify) {
      setTitle(editNotify.title);
      setMessage(editNotify.message);
      setType(editNotify.type);

      const courseIds = editNotify.courseId
        ? editNotify.courseId.split(",")
        : [];
      const userIds = editNotify.userId ? editNotify.userId.split(",") : [];

      setSelectedCourseIds(courseIds);
      setSelectedUserIds(userIds);

      // Load data based on type
      const loadData = async () => {
        try {
          const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
          if (editNotify.type === "COURSE") {
            // Load courses and selected courses
            const [courseData, notifyCourses] = await Promise.all([
              fetchCourses(),
              fetch(
                `${BASE_URL}/api/admin/notify/${editNotify.notifyId}/courses`
              )
                .then((res) => res.json())
                .catch(() => ({ courseIds: [] })),
            ]);

            setCourses(courseData);
            if (notifyCourses.courseIds?.length > 0) {
              setSelectedCourseIds(notifyCourses.courseIds);
            }
          } else if (editNotify.type === "USER" && session?.user?.token) {
            // Load users and selected users
            const [userData, notifyUsers] = await Promise.all([
              fetchUsers(session.user.token),
              fetch(`${BASE_URL}/api/admin/notify/${editNotify.notifyId}/users`)
                .then((res) => res.json())
                .catch(() => []),
            ]);

            setUsers(userData);
            if (notifyUsers?.length > 0) {
              setSelectedUserIds(notifyUsers);
            }
          }
        } catch (error) {
          console.error("Error loading data:", error);
        }
      };

      loadData();
    } else {
      setTitle("");
      setMessage("");
      setType("GLOBAL");
      setSelectedCourseIds([]);
      setSelectedUserIds([]);
    }
  }, [editNotify, session]);

  // Load data when type changes (only for create mode)
  useEffect(() => {
    if (!editNotify) {
      const loadData = async () => {
        try {
          if (type === "COURSE") {
            const courseData = await fetchCourses();
            setCourses(courseData);
          } else if (type === "USER" && session?.user?.token) {
            const userData = await fetchUsers(session.user.token);
            setUsers(userData);
          }
        } catch (error) {
          console.error("Error loading data:", error);
        }
      };

      loadData();
    }
  }, [type, session, editNotify]);

  // Clear data when modal closes
  useEffect(() => {
    if (!show) {
      setCourses([]);
      setUsers([]);
    }
  }, [show]);

  useEffect(() => {
    const successMessage = localStorage.getItem("notifySuccess");
    if (successMessage) {
      localStorage.removeItem("notifySuccess");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token) {
      alert("Unauthorized");
      return;
    }

    try {
      const notificationData = {
        title,
        message,
        type,
        isGlobal: type === "GLOBAL",
        courseId: type === "COURSE" ? selectedCourseIds.join(",") : "",
        userId: type === "USER" ? selectedUserIds.join(",") : null,
      };

      if (editNotify) {
        const newNotify: Notify = await updateNotification(
          editNotify.notifyId || "",
          notificationData,
          session.user.token
        );
        updateNotify(newNotify);
        localStorage.setItem("notifySuccess", "true");
      } else {
        const newNotify: Notify = await addNotification(
          {
            ...notificationData,
            isGlobal: type === "GLOBAL" || type === "ADMIN",
          },
          session.user.token
        );
        addNotify(newNotify);
        localStorage.setItem("notifySuccess", "true");
        setTitle("");
        setMessage("");
        setType("GLOBAL");
        setSelectedCourseIds([]);
        setSelectedUserIds([]);
      }

      handleClose();
    } catch (error) {
      console.error("Failed to create notification", error);
    }
  };

  const customStyles: StylesConfig<Option, true> = {
    control: (base) => ({
      ...base,
      minHeight: 50,
      borderRadius: 8,
      borderColor: "#dee2e6",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#80bdff",
      },
    }),
    option: (base, state) => ({
      ...base,
      padding: "10px 15px",
      backgroundColor: state.isSelected
        ? "#0d6efd"
        : state.isFocused
        ? "#f8f9fa"
        : "white",
      "&:active": {
        backgroundColor: "#0d6efd",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#e9ecef",
      borderRadius: 4,
      padding: "2px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#495057",
      padding: "2px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#495057",
      "&:hover": {
        backgroundColor: "#dc3545",
        color: "white",
      },
    }),
  };

  const singleSelectStyles: StylesConfig<Option, false> = {
    control: (base) => ({
      ...base,
      minHeight: 50,
      borderRadius: 8,
      borderColor: "#dee2e6",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#80bdff",
      },
    }),
    option: (base, state) => ({
      ...base,
      padding: "10px 15px",
      backgroundColor: state.isSelected
        ? "#0d6efd"
        : state.isFocused
        ? "#f8f9fa"
        : "white",
      "&:active": {
        backgroundColor: "#0d6efd",
      },
    }),
  };

  return (
    <>
      {show && (
        <Modal
          show={show || false}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
          size="lg"
          className="notification-modal"
        >
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              <i className="bi bi-bell me-2"></i>
              {editNotify ? t("edit") : t("create")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-12">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">{t("title")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="form-control-lg"
                      placeholder="Enter notification title..."
                    />
                  </Form.Group>
                </div>

                <div className="col-12">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">{t("message")}</Form.Label>
                    <Form.Control
                      as="textarea"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="form-control-lg"
                      style={{ minHeight: "120px" }}
                      placeholder="Enter notification message..."
                    />
                  </Form.Group>
                </div>

                <div className="col-12">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">{t("type")}</Form.Label>
                    <Select<Option>
                      value={typeOptions.find(
                        (option) => option.value === type
                      )}
                      onChange={(option) => {
                        if (option) {
                          setType(
                            option.value as
                              | "GLOBAL"
                              | "USER"
                              | "COURSE"
                              | "ADMIN"
                          );
                          setSelectedCourseIds([]);
                          setSelectedUserIds([]);
                        }
                      }}
                      options={typeOptions}
                      styles={singleSelectStyles}
                      isSearchable={false}
                    />
                  </Form.Group>
                </div>

                {type === "COURSE" && (
                  <div className="col-12">
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold d-flex align-items-center">
                        <i className="bi bi-book me-2"></i>
                        {t("selectCourse")}
                      </Form.Label>
                      <Select<Option, true>
                        isMulti
                        value={courseOptions.filter((option) =>
                          selectedCourseIds.includes(option.value)
                        )}
                        onChange={(selected) => {
                          const selectedIds = selected.map(
                            (option) => option.value
                          );
                          setSelectedCourseIds(selectedIds);
                        }}
                        options={courseOptions}
                        styles={customStyles}
                        placeholder="Select courses..."
                      />
                    </Form.Group>
                  </div>
                )}

                {type === "USER" && (
                  <div className="col-12">
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold d-flex align-items-center">
                        <i className="bi bi-people me-2"></i>
                        {t("selectUser")}
                      </Form.Label>
                      <Select<Option, true>
                        isMulti
                        value={userOptions.filter((option) =>
                          selectedUserIds.includes(option.value)
                        )}
                        onChange={(selected) => {
                          const selectedIds = selected.map(
                            (option) => option.value
                          );
                          setSelectedUserIds(selectedIds);
                        }}
                        options={userOptions}
                        styles={customStyles}
                        placeholder="Select users..."
                      />
                    </Form.Group>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  className="me-2"
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="px-4">
                  <i className="bi bi-send me-2"></i>
                  {editNotify ? t("editNotification") : t("create")}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default NotifyCreateModal;
