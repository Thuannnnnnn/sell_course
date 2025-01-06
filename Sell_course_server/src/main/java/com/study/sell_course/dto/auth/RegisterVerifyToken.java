package com.study.sell_course.dto.auth;

public class RegisterVerifyToken {
    private String token;

    public RegisterVerifyToken(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
