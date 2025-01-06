package com.study.sell_course.repository;

import com.study.sell_course.entity.OrderHistories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderHistoriesRepo extends JpaRepository<OrderHistories, String> {
}
