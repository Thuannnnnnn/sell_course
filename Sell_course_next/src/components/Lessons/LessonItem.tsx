import { Lesson } from "@/app/type/course/Lesson";
import { ListGroup, Button, Card } from "react-bootstrap";
import { useDrag, useDrop } from "react-dnd";
import styles from "@/style/LessonPage.module.css";
import { deleteContent } from "@/app/api/course/ContentAPI";

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
  t,
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
        ref={(node: HTMLElement | null) => {
          contentRef(node);
          contentDrop(node);
        }}
        style={{ cursor: "move" }}
      >
        <div className={styles.contentItem}>
          <div 
            className={styles.contentText}
            onClick={() => handleContentClick(content)}
          >
            {content.order}. [{content.contentType.toUpperCase()}]{" "}
            {content.contentName}
          </div>
          <div className={styles.buttonContainer}>
            <Button
              variant="warning"
              size="sm"
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
            <Button
              variant="danger"
              size="sm"
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
          </div>
        </div>
      </ListGroup.Item>
    );
  };

  return (
    <Card
      ref={(node: HTMLElement | null) => {
        lessonRef(node);
        lessonDrop(node);
      }}
      key={lesson.lessonId}
      className="mb-3"
      style={{ cursor: "move" }}
    >
      <Card.Body>
        <div className={styles.titleContainer}>
          <Card.Title>
            {lesson.order}. {lesson.lessonName}
          </Card.Title>
          <div className={styles.buttonContainer}>
            <Button
              variant="warning"
              size="sm"
              onClick={() =>
                handleShowUpdateModal(lesson.lessonId, lesson.lessonName)
              }
            >
              ✏️
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteLesson(lesson.lessonId)}
            >
              🗑️
            </Button>
          </div>
        </div>

        <ListGroup className="mt-3">
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
          ➕
        </Button>
      </Card.Body>
    </Card>
  );
};