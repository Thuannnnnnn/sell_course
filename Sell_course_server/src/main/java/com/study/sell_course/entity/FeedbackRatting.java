package com.study.sell_course.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "feedback_ratting")
public class FeedbackRatting {
    @Id
    @Column(name = "feedback_ratting_id", nullable = false)
    private String feedbackRattingId;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "users_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id", referencedColumnName = "course_id")
    private Course course;

    private Integer star;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
