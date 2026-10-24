package com.zauqandshauq.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_code", columnList = "product_code", unique = true),
    @Index(name = "idx_product_category", columnList = "category")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_code", nullable = false, unique = true, length = 100)
    private String productCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String category;

    private String concentration;

    private String size;

    @Column(nullable = false)
    private double price;

    @Column(name = "original_price")
    private double originalPrice;

    private double rating = 5.0;

    private int reviews = 0;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notesText;

    private String image;

    private String badge;

    private boolean featured = false;

    private boolean bestseller = false;

    @Column(name = "new_arrival")
    private boolean newArrival = false;

    @Column(name = "stock_quantity")
    private int stockQuantity = 100;

    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public Product() {}

    public Product(Long id, String productCode, String name, String brand, String category,
                   String concentration, String size, double price, double originalPrice,
                   double rating, int reviews, String description, String ingredients,
                   String notesText, String image, String badge, boolean featured,
                   boolean bestseller, boolean newArrival, int stockQuantity, boolean active) {
        this.id = id;
        this.productCode = productCode;
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.concentration = concentration;
        this.size = size;
        this.price = price;
        this.originalPrice = originalPrice;
        this.rating = rating;
        this.reviews = reviews;
        this.description = description;
        this.ingredients = ingredients;
        this.notesText = notesText;
        this.image = image;
        this.badge = badge;
        this.featured = featured;
        this.bestseller = bestseller;
        this.newArrival = newArrival;
        this.stockQuantity = stockQuantity;
        this.active = active;
    }

    @PrePersist
    public void onPrePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getConcentration() {
        return concentration;
    }

    public void setConcentration(String concentration) {
        this.concentration = concentration;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getReviews() {
        return reviews;
    }

    public void setReviews(int reviews) {
        this.reviews = reviews;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIngredients() {
        return ingredients;
    }

    public void setIngredients(String ingredients) {
        this.ingredients = ingredients;
    }

    public String getNotesText() {
        return notesText;
    }

    public void setNotesText(String notesText) {
        this.notesText = notesText;
    }

    @JsonProperty("notes")
    public List<String> getNotes() {
        if (notesText == null || notesText.isBlank()) {
            return List.of();
        }
        return Arrays.stream(notesText.split("[,;|]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public void setNotes(List<String> notes) {
        if (notes == null || notes.isEmpty()) {
            this.notesText = "";
        } else {
            this.notesText = String.join(", ", notes);
        }
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public boolean isBestseller() {
        return bestseller;
    }

    public void setBestseller(boolean bestseller) {
        this.bestseller = bestseller;
    }

    public boolean isNewArrival() {
        return newArrival;
    }

    public void setNewArrival(boolean newArrival) {
        this.newArrival = newArrival;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
