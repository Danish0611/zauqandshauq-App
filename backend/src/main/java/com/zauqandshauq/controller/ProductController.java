package com.zauqandshauq.controller;

import com.zauqandshauq.dto.CsvUploadResponse;
import com.zauqandshauq.model.Product;
import com.zauqandshauq.service.ProductService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/products")
    public List<Product> products(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String sort) {
        return service.find(category, q, sort);
    }

    @GetMapping("/products/{id}")
    public Product getProductById(@PathVariable long id) {
        return service.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with id: " + id));
    }

    @GetMapping("/products/code/{productCode}")
    public Product getProductByCode(@PathVariable String productCode) {
        return service.findByProductCode(productCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with code: " + productCode));
    }

    @GetMapping(value = {"/products/csv/template", "/products/template/csv"}, produces = "text/csv")
    public ResponseEntity<byte[]> downloadCsvTemplate() {
        byte[] csvData = service.generateCsvTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"perfumes_template.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }

    @PostMapping(value = {"/products/csv/upload", "/products/upload-csv"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CsvUploadResponse> uploadCsv(@RequestParam("file") MultipartFile file) {
        CsvUploadResponse response = service.processCsvUpload(file);
        return ResponseEntity.status(response.success() ? HttpStatus.OK : HttpStatus.MULTI_STATUS).body(response);
    }

    @GetMapping(value = "/products/csv/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportProductsCsv() {
        byte[] csvData = service.exportProductsCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"zauq_and_shauq_products.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return service.categories();
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "application", "zauqandshauq-api");
    }
}
