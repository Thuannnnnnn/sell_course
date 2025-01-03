package com.study.sell_course.repository;

import com.study.sell_course.entity.Reply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReplyRepo extends JpaRepository<Reply, String> {
}
