package com.study.sell_course.controller;

import com.study.sell_course.dto.auth.JwtResponse;
import com.study.sell_course.dto.auth.LoginRequest;
import com.study.sell_course.dto.auth.RegisterRequest;
import com.study.sell_course.dto.auth.RegisterResponse;
import com.study.sell_course.service.Auth.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.login(loginRequest);
        return ResponseEntity.ok(jwtResponse);  // Trả về token JWT
    }
    @PostMapping("/register")
    public RegisterResponse register (@RequestBody RegisterRequest registerRequest){
        return authService.register(registerRequest);
    }
    @GetMapping("/register")
    public String testRegister(){
        return "oke";
    }
}
