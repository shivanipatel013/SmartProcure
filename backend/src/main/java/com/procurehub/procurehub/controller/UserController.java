package com.procurehub.procurehub.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.procurehub.procurehub.entity.UserEntity;
import com.procurehub.procurehub.repository.UserRepository;
import com.procurehub.procurehub.security.JwtUtil;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public Object register(@RequestBody UserEntity user) {

    if (userRepository.findByEmail(user.getEmail()).isPresent()) {
        return "Email already exists";
    }

    if (userRepository.findByPassword(user.getPassword()).isPresent()) {
        return "Password already used";
    }

    return userRepository.save(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody UserEntity user) {

    UserEntity dbUser = userRepository.findByEmail(user.getEmail()).orElse(null);

    if (dbUser != null && dbUser.getPassword().equals(user.getPassword())) {
        return JwtUtil.generateToken(dbUser.getEmail());
    }

    return "Invalid Email or Password";
    }

    // Get user by email – called by frontend after login to resolve userId, username, role
    @GetMapping("/getByEmail")
    public UserEntity getByEmail(@RequestParam String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    // Get All Users
    @GetMapping("/getAllUsers")
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }
}