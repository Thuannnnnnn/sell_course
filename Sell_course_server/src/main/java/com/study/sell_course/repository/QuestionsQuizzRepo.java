package com.study.sell_course.repository;

import com.study.sell_course.entity.QuestionsQuizz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionsQuizzRepo extends JpaRepository<QuestionsQuizz, String> {
}
