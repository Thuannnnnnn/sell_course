package com.study.sell_course.service.Auth;

import com.study.sell_course.dto.auth.JwtResponse;
import com.study.sell_course.dto.auth.LoginRequest;
import com.study.sell_course.dto.auth.RegisterRequest;
import com.study.sell_course.dto.auth.RegisterResponse;
import com.study.sell_course.entity.User;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.study.sell_course.repository.UserRepo;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailsService userDetailsService;
    private final EmailService emailService;
    @Autowired
    public AuthService(UserRepo userRepo, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService, CustomUserDetailsService userDetailsService, EmailService emailService) {
        this.userRepo = userRepo;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.emailService = emailService;
    }

    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails.getUsername());
        String refreshToken = jwtService.generateRefreshToken(userDetails.getUsername());
        return new JwtResponse(token, refreshToken);
    }
    public JwtResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (username == null || !jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new JwtException("Refresh token is expired or invalid");
        }


        String newAccessToken = jwtService.generateToken(username);
        return new JwtResponse(newAccessToken, refreshToken);
    }
    public RegisterResponse register(RegisterRequest request, String token) {
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email exists!");
        }
        if(!emailService.verifyToken(token, request.getEmail())) {
            throw new IllegalArgumentException("Token is invalid");
        }
        User user = User.builder()
                .userId(UUID.randomUUID())
                .birthDay(request.getBrith_day())
                .gender(request.getGender())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhone_number())
                .role("Customer")
                .createdAt(LocalDateTime.now())
                .build();
        userRepo.save(user);

        return RegisterResponse.builder()
                .message("Register Successfully")
                .email(request.getEmail())
                .build();
    }
}