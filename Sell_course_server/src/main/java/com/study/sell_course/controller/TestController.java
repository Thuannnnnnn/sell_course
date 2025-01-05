package com.study.sell_course.controller;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

public class TestController {
    @GetMapping("/")
    public String greet(HttpServletRequest request) {
        return "Welcome to "+request.getSession().getId();
    } @GetMapping("/api/hello")
    public String sayHello() {
        return "Hello, World";
    }
}
