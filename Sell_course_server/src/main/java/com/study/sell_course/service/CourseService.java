package com.study.sell_course.service;


import com.study.sell_course.dto.CourseDTO;
import com.study.sell_course.entity.Course;
import com.study.sell_course.mapper.CourseMapper;
import com.study.sell_course.repository.CourseRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepo courseRepository;

    @Autowired
    private CourseMapper courseMapper;

    public List<CourseDTO> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream().map(courseMapper::toDTOCourseDTO).collect(Collectors.toList());
    }

    public CourseDTO getCourseById(String courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow(() ->
                new RuntimeException("Course not found with ID: " + courseId));
        return courseMapper.toDTOCourseDTO(course);
    }

    public CourseDTO createCourse(CourseDTO courseDTO) {
        Course course = courseMapper.toEntityCourse(courseDTO);
        Course savedCourse = courseRepository.save(course);
        return courseMapper.toDTOCourseDTO(savedCourse);
    }

    public CourseDTO updateCourse(String courseId, CourseDTO courseDTO) {
        Course existingCourse = courseRepository.findById(courseId).orElseThrow(() ->
                new RuntimeException("Course not found with ID: " + courseId));
        existingCourse.setTitle(courseDTO.getTitle());
        existingCourse.setPrice(courseDTO.getPrice());
        existingCourse.setDescription(courseDTO.getDescription());
        existingCourse.setVideoInfo(courseDTO.getVideoInfo());
        existingCourse.setImageInfo(courseDTO.getImageInfo());
        Course updatedCourse = courseRepository.save(existingCourse);
        return courseMapper.toDTOCourseDTO(updatedCourse);
    }

    public void deleteCourse(String courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found with ID: " + courseId);
        }
        courseRepository.deleteById(courseId);
    }
}
