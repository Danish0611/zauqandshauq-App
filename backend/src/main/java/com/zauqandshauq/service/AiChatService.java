package com.zauqandshauq.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zauqandshauq.dto.ChatMessageDto;
import com.zauqandshauq.dto.ChatRequest;
import com.zauqandshauq.dto.ChatResponse;
import com.zauqandshauq.model.Product;
import com.zauqandshauq.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiChatService {

    private static final Logger log = LoggerFactory.getLogger(AiChatService.class);
    private static final Pattern PRODUCT_TAG_PATTERN = Pattern.compile("\\[Product:\\s*([^\\]]+)\\]", Pattern.CASE_INSENSITIVE);

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-flash-lite-latest}")
    private String primaryModel;

    @Value("${gemini.api.fallback-model:gemini-3.8-flash}")
    private String fallbackModel;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String systemPromptTemplate;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("ai/scent-concierge-system-prompt.txt");
            try (InputStream is = resource.getInputStream()) {
                this.systemPromptTemplate = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                log.info("Loaded AI Scent Concierge System Prompt template ({} bytes)", systemPromptTemplate.length());
            }
        } catch (Exception e) {
            log.warn("Could not load ai/scent-concierge-system-prompt.txt from classpath: {}. Using default prompt.", e.getMessage());
            this.systemPromptTemplate = "You are Nadir, Master Perfumer of Zauq & Shauq Haute Parfumerie. Recommend fragrances from the store catalog: %s";
        }
    }

    public ChatResponse chat(ChatRequest request) {
        String userPrompt = request.getMessage() != null ? request.getMessage().trim() : "";
        if (userPrompt.isEmpty()) {
            return new ChatResponse("A most gracious greeting, esteemed seeker of scent. Pray, how may I guide your olfactory journey today?",
                    Collections.emptyList(), primaryModel, false);
        }

        // 1. Fetch live active catalog from database
        List<Product> catalog = productRepository.findAll().stream()
                .filter(Product::isActive)
                .toList();

        // 2. Build catalog summary text for Gemini context
        String catalogSummary = formatCatalogForPrompt(catalog);
        String fullSystemPrompt = String.format(systemPromptTemplate, catalogSummary);

        // 3. Try primary model first, with fallback to secondary model
        String[] modelsToTry = new String[]{primaryModel, fallbackModel, "gemini-2.5-flash-lite"};
        for (String model : modelsToTry) {
            try {
                String reply = callGemini(model, fullSystemPrompt, request.getHistory(), userPrompt);
                if (reply != null && !reply.isBlank()) {
                    List<Product> recommendedProducts = extractRecommendedProducts(reply, userPrompt, catalog);
                    return new ChatResponse(reply, recommendedProducts, model, !model.equals(primaryModel));
                }
            } catch (Exception e) {
                log.warn("Gemini model [{}] call failed: {}. Trying next model...", model, e.getMessage());
            }
        }

        // 4. Intelligent offline fallback if external AI service is unreachable
        log.warn("All Gemini AI endpoints failed or timed out. Triggering artisanal offline fallback.");
        return generateOfflineArtisanalFallback(userPrompt, catalog);
    }

    private String callGemini(String model, String systemPrompt, List<ChatMessageDto> history, String userPrompt) throws Exception {
        String endpoint = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey);

        ObjectNode root = objectMapper.createObjectNode();

        // System Instruction
        ObjectNode systemInstruction = root.putObject("system_instruction");
        ArrayNode sysParts = systemInstruction.putArray("parts");
        sysParts.addObject().put("text", systemPrompt);

        // Contents (Conversation History + Current Prompt)
        ArrayNode contents = root.putArray("contents");

        if (history != null) {
            for (ChatMessageDto msg : history) {
                if (msg.getContent() != null && !msg.getContent().isBlank()) {
                    String role = "model".equalsIgnoreCase(msg.getRole()) ? "model" : "user";
                    ObjectNode entry = contents.addObject();
                    entry.put("role", role);
                    entry.putArray("parts").addObject().put("text", msg.getContent().trim());
                }
            }
        }

        // Add current turn
        ObjectNode currentTurn = contents.addObject();
        currentTurn.put("role", "user");
        currentTurn.putArray("parts").addObject().put("text", userPrompt);

        // Generation Config
        ObjectNode genConfig = root.putObject("generationConfig");
        genConfig.put("temperature", 0.7);
        genConfig.put("topP", 0.95);
        genConfig.put("maxOutputTokens", 1024);

        String jsonPayload = objectMapper.writeValueAsString(root);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            JsonNode resJson = objectMapper.readTree(response.body());
            JsonNode candidates = resJson.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    String text = parts.get(0).path("text").asText();
                    if (text != null) {
                        // Normalize any broken currency symbols or question marks before digits
                        text = text.replaceAll("[\\uFFFD\\?]+1?([0-9])", "\u20B9$1");
                        text = text.replaceAll("Rs\\.?\\s*([0-9])", "\u20B9$1");
                    }
                    return text;
                }
            }
        } else {
            throw new RuntimeException("Gemini HTTP " + response.statusCode() + ": " + response.body());
        }

        return null;
    }

    private String formatCatalogForPrompt(List<Product> catalog) {
        if (catalog.isEmpty()) {
            return "No products currently active in catalog.";
        }
        StringBuilder sb = new StringBuilder();
        for (Product p : catalog) {
            sb.append(String.format("- [Product: %s] | Code: %s | Brand: %s | Category: %s | Concentration: %s | Price: ₹%.0f (Original: ₹%.0f) | Rating: %.1f★ (%d reviews) | Notes: %s | Stock: %d | Description: %s\n",
                    p.getName(),
                    p.getProductCode(),
                    p.getBrand(),
                    p.getCategory(),
                    p.getConcentration() != null ? p.getConcentration() : "Eau de Parfum",
                    p.getPrice(),
                    p.getOriginalPrice(),
                    p.getRating(),
                    p.getReviews(),
                    String.join(", ", p.getNotes()),
                    p.getStockQuantity(),
                    p.getDescription() != null ? p.getDescription().replaceAll("\\s+", " ") : ""
            ));
        }
        return sb.toString();
    }

    private List<Product> extractRecommendedProducts(String reply, String userPrompt, List<Product> catalog) {
        Set<Product> matched = new LinkedHashSet<>();

        // 1. Check for explicit [Product: Name] tags in AI reply
        Matcher matcher = PRODUCT_TAG_PATTERN.matcher(reply);
        while (matcher.find()) {
            String prodName = matcher.group(1).trim();
            catalog.stream()
                    .filter(p -> p.getName().equalsIgnoreCase(prodName) || p.getName().toLowerCase().contains(prodName.toLowerCase()))
                    .findFirst()
                    .ifPresent(matched::add);
        }

        // 2. Check for exact product name mentions in the text
        if (matched.isEmpty()) {
            for (Product p : catalog) {
                if (reply.toLowerCase().contains(p.getName().toLowerCase())) {
                    matched.add(p);
                }
            }
        }

        // 3. If user asked about a specific note/category and nothing matched yet, find top relevance from catalog
        if (matched.isEmpty()) {
            String lowerPrompt = userPrompt.toLowerCase();
            for (Product p : catalog) {
                boolean noteMatch = p.getNotes().stream().anyMatch(n -> lowerPrompt.contains(n.toLowerCase()));
                boolean nameMatch = lowerPrompt.contains(p.getName().toLowerCase());
                boolean categoryMatch = lowerPrompt.contains(p.getCategory().toLowerCase());
                if (noteMatch || nameMatch || categoryMatch) {
                    matched.add(p);
                    if (matched.size() >= 3) break;
                }
            }
        }

        return new ArrayList<>(matched);
    }

    private ChatResponse generateOfflineArtisanalFallback(String prompt, List<Product> catalog) {
        String lower = prompt.toLowerCase();
        List<Product> matched = catalog.stream()
                .filter(p -> p.getName().toLowerCase().contains(lower)
                        || p.getNotes().stream().anyMatch(n -> lower.contains(n.toLowerCase()))
                        || (p.getCategory() != null && lower.contains(p.getCategory().toLowerCase())))
                .limit(3)
                .toList();

        if (matched.isEmpty() && !catalog.isEmpty()) {
            matched = catalog.stream().limit(2).toList();
        }

        StringBuilder reply = new StringBuilder();
        reply.append("Welcome to House of Zauq & Shauq. As Nadir, your personal fragrance advisor, I have reviewed our collection for your request.\n\n");

        if (!matched.isEmpty()) {
            reply.append("Based on your preference, here are our recommended handcrafted flacons:\n\n");
            for (Product p : matched) {
                reply.append(String.format("✦ **[Product: %s]** (%s) — *₹%.0f*\n", p.getName(), p.getCategory(), p.getPrice()));
                reply.append(String.format("  • **Olfactory Notes**: %s\n", String.join(", ", p.getNotes())));
                reply.append(String.format("  • **Description**: %s\n\n", p.getDescription()));
            }
            reply.append("Each flacon is hand-poured with pure botanicals for long-lasting sillage. How else may I assist your fragrance selection?");
        } else {
            reply.append("Our house offers rare artisanal perfumes blending international French craftsmanship with classic Kannauj and Assam heritage. Tell me about your preferred notes—such as Assam Oud, Kannauj Rose, Velvet Amber, or fresh Bergamot—and I will suggest your ideal scent.");
        }

        return new ChatResponse(reply.toString(), matched, "offline-artisanal-sommelier", true);
    }
}
