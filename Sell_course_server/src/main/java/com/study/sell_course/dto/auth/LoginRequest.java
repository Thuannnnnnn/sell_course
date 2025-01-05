package com.study.sell_course.dto.auth;

import lombok.Getter;

@Getter
public class LoginRequest {
    private String email;
    private String password;

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
