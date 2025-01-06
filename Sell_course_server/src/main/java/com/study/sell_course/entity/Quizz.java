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
@Table(name = "quizz")
public class Quizz {
    @Id
    @Column(name = "quizz_id", nullable = false)
    private String quizzId;

    @ManyToOne
    @JoinColumn(name = "content_id", nullable = false)
    private Contents contents;

    private Timestamp createdAt;

}

