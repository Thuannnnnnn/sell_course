import axios from 'axios';

interface Answer {
  answerId: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  questionId?: string;
  question: string;
  answers: Answer[];
}

// Removed unused interface Exam


export interface CreateExamDto {
  courseId: string;
  questions: {
    question: string;
    answers: {
      answer: string;
      isCorrect: boolean;
    }[];
  }[];
}
export interface UpdateExamDto {
  // examId: string;
  // questions: {
    questionId: string;
    question: string;
    answers: {
      answerId: string;
      answer: string;
      isCorrect: boolean;
    }[];
  // }[];
}
export interface AnswerSubmitDto {
  questionId: string;
  answerId: string;
}

export interface SubmitExamDto {
  courseId: string;
  answers: AnswerSubmitDto[];
}

export const  getExamByCourseId = async (courseId: string) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/exam/view_exam/${courseId}`, {
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    });
    console.log("Response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error('Could not fetch questions');
  }
};

export const updateExamQuestion = async (updateExamDto: UpdateExamDto) => {
  try {
    const { questionId, ...questionData } = updateExamDto;
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/exam/update_question/${questionId}`,
      questionData,
      {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        //   "Content-Type": "application/json",
        // },
      }
    );
    console.log("Response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating question:", error);
    throw new Error('Could not update question');
  }
};




export const deleteExamQuestion = async (questionId: string): Promise<Question> => {
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/exam/delete_question/${questionId}`, {
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    });
    console.log("Response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw new Error('Could not delete question');
  }
}

export const getExamQuetion = async (questionId: string) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/exam/view_question/${questionId}`, {
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    });
    console.log("Response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching question:", error);
    throw new Error('Could not fetch question');
  }
}

export const createExamQuestion = async (createExamDto: CreateExamDto) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/exam/create_exam`, createExamDto, {
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    });
    console.log("Response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating question:", error);
    throw new Error('Could not create question');
  }
};

export const fetchQuestion = async (token: string, courseId: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/user/questions/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching question:", error);
    throw new Error('Could not fetch question');
  }
}

export const submitExam = async (token: string, courseId: string, answers: AnswerSubmitDto[]) => {
  try {
    console.log("Submitting Exam Data:", { courseId, answers }); // Kiểm tra trước khi gửi
    console.log("Number of Answers Sent:", answers.length); // Đếm số lượng câu trả lời gửi lên

    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/user/submit`, {
      courseId,
      answers,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error submitting exam:", error);
    throw error;
  }
};

export const getExamResults = async (token: string, courseId: string) => {
  try {
    const response = await  axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/user/results/${courseId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Failed to fetch exam results:", error);
    return null;
  }
};
