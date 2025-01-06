package com.study.sell_course.mapper;

import com.study.sell_course.dto.CourseDTO;
import com.study.sell_course.entity.Course;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public CourseDTO toDTOCourseDTO(Course course) {
        return CourseDTO.builder()
                .courseId(course.getCourseId())
                .title(course.getTitle())
                .price(course.getPrice())
                .description(course.getDescription())
                .videoInfo(course.getVideoInfo())
                .imageInfo(course.getImageInfo())
                .build();
    }

    public Course toEntityCourse(CourseDTO courseDTO) {
        return Course.builder()
                .courseId(courseDTO.getCourseId())
                .title(courseDTO.getTitle())
                .price(courseDTO.getPrice())
                .description(courseDTO.getDescription())
                .videoInfo(courseDTO.getVideoInfo())
                .imageInfo(courseDTO.getImageInfo())
                .build();
    }
}
