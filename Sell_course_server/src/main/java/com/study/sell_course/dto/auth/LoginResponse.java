package com.study.sell_course.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private String refreshToken;
    private String email;
    private String username;
    private String role;
    private String gender;
    private String birthDay;
    private Integer phoneNumber;

    // Constructor
    public LoginResponse(String token, String refreshToken, String email, String username, String role,
                         String gender, String birthDay, Integer phoneNumber) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.email = email;
        this.username = username;
        this.role = role;
        this.gender = gender;
        this.birthDay = birthDay;
        this.phoneNumber = phoneNumber;
    }
}
