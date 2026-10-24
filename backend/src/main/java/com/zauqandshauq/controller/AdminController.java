package com.zauqandshauq.controller;

import com.zauqandshauq.model.NewsletterSubscriber;
import com.zauqandshauq.model.OrderReceipt;
import com.zauqandshauq.model.Product;
import com.zauqandshauq.repository.NewsletterRepository;
import com.zauqandshauq.repository.ProductRepository;
import com.zauqandshauq.repository.UserRepository;
import com.zauqandshauq.service.AuthService;
import com.zauqandshauq.service.EmailNotificationService;
import com.zauqandshauq.service.OrderService;
import com.zauqandshauq.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AuthService authService;
    private final ProductService productService;
    private final ProductRepository productRepository;
    private final OrderService orderService;
    private final NewsletterRepository newsletterRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailService;

    public AdminController(AuthService authService,
                           ProductService productService,
                           ProductRepository productRepository,
                           OrderService orderService,
                           NewsletterRepository newsletterRepository,
                           UserRepository userRepository,
                           EmailNotificationService emailService) {
        this.authService = authService;
        this.productService = productService;
        this.productRepository = productRepository;
        this.orderService = orderService;
        this.newsletterRepository = newsletterRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.requireAdmin(authHeader);

        List<Product> products = productService.all();
        long lowStock = products.stream().filter(p -> p.getStockQuantity() <= 20).count();
        List<OrderReceipt> orders = orderService.findAllOrders();
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> !"CANCELLED".equalsIgnoreCase(o.status()))
                .map(OrderReceipt::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "totalProducts", products.size(),
                "lowStockProducts", lowStock,
                "totalOrders", orders.size(),
                "totalRevenue", totalRevenue,
                "totalSubscribers", newsletterRepository.count(),
                "totalUsers", userRepository.count()
        );
    }

    @GetMapping("/orders")
    public List<OrderReceipt> allOrders(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.requireAdmin(authHeader);
        return orderService.findAllOrders();
    }

    @PatchMapping("/orders/{orderNumber}/status")
    public OrderReceipt updateOrderStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String orderNumber,
            @RequestBody StatusUpdateRequest req) {
        authService.requireAdmin(authHeader);
        if (req.status() == null || req.status().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order status is required.");
        }
        return orderService.updateOrderStatus(orderNumber.trim(), req.status());
    }

    @GetMapping("/products")
    public List<Product> allProducts(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.requireAdmin(authHeader);
        return productService.all();
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public Product createProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Product payload) {
        authService.requireAdmin(authHeader);
        if (payload.getName() == null || payload.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product name is required.");
        }
        if (payload.getProductCode() == null || payload.getProductCode().isBlank()) {
            payload.setProductCode("ZS-" + payload.getName().replaceAll("[^a-zA-Z0-9]", "").toUpperCase());
        }
        if (productRepository.existsByProductCodeIgnoreCase(payload.getProductCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Product code already exists: " + payload.getProductCode());
        }
        payload.setId(null);
        payload.setActive(true);
        if (payload.getImage() == null || payload.getImage().isBlank()) {
            payload.setImage("/assets/products/noir-oud.svg");
        }
        return productService.save(payload);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable long id,
            @RequestBody Product payload) {
        authService.requireAdmin(authHeader);
        Product existing = productService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with id: " + id));

        if (payload.getProductCode() != null && !payload.getProductCode().isBlank()) {
            existing.setProductCode(payload.getProductCode().trim());
        }
        if (payload.getName() != null && !payload.getName().isBlank()) {
            existing.setName(payload.getName().trim());
        }
        if (payload.getBrand() != null) existing.setBrand(payload.getBrand().trim());
        if (payload.getCategory() != null) existing.setCategory(payload.getCategory().trim());
        if (payload.getConcentration() != null) existing.setConcentration(payload.getConcentration().trim());
        if (payload.getSize() != null) existing.setSize(payload.getSize().trim());
        existing.setPrice(payload.getPrice());
        existing.setOriginalPrice(payload.getOriginalPrice() > 0 ? payload.getOriginalPrice() : payload.getPrice());
        existing.setRating(payload.getRating() > 0 ? payload.getRating() : existing.getRating());
        existing.setReviews(payload.getReviews());
        if (payload.getDescription() != null) existing.setDescription(payload.getDescription());
        if (payload.getIngredients() != null) existing.setIngredients(payload.getIngredients());
        if (payload.getNotesText() != null && !payload.getNotesText().isBlank()) {
            existing.setNotesText(payload.getNotesText());
        } else if (payload.getNotes() != null && !payload.getNotes().isEmpty()) {
            existing.setNotes(payload.getNotes());
        }
        if (payload.getImage() != null && !payload.getImage().isBlank()) existing.setImage(payload.getImage());
        if (payload.getBadge() != null) existing.setBadge(payload.getBadge());
        existing.setFeatured(payload.isFeatured());
        existing.setBestseller(payload.isBestseller());
        existing.setNewArrival(payload.isNewArrival());
        existing.setStockQuantity(payload.getStockQuantity());
        existing.setActive(payload.isActive());

        return productService.save(existing);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable long id) {
        authService.requireAdmin(authHeader);
        Product existing = productService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with id: " + id));
        productRepository.delete(existing);
    }

    @GetMapping("/subscribers")
    public List<NewsletterSubscriber> subscribers(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.requireAdmin(authHeader);
        return newsletterRepository.findAllByOrderBySubscribedAtDesc();
    }

    @GetMapping("/emails")
    public List<EmailNotificationService.EmailLog> emails(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.requireAdmin(authHeader);
        return emailService.getRecentEmails();
    }

    public record StatusUpdateRequest(String status) {}
}

