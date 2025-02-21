'use client';

import { useState, useEffect } from 'react';
import styles from '@/style/Quizz/FlashCard.module.css';
import { RandomQuizz } from '@/app/api/quizz/quizz';

interface Answer {
  answerId: string;
  content: string;
  isCorrect: boolean;
}

interface Question {
  questionId: string;
  content: string;
  answers: Answer[];
}

interface Quiz {
  quizzId: string;
  title: string;
  questions: Question[];
}

export default function QuizzRandom({ quizId }: { quizId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await RandomQuizz(quizId);
        setQuiz(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !quiz) {
    return <div>Error: {error}</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsFlipped(false);
      setSelectedAnswer(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsFlipped(false);
      setSelectedAnswer(null);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    setIsFlipped(true);
  };

  return (
    <div className={styles.flashcardContainer}>
      <h2>{quiz.title}</h2>

      <div className={`${styles.card} ${isFlipped ? styles.cardFlipped : ''}`}>
        <div className={styles.cardInner}>
          <div className={styles.cardFront}>
            <h3>Question {currentQuestionIndex + 1}</h3>
            <p>{currentQuestion.content}</p>
            <ul className={styles.answerList}>
              {currentQuestion.answers.map((answer) => (
                <li
                  key={answer.answerId}
                  className={`${styles.answerItem} ${
                    selectedAnswer === answer.answerId && isFlipped
                      ? answer.isCorrect
                        ? styles.correctAnswer
                        : styles.wrongAnswer
                      : ''
                  }`}
                  onClick={() => handleAnswerSelect(answer.answerId)}
                >
                  {answer.content}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.cardBack}>
            <h3>Answer</h3>
            {currentQuestion.answers.map((answer) => (
              answer.isCorrect && (
                <div key={answer.answerId}>
                  <p>{answer.content}</p>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      <div className={styles.navigation}>
        <button
          className={styles.navigationButton}
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        <button
          className={styles.navigationButton}
          onClick={handleNext}
          disabled={currentQuestionIndex === quiz.questions.length - 1}
        >
          Next
        </button>
      </div>

      <div className={styles.progress}>
        Question {currentQuestionIndex + 1} of {quiz.questions.length}
      </div>
    </div>
  );
}
