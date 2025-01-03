package com.study.sell_course.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @Column(name = "users_id", nullable = false)
    private String userId;

    private String email;
    private String username;
    private String password;
    private String gender;
    private String birthDay;
    private Integer phoneNumber;
    private String role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;


}
