package com.zauqandshauq.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CheckoutLine(
    @NotNull Long productId,
    @Min(1) @Max(10) int quantity
) { }
