package com.zauqandshauq.service;

import com.zauqandshauq.dto.CheckoutLine;
import com.zauqandshauq.dto.CheckoutRequest;
import com.zauqandshauq.model.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class OrderServiceTest {
    private ProductService productService;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        productService = Mockito.mock(ProductService.class);
        orderService = new OrderService(productService);

        Product p1 = new Product();
        p1.setId(1L);
        p1.setName("Noir Oud");
        p1.setPrice(3499.0);

        Product p2 = new Product();
        p2.setId(2L);
        p2.setName("Rose Éclat");
        p2.setPrice(2899.0);

        Product p3 = new Product();
        p3.setId(3L);
        p3.setName("Citrus Drift");
        p3.setPrice(2199.0);

        when(productService.findById(1L)).thenReturn(Optional.of(p1));
        when(productService.findById(2L)).thenReturn(Optional.of(p2));
        when(productService.findById(3L)).thenReturn(Optional.of(p3));
    }

    private CheckoutRequest request(String coupon, long id, int quantity) {
        return new CheckoutRequest("Demo Customer", "demo@example.com", "9876543210", "12 Sample Road", "Jaipur", "Rajasthan", "302001", coupon, List.of(new CheckoutLine(id, quantity)));
    }

    @Test
    void appliesTenPercentCouponToSubtotal() {
        var pricing = orderService.quote(request("ZAUQ10", 1L, 1));
        assertEquals("3499.00", pricing.subtotal().toPlainString());
        assertEquals("349.90", pricing.discount().toPlainString());
        assertEquals("0.00", pricing.shipping().toPlainString());
        assertEquals("3149.10", pricing.total().toPlainString());
    }

    @Test
    void chargesDeliveryBelowFreeShippingThreshold() {
        var pricing = orderService.quote(request("", 3L, 1));
        assertEquals("2199.00", pricing.subtotal().toPlainString());
        assertEquals("99.00", pricing.shipping().toPlainString());
        assertEquals("2298.00", pricing.total().toPlainString());
    }

    @Test
    void appliesDiscoverCouponAndCapsAtSubtotal() {
        var pricing = orderService.quote(request("DISCOVER999", 1L, 1));
        assertEquals("3499.00", pricing.subtotal().toPlainString());
        assertEquals("999.00", pricing.discount().toPlainString());
        assertEquals("0.00", pricing.shipping().toPlainString());
        assertEquals("2500.00", pricing.total().toPlainString());
    }

    @Test
    void resolvesCoffretFallbackWhenProductIdIs9999() {
        var pricing = orderService.quote(request("", 9999L, 1));
        assertEquals("999.00", pricing.subtotal().toPlainString());
        assertEquals("99.00", pricing.shipping().toPlainString());
        assertEquals("1098.00", pricing.total().toPlainString());
        assertEquals("The Royal Discovery Coffret", pricing.lines().get(0).name());
    }

    @Test
    void placesCodOrderWithPendingDeliveryStatus() {
        var receipt = orderService.placeCodOrder(request("", 1L, 1));
        assertNotNull(receipt.orderNumber());
        assertEquals("COD_CONFIRMED", receipt.status());
        assertEquals("CASH_ON_DELIVERY", receipt.paymentMethod());
        assertEquals("3499.00", receipt.total().toPlainString());
    }
}
