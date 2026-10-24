package com.zauqandshauq.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.zauqandshauq.dto.CheckoutRequest;
import com.zauqandshauq.model.OrderReceipt;
import com.zauqandshauq.model.UserEntity;
import com.zauqandshauq.service.AuthService;
import com.zauqandshauq.service.OrderService;
import jakarta.validation.Valid;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    @Value("${app.payment.razorpay-key-id:rzp_test_TrnvmqpEGpgwfa}")
    private String keyId;

    @Value("${app.payment.razorpay-key-secret:Du3jki4aIKD08SxBI4PB3sIu}")
    private String keySecret;

    @Value("${app.payment.razorpay-webhook-secret:}")
    private String webhookSecret;

    private final OrderService orderService;
    private final AuthService authService;
    private final ConcurrentHashMap<String, CheckoutRequest> pendingOrders = new ConcurrentHashMap<>();

    @Autowired
    public PaymentController(OrderService orderService, AuthService authService) {
        this.orderService = orderService;
        this.authService = authService;
    }

    @Value("${app.payment.upi-vpa:zauqandshauq@icici}")
    private String upiVpa;

    @Value("${app.payment.upi-payee-name:Zauq & Shauq Haute Parfumerie}")
    private String upiPayeeName;

    @GetMapping("/config")
    public Map<String, Object> config() {
        boolean enabled = !keyId.isBlank() && !keySecret.isBlank();
        return Map.of(
                "gateway", enabled ? "RAZORPAY" : "DEMO",
                "enabled", enabled,
                "keyId", enabled ? keyId : "",
                "webhookConfigured", !webhookSecret.isBlank(),
                "upiVpa", upiVpa != null && !upiVpa.isBlank() ? upiVpa : "zauqandshauq@icici",
                "upiPayeeName", upiPayeeName != null && !upiPayeeName.isBlank() ? upiPayeeName : "Zauq & Shauq Haute Parfumerie"
        );
    }

    @PostMapping("/config")
    public Map<String, Object> updateConfig(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body) {
        authService.requireAdmin(authHeader);
        if (body.containsKey("keyId")) {
            this.keyId = body.get("keyId").trim();
        }
        if (body.containsKey("keySecret")) {
            this.keySecret = body.get("keySecret").trim();
        }
        if (body.containsKey("webhookSecret")) {
            this.webhookSecret = body.get("webhookSecret").trim();
        }
        if (body.containsKey("upiVpa")) {
            this.upiVpa = body.get("upiVpa").trim();
        }
        if (body.containsKey("upiPayeeName")) {
            this.upiPayeeName = body.get("upiPayeeName").trim();
        }
        log.info("Payment configuration updated by admin: Razorpay enabled={}", !keyId.isBlank() && !keySecret.isBlank());
        return config();
    }

    @PostMapping("/razorpay/order")
    public Map<String, Object> createPaymentOrder(@Valid @RequestBody CheckoutRequest request) {
        OrderService.Pricing pricing = orderService.quote(request);
        int amountPaise = pricing.total().multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP).intValueExact();
        if (keyId.isBlank() || keySecret.isBlank()) {
            return Map.of(
                    "gateway", "DEMO",
                    "orderId", "demo_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12),
                    "amount", amountPaise,
                    "currency", "INR"
            );
        }
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", amountPaise);
            options.put("currency", "INR");
            options.put("receipt", "zs_" + UUID.randomUUID().toString().replace("-", "").substring(0, 18));
            options.put("notes", new JSONObject().put("brand", "Zauq & Shauq"));
            Order order = client.orders.create(options);
            String orderId = order.toJson().getString("id");
            pendingOrders.put(orderId, request);
            log.info("Razorpay order created successfully: orderId={}, amountPaise={}", orderId, amountPaise);
            return Map.of(
                    "gateway", "RAZORPAY",
                    "keyId", keyId,
                    "orderId", orderId,
                    "amount", amountPaise,
                    "currency", "INR"
            );
        } catch (RazorpayException ex) {
            log.error("Failed to create Razorpay order with keyId={}: {}", keyId, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to create Razorpay order: " + ex.getMessage());
        }
    }

    @PostMapping("/razorpay/verify")
    public OrderReceipt verifyPayment(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody VerifyPaymentRequest request) {
        if (keySecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Razorpay test keys are not configured.");
        }
        if (request.razorpayOrderId() == null || request.razorpayPaymentId() == null || request.razorpaySignature() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment verification details are incomplete.");
        }
        CheckoutRequest checkout = pendingOrders.get(request.razorpayOrderId());
        if (checkout == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The payment order is unknown or has already been processed.");
        }
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.razorpayOrderId());
            attributes.put("razorpay_payment_id", request.razorpayPaymentId());
            attributes.put("razorpay_signature", request.razorpaySignature());
            if (!Utils.verifyPaymentSignature(attributes, keySecret)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment signature verification failed.");
            }
            pendingOrders.remove(request.razorpayOrderId());
            Long userId = authService != null
                    ? authService.resolveOptionalUser(authHeader).map(UserEntity::getId).orElse(null)
                    : null;
            return orderService.placePaidOrder(checkout, "RAZORPAY", request.razorpayOrderId(), request.razorpayPaymentId(), userId);
        } catch (RazorpayException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to verify the payment signature.");
        }
    }

    @PostMapping("/razorpay/webhook")
    public Map<String, Object> handleWebhook(
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature,
            @RequestBody String rawPayload) {

        String secretToUse = !webhookSecret.isBlank() ? webhookSecret : keySecret;
        if (!secretToUse.isBlank()) {
            if (signature == null || signature.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing X-Razorpay-Signature header.");
            }
            try {
                if (!Utils.verifyWebhookSignature(rawPayload, signature, secretToUse)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Razorpay webhook signature.");
                }
            } catch (RazorpayException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not verify Razorpay webhook signature.");
            }
        }

        JSONObject eventJson = new JSONObject(rawPayload);
        String eventType = eventJson.optString("event", "");
        log.info("Received Razorpay webhook event: {}", eventType);

        if ("payment.captured".equals(eventType) || "order.paid".equals(eventType)) {
            JSONObject paymentEntity = eventJson.optJSONObject("payload") != null
                    && eventJson.getJSONObject("payload").optJSONObject("payment") != null
                    ? eventJson.getJSONObject("payload").getJSONObject("payment").optJSONObject("entity")
                    : null;

            if (paymentEntity != null) {
                String rzpOrderId = paymentEntity.optString("order_id", "");
                String rzpPaymentId = paymentEntity.optString("id", "");

                if (!rzpOrderId.isBlank()) {
                    Optional<OrderReceipt> updated = orderService.markRazorpayOrderPaid(rzpOrderId, rzpPaymentId);
                    if (updated.isEmpty()) {
                        CheckoutRequest pending = pendingOrders.remove(rzpOrderId);
                        if (pending != null) {
                            orderService.placePaidOrder(pending, "RAZORPAY (WEBHOOK)", rzpOrderId, rzpPaymentId, null);
                        }
                    }
                }
            }
        }

        return Map.of("received", true, "event", eventType);
    }

    public record VerifyPaymentRequest(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) { }
}
