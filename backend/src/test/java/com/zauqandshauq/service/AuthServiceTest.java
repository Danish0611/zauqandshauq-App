package com.zauqandshauq.service;

import com.zauqandshauq.model.UserEntity;
import com.zauqandshauq.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private UserRepository userRepository;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        authService = new AuthService(userRepository);
        ReflectionTestUtils.setField(authService, "jwtSecret", "test-secret-key-for-zauq-and-shauq-2026");
        ReflectionTestUtils.setField(authService, "jwtExpirationMs", 3600000L);
    }

    @Test
    void registersNewCustomerAndIssuesValidJwt() {
        when(userRepository.existsByEmailIgnoreCase("sana@example.com")).thenReturn(false);
        when(userRepository.save(any(UserEntity.class))).thenAnswer(inv -> {
            UserEntity u = inv.getArgument(0);
            u.setId(42L);
            return u;
        });

        AuthService.AuthResponse res = authService.register("Sana R.", "sana@example.com", "secret123", "9876543210");
        assertNotNull(res.token());
        assertEquals("Sana R.", res.user().name());
        assertEquals("CUSTOMER", res.user().role());

        UserEntity stored = new UserEntity();
        stored.setId(42L);
        stored.setName("Sana R.");
        stored.setEmail("sana@example.com");
        stored.setRole("CUSTOMER");
        when(userRepository.findById(42L)).thenReturn(Optional.of(stored));

        UserEntity verified = authService.requireUser("Bearer " + res.token());
        assertEquals(42L, verified.getId());
        assertEquals("sana@example.com", verified.getEmail());
    }
}

