package com.zauqandshauq.controller;

import com.zauqandshauq.model.NewsletterSubscriber;
import com.zauqandshauq.repository.NewsletterRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private final NewsletterRepository newsletterRepository;

    public NewsletterController(NewsletterRepository newsletterRepository) {
        this.newsletterRepository = newsletterRepository;
    }

    @PostMapping("/subscribe")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> subscribe(@Valid @RequestBody SubscribeRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (newsletterRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return Map.of("message", "You're already on our list. Thank you for being here.");
        }
        newsletterRepository.save(new NewsletterSubscriber(normalizedEmail));
        return Map.of("message", "You're on the list. Look out for a little note from Z&S.");
    }

    public record SubscribeRequest(@NotBlank @Email @Size(max = 200) String email) { }
}
