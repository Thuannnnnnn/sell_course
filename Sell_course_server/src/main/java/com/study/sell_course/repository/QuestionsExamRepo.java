package com.study.sell_course.repository;

import com.study.sell_course.entity.QuestionsExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionsExamRepo extends JpaRepository<QuestionsExam, String> {
}
