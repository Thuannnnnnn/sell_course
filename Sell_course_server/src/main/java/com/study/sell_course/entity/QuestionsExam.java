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
@Table(name = "questionsExam")
public class QuestionsExam {
    @Id
    @Column(name = "questionsExam_id", nullable = false)
    private String questionsExamId;

    private String text;

    @ManyToOne
    @JoinColumn(name = "questionExam_id", nullable = false)
    private Exam exam;

}

