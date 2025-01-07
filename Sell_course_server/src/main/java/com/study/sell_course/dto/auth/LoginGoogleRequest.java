package com.study.sell_course.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginGoogleRequest {
    private String email;
    private String username;
}
