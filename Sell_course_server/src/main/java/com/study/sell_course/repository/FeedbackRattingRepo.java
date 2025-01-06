package com.study.sell_course.repository;

import com.study.sell_course.entity.FeedbackRatting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRattingRepo extends JpaRepository<FeedbackRatting, String> {
}
