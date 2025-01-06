package com.study.sell_course.repository;

import com.study.sell_course.entity.ResultExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResultExamRepo extends JpaRepository<ResultExam, String> {
}
