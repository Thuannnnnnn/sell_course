interface Content {
  contentId: string;
  contentType: string;
  contentName: string;
  order: number;
}

interface Lesson {
  lessonId: string;
  lessonName: string;
  order: number;
  contents: Content[];
}

export interface CourseData {
  courseId: string;
  courseName: string;
  lessons: Lesson[];
}
