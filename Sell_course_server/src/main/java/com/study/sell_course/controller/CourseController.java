package com.study.sell_course.controller;

import com.study.sell_course.dto.CourseDTO;
import com.study.sell_course.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@Tag(name = "Course APIs")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Operation(summary = "Get all courses", description = "Retrieve a list of all courses")
    @ApiResponse(responseCode = "200", description = "Successful retrieval of course list")
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @Operation(summary = "Get a course by ID", description = "Retrieve course details by course ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful retrieval of course details"),
            @ApiResponse(responseCode = "404", description = "Course not found", content = @Content)
    })
    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable String courseId) {
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    @Operation(summary = "Create a new course", description = "Add a new course to the system")
    @ApiResponse(responseCode = "200", description = "Course successfully created")
    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO courseDTO) {
        return ResponseEntity.ok(courseService.createCourse(courseDTO));
    }

    @Operation(summary = "Update a course", description = "Update details of an existing course by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Course successfully updated"),
            @ApiResponse(responseCode = "404", description = "Course not found", content = @Content)
    })
    @PutMapping("/{courseId}")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable String courseId, @RequestBody CourseDTO courseDTO) {
        return ResponseEntity.ok(courseService.updateCourse(courseId, courseDTO));
    }

    @Operation(summary = "Delete a course", description = "Remove a course from the system by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Course successfully deleted"),
            @ApiResponse(responseCode = "404", description = "Course not found", content = @Content)
    })
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable String courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }
}
