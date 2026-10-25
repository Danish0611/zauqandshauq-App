package com.zauqandshauq.controller;

import com.zauqandshauq.dto.ChatRequest;
import com.zauqandshauq.dto.ChatResponse;
import com.zauqandshauq.service.AiChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AiChatController {

    @Autowired
    private AiChatService aiChatService;

    @Value("${gemini.api.model:gemini-flash-lite-latest}")
    private String primaryModel;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = aiChatService.chat(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Zauq & Shauq AI Scent Concierge (Nadir)",
                "model", primaryModel,
                "botanicalVaultGrounded", true
        ));
    }
}
