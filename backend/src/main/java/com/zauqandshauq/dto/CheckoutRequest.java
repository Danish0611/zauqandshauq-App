package com.zauqandshauq.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CheckoutRequest(
    @NotBlank @Size(max=100) String name,
    @NotBlank @Email @Size(max=200) String email,
    @NotBlank @Pattern(regexp="[0-9+()\\s-]{8,18}", message="Enter a valid phone number") String phone,
    @NotBlank @Size(max=250) String address,
    @NotBlank @Size(max=100) String city,
    @NotBlank @Size(max=100) String state,
    @NotBlank @Pattern(regexp="[0-9]{6}", message="Enter a six digit PIN code") String postalCode,
    @Size(max=30) String couponCode,
    @NotEmpty @Size(max=30) List<@Valid CheckoutLine> items
) { }
