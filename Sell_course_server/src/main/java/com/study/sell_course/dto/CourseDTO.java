package com.study.sell_course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseDTO {
    private String courseId;
    private String title;
    private Double price;
    private String description;
    private String videoInfo;
    private String imageInfo;
}

