package com.study.sell_course.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "lesson")
public class Lesson {
    @Id
    private String lesson_id;
    private String course_id;
    private String lessonName;
    private String create_at;
}
