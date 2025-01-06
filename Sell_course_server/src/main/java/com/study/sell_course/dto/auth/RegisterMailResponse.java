package com.study.sell_course.dto.auth;
import jakarta.validation.constraints.AssertFalse;
import lombok.Builder;
import lombok.Getter;
@Getter
@Builder
public class RegisterMailResponse {
    private String message;
    private String url;
    public RegisterMailResponse(String message, String url) {
        this.message = message;
        this.url = url;
    }



    public void setMessage(String message) {
        this.message = message;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
