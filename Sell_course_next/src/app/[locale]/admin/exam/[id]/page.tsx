"use client";
import styles from '../../../../../style/ExamAdmin.module.css';
import { CreateExamDto, getExamByCourseId, getExamQuetion, updateExamQuestion, createExamQuestion, deleteExamQuestion } from "@/app/api/exam/exam";
// import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";

// Define the types for answers, questions, and exams
interface Answer {
  answerId: string;
  answer: string;
  isCorrect: boolean;
}

interface Question {
  questionId: string;
  question: string;
  answers: Answer[];
}

interface Exam {
  examId: string;
  courseId: string;
  questions: Question[];
}

interface UpdateQuizzDto {
  // examId: string;
    questionId: string;
    question: string;
    answers: {
      answerId: string;
      answer: string;
      isCorrect: boolean;
    }[];
}
const ExamManagementPage = () => {
  const { id } = useParams() as { id: string }; // Get courseId from route params
  const [exams, setExams] = useState<Exam | null>(null);  // Keep exams as a single object
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<{
    // examId: string;
    questionId: string;
    question: string;
    answers: { answerId: string; answer: string; isCorrect: boolean }[];
  } | null>(null);
  // const { data: session } = useSession();

  const [newExamData, setNewExamData] = useState<CreateExamDto>({
    courseId: id || "",
    questions: [{
      question: "",
      answers: [{ answer: "", isCorrect: false }, { answer: "", isCorrect: false }, { answer: "", isCorrect: false }, { answer: "", isCorrect: false }],
    }],
  });

  useEffect(() => {
    if (id) {
      const fetchExams = async () => {
        if (!id) {
          console.log("Course ID is missing");
          return;
        }
        try {
          setLoading(true);
          const data = await getExamByCourseId(id);
          console.log("Data received:", data);
          // Ensure the data is in the correct format (object)
          if (data && data.examId) {
            setExams(data);  // Set the exam object
          } else {
            console.error("Expected an exam object but got:", data);
            setExams(null);  // Reset if the data is not valid
          }
        } catch (error) {
          console.error("Error fetching exams:", error);
          setExams(null);  // Set exams to null in case of error
        } finally {
          setLoading(false);
        }
      };
      fetchExams();
    }
  }, [id]);

  const fetchExams = async () => {
    if (!id) {
      console.log("Course ID is missing");
      return;
    }
    try {
      setLoading(true);
      const data = await getExamByCourseId(id);
      console.log("Data received:", data);
      // Ensure the data is in the correct format (object)
      if (data && data.examId) {
        setExams(data);  // Set the exam object
      } else {
        console.error("Expected an exam object but got:", data);
        setExams(null);  // Reset if the data is not valid
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      setExams(null);  // Set exams to null in case of error
    } finally {
      setLoading(false);
    }
  };

  console.log("CourseId ", id);

  // Handle adding a new question to the exam
  const handleAddQuestion = () => {
    setNewExamData(prevData => ({
      ...prevData,
      questions: [...prevData.questions, {
        question: "",
        answers: [{ answer: "", isCorrect: false }, { answer: "", isCorrect: false }, { answer: "", isCorrect: false }, { answer: "", isCorrect: false }],
      }],
    }));
  };

  // Handle editing a question
const handleEditQuestion = async (questionId: string | undefined, question: Question) => {
  if (!questionId) {
    alert("Cannot edit question: Quiz ID is missing");
    return;
  }
  if (!question?.questionId) {
    alert("Cannot edit question: Question ID is missing");
    return;
  }

  try {
    setLoading(true);

    const examData = await getExamQuetion(question.questionId);
    console.log("Exam data received:", examData);

    // Validate examData structure
    if (!examData || !examData.questionId || !Array.isArray(examData.answers)) {
      console.error("Invalid examData format:", examData);
      throw new Error("Questions data is not available or is in the wrong format");
    }

    // Prepare the data for updating
    const updateData: UpdateQuizzDto = {
      questionId: examData.questionId,
      question: examData.question || "",
      answers: examData.answers.map((a: Answer) => ({
        answerId: a.answerId,
        answer: a.answer || "",
        isCorrect: Boolean(a.isCorrect),
      })),
    };

    // Send update request
    await updateExamQuestion(updateData);

    // Update state with new data
    setEditingQuestion(updateData);
    setShowEditModal(true);
  } catch (error) {
    console.error("Error editing question:", error);
    alert("An error occurred while editing the question.");
  } finally {
    setLoading(false);
  }
};


  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        setLoading(true);
        await deleteExamQuestion(questionId);  // Call delete API
        fetchExams();  // Refresh the list
      } catch {
        alert("Failed to delete question.");
      } finally {
        setLoading(false);
      }
    }
  };
  // Handle updating the question
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    try {
      setLoading(true);
      await updateExamQuestion({
        questionId: editingQuestion.questionId,
        question: editingQuestion.question,
        answers: editingQuestion.answers.map(answer => ({
          answerId: answer.answerId,
          answer: answer.answer,
          isCorrect: answer.isCorrect,
        })),
      });
      fetchExams(); // Refresh the exams list
      setShowEditModal(false);
      setEditingQuestion(null);
    } catch  {
      alert("Failed to update question. Please ensure all fields are filled correctly.");
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new exam
  const handleCreateExam = async () => {
    if (!id) return;
    try {
      setLoading(true);
      await createExamQuestion(newExamData);
      fetchExams(); // Refresh the exams list
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create exam:", error);
      alert("Failed to create exam.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="wrapper">
        <div className="header">
          <h1 className="title">Exam Management</h1>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={() => setShowCreateModal(true)}
          >
            Add New Exam
          </button>
        </div>

        {/* Modal for creating new quiz */}
        {showCreateModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Create New Exam</h2>
              <button className={styles.addButton} onClick={handleAddQuestion}>
                Add New Question
              </button>
              {newExamData.questions.map((question, qIndex) => (
                <div key={qIndex} className={styles.questionSection}>
                  <h3>Question {qIndex + 1}</h3>
                  <input
                    type="text"
                    className={styles.inputText}
                    placeholder="Enter question"
                    value={question.question}
                    onChange={(e) => {
                      const updatedQuestions = [...newExamData.questions];
                      updatedQuestions[qIndex].question = e.target.value;
                      setNewExamData({ ...newExamData, questions: updatedQuestions });
                    }}
                  />
                  {question.answers.map((answer, aIndex) => (
                    <div key={aIndex} className={styles.answerRow}>
                      <input
                        type="text"
                        className={styles.inputText}
                        placeholder={`Answer ${aIndex + 1}`}
                        value={answer.answer}
                        onChange={(e) => {
                          const updatedQuestions = [...newExamData.questions];
                          updatedQuestions[qIndex].answers[aIndex].answer = e.target.value;
                          setNewExamData({ ...newExamData, questions: updatedQuestions });
                        }}
                      />
                      <input
                        type="checkbox"
                        className={styles.inputCheckbox}
                        checked={answer.isCorrect}
                        onChange={(e) => {
                          const updatedQuestions = [...newExamData.questions];
                          updatedQuestions[qIndex].answers[aIndex].isCorrect = e.target.checked;
                          setNewExamData({ ...newExamData, questions: updatedQuestions });
                        }}
                      />
                      <label>Correct</label>
                    </div>
                  ))}
                </div>
              ))}
              <div className={styles.modalButtons}>
                <button
                  className={`${styles.button} ${styles.primary}`}
                  onClick={handleCreateExam}
                >
                  Create Question
                </button>
                <button
                  className={`${styles.button} ${styles.secondary}`}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for editing a question */}
        {showEditModal && editingQuestion && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Edit Question</h2>
              <div className={styles.questionSection}>
                <input
                  type="text"
                  className={styles.inputText}
                  placeholder="Enter question"
                  value={editingQuestion.question}
                  onChange={(e) => {
                    setEditingQuestion({ ...editingQuestion, question: e.target.value });
                  }}
                />
                {editingQuestion.answers.map((answer, aIndex) => (
                  <div key={aIndex} className={styles.answerRow}>
                    <input
                      type="text"
                      className={styles.inputText}
                      placeholder={`Answer ${aIndex + 1}`}
                      value={answer.answer}
                      onChange={(e) => {
                        const updatedAnswers = [...editingQuestion.answers];
                        updatedAnswers[aIndex].answer = e.target.value;
                        setEditingQuestion({ ...editingQuestion, answers: updatedAnswers });
                      }}
                    />
                    <input
                      type="checkbox"
                      className={styles.inputCheckbox}
                      checked={answer.isCorrect}
                      onChange={(e) => {
                        const updatedAnswers = [...editingQuestion.answers];
                        updatedAnswers[aIndex].isCorrect = e.target.checked;
                        setEditingQuestion({ ...editingQuestion, answers: updatedAnswers });
                      }}
                    />
                    <label>Correct</label>
                  </div>
                ))}
              </div>
              <div className={styles.modalButtons}>
                <button
                  className={`${styles.button} ${styles.primary}`}
                  onClick={handleUpdateQuestion}
                >
                  Update Question
                </button>
                <button
                  className={`${styles.button} ${styles.secondary}`}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Display the exam */}
        <div className={styles.examList}>
          {loading ? (
            <p>Loading exams...</p>
          ) : exams ? (
            <div className={styles.examCard}>
              <h3>Exam for Course </h3>
              <div className={styles.questions}>
                {exams.questions.map((question, index) => (
                  <div key={index} className={styles.questionCard}>
                    <h4>{question.question}</h4>
                    <div className={styles.answers}>
                      {question.answers.map((answer, aIndex) => (
                        <div hidden key={aIndex}>
                          <p>{answer.answer}</p>
                            {answer.isCorrect && <p>{answer.isCorrect}</p>}
                        </div>
                      ))}
                    </div>
                    <button
                      className={`${styles.button} ${styles.secondary}`}
                      onClick={() => handleEditQuestion(question.questionId, question)}
                    >
                      Edit Question
                    </button>
                    <button
                      className={`${styles.button} ${styles.danger}`}
                      onClick={() => handleDeleteQuestion(question.questionId)}
                    >
                      Delete Question
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No exam data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamManagementPage;





