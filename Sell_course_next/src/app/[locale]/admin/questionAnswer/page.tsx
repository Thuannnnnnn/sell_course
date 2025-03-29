"use client";

import { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/SideBar";
import "@/style/questionHabit.css";

const API_URL = "/api/question-habits";

export default function ManageQuestionHabit() {
  const [questionHabits, setQuestionHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: "", question: "" });
  const router = useRouter();

  const fetchQuestionHabits = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      setQuestionHabits(data);
    } catch (err) {
      setError("Failed to load question habits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionHabits();
  }, []);

  const handleCreateOrUpdate = async () => {
    try {
      if (form.id) {
        await axios.put(`${API_URL}/${form.id}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      fetchQuestionHabits();
      handleClose();
    } catch (err) {
      setError("Failed to save question.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchQuestionHabits();
    } catch (err) {
      setError("Failed to delete question.");
    }
  };

  const handleShow = (question = "", id = "") => {
    setForm({ question, id });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setForm({ id: "", question: "" });
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="layout-right">
        <h3>Manage Question Habits</h3>
        <Button onClick={() => handleShow()}>Add Question</Button>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Question</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questionHabits.map((qh) => (
              <tr key={qh.id}>
                <td>{qh.id}</td>
                <td>{qh.question}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => handleShow(qh.question, qh.id)}
                  >
                    Edit
                  </Button>{" "}
                  <Button variant="danger" onClick={() => handleDelete(qh.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              {form.id ? "Edit Question" : "Add Question"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Question</Form.Label>
                <Form.Control
                  type="text"
                  value={form.question}
                  onChange={(e) =>
                    setForm({ ...form, question: e.target.value })
                  }
                  placeholder="Enter question"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateOrUpdate}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
