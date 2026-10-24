package com.zauqandshauq.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderReceipt(
    String orderNumber,
    String status,
    String paymentMethod,
    Instant createdAt,
    String name,
    String email,
    String phone,
    String address,
    String city,
    String state,
    String postalCode,
    List<OrderLine> items,
    BigDecimal subtotal,
    BigDecimal discount,
    BigDecimal shipping,
    BigDecimal total
) {
    public OrderReceipt(
        String orderNumber, String status, String paymentMethod, Instant createdAt,
        String name, String email, List<OrderLine> items,
        BigDecimal subtotal, BigDecimal discount, BigDecimal shipping, BigDecimal total
    ) {
        this(orderNumber, status, paymentMethod, createdAt, name, email, "", "", "", "", "", items, subtotal, discount, shipping, total);
    }

    public record OrderLine(long productId, String name, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) { }
}
