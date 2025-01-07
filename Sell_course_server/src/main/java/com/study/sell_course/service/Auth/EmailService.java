package com.study.sell_course.service.Auth;

import com.study.sell_course.dto.auth.RegisterMailResponse;
import com.study.sell_course.dto.auth.RegisterResponse;
import com.study.sell_course.entity.EmailVerification;
import com.study.sell_course.repository.EmailVerificationRepo;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;
    @Autowired
    private EmailVerificationRepo emailVerificationRepo;
    public void sendVerificationEmail(String email, String token) throws MessagingException {
        String subject = "Xác nhận đăng ký tài khoản";
        String content = "Vui lòng nhấp vào liên kết dưới đây để xác nhận đăng ký của bạn: " +
                "http://localhost:8080/api/auth/verify-email?token=" + token;

        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(email);
        helper.setSubject(subject);
        helper.setText(content);
        javaMailSender.send(message);
    }
    public String generateVerificationToken() {
        return java.util.UUID.randomUUID().toString();
    }

    public RegisterMailResponse sendRegisterMail(String email) {
        long TIME_OUT = 1000 * 60 * 60;
        String token = generateVerificationToken();
        try {
            sendVerificationEmail(email, token);
            Optional<EmailVerification> existingRequest = emailVerificationRepo.findByEmail(email);
        EmailVerification verificationRequest;
        if (existingRequest.isPresent()) {
            verificationRequest = existingRequest.get();
                verificationRequest.setToken(token);
                verificationRequest.setCreated_at(LocalDateTime.now());
                verificationRequest.setExpired_at(LocalDateTime.now().plusSeconds(TIME_OUT));
        } else {

            verificationRequest = EmailVerification.builder()
                    .email(email)
                    .token(token)
                    .created_at(LocalDateTime.now())
                    .expired_at(LocalDateTime.now().plusSeconds(TIME_OUT))
                    .build();


        }
        emailVerificationRepo.save(verificationRequest);

        } catch (MessagingException e) {
            e.printStackTrace();
        }
        return RegisterMailResponse.builder()
                .message("Email sent successfully")
                .url("http://localhost:8080/api/auth/verify-email?token=" + token)
                .build();
    }

    public boolean verifyToken(String token, String email) {
        Optional<EmailVerification> existingRequest = emailVerificationRepo.findByToken(token);
        Optional<EmailVerification> existingEmail = emailVerificationRepo.findByEmail(email);
        if(existingRequest.isEmpty() || existingEmail.isEmpty()) {
            return false;
        }
        EmailVerification verificationRequest = existingRequest.get();
        return !verificationRequest.getExpired_at().isBefore(LocalDateTime.now());

    }
    public void deleteToken(String email) {
        emailVerificationRepo.deleteEmailVerificationByEmail(email);
    }
}
