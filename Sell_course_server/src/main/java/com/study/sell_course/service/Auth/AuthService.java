package com.study.sell_course.service.Auth;

import com.study.sell_course.dto.auth.*;
import com.study.sell_course.entity.User;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.study.sell_course.repository.UserRepo;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
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

    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // Xác thực người dùng
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Lấy thông tin người dùng
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Tạo claims để lưu thêm thông tin
            Map<String, Object> claims = new HashMap<>();
            claims.put("role", userDetails.getAuthorities().stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Role not found"))
                    .getAuthority());

            // Tạo token và refresh token
            String token = jwtService.generateToken(userDetails.getUsername(), claims);
            String refreshToken = jwtService.generateRefreshToken(userDetails.getUsername());

            // Trả về kết quả LoginResponse
            return new LoginResponse(
                    token,
                    refreshToken,
                    userDetails.getUsername(),
                    userDetails.getUsername(), // Assuming username is the same as email or you can map this to a custom user field
                    userDetails.getAuthorities().stream().findFirst().orElseThrow().getAuthority(),
                    ((CustomUserDetails) userDetails).getGender(), // Assuming CustomUserDetails has these fields
                    ((CustomUserDetails) userDetails).getBirthDay(),
                    ((CustomUserDetails) userDetails).getPhoneNumber()
            );

        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password", e);
        } catch (Exception e) {
            throw new RuntimeException("An error occurred during login", e);
        }
    }
    public JwtResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (username == null || !jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new JwtException("Refresh token is expired or invalid");
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userDetails.getAuthorities().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Role not found"))
                .getAuthority());
        String newAccessToken = jwtService.generateToken(userDetails.getUsername(), claims);
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
                .role("CUSTOMER")
                .createdAt(LocalDateTime.now())
                .build();
        userRepo.save(user);
        emailService.deleteToken(request.getEmail());
        return RegisterResponse.builder()
                .message("Register Successfully")
                .email(request.getEmail())
                .build();
    }
    public LoginResponse loginGoogle(String email, String username) {
        if (!userRepo.existsByEmail(email)) {
            User user = User.builder()
                    .userId(UUID.fromString(UUID.randomUUID().toString()))
                    .email(email)
                    .username(username)
                    .role("CUSTOMER")
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepo.save(user);
        }
        String token = jwtService.generateToken(email, new HashMap<>());
        String refreshToken = jwtService.generateRefreshToken(email);
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return new LoginResponse(
                token,
                refreshToken,
                user.getEmail(),
                user.getUsername(),
                user.getRole(),
                user.getGender(),
                user.getBirthDay(),
                user.getPhoneNumber()
        );
    }
}