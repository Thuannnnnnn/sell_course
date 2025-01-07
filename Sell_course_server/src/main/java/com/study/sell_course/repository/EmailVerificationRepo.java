package com.study.sell_course.repository;
import com.study.sell_course.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationRepo extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByEmail(String email);
    Optional<EmailVerification> findByToken(String token);
    void deleteEmailVerificationByEmail(String email);
}
