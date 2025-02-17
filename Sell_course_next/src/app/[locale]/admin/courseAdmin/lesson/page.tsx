'use client';

import { useState, useEffect } from 'react';
import { Container, Card, ListGroup } from 'react-bootstrap';
import { CourseData } from '@/app/type/course/Lesson';
import { fetchLesson } from '@/app/api/course/LessonAPI';
import { useSession } from 'next-auth/react';
const CoursePage = () => {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const { data: session } = useSession();
  useEffect(() => {
    const fetchData = async () => {
      const token = session?.user.token;
      if (!token) {
        return
      }
      const data = await fetchLesson(courseId, token)
      setCourseData(data);
    };

    fetchData();
  }, []);

  if (!courseData) return <p>Loading...</p>;

  return (
    <Container className="mt-4">
      <h1>{courseData.courseName}</h1>
      {courseData.lessons.map((lesson) => (
        <Card key={lesson.lessonId} className="mb-3">
          <Card.Body>
            <Card.Title>{lesson.order}. {lesson.lessonName}</Card.Title>
            <ListGroup>
              {lesson.contents.map((content) => (
                <ListGroup.Item key={content.contentId}>
                  {content.order}. [{content.contentType.toUpperCase()}] {content.contentName}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default CoursePage;
