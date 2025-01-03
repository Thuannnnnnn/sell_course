package com.study.sell_course.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "questions_quizz")
public class QuestionsQuizz {
    @Id
    @Column(name = "questionsQuizz_id", nullable = false)
    private String questionsQuizzId;

    private String text;

    @ManyToOne
    @JoinColumn(name = "questionQuizz_id", nullable = false)
    private Quizz quizz;

}

