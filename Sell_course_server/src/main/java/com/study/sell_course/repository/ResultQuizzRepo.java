package com.study.sell_course.repository;

import com.study.sell_course.entity.ResultQuizz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResultQuizzRepo extends JpaRepository<ResultQuizz, Integer> {
}
