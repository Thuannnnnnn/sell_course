"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import Sidebar from "@/components/SideBar";
import { useTranslations } from "next-intl";

import "@/style/courseAdmin.css";

import { QuestionHabit } from "@/app/type/question/question";
import {
  createQuestionHabit,
  deleteQuestionHabit,
  fetchQuestionHabits,
  updateQuestionHabit,
} from "@/app/api/questionHabit/questionHabitApi";

export default function ManageQuestionHabit() {
  const [questionHabits, setQuestionHabits] = useState<QuestionHabit[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: "", question: "" });
  const t = useTranslations("manageQuestionAnswer");

  const loadQuestionHabits = async () => {
    try {
      const data = await fetchQuestionHabits();
      setQuestionHabits(data);
    } catch {
    } finally {
    }
  };

  useEffect(() => {
    loadQuestionHabits();
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [form.question]);

  const handleCreateOrUpdate = async () => {
    try {
      if (form.id) {
        await updateQuestionHabit(form.id, form);
      } else {
        await createQuestionHabit(form);
      }
      loadQuestionHabits();
      handleClose();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestionHabit(id);
      loadQuestionHabits();
    } catch {}
  };

  const handleShow = (question = "", id = "") => {
    setForm({ question, id });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setForm({ id: "", question: "" });
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="layout-right">
        <h3>{t("title")}</h3>
        <Button onClick={() => handleShow()}>{t("add_question")}</Button>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th></th>
              <th>{t("question")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {questionHabits.map((qh, index) => (
              <tr key={qh.id}>
                <td>{index}</td>
                <td>{qh.question}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => handleShow(qh.question, qh.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-pencil-square"
                      viewBox="0 0 16 16"
                    >
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                      <path d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                    </svg>
                  </Button>{" "}
                  <Button variant="danger" onClick={() => handleDelete(qh.id)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-trash"
                      viewBox="0 0 16 16"
                    >
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                    </svg>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              {form.id ? t("edit_question") : t("add_question")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>{t("question")}</Form.Label>
                <Form.Control
                  className="text-Control"
                  as="textarea"
                  ref={textareaRef}
                  type="textarea"
                  value={form.question}
                  onChange={(e) =>
                    setForm({ ...form, question: e.target.value })
                  }
                  rows={1}
                  placeholder={t("placeholder")}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              {t("cancel")}
            </Button>
            <Button variant="primary" onClick={handleCreateOrUpdate}>
              {t("save")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
