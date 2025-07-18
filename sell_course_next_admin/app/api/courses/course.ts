import { Course, CourseStatus } from "app/types/course";
import axios from "axios";

export const createCourse = async (
  formData: FormData,
  token: string
): Promise<Course> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/create_course`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error creating course:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error creating course:", error);
    }
    throw error;
  }
};

export const updateCourse = async (
  courseid: string,
  formData: FormData,
  token: string
): Promise<Course> => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/update_course/${courseid}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error creating course:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error creating course:", error);
    }
    throw error;
  }
};

export const fetchCourses = async (token: string): Promise<Course[]> => {
  try {
    const response = await axios.get<Course[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/view_course`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const fetchCourseById = async (
  token: string,
  courseId: string
): Promise<Course> => {
  try {
    const response = await axios.get<Course>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/view_course/${courseId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const deleteCourse = async (
  id: string,
  token: string
): Promise<void> => {
  try {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/delete_course/${id}`, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

// Fetch course with full details for review using new API
export const fetchCourseWithDetailsNew = async (
  token: string,
  courseId: string
): Promise<CourseReviewData> => {
  try {
    // Gọi API mới để lấy thông tin đầy đủ
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/details/${courseId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const courseData = response.data;
    
    // Transform data to match CourseReviewData interface
    const lessons: LessonReviewData[] = courseData.lessons.map((lesson: {
      lessonId: string;
      lessonName: string;
      order: number;
      contents: {
        contentId: string;
        contentName: string;
        contentType: string;
        order: number;
        video?: {
          videoId: string;
          title: string;
          description: string;
          url: string;
          urlScript: string;
        };
        doc?: {
          docsId: string;
          title: string;
          url: string;
        };
        quiz?: {
          quizzId: string;
          questions: {
            questionId: string;
            question: string;
            difficulty: string;
            weight: number;
            answers: {
              answerId: string;
              answer: string;
              isCorrect: boolean;
            }[];
          }[];
        };
      }[];
    }) => ({
      lessonId: lesson.lessonId,
      lessonName: lesson.lessonName,
      order: lesson.order,
      contents: lesson.contents.map((content) => ({
        contentId: content.contentId,
        contentName: content.contentName,
        contentType: content.contentType,
        order: content.order,
        video: content.video ? {
          videoId: content.video.videoId,
          title: content.video.title,
          description: content.video.description,
          url: content.video.url,
          urlScript: content.video.urlScript,
        } : undefined,
        doc: content.doc ? {
          docsId: content.doc.docsId,
          title: content.doc.title,
          url: content.doc.url,
        } : undefined,
        quiz: content.quiz ? {
          quizzId: content.quiz.quizzId,
          questions: content.quiz.questions.map((q) => ({
            questionId: q.questionId,
            question: q.question,
            difficulty: q.difficulty,
            weight: q.weight,
            answers: q.answers.map((a) => ({
              answerId: a.answerId,
              answer: a.answer,
              isCorrect: a.isCorrect,
            })),
          })),
        } : undefined,
      })),
    }));
    
    // Transform exam data
    let exam: ExamReviewData | undefined;
    if (courseData.exam) {
      exam = {
        examId: courseData.exam.examId,
        questions: courseData.exam.questions.map((q: {
          questionId: string;
          question: string;
          difficulty: string;
          weight: number;
          answers: {
            answerId: string;
            answer: string;
            isCorrect: boolean;
          }[];
        }) => ({
          questionId: q.questionId,
          question: q.question,
          difficulty: q.difficulty,
          weight: q.weight,
          answers: q.answers.map((a) => ({
            answerId: a.answerId,
            answer: a.answer,
            isCorrect: a.isCorrect,
          })),
        })),
      };
    }

    // Transform course data to match interface
    const course: Course = {
      courseId: courseData.courseId,
      title: courseData.title,
      category: courseData.category.name,
      thumbnail: courseData.thumbnail,
      short_description: courseData.short_description,
      description: courseData.description,
      price: courseData.price,
      status: courseData.status as CourseStatus,
      updatedAt: courseData.updatedAt,
      duration: courseData.duration,
      skill: courseData.skill,
      createdAt: courseData.createdAt,
      level: courseData.level,
      instructorId: courseData.instructor.userId,
      instructorName: courseData.instructor.username,
      categoryId: courseData.category.categoryId,
      categoryName: courseData.category.name,
    };
    
    return {
      course,
      lessons,
      exam,
    };
  } catch (error) {
    console.error("Error fetching course with details:", error);
    throw error;
  }
};

// Fetch course with full details for review
export const fetchCourseForReview = async (
  token: string,
  courseId: string
): Promise<CourseReviewData> => {
  try {
    // Lấy thông tin cơ bản của khóa học
    const course = await fetchCourseById(token, courseId);
    
    // Lấy danh sách lessons với contents
    const lessonsResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/${courseId}/lessons`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    const lessons: LessonReviewData[] = await Promise.all(
      lessonsResponse.data.map(async (lesson: { lessonId: string; lessonName: string; order: number }) => {
        // Lấy contents cho mỗi lesson
        const contentsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/lessons/${lesson.lessonId}/contents`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const contents: ContentReviewData[] = await Promise.all(
          contentsResponse.data.map(async (content: { contentId: string; contentName: string; contentType: string; order: number }) => {
            const contentData: ContentReviewData = {
              contentId: content.contentId,
              contentName: content.contentName,
              contentType: content.contentType,
              order: content.order,
            };
            
            // Lấy chi tiết theo loại content
            if (content.contentType === 'video') {
              try {
                const videoResponse = await axios.get(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/contents/${content.contentId}/video`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                contentData.video = {
                  videoId: videoResponse.data.videoId,
                  title: videoResponse.data.title,
                  description: videoResponse.data.description,
                  url: videoResponse.data.url,
                  urlScript: videoResponse.data.urlScript,
                };
              } catch (error) {
                console.error('Error fetching video data:', error);
              }
            }
            
            if (content.contentType === 'doc') {
              try {
                const docResponse = await axios.get(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/contents/${content.contentId}/doc`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                contentData.doc = {
                  docsId: docResponse.data.docsId,
                  title: docResponse.data.title,
                  url: docResponse.data.url,
                };
              } catch (error) {
                console.error('Error fetching doc data:', error);
              }
            }
            
            if (content.contentType === 'quiz') {
              try {
                const quizResponse = await axios.get(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/contents/${content.contentId}/quiz`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                contentData.quiz = {
                  quizzId: quizResponse.data.quizzId,
                  questions: quizResponse.data.questions.map((q: { questionId: string; question: string; difficulty: string; weight: number; answers: { answerId: string; answer: string; isCorrect: boolean }[] }) => ({
                    questionId: q.questionId,
                    question: q.question,
                    difficulty: q.difficulty,
                    weight: q.weight,
                    answers: q.answers.map((a: { answerId: string; answer: string; isCorrect: boolean }) => ({
                      answerId: a.answerId,
                      answer: a.answer,
                      isCorrect: a.isCorrect,
                    })),
                  })),
                };
              } catch (error) {
                console.error('Error fetching quiz data:', error);
              }
            }
            
            return contentData;
          })
        );
        
        return {
          lessonId: lesson.lessonId,
          lessonName: lesson.lessonName,
          order: lesson.order,
          contents: contents,
        };
      })
    );
    
    // Lấy thông tin exam nếu có
    let exam: ExamReviewData | undefined;
    try {
      const examResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/${courseId}/exam`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (examResponse.data) {
        exam = {
          examId: examResponse.data.examId,
          questions: examResponse.data.questions.map((q: { questionId: string; question: string; difficulty: string; weight: number; answers: { answerId: string; answer: string; isCorrect: boolean }[] }) => ({
            questionId: q.questionId,
            question: q.question,
            difficulty: q.difficulty,
            weight: q.weight,
            answers: q.answers.map((a: { answerId: string; answer: string; isCorrect: boolean }) => ({
              answerId: a.answerId,
              answer: a.answer,
              isCorrect: a.isCorrect,
            })),
          })),
        };
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
      // Exam is optional, so we continue without it
    }
    
    return {
      course,
      lessons,
      exam,
    };
  } catch (error) {
    console.error("Error fetching course for review:", error);
    throw error;
  }
};

// Fetch lessons for a course
export const fetchLessonsByCourse = async (
  token: string,
  courseId: string
): Promise<LessonReviewData[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/${courseId}/lessons`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw error;
  }
};

// Fetch contents for a lesson
export const fetchContentsByLesson = async (
  token: string,
  lessonId: string
): Promise<ContentReviewData[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/lessons/${lessonId}/contents`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching contents:", error);
    throw error;
  }
};

// Fetch video data for content
export const fetchVideoByContent = async (
  token: string,
  contentId: string
): Promise<VideoReviewData> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/contents/${contentId}/video`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching video:", error);
    throw error;
  }
};

// Fetch doc data for content
export const fetchDocByContent = async (
  token: string,
  contentId: string
): Promise<DocReviewData> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/contents/${contentId}/doc`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching doc:", error);
    throw error;
  }
};

// Fetch quiz data for content
export const fetchQuizByContent = async (
  token: string,
  contentId: string
): Promise<QuizReviewData> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/contents/${contentId}/quiz`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quiz:", error);
    throw error;
  }
};

// Fetch exam data for course
export const fetchExamByCourse = async (
  token: string,
  courseId: string
): Promise<ExamReviewData> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/${courseId}/exam`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching exam:", error);
    throw error;
  }
};

// Review Actions
export interface ReviewAction {
  comments: string;
  checklist: {
    contentQuality: boolean;
    videoQuality: boolean;
    quizQuality: boolean;
    documentQuality: boolean;
    overallStructure: boolean;
  };
}

export const approveCourse = async (token: string, courseId: string, reviewData: ReviewAction) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/course-review/${courseId}/approve`,
      reviewData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error approving course:', error);
    throw error;
  }
};

export const rejectCourse = async (token: string, courseId: string, reviewData: ReviewAction) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/course-review/${courseId}/reject`,
      reviewData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error rejecting course:', error);
    throw error;
  }
}

// Interface for course review data
export interface CourseReviewData {
  course: Course;
  lessons: LessonReviewData[];
  exam?: ExamReviewData;
}

export interface LessonReviewData {
  lessonId: string;
  lessonName: string;
  order: number;
  contents: ContentReviewData[];
}

export interface ContentReviewData {
  contentId: string;
  contentName: string;
  contentType: string;
  order: number;
  video?: VideoReviewData;
  doc?: DocReviewData;
  quiz?: QuizReviewData;
}

export interface VideoReviewData {
  videoId: string;
  title: string;
  description: string;
  url: string;
  urlScript?: string;
}

export interface DocReviewData {
  docsId: string;
  title: string;
  url: string;
}

export interface QuizReviewData {
  quizzId: string;
  questions: QuestionReviewData[];
}

export interface QuestionReviewData {
  questionId: string;
  question: string;
  difficulty: string;
  weight: number;
  answers: AnswerReviewData[];
}

export interface AnswerReviewData {
  answerId: string;
  answer: string;
  isCorrect: boolean;
}

export interface ExamReviewData {
  examId: string;
  questions: ExamQuestionReviewData[];
}

export interface ExamQuestionReviewData {
  questionId: string;
  question: string;
  difficulty: string;
  weight: number;
  answers: ExamAnswerReviewData[];
}

export interface ExamAnswerReviewData {
  answerId: string;
  answer: string;
  isCorrect: boolean;
}

// Update course status (for instructors - DRAFT/PENDING_REVIEW only)
export const updateCourseStatus = async (
  courseId: string,
  status: CourseStatus,
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error updating course status:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error updating course status:", error);
    }
    throw error;
  }
};

// Review course status (for admins - PUBLISHED/REJECTED only)
export const reviewCourseStatus = async (
  courseId: string,
  status: CourseStatus,
  token: string,
  reason?: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses/${courseId}/review`,
      { status, reason },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error reviewing course:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error reviewing course:", error);
    }
    throw error;
  }
};

// Get courses by status (for admins)
export const getCoursesByStatus = async (
  status: CourseStatus,
  token: string
): Promise<Course[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses/status/${status}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error fetching courses by status:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error fetching courses by status:", error);
    }
    throw error;
  }
};
