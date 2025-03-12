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
  const [type, setType] = useState<"GLOBAL" | "USER" | "COURSE">("GLOBAL");
  const [courseId, setCourseId] = useState("");
  const [userId, setUserId] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseUpdate, setCourseUpdate] = useState<Course>();
  const [users, setUsers] = useState<User[]>([]);
  const t = useTranslations("notifies");
  useEffect(() => {
    if (editNotify) {
      setTitle(editNotify.title);
      setMessage(editNotify.message);
      setType(editNotify.type);
      setCourseId(editNotify.courseId || "");
      setUserId(editNotify.userId || "");
    }
  }, [editNotify]);

  useEffect(() => {
    if (type === "COURSE") {
      fetchCourses()
        .then((data) => {
          if (editNotify) {
            const selectedCourse = data.find(
              (course) => course.courseId === editNotify.course?.courseId
            );
            setCourseUpdate(selectedCourse || undefined);
          } else {
            setCourses(data);
          }
        })
        .catch(console.error);
    } else if (type === "USER" && session?.user?.token) {
      fetchUsers(session.user.token)
        .then((data) => setUsers(data))
        .catch(console.error);
    }
  }, [type, session, courseId, editNotify]);

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
      if (editNotify) {
        const newNotify: Notify = await updateNotification(
          editNotify.notifyId || "",
          {
            title,
            message,
            type,
            isGlobal: type === "GLOBAL",
            courseId: type === "COURSE" ? courseId : "",
            userId: type === "USER" ? userId : null,
          },
          session.user.token
        );
        updateNotify(newNotify);
        localStorage.setItem("notifySuccess", "true");
      } else {
        const newNotify: Notify = await addNotification(
          {
            title,
            message,
            type,
            isGlobal: type === "GLOBAL",
            courseId: type === "COURSE" ? courseId : "",
            userId: type === "USER" ? userId : null,
          },
          session.user.token
        );
        addNotify(newNotify);
        localStorage.setItem("notifySuccess", "true");
      }

      handleClose();
    } catch (error) {
      console.error("Failed to create notification", error);
    }
  };

  return (
    <>
      {show && (
        <Modal
          show={show || false}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editNotify ? t("edit") : t("create")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>{t("title") }</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>{t("message")}</Form.Label>
                <Form.Control
                  as="textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </Form.Group>
              {!editNotify && (
                <Form.Group>
                  <Form.Label>{t("type")}</Form.Label>
                  <Form.Select
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as "GLOBAL" | "USER" | "COURSE")
                    }
                  >
                    <option value="GLOBAL">{t("Global")}</option>
                    <option value="COURSE">{t("Course")}</option>
                    <option value="USER">{t("User")}</option>
                  </Form.Select>
                </Form.Group>
              )}
              {type === "COURSE" && (
                <>
                  {!editNotify?.course?.courseId ? (
                    <Form.Group>
                      <Form.Label>{t("selectCourse")}</Form.Label>
                      <Form.Select
                        value={courseId}
                        onChange={(e) => {
                          setCourseId(e.target.value);
                          const selectedCourse = courses.find(
                            (course) => course.courseId === e.target.value
                          );
                          setCourseUpdate(selectedCourse);
                        }}
                      >
                        <option value="">{t("selectCourse")}</option>
                        {courses.map((course) => (
                          <option key={course.courseId} value={course.courseId}>
                            {course.title}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  ) : (
                    <Form.Group>
                      <Form.Label>{t("selectCourse")}</Form.Label>
                      <Form.Control
                        type="text"
                        value={courseUpdate?.title}
                        readOnly
                      />
                    </Form.Group>
                  )}
                </>
              )}
              {type === "USER" && (
                <Form.Group>
                  <Form.Label>{t("selectUser")}</Form.Label>
                  <Form.Select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  >
                    <option value="">{t("selectUser")}</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.email ?? "No Email"}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              <Button variant="primary" type="submit" className="mt-3">
                {editNotify ? t("editNotification") : t("create") }
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default NotifyCreateModal;
