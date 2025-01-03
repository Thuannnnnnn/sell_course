package com.study.sell_course.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "forum")
public class Forum {
    @Id
    @Column(name = "forum_id", nullable = false)
    private String forumId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;
    private String image;
    private String text;
    private Timestamp createdAt;

    // Getters and Setters
}

