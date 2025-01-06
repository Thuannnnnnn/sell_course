package com.study.sell_course.dto.auth;
import lombok.Getter;
@Getter
public class RegisterMailRequest {
    private String email;
    public RegisterMailRequest(String email) {
        this.email = email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
}
