package com.study.sell_course.mapper;

import com.study.sell_course.entity.User;

public class UserMapper {
    public static User formEmailAndPassword(String email, String password){
        User user = new User();
        user.setEmail(email);
        user.setPassword(password);
        return user;
    }
}
