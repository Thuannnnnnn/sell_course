package com.study.sell_course.repository;

import com.study.sell_course.entity.Docs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocsRepo extends JpaRepository<Docs, String> {
}
