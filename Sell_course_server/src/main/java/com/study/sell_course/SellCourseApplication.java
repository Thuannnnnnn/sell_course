package com.study.sell_course;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.study.sell_course")
@RequiredArgsConstructor
public class SellCourseApplication {

    public static void main(String[] args) {
        SpringApplication.run(SellCourseApplication.class, args);
    }

}
