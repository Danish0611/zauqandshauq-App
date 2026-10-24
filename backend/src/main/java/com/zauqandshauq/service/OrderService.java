package com.zauqandshauq.service;

import com.zauqandshauq.dto.CheckoutLine;
import com.zauqandshauq.dto.CheckoutRequest;
import com.zauqandshauq.model.OrderEntity;
import com.zauqandshauq.model.OrderItemEntity;
import com.zauqandshauq.model.OrderReceipt;
import com.zauqandshauq.model.Product;
import com.zauqandshauq.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OrderService {
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("2499.00");
    private static final BigDecimal DELIVERY_FEE = new BigDecimal("99.00");

    private final ProductService productService;
    private final OrderRepository orderRepository;
    private final EmailNotificationService emailService;
    private final ConcurrentHashMap<String, OrderReceipt> fallbackOrders = new ConcurrentHashMap<>();

    public OrderService(ProductService productService) {
        this(productService, null, null);
    }

    @Autowired
    public OrderService(ProductService productService, OrderRepository orderRepository, EmailNotificationService emailService) {
        this.productService = productService;
        this.orderRepository = orderRepository;
        this.emailService = emailService;
    }

    public Pricing quote(CheckoutRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Your bag is empty.");
        }
        if (request.items().size() > 30) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Too many unique items in an order.");
        }
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderReceipt.OrderLine> lines = new ArrayList<>();
        for (CheckoutLine item : request.items()) {
            if (item.quantity() < 1 || item.quantity() > 10) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each product quantity must be between 1 and 10.");
            }
            Product product = productService.findById(item.productId())
                    .or(() -> {
                        if (item.productId() == 9999L) {
                            return productService.findByProductCode("ZS-COFFRET-05");
                        }
                        return Optional.empty();
                    })
                    .orElseGet(() -> {
                        if (item.productId() == 9999L) {
                            Product virtual = new Product();
                            virtual.setId(9999L);
                            virtual.setProductCode("ZS-COFFRET-05");
                            virtual.setName("The Royal Discovery Coffret");
                            virtual.setBrand("Zauq & Shauq");
                            virtual.setCategory("Unisex");
                            virtual.setConcentration("Discovery Wardrobe");
                            virtual.setSize("5 × 2ml Vials");
                            virtual.setPrice(999.0);
                            virtual.setOriginalPrice(2499.0);
                            virtual.setStockQuantity(100);
                            return virtual;
                        }
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A selected product is no longer available.");
                    });
            BigDecimal unit = money(product.getPrice());
            BigDecimal line = unit.multiply(BigDecimal.valueOf(item.quantity())).setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(line);
            lines.add(new OrderReceipt.OrderLine(product.getId() != null ? product.getId() : item.productId(), product.getName(), item.quantity(), unit, line));
        }

        BigDecimal discount = BigDecimal.ZERO.setScale(2);
        String coupon = request.couponCode() == null ? "" : request.couponCode().trim();
        if ("ZAUQ10".equalsIgnoreCase(coupon)) {
            discount = subtotal.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        } else if ("ROYAL20".equalsIgnoreCase(coupon)) {
            discount = subtotal.multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP);
        } else if ("DISCOVER999".equalsIgnoreCase(coupon)) {
            discount = subtotal.min(new BigDecimal("999.00")).setScale(2, RoundingMode.HALF_UP);
        } else if ("WELCOME500".equalsIgnoreCase(coupon)) {
            if (subtotal.compareTo(new BigDecimal("2000.00")) >= 0) {
                discount = new BigDecimal("500.00").setScale(2, RoundingMode.HALF_UP);
            }
        }

        BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO.setScale(2) : DELIVERY_FEE;
        BigDecimal total = subtotal.subtract(discount).max(BigDecimal.ZERO).add(shipping).setScale(2, RoundingMode.HALF_UP);
        return new Pricing(List.copyOf(lines), subtotal.setScale(2, RoundingMode.HALF_UP), discount, shipping, total);
    }

    @Transactional
    public OrderReceipt placeDemoOrder(CheckoutRequest request) {
        return placeDemoOrder(request, null);
    }

    @Transactional
    public OrderReceipt placeDemoOrder(CheckoutRequest request, Long userId) {
        Pricing pricing = quote(request);
        return save(request, pricing, "DEMO_ORDER_RECORDED", "DEMO MODE - NO CHARGE", null, null, userId);
    }

    @Transactional
    public OrderReceipt placeCodOrder(CheckoutRequest request) {
        return placeCodOrder(request, null);
    }

    @Transactional
    public OrderReceipt placeCodOrder(CheckoutRequest request, Long userId) {
        Pricing pricing = quote(request);
        return save(request, pricing, "COD_CONFIRMED", "CASH_ON_DELIVERY", null, null, userId);
    }

    @Transactional
    public OrderReceipt placePaidOrder(CheckoutRequest request, String paymentMethod) {
        return placePaidOrder(request, paymentMethod, null, null, null);
    }

    @Transactional
    public OrderReceipt placePaidOrder(CheckoutRequest request, String paymentMethod, String razorpayOrderId, String razorpayPaymentId, Long userId) {
        Pricing pricing = quote(request);
        return save(request, pricing, "PAID", paymentMethod, razorpayOrderId, razorpayPaymentId, userId);
    }

    @Transactional
    public OrderReceipt placeUpiOrder(CheckoutRequest request, String utrNumber, Long userId) {
        Pricing pricing = quote(request);
        String cleanUtr = (utrNumber != null && !utrNumber.isBlank()) ? utrNumber.trim() : "UNVERIFIED";
        return save(request, pricing, "PAID", "DIRECT_UPI (UTR: " + cleanUtr + ")", "UPI_DIRECT", cleanUtr, userId);
    }

    private OrderReceipt save(CheckoutRequest request, Pricing pricing, String status, String method,
                              String razorpayOrderId, String razorpayPaymentId, Long userId) {
        String orderNumber = "ZS-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // Deduct product stock quantities
        for (OrderReceipt.OrderLine line : pricing.lines()) {
            productService.findById(line.productId())
                    .or(() -> line.productId() == 9999L ? productService.findByProductCode("ZS-COFFRET-05") : Optional.empty())
                    .ifPresent(product -> {
                        product.setStockQuantity(Math.max(0, product.getStockQuantity() - line.quantity()));
                        productService.save(product);
                    });
        }

        OrderReceipt receipt;
        if (orderRepository != null) {
            OrderEntity entity = new OrderEntity();
            entity.setOrderNumber(orderNumber);
            entity.setStatus(status);
            entity.setPaymentMethod(method);
            entity.setRazorpayOrderId(razorpayOrderId);
            entity.setRazorpayPaymentId(razorpayPaymentId);
            entity.setCustomerName(request.name().trim());
            entity.setCustomerEmail(request.email().trim().toLowerCase());
            entity.setCustomerPhone(request.phone() != null ? request.phone().trim() : "");
            entity.setShippingAddress(request.address() != null ? request.address().trim() : "");
            entity.setCity(request.city() != null ? request.city().trim() : "");
            entity.setState(request.state() != null ? request.state().trim() : "");
            entity.setPostalCode(request.postalCode() != null ? request.postalCode().trim() : "");
            entity.setCouponCode(request.couponCode() != null ? request.couponCode().trim() : "");
            entity.setSubtotal(pricing.subtotal());
            entity.setDiscount(pricing.discount());
            entity.setShipping(pricing.shipping());
            entity.setTotal(pricing.total());
            entity.setUserId(userId);
            entity.setCreatedAt(Instant.now());

            for (OrderReceipt.OrderLine line : pricing.lines()) {
                entity.addItem(new OrderItemEntity(
                        line.productId(),
                        line.name(),
                        line.quantity(),
                        line.unitPrice(),
                        line.lineTotal()
                ));
            }

            OrderEntity saved = orderRepository.save(entity);
            receipt = saved.toReceipt();
        } else {
            receipt = new OrderReceipt(
                    orderNumber, status, method, Instant.now(),
                    request.name().trim(), request.email().trim(),
                    request.phone(), request.address(), request.city(), request.state(), request.postalCode(),
                    pricing.lines(), pricing.subtotal(), pricing.discount(), pricing.shipping(), pricing.total()
            );
            fallbackOrders.put(orderNumber, receipt);
        }

        if (emailService != null) {
            emailService.sendOrderConfirmation(receipt);
        }

        return receipt;
    }

    public OrderReceipt findOrder(String orderNumber) {
        if (orderRepository != null) {
            Optional<OrderEntity> found = orderRepository.findByOrderNumber(orderNumber);
            if (found.isPresent()) {
                return found.get().toReceipt();
            }
        }
        OrderReceipt receipt = fallbackOrders.get(orderNumber);
        if (receipt == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order reference not found.");
        }
        return receipt;
    }

    public List<OrderReceipt> findOrdersByEmail(String email) {
        if (orderRepository == null || email == null || email.isBlank()) return List.of();
        return orderRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email.trim())
                .stream()
                .map(OrderEntity::toReceipt)
                .toList();
    }

    public List<OrderReceipt> findOrdersByUserId(Long userId) {
        if (orderRepository == null || userId == null) return List.of();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(OrderEntity::toReceipt)
                .toList();
    }

    public List<OrderReceipt> findAllOrders() {
        if (orderRepository == null) {
            return List.copyOf(fallbackOrders.values());
        }
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(OrderEntity::toReceipt)
                .toList();
    }

    @Transactional
    public OrderReceipt updateOrderStatus(String orderNumber, String newStatus) {
        if (orderRepository == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Order persistence is not initialized.");
        }
        OrderEntity entity = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderNumber));
        entity.setStatus(newStatus.trim().toUpperCase());
        OrderEntity saved = orderRepository.save(entity);
        OrderReceipt receipt = saved.toReceipt();
        if (emailService != null) {
            emailService.sendOrderStatusUpdate(receipt);
        }
        return receipt;
    }

    @Transactional
    public Optional<OrderReceipt> markRazorpayOrderPaid(String razorpayOrderId, String razorpayPaymentId) {
        if (orderRepository == null || razorpayOrderId == null) return Optional.empty();
        Optional<OrderEntity> opt = orderRepository.findByRazorpayOrderId(razorpayOrderId);
        if (opt.isPresent()) {
            OrderEntity entity = opt.get();
            entity.setStatus("PAID");
            if (razorpayPaymentId != null && !razorpayPaymentId.isBlank()) {
                entity.setRazorpayPaymentId(razorpayPaymentId);
            }
            OrderReceipt receipt = orderRepository.save(entity).toReceipt();
            if (emailService != null) {
                emailService.sendOrderStatusUpdate(receipt);
            }
            return Optional.of(receipt);
        }
        return Optional.empty();
    }

    private BigDecimal money(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    public record Pricing(List<OrderReceipt.OrderLine> lines, BigDecimal subtotal, BigDecimal discount, BigDecimal shipping, BigDecimal total) { }
}
