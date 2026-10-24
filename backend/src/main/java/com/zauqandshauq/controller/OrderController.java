package com.zauqandshauq.controller;

import com.zauqandshauq.dto.CheckoutRequest;
import com.zauqandshauq.model.OrderReceipt;
import com.zauqandshauq.model.UserEntity;
import com.zauqandshauq.service.AuthService;
import com.zauqandshauq.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    @Autowired
    public OrderController(OrderService orderService, AuthService authService) {
        this.orderService = orderService;
        this.authService = authService;
    }

    @PostMapping("/demo")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderReceipt demoOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CheckoutRequest request) {
        Long userId = authService != null
                ? authService.resolveOptionalUser(authHeader).map(UserEntity::getId).orElse(null)
                : null;
        return orderService.placeDemoOrder(request, userId);
    }

    @PostMapping("/cod")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderReceipt codOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CheckoutRequest request) {
        Long userId = authService != null
                ? authService.resolveOptionalUser(authHeader).map(UserEntity::getId).orElse(null)
                : null;
        return orderService.placeCodOrder(request, userId);
    }

    public record UpiOrderPayload(@Valid CheckoutRequest checkout, String utrNumber) {}

    @PostMapping("/upi")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderReceipt upiOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody UpiOrderPayload payload) {
        Long userId = authService != null
                ? authService.resolveOptionalUser(authHeader).map(UserEntity::getId).orElse(null)
                : null;
        return orderService.placeUpiOrder(payload.checkout(), payload.utrNumber(), userId);
    }

    @GetMapping("/{orderNumber}")
    public OrderReceipt findOrder(@PathVariable String orderNumber) {
        String normalized = orderNumber.trim().toUpperCase();
        if (!normalized.matches("ZS-[0-9]{8}-[A-F0-9]{6}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order reference format (expected ZS-YYYYMMDD-XXXXXX).");
        }
        return orderService.findOrder(normalized);
    }

    @GetMapping("/by-email")
    public List<OrderReceipt> findByEmail(@RequestParam String email) {
        return orderService.findOrdersByEmail(email);
    }
}
