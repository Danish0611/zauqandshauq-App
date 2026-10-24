package com.zauqandshauq.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "newsletter_subscribers", indexes = {
    @Index(name = "idx_subscriber_email", columnList = "email", unique = true)
})
public class NewsletterSubscriber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    @Column(name = "subscribed_at", nullable = false, updatable = false)
    private Instant subscribedAt;

    private boolean active = true;

    public NewsletterSubscriber() {}

    public NewsletterSubscriber(String email) {
        this.email = email.trim().toLowerCase();
        this.subscribedAt = Instant.now();
        this.active = true;
    }

    @PrePersist
    public void onPrePersist() {
        if (this.subscribedAt == null) {
            this.subscribedAt = Instant.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Instant getSubscribedAt() { return subscribedAt; }
    public void setSubscribedAt(Instant subscribedAt) { this.subscribedAt = subscribedAt; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

