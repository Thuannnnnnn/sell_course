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
@Table(name = "video")
public class Video {
    @Id
    @Column(name = "video_id", nullable = false)
    private String videoId;

    @ManyToOne
    @JoinColumn(name = "content_id", nullable = false)
    private Contents contents;

    private String title;
    private String description;
    private String url;
    private Timestamp createdAt;
}
