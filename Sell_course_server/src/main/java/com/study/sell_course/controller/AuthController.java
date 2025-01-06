package com.study.sell_course.controller;

import com.study.sell_course.dto.auth.*;
import com.study.sell_course.service.Auth.AuthService;
import com.study.sell_course.service.Auth.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final EmailService emailService;
    public AuthController(AuthService authService, EmailService emailService) {
        this.authService = authService;
        this.emailService = emailService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.login(loginRequest);
        return ResponseEntity.ok(jwtResponse);  // Trả về token JWT
    }
    @PostMapping("/register-user")
    public RegisterResponse register (@RequestBody RegisterRequest registerRequest, @RequestParam String token) {
        return authService.register(registerRequest, token);
    }
    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }

        System.out.println("Received refresh token: " + refreshToken);

        JwtResponse jwtResponse = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(jwtResponse);
    }
    @PostMapping("/register")
    public RegisterMailResponse register(@RequestBody RegisterMailRequest registerMailRequest) {
        return emailService.sendRegisterMail(registerMailRequest.getEmail());
    }
}
