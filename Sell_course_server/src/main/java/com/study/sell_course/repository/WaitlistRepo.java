package com.study.sell_course.repository;

import com.study.sell_course.entity.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WaitlistRepo extends JpaRepository<Waitlist, String> {
}
