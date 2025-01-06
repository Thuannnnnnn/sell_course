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
@Table(name = "qa")
public class Qa {
    @Id
    @Column(name = "qa_id", nullable = false)
    private String qaId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String text;
    private Timestamp createdAt;
}

