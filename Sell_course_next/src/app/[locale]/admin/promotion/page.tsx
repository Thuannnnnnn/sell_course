"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import Sidebar from "@/components/SideBar";
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  PromotionData,
  Promotion,
} from "@/app/api/promotion/promotion";
import { Course } from "@/app/type/course/Course";
import { fetchCourses } from "@/app/api/course/CourseAPI";

export default function PromotionPage() {
  const t = useTranslations("promotion");
  const { data: session } = useSession();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(
    null
  );
  const [formData, setFormData] = useState<PromotionData>({
    name: "",
    discount: 0,
    code: "",
    course: "",
  });
  const [course, setCourse] = useState<Course[] | null>(null);
  const [courseSearch, setCourseSearch] = useState(""); // State cho tìm kiếm khóa học
  const token = session?.user?.token;

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        if (!token) return;
        const data = await getAllPromotions(token);
        const fetchedCourses = await fetchCourses();
        setCourse(fetchedCourses);
        setPromotions(data);
      } catch (err) {
        console.error(err);
        setError(t("fetchError"));
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPromotions();
  }, [token, t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "discount" ? Number(value) : value,
    });
  };

  const handleSavePromotion = async () => {
    try {
      if (!token) return;

      const promotionData = {
        name: formData.name,
        discount: formData.discount,
        code: formData.code,
        course: formData.course,
      };

      if (isNaN(formData.discount) || formData.discount < 0) {
        setError(t("invalidDiscount"));
        return;
      }

      if (!promotionData.course) {
        setError(t("courseRequired"));
        return;
      }

      if (currentPromotion) {
        await updatePromotion(currentPromotion.id, promotionData, token);
      } else {
        await createPromotion(promotionData, token);
      }

      setShowModal(false);
      setFormData({ name: "", discount: 0, code: "", course: "" });
      setCurrentPromotion(null);
      setCourseSearch(""); // Reset tìm kiếm
      const updatedPromotions = await getAllPromotions(token);
      setPromotions(updatedPromotions);
    } catch (err) {
      console.error(err);
      setError(t("saveError"));
    }
  };

  const handleDeletePromotion = async (id: string) => {
    try {
      if (!token) return;
      await deletePromotion(id, token);
      const updatedPromotions = await getAllPromotions(token);
      setPromotions(updatedPromotions);
    } catch (err) {
      console.error(err);
      setError(t("deleteError"));
    }
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setCurrentPromotion(promotion);
    setFormData({
      name: promotion.name,
      discount: promotion.discount,
      code: promotion.code,
      course: promotion.course.courseId,
    });
    setShowModal(true);
  };

  const handleCreatePromotion = () => {
    setCurrentPromotion(null);
    setFormData({ name: "", discount: 0, code: "", course: "" });
    setCourseSearch(""); // Reset tìm kiếm khi tạo mới
    setShowModal(true);
  };

  // Lọc danh sách khóa học dựa trên tìm kiếm
  const filteredCourses = course?.filter((c) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="d-flex">
      <Sidebar />
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2>{t("title")}</h2>
          </Col>
          <Col className="text-end">
            <Button onClick={handleCreatePromotion}>{t("create")}</Button>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("discount")}</th>
                <th>{t("code")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr key={promotion.id}>
                  <td>{promotion.name}</td>
                  <td>{promotion.discount}%</td>
                  <td>{promotion.code}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditPromotion(promotion)}
                    >
                      {t("edit")}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeletePromotion(promotion.id)}
                    >
                      {t("delete")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {currentPromotion ? t("editPromotion") : t("createPromotion")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="promotionName">
                <Form.Label>{t("name")}</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="promotionCourse">
                <Form.Label>{t("course")}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t("searchCourse")}
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="mb-2"
                />
                <Form.Select
                  name="courseId"
                  value={formData.course || ""}
                  onChange={(e) => {
                    const selectedCourse = course?.find(
                      (c) => c.courseId === e.target.value
                    );
                    setFormData({
                      ...formData,
                      course: selectedCourse?.courseId || "",
                    });
                  }}
                >
                  <option value="">{t("selectCourse")}</option>
                  {filteredCourses?.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="promotionDiscount">
                <Form.Label>{t("discount")}</Form.Label>
                <Form.Control
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="promotionCode">
                <Form.Label>{t("code")}</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t("cancel")}
            </Button>
            <Button variant="primary" onClick={handleSavePromotion}>
              {t("save")}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
