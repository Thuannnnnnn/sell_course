package com.study.sell_course.dto.auth;
import lombok.Data;
@Data
public class RegisterRequest {
    private String email;
    private String brith_day;
    private String gender;
    private String password;
    private Integer phone_number;
    private String role;
    private String username;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBrith_day() {
        return brith_day;
    }

    public void setBrith_day(String brith_day) {
        this.brith_day = brith_day;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getPhone_number() {
        return phone_number;
    }

    public void setPhone_number(Integer phone_number) {
        this.phone_number = phone_number;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
