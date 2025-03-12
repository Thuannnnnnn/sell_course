// LessonItem.tsx
import { Lesson } from "@/app/type/course/Lesson";
import { ListGroup, Button, Card } from "react-bootstrap";
import { useDrag, useDrop } from "react-dnd";
import styles from "@/style/lesson.module.css";
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
      ref={(node: HTMLElement | null) => {
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
          ➕
        </Button>
      </Card.Body>
    </Card>
  );
};
