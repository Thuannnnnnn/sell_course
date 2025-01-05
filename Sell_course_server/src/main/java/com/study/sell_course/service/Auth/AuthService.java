package com.study.sell_course.service.Auth;

import com.study.sell_course.dto.auth.JwtResponse;
import com.study.sell_course.dto.auth.LoginRequest;
import com.study.sell_course.dto.auth.RegisterRequest;
import com.study.sell_course.dto.auth.RegisterResponse;
import com.study.sell_course.entity.User;
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

    @Autowired
    public AuthService(UserRepo userRepo, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepo = userRepo;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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
        return new JwtResponse(token);
    }

    public RegisterResponse register(RegisterRequest request) {
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email exists!");
        }
        User user = User.builder()
                .userId(UUID.randomUUID())
                .birthDay(request.getBrith_day()) // Corrected typo here
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