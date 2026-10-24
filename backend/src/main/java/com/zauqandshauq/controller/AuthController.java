package com.zauqandshauq.controller;

import com.zauqandshauq.model.OrderReceipt;
import com.zauqandshauq.model.UserEntity;
import com.zauqandshauq.service.AuthService;
import com.zauqandshauq.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final OrderService orderService;

    public AuthController(AuthService authService, OrderService orderService) {
        this.authService = authService;
        this.orderService = orderService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthService.AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req.name(), req.email(), req.password(), req.phone());
    }

    @PostMapping("/login")
    public AuthService.AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req.email(), req.password());
    }

    @GetMapping("/me")
    public Map<String, Object> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserEntity user = authService.requireUser(authHeader);
        return Map.of(
                "user", authService.toUserDto(user),
                "orders", getUserOrders(user)
        );
    }

    @PutMapping("/profile")
    public AuthService.UserDto updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody ProfileUpdateRequest req) {
        UserEntity user = authService.requireUser(authHeader);
        return authService.updateProfile(user, req.name(), req.phone(), req.address(), req.city(), req.state(), req.postalCode());
    }

    @GetMapping("/orders")
    public List<OrderReceipt> myOrders(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        UserEntity user = authService.requireUser(authHeader);
        return getUserOrders(user);
    }

    private List<OrderReceipt> getUserOrders(UserEntity user) {
        Map<String, OrderReceipt> merged = new LinkedHashMap<>();
        for (OrderReceipt r : orderService.findOrdersByUserId(user.getId())) {
            merged.put(r.orderNumber(), r);
        }
        for (OrderReceipt r : orderService.findOrdersByEmail(user.getEmail())) {
            merged.putIfAbsent(r.orderNumber(), r);
        }
        return new ArrayList<>(merged.values());
    }

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 120) String name,
            @NotBlank @Email @Size(max = 200) String email,
            @NotBlank @Size(min = 6, max = 100) String password,
            String phone
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record ProfileUpdateRequest(
            String name, String phone, String address, String city, String state, String postalCode
    ) {}
}

