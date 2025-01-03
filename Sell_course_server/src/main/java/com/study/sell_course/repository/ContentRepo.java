package com.study.sell_course.repository;

import com.study.sell_course.entity.Contents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.AbstractDocument;

@Repository
public interface ContentRepo extends JpaRepository<Contents, String> {
}
