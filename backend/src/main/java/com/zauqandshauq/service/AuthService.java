package com.zauqandshauq.service;

import com.zauqandshauq.model.UserEntity;
import com.zauqandshauq.repository.UserRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${app.auth.jwt-secret:zauqandshauq-luxury-fragrance-jwt-secret-key-2026-secure}")
    private String jwtSecret;

    @Value("${app.auth.jwt-expiration-ms:604800000}")
    private long jwtExpirationMs;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public AuthResponse register(String name, String email, String password, String phone) {
        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        UserEntity user = new UserEntity();
        user.setName(name.trim());
        user.setEmail(normalizedEmail);
        user.setPhone(phone != null ? phone.trim() : "");
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole("CUSTOMER");

        UserEntity saved = userRepository.save(user);
        String token = generateToken(saved);
        return new AuthResponse(token, toUserDto(saved));
    }

    public AuthResponse login(String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();
        UserEntity user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        String token = generateToken(user);
        return new AuthResponse(token, toUserDto(user));
    }

    @Transactional
    public UserDto updateProfile(UserEntity user, String name, String phone, String address, String city, String state, String postalCode) {
        if (name != null && !name.isBlank()) user.setName(name.trim());
        if (phone != null) user.setPhone(phone.trim());
        if (address != null) user.setAddress(address.trim());
        if (city != null) user.setCity(city.trim());
        if (state != null) user.setState(state.trim());
        if (postalCode != null) user.setPostalCode(postalCode.trim());
        return toUserDto(userRepository.save(user));
    }

    public Optional<UserEntity> resolveOptionalUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }
        try {
            return Optional.of(requireUser(authHeader));
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    public UserEntity requireUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication token is required.");
        }
        String token = authHeader.substring(7).trim();
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Malformed authentication token.");
        }

        String expectedSig = hmacSha256(parts[0] + "." + parts[1]);
        if (!MessageDigest.isEqual(expectedSig.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication token signature.");
        }

        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        JSONObject payload = new JSONObject(payloadJson);
        long exp = payload.optLong("exp", 0L);
        if (System.currentTimeMillis() > exp) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Your session has expired. Please sign in again.");
        }

        long userId = payload.getLong("sub");
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists."));
    }

    public UserEntity requireAdmin(String authHeader) {
        UserEntity user = requireUser(authHeader);
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin privileges are required to perform this action.");
        }
        return user;
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public UserDto toUserDto(UserEntity u) {
        return new UserDto(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getPhone() != null ? u.getPhone() : "",
                u.getRole(),
                u.getAddress() != null ? u.getAddress() : "",
                u.getCity() != null ? u.getCity() : "",
                u.getState() != null ? u.getState() : "Rajasthan",
                u.getPostalCode() != null ? u.getPostalCode() : ""
        );
    }

    private String generateToken(UserEntity user) {
        String header = Base64.getUrlEncoder().withoutPadding()
                .encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        JSONObject payloadObj = new JSONObject();
        payloadObj.put("sub", user.getId());
        payloadObj.put("email", user.getEmail());
        payloadObj.put("role", user.getRole());
        payloadObj.put("iat", System.currentTimeMillis());
        payloadObj.put("exp", System.currentTimeMillis() + jwtExpirationMs);

        String payload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payloadObj.toString().getBytes(StandardCharsets.UTF_8));
        String signature = hmacSha256(header + "." + payload);
        return header + "." + payload + "." + signature;
    }

    private String hmacSha256(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to sign JWT token", e);
        }
    }

    public record UserDto(
            Long id, String name, String email, String phone, String role,
            String address, String city, String state, String postalCode
    ) {}

    public record AuthResponse(String token, UserDto user) {}
}

