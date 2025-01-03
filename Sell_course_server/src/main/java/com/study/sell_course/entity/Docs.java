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
@Table(name = "docs")
public class Docs {
    @Id
    @Column(name = "docs_id", nullable = false)
    private String docsId;

    @ManyToOne
    @JoinColumn(name = "content_id", nullable = false)
    private Contents contents;

    private String title;
    private String url;
    private Timestamp createdAt;

    // Getters and Setters
}

