package com.study.sell_course.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "course")
public class Course {
    @Id
    @Column(name = "course_id", nullable = false)
    private String courseId;

    private String title;
    private Double price;
    private String description;

    @Column(name = "video_info")
    private String videoInfo;

    @Column(name = "image_info")
    private String imageInfo;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

}
