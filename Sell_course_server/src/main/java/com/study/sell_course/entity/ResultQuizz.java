package com.study.sell_course.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "resultQuizz")
public class ResultQuizz {
    @Id
    @Column(name = "resultQuizz_id", nullable = false)
    private Integer resultQuizzId;

    @ManyToOne
    @JoinColumn(name = "quizz_id", nullable = false)
    private Quizz quizz;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer score;
    private Timestamp submittedAt;

    // Getters and Setters
}
