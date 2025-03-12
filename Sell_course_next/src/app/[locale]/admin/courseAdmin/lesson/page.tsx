"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Card,
  ListGroup,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { CourseData, Lesson } from "@/app/type/course/Lesson";
import {
  fetchLesson,
  addLesson,
  deleteLesson,
  updateLesson,
  updateLessonOrder,
} from "@/app/api/course/LessonAPI";
import {
  addContent,
  updateContent,
  deleteContent,
  updateContentOrder,
} from "@/app/api/course/ContentAPI";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  NotificationManager,
  NotificationContainer,
} from "react-notifications";
import styles from "@/style/lesson.module.css";
import "react-notifications/lib/notifications.css";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  LESSON: "lesson",
  CONTENT: "content",
};

interface LessonItemProps {
  lesson: Lesson;
  index: number;
  moveLesson: (fromIndex: number, toIndex: number) => void;
  moveContent: (lessonId: string, fromIndex: number, toIndex: number) => void;
  handleDeleteLesson: (lessonId: string) => void;
  handleShowUpdateModal: (lessonId: string, lessonName: string) => void;
  handleShowModal: (lessonId: string) => void;
  handleContentClick: (content: {
    contentType: string;
    contentId: string;
  }) => void;
  handleShowContentModal: (
    event: React.MouseEvent,
    contentId: string,
    contentName: string
  ) => void;
  t: (key: string) => string;
}

export const LessonItem = ({
  lesson,
  index,
  moveLesson,
  moveContent,
  handleDeleteLesson,
  handleShowUpdateModal,
  handleShowModal,
  handleContentClick,
  handleShowContentModal,
}: LessonItemProps) => {
  const [, lessonRef] = useDrag({
    type: ItemTypes.LESSON,
    item: { index },
  });

  const [, lessonDrop] = useDrop({
    accept: ItemTypes.LESSON,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveLesson(item.index, index);
        item.index = index;
      }
    },
  });

  const ContentItem = ({
    content,
    contentIndex,
  }: {
    content: {
      contentId: string;
      contentName: string;
      contentType: string;
      order: number;
    };
    contentIndex: number;
  }) => {
    const [, contentRef] = useDrag({
      type: ItemTypes.CONTENT,
      item: { index: contentIndex, lessonId: lesson.lessonId },
    });

    const [, contentDrop] = useDrop({
      accept: ItemTypes.CONTENT,
      hover: (item: { index: number; lessonId: string }) => {
        if (item.lessonId === lesson.lessonId && item.index !== contentIndex) {
          moveContent(lesson.lessonId, item.index, contentIndex);
          item.index = contentIndex;
        }
      },
    });

    return (
      <ListGroup.Item
        ref={(node) => {
          contentRef(node);
          contentDrop(node);
        }}
        onClick={() => handleContentClick(content)}
        className={styles.cursorPointer}
        style={{ cursor: "move" }}
      >
        {content.order}. [{content.contentType.toUpperCase()}]{" "}
        {content.contentName}
        <Button
          variant="danger"
          className="ms-2"
          onClick={(event) => {
            event.stopPropagation();
            deleteContent(
              content.contentId,
              sessionStorage.getItem("token") || ""
            );
          }}
        >
          🗑️
        </Button>
        <Button
          variant="warning"
          className="ms-2"
          onClick={(event) =>
            handleShowContentModal(
              event,
              content.contentId,
              content.contentName
            )
          }
        >
          ✏️
        </Button>
      </ListGroup.Item>
    );
  };

  return (
    <Card
      ref={(node) => {
        lessonRef(node);
        lessonDrop(node);
      }}
      key={lesson.lessonId}
      className="mb-3"
      style={{ cursor: "move" }}
    >
      <Card.Body>
        <Card.Title>
          {lesson.order}. {lesson.lessonName}
          <Button
            variant="danger"
            className="ms-2"
            onClick={() => handleDeleteLesson(lesson.lessonId)}
          >
            🗑️
          </Button>
          <Button
            variant="warning"
            className="ms-2"
            onClick={() =>
              handleShowUpdateModal(lesson.lessonId, lesson.lessonName)
            }
          >
            ✏️
          </Button>
        </Card.Title>

        <ListGroup>
          {lesson.contents.map((content, contentIndex) => (
            <ContentItem
              key={content.contentId}
              content={content}
              contentIndex={contentIndex}
            />
          ))}
        </ListGroup>
        <Button
          variant="outline-secondary"
          className="mt-2"
          onClick={() => handleShowModal(lesson.lessonId)}
        >
          <FaPlus />
        </Button>
      </Card.Body>
    </Card>
  );
};

const LessonPage = () => {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [updatedContent, setUpdatedContent] = useState({ contentName: "" });
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null
  );
  const [newContent, setNewContent] = useState({
    contentName: "",
    contentType: "video",
    order: "",
  });
  const [newLesson, setNewLesson] = useState({ lessonName: "" });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatedLesson, setUpdatedLesson] = useState({ lessonName: "" });

  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const t = useTranslations("lesson");

  useEffect(() => {
    const fetchData = async () => {
      const token = session?.user.token;
      if (!token || !courseId) return;
      const data = await fetchLesson(courseId, token);
      setCourseData(data);
    };
    fetchData();
  }, [session, courseId]);

  const moveLesson = async (fromIndex: number, toIndex: number) => {
    if (!courseData || !session?.user.token) return;

    const updatedLessons = [...courseData.lessons];
    const [movedLesson] = updatedLessons.splice(fromIndex, 1);
    updatedLessons.splice(toIndex, 0, movedLesson);

    const reorderedLessons = updatedLessons.map((lesson, idx) => ({
      ...lesson,
      order: idx + 1,
    }));

    const lessonOrderData = reorderedLessons.map((lesson) => ({
      lessonId: lesson.lessonId,
      order: lesson.order,
    }));

    try {
      await updateLessonOrder(lessonOrderData, session.user.token);
      setCourseData({ ...courseData, lessons: reorderedLessons });
    } catch (error) {
      console.error("Error updating lesson order:", error);
    }
  };

  const moveContent = async (
    lessonId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    if (!courseData || !session?.user.token) return;

    const lesson = courseData.lessons.find((l) => l.lessonId === lessonId);
    if (!lesson) return;

    const updatedContents = [...lesson.contents];
    const [movedContent] = updatedContents.splice(fromIndex, 1);
    updatedContents.splice(toIndex, 0, movedContent);

    const reorderedContents = updatedContents.map((content, idx) => ({
      ...content,
      order: idx + 1,
    }));

    const contentOrderData = reorderedContents.map((content) => ({
      contentId: content.contentId,
      order: content.order,
    }));

    try {
      await updateContentOrder(contentOrderData, session.user.token);
      const updatedLessons = courseData.lessons.map((l) =>
        l.lessonId === lessonId ? { ...l, contents: reorderedContents } : l
      );
      setCourseData({ ...courseData, lessons: updatedLessons });
    } catch (error) {
      console.error("Error updating content order:", error);
    }
  };

  const handleShowUpdateModal = (lessonId: string, lessonName: string) => {
    setSelectedLessonId(lessonId);
    setUpdatedLesson({ lessonName });
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedLessonId(null);
    setUpdatedLesson({ lessonName: "" });
  };

  const handleShowContentModal = (
    event: React.MouseEvent,
    contentId: string,
    contentName: string
  ) => {
    event.stopPropagation();
    setSelectedContentId(contentId);
    setUpdatedContent({ contentName });
    setShowContentModal(true);
  };

  const handleCloseContentModal = () => {
    setShowContentModal(false);
    setSelectedContentId(null);
    setUpdatedContent({ contentName: "" });
  };

  const handleShowModal = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLessonId(null);
    setShowLessonModal(false);
    setNewContent({ contentName: "", contentType: "video", order: "" });
  };

  const handleAddContent = async () => {
    if (!selectedLessonId || !session?.user.token) return;

    try {
      const response = await addContent(
        selectedLessonId,
        newContent.contentName,
        newContent.contentType,
        session.user.token
      );
      if (response) {
        const updatedData = await fetchLesson(courseId!, session.user.token);
        setCourseData(updatedData);
        NotificationManager.success(t("contentAdded"), t("success"), 3000);
      } else {
        NotificationManager.error(t("contentFailed"), t("error"), 3000);
      }
    } catch (error) {
      console.error("Error adding content:", error);
      NotificationManager.error(t("contentFailed"), t("error"), 3000);
    }
    handleCloseModal();
  };

  const handleUpdateContent = async (
    contentId: string,
    contentName: string
  ) => {
    if (!session?.user.token) return;
    try {
      const response = await updateContent(
        contentId,
        contentName,
        session.user.token
      );
      if (response) {
        const updatedData = await fetchLesson(courseId!, session.user.token);
        setCourseData(updatedData);
        NotificationManager.success(t("contentUpdated"), t("success"), 3000);
      } else {
        NotificationManager.error(t("contentUpdateFailed"), t("error"), 3000);
      }
    } catch (error) {
      console.error("Error updating content:", error);
      NotificationManager.error(t("contentUpdateFailed"), t("error"), 3000);
    }
    handleCloseContentModal();
  };

  const handleAddLesson = async () => {
    if (!newLesson.lessonName || !session?.user.token || !courseId) return;

    try {
      const response = await addLesson(
        newLesson.lessonName,
        courseId,
        session.user.token
      );
      if (response) {
        const updatedData = await fetchLesson(courseId, session.user.token);
        setCourseData(updatedData);
        NotificationManager.success(t("lessonAdded"), t("success"), 3000);
      } else {
        NotificationManager.error(t("lessonFailed"), t("error"), 3000);
      }
    } catch (error) {
      console.error("Error adding lesson:", error);
      NotificationManager.error(t("lessonFailed"), t("error"), 3000);
    }
    setShowLessonModal(false);
    setNewLesson({ lessonName: "" });
  };

  const handleUpdateLesson = async (lessonId: string, lessonName: string) => {
    if (!session?.user.token) return;
    try {
      const response = await updateLesson(
        lessonId,
        lessonName,
        session.user.token
      );
      if (response) {
        const updatedData = await fetchLesson(courseId!, session.user.token);
        setCourseData(updatedData);
        NotificationManager.success(t("lessonUpdated"), t("success"), 3000);
      } else {
        NotificationManager.error(t("lessonUpdateFailed"), t("error"), 3000);
      }
    } catch (error) {
      console.error("Error updating lesson:", error);
      NotificationManager.error(t("lessonUpdateFailed"), t("error"), 3000);
    }
    handleCloseUpdateModal();
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!session?.user.token) return;
    try {
      const response = await deleteLesson(lessonId, session.user.token);
      if (response) {
        const updatedData = await fetchLesson(courseId!, session.user.token);
        setCourseData(updatedData);
        NotificationManager.success(t("lessonDeleted"), t("success"), 3000);
      } else {
        NotificationManager.error(t("lessonDeleteFailed"), t("error"), 3000);
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      NotificationManager.error(t("lessonDeleteFailed"), t("error"), 3000);
    }
  };

  const handleContentClick = (content: {
    contentType: string;
    contentId: string;
  }) => {
    const { contentType, contentId } = content;
    switch (contentType) {
      case "video":
        router.push(`lesson/content/video?contentId=${contentId}`);
        break;
      case "document":
        router.push(
          `lesson/content/document?contentId=${contentId}?${courseId}`
        );
        break;
      case "quiz":
        router.push(`lesson/content/quizz?contentId=${contentId}`);
        break;
      default:
        break;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Container className="mt-4">
        {!courseData ? (
          <div>
            <p>{t("NotHave")}</p>
            <Button
              variant="outline-primary"
              className="mt-3"
              onClick={() => setShowLessonModal(true)}
            >
              <FaPlus />
            </Button>
            <Modal show={showLessonModal} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>{t("addLesson")}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("lessonName")}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("lessonName")}
                      value={newLesson.lessonName}
                      onChange={(e) =>
                        setNewLesson({
                          ...newLesson,
                          lessonName: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleAddLesson}>
                  {t("addLesson")}
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        ) : (
          <>
            <h1>{courseData.courseName}</h1>
            {courseData.lessons.map((lesson, index) => (
              <LessonItem
                key={lesson.lessonId}
                lesson={lesson}
                index={index}
                moveLesson={moveLesson}
                moveContent={moveContent}
                handleDeleteLesson={handleDeleteLesson}
                handleShowUpdateModal={handleShowUpdateModal}
                handleShowModal={handleShowModal}
                handleContentClick={handleContentClick}
                handleShowContentModal={handleShowContentModal}
                t={t}
              />
            ))}
            <Button
              variant="outline-primary"
              className="mt-3"
              onClick={() => setShowLessonModal(true)}
            >
              <FaPlus />
            </Button>

            <Modal show={showModal} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>{t("addContent")}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("contentName")}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("contentName")}
                      value={newContent.contentName}
                      onChange={(e) =>
                        setNewContent({
                          ...newContent,
                          contentName: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <label htmlFor="contentType">{t("contentType")}</label>
                    <select
                      id="contentType"
                      value={newContent.contentType}
                      onChange={(e) =>
                        setNewContent({
                          ...newContent,
                          contentType: e.target.value,
                        })
                      }
                    >
                      <option value="video">{t("video")}</option>
                      <option value="document">{t("document")}</option>
                      <option value="quiz">{t("quiz")}</option>
                    </select>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleAddContent}>
                  {t("addContent")}
                </Button>
              </Modal.Footer>
            </Modal>

            <Modal show={showLessonModal} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>{t("addLesson")}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("lessonName")}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("lessonName")}
                      value={newLesson.lessonName}
                      onChange={(e) =>
                        setNewLesson({
                          ...newLesson,
                          lessonName: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleAddLesson}>
                  {t("addLesson")}
                </Button>
              </Modal.Footer>
            </Modal>

            <Modal show={showUpdateModal} onHide={handleCloseUpdateModal}>
              <Modal.Header closeButton>
                <Modal.Title>{t("updateLesson")}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("lessonName")}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("lessonName")}
                      value={updatedLesson.lessonName}
                      onChange={(e) =>
                        setUpdatedLesson({ lessonName: e.target.value })
                      }
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseUpdateModal}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    handleUpdateLesson(
                      selectedLessonId!,
                      updatedLesson.lessonName
                    )
                  }
                >
                  {t("updateLesson")}
                </Button>
              </Modal.Footer>
            </Modal>

            <Modal show={showContentModal} onHide={handleCloseContentModal}>
              <Modal.Header closeButton>
                <Modal.Title>{t("updateContent")}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("contentName")}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("contentName")}
                      value={updatedContent.contentName}
                      onChange={(e) =>
                        setUpdatedContent({ contentName: e.target.value })
                      }
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseContentModal}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    handleUpdateContent(
                      selectedContentId!,
                      updatedContent.contentName
                    )
                  }
                >
                  {t("updateContent")}
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
        <NotificationContainer />
      </Container>
    </DndProvider>
  );
};

export default LessonPage;
