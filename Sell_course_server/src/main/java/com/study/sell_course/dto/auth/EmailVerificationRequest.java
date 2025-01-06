package com.study.sell_course.dto.auth;
import com.study.sell_course.entity.EmailVerification;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class EmailVerificationRequest extends EmailVerification {
    private String email;
    private String token;
    private LocalDateTime created_at;
    private LocalDateTime expired_at;

    public EmailVerificationRequest(String email, String token, LocalDateTime created_at, LocalDateTime expired_at) {
        this.email = email;
        this.token = token;
        this.created_at = created_at;
        this.expired_at = expired_at;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setToken(String token) {
        this.token = token;
    }
    public void setCreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }
    public void setExpired_at(LocalDateTime expired_at) {
        this.expired_at = expired_at;
    }
}
