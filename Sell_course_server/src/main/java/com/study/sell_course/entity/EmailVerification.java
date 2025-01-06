package com.study.sell_course.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "email_verifications")
@Builder
public class EmailVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String token;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime created_at;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expired_at;

    public EmailVerification(String email, String token, LocalDateTime created_at, LocalDateTime expired_at) {
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
