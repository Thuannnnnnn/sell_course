package com.study.sell_course.repository;

import com.study.sell_course.entity.Qa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QaRepo extends JpaRepository<Qa, String> {
}
