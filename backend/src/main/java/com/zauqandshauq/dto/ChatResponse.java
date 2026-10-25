package com.zauqandshauq.dto;

import com.zauqandshauq.model.Product;
import java.util.ArrayList;
import java.util.List;

public class ChatResponse {

    private String reply;
    private List<Product> recommendedProducts = new ArrayList<>();
    private String modelUsed;
    private boolean fallbackUsed;

    public ChatResponse() {}

    public ChatResponse(String reply, List<Product> recommendedProducts, String modelUsed, boolean fallbackUsed) {
        this.reply = reply;
        this.recommendedProducts = recommendedProducts != null ? recommendedProducts : new ArrayList<>();
        this.modelUsed = modelUsed;
        this.fallbackUsed = fallbackUsed;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public List<Product> getRecommendedProducts() {
        return recommendedProducts;
    }

    public void setRecommendedProducts(List<Product> recommendedProducts) {
        this.recommendedProducts = recommendedProducts != null ? recommendedProducts : new ArrayList<>();
    }

    public String getModelUsed() {
        return modelUsed;
    }

    public void setModelUsed(String modelUsed) {
        this.modelUsed = modelUsed;
    }

    public boolean isFallbackUsed() {
        return fallbackUsed;
    }

    public void setFallbackUsed(boolean fallbackUsed) {
        this.fallbackUsed = fallbackUsed;
    }
}
