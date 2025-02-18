'use client';
import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  ListGroup,
  Button,
  Modal,
  Form,
} from 'react-bootstrap';
import { CourseData } from '@/app/type/course/Lesson';
import { fetchLesson } from '@/app/api/course/LessonAPI';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { addContent } from '@/app/api/course/ContentAPI';
import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
const LessonPage = () => {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [newContent, setNewContent] = useState({
    contentName: '',
    contentType: 'video',
    order: '',
  });
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  useEffect(() => {
    const fetchData = async () => {
      const token = session?.user.token;
      if (!token || !courseId) {
        return;
      }
      const data = await fetchLesson(courseId, token);
      setCourseData(data);
    };

    fetchData();
  }, [session, courseId]);

  const handleShowModal = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLessonId(null);
    setNewContent({ contentName: '', contentType: 'video', order: '' });
  };

  const handleAddContent = async () => {
    if (!selectedLessonId || !session?.user.token) return;

    try {
      console.log('ABCD');
      const response = await addContent(
        selectedLessonId,
        newContent.contentName,
        newContent.contentType,
        session.user.token
      );

      if (response) {
        console.log('Content added successfully:', response);
        const updatedData = await fetchLesson(courseId!, session.user.token);
        setCourseData(updatedData);
      } else {
        console.error('Failed to add content.');
      }
    } catch (error) {
      console.error('Error adding content:', error);
    }

    handleCloseModal();
  };
  const handleContentClick = (content: {
    contentType: string;
    contentId: string;
  }) => {
    const { contentType, contentId } = content;
    console.log(contentType);
    switch (contentType) {
    case 'video':
      router.push(`lesson/content/video?contentId=${contentId}`);
      break;
    case 'document':
      router.push(`content/document/${contentId}`);
      break;
    case 'quiz':
      router.push(`lesson/content/quizz?contentId=${contentId}`);
      break;
    default:
      break;
    }
  };
  if (!courseData) return <p>Loading...</p>;
  return (
    <Container className="mt-4">
      <h1>{courseData.courseName}</h1>
      {courseData.lessons.map((lesson) => (
        <Card key={lesson.lessonId} className="mb-3">
          <Card.Body>
            <Card.Title>
              {lesson.order}. {lesson.lessonName}
            </Card.Title>
            <ListGroup>
              {lesson.contents.map((content) => (
                <ListGroup.Item
                  key={content.contentId}
                  onClick={() => handleContentClick(content)}
                >
                  {content.order}. [{content.contentType.toUpperCase()}]{' '}
                  {content.contentName}
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Button
              variant="outline-seccondary"
              className="mt-2"
              onClick={() => handleShowModal(lesson.lessonId)}
            >
              <FaPlus />
            </Button>
          </Card.Body>
        </Card>
      ))}

      {/* Modal thêm nội dung */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Content</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Content Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter content name"
                value={newContent.contentName}
                onChange={(e) =>
                  setNewContent({ ...newContent, contentName: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <label htmlFor="contentType">Content Type</label>
              <select
                id="contentType"
                title="Content Type"
                value={newContent.contentType}
                onChange={(e) =>
                  setNewContent({ ...newContent, contentType: e.target.value })
                }
              >
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="quiz">Quiz</option>
              </select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddContent}>
            Add Content
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LessonPage;
