package com.study.sell_course.service.Auth;

import com.study.sell_course.dto.auth.CustomUserDetails;
import com.study.sell_course.entity.User;
import com.study.sell_course.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepo userRepo;

    @Autowired
    public CustomUserDetailsService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public CustomUserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Tìm người dùng trong cơ sở dữ liệu
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Trả về CustomUserDetails chứa thông tin người dùng
        return new CustomUserDetails(
                user.getEmail(),
                user.getPassword(),
                user.getRole(),
                user.getGender(),
                user.getBirthDay(),
                user.getPhoneNumber()
        );
    }
}
